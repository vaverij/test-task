<script setup lang="ts">
	import { GET_POSTS_QUERY } from "~/api/queries";
	import ArticleComponent from "~/components/articles/Article.vue";
	import type { ArticlesResponse, Article } from "~/utils/types";

	const { $apolloClient, graphqlUri } = useGraphQLClient();

	type Articles = Article[];
	type Links = ArticlesResponse["posts"]["links"];

	const data = ref<Articles>([]);
	const links = ref<Links>();
	const loading = ref<boolean>(true);

	// query params for get posts request
	const options = {
		options: {
			paginate: {
				page: 1,
				limit: 7,
			},
		},
	};

	function createDummyArticles(): void {
		let dummyArticles: Articles = [];
		//create dummy data to indicate loading
		for (let index = 0; index < options.options.paginate.limit; index++) {
			dummyArticles.push({ id: index, title: null });
		}
		data.value = dummyArticles;
	}

	async function requestData(page = 1): Promise<void> {
		options.options.paginate.page = page;
		loading.value = true;
		try {
			const response = (await $apolloClient.request(graphqlUri, {
				query: GET_POSTS_QUERY,
				variables: options,
			})) as ArticlesResponse;

			data.value = response.posts.data;
			links.value = response.posts.links;
			loading.value = false;
		} catch (error) {
			console.error(error);
		}
	}

	onMounted(async () => {
		//create dummy articles to show something (loading indication)
		createDummyArticles();
		//request articles
		requestData();
	});
</script>
<template>
	<div class="container mx-auto grid grid-cols-12 w-full">
		<div class="lg:col-start-2 col-span-12 lg:col-span-10">
			<p class="text-3xl text-gray-800 py-6">
				<span class="font-semibold">Todays</span> headlines
			</p>
			<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
				<template v-for="(article, index) in data" :key="article.id">
					<div v-if="index === 0" class="lg:col-span-3">
						<ArticleComponent :article="article" :loading="loading" size="lg" />
					</div>
					<div v-else-if="index < 4" class="flex-1 flex">
						<ArticleComponent :article="article" :loading="loading" />
					</div>
					<div v-else>
						<ArticleComponent :article="article" :loading="loading" size="xs" />
					</div>
				</template>
			</div>
		</div>
	</div>
</template>
