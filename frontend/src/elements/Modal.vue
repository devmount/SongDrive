<template>
	<transition-fade>
		<div
			v-if="active"
			class="fixed top-0 left-0 z-40 w-screen h-screen bg-blade-750/50 dark:bg-black/50"
			@click.prevent="emit('closed')"
		></div>
	</transition-fade>
	<transition-scale>
		<div
			v-if="active"
			class="fixed z-40 position-center rounded-sm shadow-l w-full max-w-sm p-4 flex flex-col gap-4"
			:class="{
				'bg-blade-100 dark:bg-blade-850': !theme,
				'bg-white text-black': theme === themes.white,
				'bg-black text-white': theme === themes.black,
				'!max-w-md': size === sizes.md,
				'!max-w-lg': size === sizes.lg,
				'!max-w-xl': size === sizes.xl,
				'!max-w-2xl h-screen xs:h-2/3v': size === sizes.xl2,
				'!max-w-3xl h-screen xs:h-2/3v': size === sizes.xl3,
				'!max-w-5xl h-screen md:h-3/4v': size === sizes.xl5,
				'!max-w-6xl h-screen lg:h-4/5v': size === sizes.xl6,
				'!max-w-7xl h-screen lg:h-4/5v': size === sizes.xl7,
				'!max-w-none w-screen h-screen': size === sizes.full,
			}"
			@click.stop="null"
		>
			<div class="flex justify-between">
				<div class="text-lg uppercase font-medium">{{ title }}</div>
				<slot name="close">
					<button aria-label="Close" @click="emit('closed')">
						<icon-x class="w-6 h-6 stroke-1.5" />
					</button>
				</slot>
			</div>
			<slot></slot>
		</div>
	</transition-scale>
</template>

<script setup>
import { watch } from 'vue';
import TransitionFade from '@/elements/TransitionFade.vue';
import TransitionScale from '@/elements/TransitionScale.vue';

// icons
import { IconX } from '@tabler/icons-vue';

// component properties
const props = defineProps({
	active: Boolean, // state of modal display, true to show modal
	theme:  String,  // theme mode (optional), black|white
	title:  String,  // title to display on top
	size:   String,  // maximum width for modal
	child:  Boolean, // true if modal is called from within another modal
});

// emits
const emit = defineEmits(['closed']);

watch(
	() => props.active,
	(newValue) => {
		if (newValue && !props.child) {
			document.body.classList.add('overflow-y-hidden');
		}
		else if (!newValue && !props.child) {
			document.body.classList.remove('overflow-y-hidden');
		}
	}
);

// available modal sizes
const sizes = {
	md: 'md',
	lg: 'lg',
	xl: 'xl',
	xl2: 'xl2',
	xl3: 'xl3',
	xl5: 'xl5',
	xl6: 'xl6',
	xl7: 'xl7',
	full: 'full',
}

// available themes
const themes = {
	white: 'white',
	black: 'black',
}
</script>
