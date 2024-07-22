<script setup lang="ts">
	const props = defineProps({
		link: { required: true },
	});
</script>
<template>
	<button
		class="px-4 py-2 rounded font-medium bg-orange-400 text-white hover:bg-orange-600 transition"
		:disabled="!link"
		:class="{ 'opacity-50': !link }"
	>
		<slot></slot>
	</button>
</template>
