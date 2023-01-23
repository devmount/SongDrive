<template>
	<slot name="trigger">
		<secondary-button @click="open = !open" @focusout="open = false">
			<dots-icon class="w-5 h-5 stroke-1.5" />
		</secondary-button>
	</slot>
	<transition-scale>
		<div v-if="open" class="relative">
			<div class="absolute top-0 right-0 p-1 bg-blade-200 dark:bg-blade-900 z-10 w-max rounded-sm shadow-lg">
				<slot></slot>
			</div>
		</div>
	</transition-scale>
</template>

<script setup>
import { ref } from 'vue';
import SecondaryButton from '@/elements/SecondaryButton.vue';
import TransitionScale from '@/elements/TransitionScale.vue';

// icons
import { DotsIcon } from 'vue-tabler-icons';

// dropdown state
const open = ref(false);
</script>
