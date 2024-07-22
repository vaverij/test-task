/* eslint-disable @typescript-eslint/no-explicit-any */

import {
	ApolloClient as Apollo,
	ApolloLink,
	type DocumentNode,
	HttpLink,
	InMemoryCache,
	type PureQueryOptions,
} from "@apollo/client/core";
import type { NormalizedCacheObject } from "@apollo/client/cache/inmemory/types";
import {
	ApolloLinkTimeout,
	TimeoutLink,
} from "~root/libraries/apollo-link-timeout/timeoutLink";
import type {
	IGraphqlData,
	IRequestOptions,
	IPureMutationOptions,
} from "~root/libraries/request-handler/types";
import { createPersistedQueryLink } from "@apollo/client/link/persisted-queries";
import { sha256 } from "crypto-hash";
import fetch from "cross-fetch";
import useDetectQueryName from "~root/utils/useDetectQueryName";

const cache = new InMemoryCache();
const timeout = 10000;
const timeoutLink: TimeoutLink = new ApolloLinkTimeout(timeout);

let globalApolloClient: Apollo<NormalizedCacheObject> | null = null;
export default class ApolloClient {
	/**
	 * сreates a new Apollo Client instance.
	 * @param uri - The URI for the GraphQL server.
	 * @param options - Optional request options.
	 * @returns A new Apollo Client instance.
	 */
	private createClient = (
		uri: string,
		options?: IRequestOptions
	): Apollo<NormalizedCacheObject> => {
		let link: ApolloLink;
		const httpLink = new HttpLink({ uri, fetch });

		//check if we should you persisted queries and if the code run on the server
		// create a uri parameter for Apollo and add a timeout
		if (!!(options?.automaticPersistedQueries && !process.server)) {
			//creates persisted link, adding a hash to query
			const linkChain = createPersistedQueryLink({
				sha256,
				useGETForHashedQueries: options?.GETAutomaticPersistedQueries ?? false,
			}).concat(httpLink);
			link = timeoutLink.concat(linkChain);
		} else {
			link = timeoutLink.concat(httpLink);
		}

		//declaring the Apollo client
		const client = new Apollo({
			link,
			cache,
			ssrMode: process.server || false,
			defaultOptions: {
				query: {
					fetchPolicy: "no-cache",
					errorPolicy: "all",
				},
			},
		});
		return client;
	};

	/**
	 * Loads the Apollo Client instance.
	 * @param uri - The URI for the GraphQL server.
	 * @param options - Optional request options.
	 * @returns The loaded Apollo Client instance.
	 */
	private loadClient = async (
		uri: string,
		options?: IRequestOptions
	): Promise<Apollo<NormalizedCacheObject>> => {
		// check if the client already loaded and is running on the server
		if (process.server || (!process.server && uri)) {
			return this.createClient(uri, options);
		}
		//check if the global client has been created
		if (!globalApolloClient) {
			globalApolloClient = this.createClient(uri, options);
		}
		return globalApolloClient;
	};

	/**
	 * Error handling.
	 * @param type - The type of request (Query or Mutation).
	 * @param error - The error that occurred.
	 * @param options - Additional query or mutation options.
	 */
	private handleError = (
		type: string,
		error: any,
		options?: PureQueryOptions | IPureMutationOptions
	): void => {
		console.error(
			`[${type}] ${error}\n(Probably query is not set up correctly - wrong input, not existing return values, etc.. or there is a Network error)`,
			`\n${type} Variables: ${JSON.stringify(options?.variables)}`
		);
	};

	/**
	 * Handles GraphQL requests.
	 * @param uri - The URI for the GraphQL server.
	 * @param options - The query or mutation options.
	 * @param requestOptions - Optional request options.
	 * @returns The response data or undefined if there were errors.
	 */
	private handleRequest = async <R>(
		uri: string,
		options: PureQueryOptions | IPureMutationOptions,
		requestOptions: IRequestOptions
	): Promise<R | undefined> => {
		const type = options.hasOwnProperty("query") ? "Query" : "Mutation";
		let response;

		const client = await this.loadClient(uri, requestOptions);
		if (type === "Query") {
			// prepare to get the data
			response = await client.query<IGraphqlData<R>>(
				options as PureQueryOptions
			);
		} else if (type === "Mutation") {
			// prepare to create/update/delete (mutate) data
			response = await client.mutate<IGraphqlData<R>>(
				options as IPureMutationOptions
			);
			//no point of doing else as only 2 options available (hardcoded)
		} else {
			throw new Error("Wrong Apollo client fetch type");
		}

		const { data, errors } = response;
		// validating if response returned any errors, handling, returning undefined
		if (errors) {
			const gqlQueryName = useDetectQueryName(options);
			errors.forEach(({ message }, i) =>
				console.error(
					`[${type}]: Apollo client error [${i}]: ${message}\n`,
					`Debug info - ${type} Name: ${gqlQueryName}, Variables: ${JSON.stringify(
						options?.variables
					)}`
				)
			);
			return undefined;
		}
		//if no errors, return response data or R
		return data?.data || (data as R);
	};

	/**
	 * Prepares a query with the given parameters.
	 * @param query - The GraphQL query.
	 * @param variables - The query variables.
	 * @param headers - Additional headers.
	 * @returns The prepared query options.
	 */
	public prepareQuery = <V>(
		query: DocumentNode,
		variables?: V,
		headers?: Record<string, unknown>
	): PureQueryOptions => {
		return {
			query,
			variables,
			context: {
				headers,
			},
		} as PureQueryOptions;
	};

	/**
	 * Sends a GraphQL request.
	 * @param uri - The URI for the GraphQL server.
	 * @param options - The query or mutation options.
	 * @param requestOptions - Optional request options.
	 * @returns The response data or undefined if there were errors.
	 */

	public request = async <R>(
		uri: string,
		options: PureQueryOptions | IPureMutationOptions,
		requestOptions: IRequestOptions = {
			cacheKey: undefined,
			automaticPersistedQueries: false,
			GETAutomaticPersistedQueries: false,
		}
	): Promise<R | undefined> => {
		type Response = R | undefined;
		return await this.handleRequest<Response>(uri, options, requestOptions);
	};
}
