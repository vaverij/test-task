<script setup lang="ts">
	const imageLoaded = ref<boolean>(false);
</script>
<template>
	<div class="container mx-auto grid grid-cols-12 w-full py-4 lg:py-10">
		<div
			class="lg:col-start-2 col-span-12 lg:col-span-6 bg-white p-2 pb-6 rounded-xl space-y-2 text-gray-800"
		>
			<div
				class="animate-pulse transition rounded-xl"
				:class="{
					hidden: imageLoaded,
				}"
			>
				<div class="h-96 bg-slate-400 rounded-xl w-full mb-4"></div>
			</div>
			<NuxtImg
				class="rounded-xl object-cover w-full transition h-96 mb-3"
				@load="imageLoaded = true"
				:class="{ hidden: !imageLoaded }"
				src="https://fv5-4.failiem.lv/thumb_show.php?i=zgze8e784j&view&v=1&PHPSESSID=a896c099def6dbb1e88577977ebb559b46cca797"
			/>
			<div class="px-4 space-y-2">
				<h1 class="text-3xl font-bold">Hello!</h1>
				<p>
					My name is Janis, and this is my first project written using Nuxt, TS
					and VueJS. While there is a lot of room for improvement, I really
					enjoyed playing with it.
				</p>
				<p>Ah, and yes - this is a test task.</p>
				<p>I hope to receive a (good) feedback :)</p>
				<p>Here's a short video for fun:</p>
				<iframe
					width="100%"
					height="315"
					src="https://www.youtube.com/embed/dQw4w9WgXcQ?si=VxcPihGJ5jt3Bzg0"
					title="YouTube video player"
					frameborder="0"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
					referrerpolicy="strict-origin-when-cross-origin"
					allowfullscreen
				></iframe>
			</div>
		</div>
	</div>
</template>
