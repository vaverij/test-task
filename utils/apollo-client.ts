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
import ApolloLinkTimeout from "apollo-link-timeout";
import { createPersistedQueryLink } from "@apollo/client/link/persisted-queries";
import { sha256 } from "crypto-hash";
import fetch from "cross-fetch";

const cache = new InMemoryCache();
const timeout = 10000;
const timeoutLink: ApolloLinkTimeout = new ApolloLinkTimeout(timeout);

let globalApolloClient: Apollo<NormalizedCacheObject> | null = null;
class ApolloClient {
	/**
	 * сreates a new Apollo Client instance.
	 * @param uri - The URI for the GraphQL server.
	 * @param options - Optional request options.
	 * @returns A new Apollo Client instance.
	 */
	private createClient = (
		uri: string,
		options?: any
	): Apollo<NormalizedCacheObject> => {
		// console.log("CREATE CLIENT");
		let link = this.createLink(uri, options);
		console.log(link);
		//declaring the Apollo client
		const client = new Apollo({
			link,
			cache,
			ssrMode: process.server || false,
			defaultOptions: {
				query: {
					// fetchPolicy: "no-cache",
					errorPolicy: "all",
				},
			},
		});
		// console.log("RETURN CLIENT");
		return client;
	};

	/**
	 * сreates a new Apollo Link for client.
	 * @param uri - The URI for the GraphQL server.
	 * @param options - Optional request options.
	 * @returns A new Apollo Link instance.
	 */
	private createLink = (uri: string, options?: any): ApolloLink => {
		// console.log("CREATE LINK");
		let link: ApolloLink;
		const httpLink = new HttpLink({ uri, fetch });

		//check if we should you persisted queries and if the code run on the server
		// create a uri parameter for Apollo and add a timeout
		if (options?.automaticPersistedQueries && !process.server) {
			//creates persisted link, adding a hash to query
			const linkChain = createPersistedQueryLink({
				sha256,
				useGETForHashedQueries: options?.GETAutomaticPersistedQueries ?? false,
			}).concat(httpLink);
			link = timeoutLink.concat(linkChain);
		} else {
			link = timeoutLink.concat(httpLink);
		}
		// console.log("RETURN LINK");
		return link;
	};

	/**
	 * Loads the Apollo Client instance.
	 * @param uri - The URI for the GraphQL server.
	 * @param options - Optional request options.
	 * @returns The loaded Apollo Client instance.
	 */
	private loadClient = async (
		uri: string,
		options?: any
	): Promise<Apollo<NormalizedCacheObject>> => {
		// console.log("LOAD CLIENT");
		// check if the client already loaded and is running on the server
		if (!globalApolloClient) {
			console.log("globalApolloClient not created");
			globalApolloClient = this.createClient(uri, options);
		}
		return globalApolloClient;
	};

	/**
	 * Error handling.
	 * @param type - The type of error
	 * @param error - error message
	 * @param options - Additional query or mutation options.
	 */
	private handleError = (
		type: string,
		error: any,
		options?: PureQueryOptions | any
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
		options: PureQueryOptions | any,
		requestOptions: any
	): Promise<R | undefined> => {
		// console.log("HANDLE REQUEST");
		const type = "query" in options ? "Query" : "Mutation";

		try {
			let response;

			const client = await this.loadClient(uri, requestOptions);
			response =
				type === "Query"
					? await client.query<R>(options as PureQueryOptions)
					: await client.mutate<R>(options as any);

			const { data, errors } = response as any; // type to be set above in <R>, any for now
			// validating if response returned any errors, handling, returning undefined
			if (errors) {
				errors.forEach(({ message }, i) =>
					console.error(
						`[${type}]: Apollo client error [${i}]: ${message}\n`,
						`Debug info - ${type}, Variables: ${JSON.stringify(
							options?.variables
						)}`
					)
				);
				throw new Error("GraphQL request failed");
			}
			//if no errors, return response data or R
			// console.log("RETURN DATA");
			return data?.data || (data as R);
		} catch (error) {
			this.handleError(type, error, options);
			throw error;
		}
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
		// console.log("PREPARR QUERY");
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
	 * @returns The response data.
	 */

	public request = async <R>(
		uri: string,
		options: PureQueryOptions | any,
		requestOptions: any = {
			cacheKey: undefined,
			automaticPersistedQueries: false,
			GETAutomaticPersistedQueries: false,
		}
	): Promise<R | undefined> => {
		// console.log("REQUEST TO APOLLO");
		return await this.handleRequest<R>(uri, options, requestOptions);
	};
}

const apolloClient = new ApolloClient();
export default apolloClient;
