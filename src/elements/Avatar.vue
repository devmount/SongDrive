<template>
	<img
		v-if="photoUrl"
		class="rounded-full bg-spring-600"
		:class="{
			'w-6 h-6': size === sizes.sm,
			'w-10 h-10': size === sizes.md,
			'w-32 h-32': size === sizes.lg,
		}"
		:src="photoUrl"
		alt="Avatar"
	/>
	<figure
		v-else-if="name"
		class="flex justify-center items-center rounded-full bg-spring-600 font-semibold pb-0.5"
		:class="{
			'w-6 h-6 text-xs': size === sizes.sm,
			'w-10 h-10': size === sizes.md,
			'w-32 h-32 text-5xl': size === sizes.lg,
		}"
		alt="Avatar"
	>
		{{ initials(name) }}
	</figure>
	<figure
		v-else
		class="flex justify-center items-center rounded-full bg-spring-600"
		:class="{
			'w-6 h-6': size === sizes.sm,
			'w-10 h-10': size === sizes.md,
			'w-32 h-32': size === sizes.lg,
		}"
		alt="Avatar"
	>
		<icon-user
			:class="{
				'w-4 h-4': size === sizes.sm,
				'w-6 h-6': size === sizes.md,
				'w-20 h-20': size === sizes.lg,
			}"
			class="stroke-2"
		/>
	</figure>
</template>

<script setup>
import { initials } from '@/utils.js';

// icons
import { IconUser } from '@tabler/icons-vue';

// component properties
defineProps({
	photoUrl: String, // actual url of a profile image
	name:     String, // name of the user
	size:     String, // avatar size: sm | md | lg
});

// available avatar sizes
const sizes = {
	sm: "sm",
	md: "md",
	lg: "lg",
};
</script>
