<script setup lang="ts">
	import type { PropType } from "vue";
	import type { Article, Photo } from "~/utils/types";
	import { GET_POST_IMAGE_QUERY } from "~/api/queries";
	const { $apolloClient, graphqlUri } = useGraphQLClient();

	const props = defineProps({
		loading: { type: Boolean, required: true },
		size: { type: String, default: "sm" },
		article: { type: Object as PropType<Article>, required: true },
	});
	const loadingImage = ref<boolean>(true);
	const imageLoaded = ref<boolean>(false);
	const imageSrc = ref<string>("");

	async function requestData() {
		loadingImage.value = true;
		try {
			const response = (await $apolloClient.request(graphqlUri, {
				query: GET_POST_IMAGE_QUERY,
				variables: {
					photoId: props.article.id,
				},
			})) as Photo;

			imageSrc.value = response.photo.url;
			loadingImage.value = false;
		} catch (error) {
			console.error(error);
		}
	}

	onMounted(async () => {
		requestData();
	});
</script>
<template>
	<NuxtLink
		:to="{ name: 'articles-id', params: { id: article.id } }"
		class="w-full flex flex-1"
	>
		<div
			class="bg-white rounded-xl px-1 pt-1 pb-2 flex-1 transition"
			:class="{ 'grid grid-cols-3': size === 'xs' }"
		>
			<!-- loading skeleton -->
			<div
				class="animate-pulse transition"
				:class="{
					'h-96': size === 'lg',
					'h-44': size === 'sm',
					'h-24': size === 'xs',
					hidden: imageLoaded,
				}"
			>
				<div class="w-full h-full bg-slate-200"></div>
			</div>
			<!-- image will wait till it's loaded and then will hide skeleton -->
			<img
				:src="imageSrc"
				@load="imageLoaded = true"
				class="rounded-xl object-cover w-full transition"
				:class="{
					'h-96': size === 'lg',
					'h-44': size === 'sm',
					'h-24': size === 'xs',
					hidden: !imageLoaded,
				}"
			/>
			<div
				class="px-4 lg:px-8 py-4 space-y-2 flex flex-1"
				:class="{ 'col-span-2': size === 'xs', 'items-center': size === 'xs' }"
			>
				<div class="animate-pulse w-full" v-if="loading">
					<!-- loading skeleton -->
					<div
						class="w-full bg-slate-200"
						:class="{ 'h-12': size !== 'xs', 'h-8': size === 'xs' }"
					></div>
				</div>
				<h2
					class="my-auto"
					:class="{
						'font-semibold text-2xl': size !== 'xs',
						'font-medium text-2xl': size === 'sm',
						'text-lg': size === 'xs',
					}"
					v-if="!loading"
				>
					{{ article.title }}
				</h2>
			</div>
		</div>
	</NuxtLink>
</template>
