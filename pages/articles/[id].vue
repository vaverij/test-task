<script setup lang="ts">
	import { GET_POST_QUERY, GET_POST_IMAGE_QUERY } from "~/api/queries";
	const { $apolloClient, graphqlUri } = useGraphQLClient();
	const route = useRoute();
	import type { Photo } from "~/utils/types";

	type ArticleResponse = {
		post: { title: string; id: number; body: string };
	};
	type Article = { title: string; id: number; body: string };
	const data = ref<Article>();
	const loading = ref<boolean>(true);
	const imageSrc = ref<string>("");
	const imageLoaded = ref<boolean>(false);

	async function getContent(): Promise<void> {
		try {
			const response = (await $apolloClient.request(graphqlUri, {
				query: GET_POST_QUERY,
				variables: {
					postId: route.params.id,
				},
			})) as ArticleResponse;

			data.value = response.post;
			loading.value = false;
		} catch (error) {
			console.error(error);
		}
	}

	async function getPhoto(): Promise<void> {
		try {
			const response = (await $apolloClient.request(graphqlUri, {
				query: GET_POST_IMAGE_QUERY,
				variables: {
					photoId: route.params.id,
				},
			})) as Photo;

			imageSrc.value = response.photo.url;
			loading.value = false;
		} catch (error) {
			console.error(error);
		}
	}

	onMounted(async () => {
		// request async content and Image photo
		getContent();
		getPhoto();
	});
</script>
<template>
	<div class="container mx-auto grid grid-cols-12 w-full py-4 lg:py-10">
		<div
			class="lg:col-start-2 col-span-12 lg:col-span-6 bg-white p-2 pb-6 rounded-xl text-gray-800"
		>
			<div v-if="data && !loading">
				<div
					class="animate-pulse transition rounded-xl"
					:class="{
						hidden: imageLoaded,
					}"
				>
					<div class="h-96 bg-slate-400 rounded-xl w-full mb-4"></div>
				</div>
				<img
					class="rounded-xl object-cover w-full transition h-96 mb-3"
					@load="imageLoaded = true"
					:class="{ hidden: !imageLoaded }"
					:src="imageSrc"
				/>

				<h1 class="font-bold text-3xl mb-4">{{ data.title }}</h1>
				<p>{{ data.body }}</p>
			</div>

			<div class="space-y-3 animate-pulse" v-else>
				<div class="h-96 bg-slate-400 rounded w-full mb-4"></div>
				<div class="h-8 bg-slate-400 rounded w-full mb-4"></div>
				<div class="h-4 bg-slate-400 rounded w-2/3"></div>
				<div class="h-4 bg-slate-400 rounded w-1/3"></div>
				<div class="h-4 bg-slate-400 rounded w-2/5"></div>
			</div>
		</div>
	</div>
</template>
