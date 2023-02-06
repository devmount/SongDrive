<template>
	<modal
		:active="active"
		:title="song.title"
		:theme="dark ? 'black' : 'white'"
		size="full"
		@closed="emit('closed')"
	>
		<template #close><span></span></template>
		<div
			ref="containerRef"
			tabindex="0"
			@keydown.ctrl.i.prevent="song.note ? showModal.infosongdata = !showModal.infosongdata : null"
			@keydown.ctrl.l.prevent="dark = !dark"
			@keydown.esc.exact="emit('closed')"
		>
			<!-- song contnt -->
			<song-content
				:content="song.content"
				:chords="chords"
				:tuning="tuning"
				:presentation="true"
				ref="songContentRef"
			/>
			<!-- toolbar -->
			<div class="absolute bottom-2 right-2 flex gap-2">
				<secondary-button
					:disabled="!song.note"
					:title="tooltip('info')"
					@click="song.note ? showModal.infosongdata = true : null"
				>
					<info-circle-icon :class="{ 'stroke-spring-400': showModal.infosongdata }" />
				</secondary-button>
				<secondary-button
					:title="tooltip('lightMode')"
					@click.prevent="dark = !dark"
				>
					<brightness-icon v-if="!dark" class="stroke-spring-400" />
					<brightness-off-icon v-else />
				</secondary-button>
				<secondary-button
					:title="tooltip('chords')"
					@click.prevent="emit('chords')"
				>
					<music-icon v-if="chords" class="stroke-spring-400" />
					<music-off-icon v-else />
				</secondary-button>
				<secondary-button
					:title="tooltip('close')"
					@click.prevent="emit('closed')"
				>
					<x-icon />
				</secondary-button>
			</div>
		</div>
	</modal>
	<!-- modal: info song note -->
	<info-song-data
		v-if="showModal.infosongdata"
		:active="showModal.infosongdata"
		:song="song"
		@closed="showModal.infosongdata = false"
	/>
</template>

<script setup>
import { reactive, ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useI18n } from "vue-i18n";
import InfoSongData from '@/modals/InfoSongData';
import Modal from '@/elements/Modal';
import SecondaryButton from '@/elements/SecondaryButton';
import SongContent from '@/partials/SongContent';

// icons
import {
	BrightnessIcon,
	BrightnessOffIcon,
	InfoCircleIcon,
	MusicIcon,
	MusicOffIcon,
	XIcon,
} from "vue-tabler-icons";

// component constants
const { t } = useI18n();

// inherited properties
const props = defineProps({
	active: Boolean,  // state of modal display, true to show modal
	chords: Boolean,  // true if chords shall be rendered
	song:   Object,   // single song to present
	tuning: Number,   // key to present song in
});

// reactive data
const showModal = reactive({
	infosongdata: false
});

// manual theme selection
const dark = ref(true);

// timeouts for resize debouncing
const resizeTimeout = ref(null);
const songContentRef = ref(null);
const containerRef = ref(null);

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
const tooltip = (target) => {
	switch (target) {
		case 'info':
			return props.song.note
				? t('tooltip.infoSongData') + '\n' + t('key.ctrl') + ' + ' + t('key.I')
				: t('tooltip.noSongInfo');
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
	// focus container to properly target keyboard shortcuts
	containerRef.value?.focus();
});
onUnmounted(() => {
	window.removeEventListener('resize', resizeHandler);
});
</script>
