<script setup lang="ts">
	import { comment } from "postcss";
	import {
		GET_POST_QUERY,
		GET_POST_IMAGE_QUERY,
		CREATE_COMMENT_QUERY,
	} from "~/api/queries";
	const { $apolloClient, graphqlUri } = useGraphQLClient();
	const route = useRoute();
	import type { Photo } from "~/utils/types";

	type ArticleResponse = {
		post: { title: string; id: number; body: string };
	};
	type CommentType = {
		name: string;
		email: string;
		body: string;
	};

	type CreateCommentResponse = {
		createComment: {
			name: string;
			email: string;
			body: string;
			id: string;
			__typename: string;
		};
	};
	type Comments = CommentType[];
	type Article = { title: string; id: number; body: string };
	const data = ref<Article>();
	const comment = ref<CommentType>({ name: "", email: "", body: "" });
	const comments = ref<Comments>([]);
	const loading = ref<boolean>(true);
	const commentLoading = ref<boolean>(false);
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

	async function postComment(): Promise<void> {
		commentLoading.value = true;
		try {
			const response = (await $apolloClient.request(graphqlUri, {
				query: CREATE_COMMENT_QUERY,
				variables: {
					input: comment.value,
				},
			})) as CreateCommentResponse;
			comments.value.push(response.createComment);
			comment.value = { name: "", email: "", body: "" };
		} catch (error) {
			console.error(error);
		} finally {
			commentLoading.value = false;
		}
	}

	onMounted(async () => {
		// request async content and Image photo
		getContent();
		getPhoto();
	});
</script>
<template>
	<div
		class="container mx-auto grid grid-cols-12 w-full py-4 lg:py-10 space-y-4"
	>
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
		<div
			class="lg:col-start-2 col-span-12 lg:col-span-6 bg-white p-2 pb-6 rounded-xl text-gray-800"
			v-if="!loading"
		>
			<div>
				<h3 class="font-semibold text-2xl mb-2">Comments</h3>
				<p class="text-gray-600 my-2" v-if="!comments.length">
					No comments. Be the first!
				</p>
				<div
					class="flex flex-col my-2"
					v-for="(comment, index) in comments"
					:key="index"
				>
					<div class="text-sm text-gray-600 font-semibold">
						{{ comment.name }}
					</div>
					<div class="col-span-11 text-gray-800">{{ comment.body }}</div>
				</div>
				<h3 class="font-semibold text-xl mb-2 border-t-2 pt-2">
					Post a comment
				</h3>
				<form @submit.prevent="postComment" class="space-y-2">
					<div class="grid grid-cols-2 gap-2">
						<input
							type="text"
							v-model="comment.name"
							required
							class="bg-gray-100 rounded-xl w-full py-2 px-4"
							placeholder="Type name"
						/>
						<input
							type="email"
							v-model="comment.email"
							required
							class="bg-gray-100 rounded-xl w-full py-2 px-4"
							placeholder="Type email"
						/>
					</div>
					<input
						type="text"
						v-model="comment.body"
						required
						class="bg-gray-100 rounded-xl w-full py-2 px-4"
						placeholder="Type comment"
					/>
					<div class="text-right">
						<button
							:disabled="commentLoading"
							:class="{ 'opacity-50': commentLoading }"
							class="px-4 py-2 rounded font-medium bg-orange-400 text-white hover:bg-orange-600 transition"
						>
							Submit
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
</template>
