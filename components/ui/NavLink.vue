<script setup lang="ts">
	const props = defineProps({
		to: { type: String, required: true },
	});
</script>
<template>
	<NuxtLink
		:to="to"
		:activeClass="'border-b-2'"
		class="flex gap-2 py-4 cursor-pointer border-orange-400 text-gray-800 font-semibold w-fit text-nowrap"
	>
		<slot />
	</NuxtLink>
</template>
