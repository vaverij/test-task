export function useGraphQLClient() {
	const { $apolloClient } = useNuxtApp();
	const config = useRuntimeConfig();
	const graphqlUri = config.public.graphqlUri;

	return { $apolloClient, graphqlUri };
}
