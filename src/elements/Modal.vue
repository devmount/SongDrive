<template>
	<transition-scale>
		<div
			v-if="active"
			class="
				fixed z-50 position-center rounded-sm w-full max-w-sm bg-blade-100 p-4 flex flex-col gap-4
				dark:bg-blade-850
			"
			:class="{
				'max-w-md': size === sizes.md,
				'max-w-lg': size === sizes.lg,
				'max-w-xl': size === sizes.xl,
			}"
			@click.stop="null"
		>
			<div class="flex justify-between">
				<div class="text-lg uppercase font-medium">{{ title }}</div>
				<button aria-label="Close" @click="emit('closed')">
					<x-icon class="w-6 h-6 stroke-1.5" />
				</button>
			</div>
			<slot></slot>
		</div>
	</transition-scale>
	<transition-fade>
		<div
			v-if="active"
			class="fixed top-0 left-0 z-40 w-screen h-screen bg-blade-750/50 dark:bg-black/50"
			@click.prevent="emit('closed')"
		></div>
	</transition-fade>
</template>

<script setup>
import TransitionFade from '@/elements/TransitionFade.vue';
import TransitionScale from '@/elements/TransitionScale.vue';

// icons
import { XIcon } from 'vue-tabler-icons';

// component properties
const props = defineProps({
	active: Boolean, // state of modal display, true to show modal
  title:  String,  // titel to display on top
  size:   String,  // maximum width for modal
});

// emits
const emit = defineEmits(['closed']);

// available modal sizes
const sizes = {
	md: 'md',
	lg: 'lg',
	xl: 'xl',
}
</script>
