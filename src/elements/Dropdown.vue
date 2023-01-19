<template>
	<slot name="trigger">
		<secondary-button @click="open = !open" @focusout="open = false">
			<ion-icon :icon="ellipsisHorizontalOutline" />
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
import { ellipsisHorizontalOutline } from 'ionicons/icons';
import { ref } from 'vue';
import TransitionScale from '@/elements/TransitionScale.vue';
import SecondaryButton from '@/elements/SecondaryButton.vue';

// dropdown state
const open = ref(false);
</script>
