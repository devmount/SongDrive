<template>
	<modal-dialog
		v-if="song"
		:active="active"
		:title="song.title"
		:theme="dark ? 'black' : 'white'"
		size="full"
		@closed="emit('closed')"
	>
		<template #close><i></i></template>
		<div class="h-full overflow-y-auto px-4 pb-12 xs:pb-0">
			<!-- song contnt -->
			<song-content
				:content="song.content"
				:chords="chords"
				:key-offset="keyOffset"
				:presentation="true"
				ref="songContentRef"
			/>
			<!-- toolbar -->
			<div class="fixed bottom-2 right-2 flex gap-2">
				<secondary-button
					:title="tooltip('lightMode')"
					@click.prevent="dark = !dark"
				>
					<icon-brightness class="w-5 h-5 stroke-1.5" :class="{ 'stroke-spring-400': !dark }" />
				</secondary-button>
				<secondary-button
					:title="tooltip('chords')"
					@click.prevent="emit('chords')"
				>
					<icon-music v-if="chords" class="w-5 h-5 stroke-1.5 stroke-spring-400" />
					<icon-music-off v-else class="w-5 h-5 stroke-1.5" />
				</secondary-button>
				<button
					class="p-2 text-blade-500"
					:title="tooltip('close')"
					@click.prevent="emit('closed')"
				>
					<icon-x class="w-5 h-5 stroke-1.5" />
				</button>
			</div>
		</div>
	</modal-dialog>
</template>

<script setup lang="ts">
import { injectStrict, hkCancelKey, hkThemeKey } from '@/keys';
import { ref, watch, onMounted, onUnmounted, nextTick, type PropType } from 'vue';
import { whenever } from '@vueuse/core';
import { useI18n } from 'vue-i18n';
import ModalDialog from '@/elements/ModalDialog.vue';
import SecondaryButton from '@/elements/SecondaryButton.vue';
import SongContent from '@/partials/SongContent.vue';
import type { SongEntity } from '@backend/models';

// icons
import {
	IconBrightness,
	IconMusic,
	IconMusicOff,
	IconX,
} from '@tabler/icons-vue';

// component constants
const { t } = useI18n();

// handle hotkeys for this component
const hkTheme = injectStrict(hkThemeKey);
const hkCancel = injectStrict(hkCancelKey);

// inherited properties
const props = defineProps({
	active:     Boolean, // state of modal display, true to show modal
	chords:     Boolean, // true if chords shall be rendered
	song:       Object as PropType<SongEntity>,  // single song to present
	keyOffset:  Number,  // semitone offset from the song's base key to present it in
});

// manual theme selection
const dark = ref(true);

// timeouts for resize debouncing
const resizeTimeout = ref<ReturnType<typeof setTimeout>>();
const songContentRef = ref<InstanceType<typeof SongContent>>();

// emits
const emit = defineEmits(['chords', 'closed']);

// adapt presentation content to viewport
const maximizeFontsize = () => {
	// wait for dom to be ready
	nextTick(() => {
		// maximize content of presented song
		songContentRef.value?.maximizeFontsize();
	});
};
// handle viewport resize
const resizeHandler = () => {
	clearTimeout(resizeTimeout.value); // debounce resize event
	resizeTimeout.value = setTimeout(() => {
		maximizeFontsize();
	}, 500);
};
// handle tooltips
const tooltip = (target: string) => {
	switch (target) {
		case 'lightMode':
			return t('tooltip.invertColors') + '\n' + t('key.ctrl') + ' + ' + t('key.L');
		case 'chords':
			return t('tooltip.chords' + (!props.chords ? 'Show' : 'Hide')) + '\n' + t('key.ctrl') + ' + ' + t('key.K');
		case 'close':
			return t('tooltip.presentationClose') + '\n' + t('key.esc');
		default:
			break;
	}
};

// maximize fontsize initially and when chords are toggled
watch (
	[() => props.active, () => props.chords],
	() => maximizeFontsize()
);

// handle mount / unmount hooks
onMounted(() => {
	// handle viewport resizes
	window.addEventListener('resize', resizeHandler);
});
onUnmounted(() => {
	window.removeEventListener('resize', resizeHandler);
});

// component shortcuts
whenever(
	hkTheme,
	() => dark.value = !dark.value
);
whenever(
	hkCancel,
	() => emit('closed')
);
</script>
