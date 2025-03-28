<template>
	<modal
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
				:tuning="tuning"
				:presentation="true"
				ref="songContentRef"
			/>
			<!-- toolbar -->
			<div class="fixed bottom-2 right-2 flex gap-2">
				<secondary-button
					:disabled="!song.note"
					:title="tooltip('info')"
					@click="song.note ? showModal.infosongdata = true : null"
				>
					<icon-info-circle class="w-5 h-5 stroke-1.5" :class="{ 'stroke-spring-400': showModal.infosongdata }" />
				</secondary-button>
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
	</modal>
	<!-- modal: info song note -->
	<info-song-data
		:active="showModal.infosongdata"
		:song="song"
		@closed="showModal.infosongdata = false"
	/>
</template>

<script setup>
import { reactive, ref, watch, onMounted, onUnmounted, nextTick, inject } from 'vue';
import { whenever } from '@vueuse/core';
import { useI18n } from 'vue-i18n';
import InfoSongData from '@/modals/InfoSongData.vue';
import Modal from '@/elements/Modal.vue';
import SecondaryButton from '@/elements/SecondaryButton.vue';
import SongContent from '@/partials/SongContent.vue';

// icons
import {
	IconBrightness,
	IconInfoCircle,
	IconMusic,
	IconMusicOff,
	IconX,
} from '@tabler/icons-vue';

// component constants
const { t } = useI18n();

// handle hotkeys for this component
const hkInfo = inject('hkInfo');
const hkTheme = inject('hkTheme');
const hkCancel = inject('hkCancel');

// inherited properties
const props = defineProps({
	active: Boolean, // state of modal display, true to show modal
	chords: Boolean, // true if chords shall be rendered
	song:   Object,  // single song to present
	tuning: Number,  // key to present song in
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
});
onUnmounted(() => {
	window.removeEventListener('resize', resizeHandler);
});

// component shortcuts
whenever(
	hkInfo,
	() => props.song.note ? showModal.infosongdata = !showModal.infosongdata : null
);
whenever(
	hkTheme,
	() => dark.value = !dark.value
);
whenever(
	hkCancel,
	() => emit('closed')
);
</script>
