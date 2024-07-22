import ApolloClient from "~/utils/apollo-client";

export default defineNuxtPlugin(() => {
	const runtimeConfig = useRuntimeConfig();

	return {
		provide: {
			apolloClient: ApolloClient,
			graphqlUri: runtimeConfig.public.graphqlUri,
		},
	};
});
