<template>
	<div @click="open = !open" @focusout="open = false" class="h-full relative">
		<div v-if="showBadge" class="w-3 h-3 rounded-full bg-spring-700 border-2 border-blade-100 dark:border-blade-900 absolute -top-1 -right-1"></div>
		<slot name="trigger">
			<secondary-button class="h-full">
				<dots-icon class="w-5 h-5 stroke-1.5" />
			</secondary-button>
		</slot>
	</div>
	<transition-scale>
		<div v-if="open" class="relative">
			<div class="absolute top-0 right-0 p-1 bg-blade-200 dark:bg-blade-900 z-10 w-max rounded-sm shadow-lg flex flex-col gap-1">
				<slot></slot>
			</div>
		</div>
	</transition-scale>
</template>

<script setup>
import { ref } from 'vue';
import SecondaryButton from '@/elements/SecondaryButton';
import TransitionScale from '@/elements/TransitionScale';

// icons
import { DotsIcon } from 'vue-tabler-icons';

// component properties
const props = defineProps({
	showBadge: Boolean, // if true a small badge is shown
});

// dropdown state
const open = ref(false);
</script>
