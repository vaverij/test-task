<script setup lang="ts">
	import { GET_POSTS_QUERY } from "~/api/queries";
	import ArticleComponent from "~/components/articles/Article.vue";
	import PaginationButton from "~/components/ui/PaginationButton.vue";
	import type { ArticlesResponse } from "~/utils/types";
	const route = useRoute();
	const router = useRouter();

	const { $apolloClient, graphqlUri } = useGraphQLClient();

	type Article = { title: string | null; id: number };
	type Articles = Article[];
	type Links = ArticlesResponse["posts"]["links"];

	const data = ref<Articles>([]);
	const links = ref<Links>();
	const loading = ref<boolean>(true);
	const currentPage = ref<number>(1);

	// query params for get posts request
	const options = {
		options: {
			paginate: {
				page: 1,
				limit: 15,
			},
		},
	};

	const paginationLinks = [
		{ name: "First", type: "first" },
		{ name: "Previous", type: "prev" },
		{ name: "Next", type: "next" },
		{ name: "Last", type: "last" },
	];

	function createDummyArticles(): void {
		let dummyArticles: Articles = [];
		//create dummy data to indicate loading
		for (let index = 0; index < options.options.paginate.limit; index++) {
			dummyArticles.push({ id: index, title: null });
		}
		data.value = dummyArticles;
	}

	watch(
		() => route.query.page,
		(newPage) => {
			if (route.query) {
				currentPage.value = parseInt(
					typeof newPage === "string" ? newPage : "1"
				);
			} else {
				currentPage.value = 1;
			}
			requestData(currentPage.value);
		}
	);

	async function requestData(page = 1, initial = false): Promise<void> {
		options.options.paginate.page = page;
		if (!initial) {
			router.push({ path: "/articles", query: { page: page } });
		}
		loading.value = true;
		window.scrollTo({ top: 0, behavior: "smooth" });
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
		let pageNum: number;
		if (route.query) {
			pageNum = parseInt(
				typeof route.query.page === "string" ? route.query.page : "1"
			);
		} else {
			pageNum = 1;
		}

		requestData(pageNum, true);
	});
</script>
<template>
	<div class="container mx-auto grid grid-cols-12 w-full">
		<div class="lg:col-start-2 col-span-12 lg:col-span-10 py-4">
			<div class="grid grid-cols-1 lg:grid-cols-1 gap-4 mb-4">
				<div v-for="article in data" :key="article.id" class="">
					<ArticleComponent :article="article" :loading="loading" size="xs" />
				</div>
			</div>

			<div class="flex gap-3 justify-center" v-if="!loading && links">
				<PaginationButton
					v-for="(link, index) in paginationLinks"
					:key="index"
					:link="links[link.type]"
					@click="requestData(links[link.type]?.page)"
					>{{ link.name }}</PaginationButton
				>
			</div>
		</div>
	</div>
</template>
