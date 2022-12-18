<template>
	<div
		class="modal modal-lg modal-full modal-presentation"
		:class="{ active: active, light: !dark }"
		ref="container"
		tabindex="0"
		@keydown.ctrl.i.prevent="song.note ? modal.infosongdata = !modal.infosongdata : null"
		@keydown.ctrl.l.prevent="dark = !dark"
		@keydown.esc.exact="emit('closed')"
	>
		<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="emit('closed')"></a>
		<div class="modal-container p-0">
			<div class="modal-header">
				<div class="modal-title h5 text-center">
					{{ song.title }}
					<span class="modal-subtitle h6 text-gray ml-3">{{ song.subtitle }}</span>
				</div>
			</div>
			<div v-if="song.content" class="modal-body">
				<SongContent
					:content="song.content"
					:chords="chords"
					:tuning="tuning"
					:presentation="true"
					ref="songcontent"
				/>
			</div>
			<div class="modal-footer">
				<a
					class="btn btn-xl btn-fw btn-gray btn-toggle tooltip ml-1"
					:class="{
						'btn-secondary': !modal.infosongdata,
						'btn-primary': modal.infosongdata ,
						'disabled': !song.note
					}"
					href="#"
					aria-label="Song Data"
					@click="song.note ? modal.infosongdata = true : null"
					:data-tooltip="tooltip('info')"
				>
					<ion-icon :icon="informationOutline" class="icon-1-5x"></ion-icon>
				</a>
				<a
					class="btn btn-xl btn-fw btn-gray btn-toggle tooltip ml-1"
					:class="{ 'btn-secondary': dark, 'btn-primary': !dark }"
					href="#"
					aria-label="Light mode"
					@click.prevent="dark = !dark"
					:data-tooltip="tooltip('lightMode')"
				>
					<ion-icon :icon="contrastOutline" class="icon-1-5x"></ion-icon>
				</a>
				<a
					class="btn btn-xl btn-fw btn-gray btn-toggle tooltip ml-1"
					:class="{ 'btn-secondary': !chords, 'btn-primary': chords }"
					href="#"
					aria-label="Chords"
					@click.prevent="emit('chords')"
					:data-tooltip="tooltip('chords')"
				>
					<ion-icon :icon="musicalNotes" class="icon-1-5x"></ion-icon>
				</a>
				<a
					class="btn btn-secondary btn-xl btn-fw btn-gray tooltip ml-1"
					href="#"
					aria-label="Cancel"
					@click.prevent="emit('closed')"
					:data-tooltip="tooltip('close')"
				>
					<ion-icon :icon="close" class="icon-1-5x"></ion-icon>
				</a>
			</div>
		</div>
		<!-- modal: info song note -->
		<InfoSongData
			v-if="modal.infosongdata"
			:active="modal.infosongdata"
			:song="song"
			@closed="modal.infosongdata = false"
		/>
	</div>
</template>

<script setup>
import { reactive, ref, inject, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useI18n } from "vue-i18n";
import SongContent from '@/partials/SongContent';
import InfoSongData from '@/modals/InfoSongData';
import {
	close,
	contrastOutline,
	informationOutline,
	musicalNotes
} from 'ionicons/icons';
const { t } = useI18n();

// inherited properties
const props = defineProps({
	active: Boolean,  // state of modal display, true to show modal
	song: Object,     // single song to present
	chords: Boolean,  // true if chords shall be rendered
	tuning: Number,   // key to present song in
});

// reactive data
const modal = reactive({
	infosongdata: false
});
const container = ref(null);
const songcontent = ref(null);
const dark = ref(true);
const resizeTimeout = ref(null);

// emits
const emit = defineEmits(['chords', 'closed']);

// adapt presentation content to viewport
const maximizeFontsize = () => {
	// wait for dom to be ready
	nextTick(() => {
		// maximize content of presented song
		songcontent.value?.maximizeFontsize();
	});
};
// handle viewport resize
const resizeHandler = () => {
	clearTimeout(resizeTimeout.value);
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

// watcher: maximize fontsize again when chords are toggled
watch (() => props.chords, () => maximizeFontsize());

// handle mount / unmount hooks
onMounted(() => {
	// handle viewport resizes
	window.addEventListener('resize', resizeHandler);
	// initially fit presentation into viewport
	maximizeFontsize();
	container.value.focus();
});
onUnmounted(() => {
	window.removeEventListener('resize', resizeHandler);
});
</script>
