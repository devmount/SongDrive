<template>
	<div
		class="transition-all fixed top-0 left-0 z-40 w-screen h-screen bg-blade-750/50 dark:bg-black/50"
		:class="{ 'hidden': !active }"
		@click.prevent="emit('closed')"
	>
		<div
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
					<ion-icon :icon="closeOutline" class="w-6 h-6" />
				</button>
			</div>
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { closeOutline } from 'ionicons/icons';

// inherited properties
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
