<template>
	<div
		class="modal modal-lg modal-full modal-setlist-presentation"
		:class="{ active: active, light: !dark }"
		ref="container"
		tabindex="0"
		@keydown.up.exact="presentation.prev()"
		@keydown.left.exact="presentation.prev()"
		@keydown.down.exact="presentation.next()"
		@keydown.right.exact="presentation.next()"
		@keydown.ctrl.i.prevent="songs[currentPosition].note ? modal.infosongdata = !modal.infosongdata : null"
		@keydown.ctrl.s.prevent="autoSync = !autoSync"
		@keydown.ctrl.b.prevent="hide = !hide"
		@keydown.ctrl.l.prevent="dark = !dark"
		@keydown.esc.exact="emit('closed')"
	>
		<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="emit('closed')"></a>
		<transition name="fade">
			<div v-if="hide" class="hide"></div>
		</transition>
		<div class="modal-container">
			<div v-if="songs && songs.length > 0" class="modal-body">
				<Carousel
					ref="presentation"
					class="presentation"
					id="presentation"
					v-model="currentPosition"
					@updated="maximizeFontsize"
				>
					<Slide v-for="(song, i) in songs" :key="i" :index="i">
						<SongContent
							:content="song.content"
							:chords="chords"
							:tuning="song.customTuningDelta"
							:presentation="true"
							ref="slides"
						/>
					</Slide>
					<template #addons>
						<Pagination />
					</template>
				</Carousel>
			</div>
			<div class="modal-footer" :class="{ 'hidden': !chords}">
				<div class="navigation-prev">
					<a
						class="btn btn-secondary btn-xl btn-gray px-3"
						:class="{ disabled: currentPosition == 0 }"
						href="#"
						aria-label="Previous Song"
						@click.prevent="presentation.prev()"
					>
						<ion-icon :icon="arrowBack" class="icon-1-5x"></ion-icon>
						<span v-if="currentPosition > 0" class="ml-2">
							{{ songs[currentPosition-1].title }}
							<span class="chords ml-2">{{ songs[currentPosition-1].customTuning }}</span>
						</span>
					</a>
				</div>
				<div class="navigation-next">
					<a
						class="btn btn-secondary btn-xl btn-gray px-3 ml-1"
						:class="{ disabled: currentPosition == songs.length-1 }"
						href="#"
						aria-label="Next Song"
						@click.prevent="presentation.next()"
					>
						<span v-if="currentPosition < songs.length-1" class="mr-3">
							{{ songs[currentPosition+1].title }}
							<span class="chords ml-2">{{ songs[currentPosition+1].customTuning }}</span>
						</span>
						<ion-icon :icon="arrowForward" class="icon-1-5x"></ion-icon>
					</a>
				</div>
				<span class="clock px-4">{{ timeonly }}</span>
				<a
					class="btn btn-xl btn-fw btn-gray btn-toggle tooltip ml-4"
					:class="{
						'btn-secondary': !modal.infosongdata,
						'btn-primary': modal.infosongdata,
						'disabled': !songs[currentPosition].note
					}"
					href="#"
					aria-label="Song Data"
					@click="songs[currentPosition].note ? modal.infosongdata = true : null"
					:data-tooltip="tooltip('info')"
				>
					<ion-icon :icon="informationOutline" class="icon-1-5x"></ion-icon>
				</a>
				<a
					class="btn btn-xl btn-fw btn-gray btn-toggle tooltip ml-1"
					:class="{ 'btn-secondary': !autoSync, 'btn-primary': autoSync }"
					href="#"
					aria-label="AutoSync"
					@click.prevent="autoSync = !autoSync"
					:data-tooltip="tooltip('sync')"
				>
					<ion-icon :icon="sync" class="icon-1-5x"></ion-icon>
				</a>
				<a
					class="btn btn-xl btn-fw btn-gray btn-toggle tooltip tooltip-left ml-1"
					:class="{ 'btn-secondary': !hide, 'btn-primary': hide }"
					href="#"
					aria-label="Hide"
					@click.prevent="hide = !hide"
					:data-tooltip="tooltip('display')"
				>
					<ion-icon :icon="eyeOffOutline" class="icon-1-5x"></ion-icon>
				</a>
				<a
					class="btn btn-xl btn-fw btn-gray btn-toggle tooltip tooltip-left ml-1"
					:class="{ 'btn-secondary': dark, 'btn-primary': !dark }"
					href="#"
					aria-label="Light mode"
					@click.prevent="dark = !dark"
					:data-tooltip="tooltip('invert')"
				>
					<ion-icon :icon="contrastOutline" class="icon-1-5x"></ion-icon>
				</a>
				<a
					class="btn btn-xl btn-fw btn-gray btn-toggle tooltip tooltip-left ml-1"
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
				<div v-if="sync && !autoSync" class="remote-control">
					<span class="text-uppercase mr-2">{{ t('text.remoteControl') }}</span>
					<a
						class="btn btn-xl btn-fw btn-gray btn-toggle tooltip ml-1"
						:class="{ 'btn-secondary': !remoteHide, 'btn-primary': remoteHide }"
						href="#"
						:data-tooltip="tooltip('remoteDisplay')"
						@click.prevent="emit('updateHide', !remoteHide)"
					>
						<ion-icon :icon="eyeOffOutline" class="icon-1-5x"></ion-icon>
					</a>
					<a
						class="btn btn-xl btn-fw btn-gray btn-toggle tooltip ml-1"
						:class="{ 'btn-secondary': !remoteLight, 'btn-primary': remoteLight }"
						href="#"
						:data-tooltip="tooltip('remoteInvert')"
						@click.prevent="emit('updateDark', !remoteLight)"
					>
						<ion-icon :icon="contrastOutline" class="icon-1-5x"></ion-icon>
					</a>
					<a
						class="btn btn-xl btn-fw btn-gray btn-toggle tooltip ml-1"
						:class="{ 'btn-secondary': remoteText, 'btn-primary': !remoteText }"
						href="#"
						:data-tooltip="tooltip('remoteChords')"
						@click.prevent="emit('updateChords', !remoteText)"
					>
						<ion-icon :icon="musicalNotes" class="icon-1-5x"></ion-icon>
					</a>
				</div>
			</div>
		</div>
		<!-- modal: info song note -->
		<InfoSongData
			v-if="modal.infosongdata"
			:active="modal.infosongdata"
			:song="songs[currentPosition]"
			@closed="modal.infosongdata = false"
		/>
	</div>
</template>

<script setup>
import { reactive, ref, computed, inject, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useI18n } from "vue-i18n";
import 'vue3-carousel/dist/carousel.css';
import { Carousel, Slide, Pagination } from 'vue3-carousel';
import SongContent from '@/partials/SongContent';
import InfoSongData from '@/modals/InfoSongData';
import {
	arrowBack,
	arrowForward,
	close,
	contrastOutline,
	eyeOffOutline,
	informationOutline,
	musicalNotes,
	sync
} from 'ionicons/icons';
const { t } = useI18n();

// global properties
const db = inject('db');

// inherited properties
const props = defineProps({
	active: Boolean,      // state of modal display, true to show modal
	songs: Array,         // list of songs to present
	sync: Boolean,        // true if setlist should send sync signals
	position: Number,     // list position of current song in the presentation
	chords: Boolean,      // true if chords shall be rendered
	remoteHide: Boolean,  // true if synced presentation should fade ouot
	remoteLight: Boolean, // true if synced presentation should show up in light mde
	remoteText: Boolean,  // true if synced presentation should be rendered without chords
});

// reactive data
const modal = reactive({
	infosongdata: false
});
const container = ref(null);
const presentation = ref(null);
const slides = ref(null);
const currentPosition = ref(0);
const autoSync = ref(false);
const hide = ref(false);
const dark = ref(true);
const now = ref(new Date);
const blink = ref(true);
const resizeTimeout = ref(null);

// emits
const emit = defineEmits(['updatePosition', 'chords', 'updateHide', 'updateDark', 'updateChords', 'closed']);

// computed properties
const timeonly = computed(() => {
	const timestring = String(now.value).slice(16, 21);
	return blink.value ? timestring : timestring.replace(':', ' ');
});

// adapt presentation content to viewport
const maximizeFontsize = () => {
	// wait for dom to be ready
	nextTick(() => {
		// maximize content of each song/slide
		for (let i = 0; i < slides.value.length; i++) {
			slides.value[i]?.maximizeFontsize();
		}
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
		case 'info': return props.songs[currentPosition.value].note
			? t('tooltip.infoSongData') + '\n' + t('key.ctrl') + ' + ' + t('key.I')
			: t('tooltip.noSongInfo');
		case 'sync':
			return t('tooltip.sync' + (!autoSync.value ? 'On' : 'Off')) + '\n' + t('key.ctrl') + ' + ' + t('key.S');
		case 'display':
			return t('tooltip.presentation' + (hide.value ? 'Show' : 'Hide')) + '\n' + t('key.ctrl') + ' + ' + t('key.B');
		case 'invert':
			return t('tooltip.invertColors') + '\n' + t('key.ctrl') + ' + ' + t('key.L');
		case 'chords':
			return t('tooltip.chords' + (!props.chords ? 'Show' : 'Hide')) + '\n' + t('key.ctrl') + ' + ' + t('key.K');
		case 'close':
			return t('tooltip.presentationClose') + '\n' + t('key.esc');
		case 'remoteDisplay':
			return t('text.syncedDevices') + '\n' + t('tooltip.presentation' + (props.remoteHide ? 'Show' : 'Hide'));
		case 'remoteInvert':
			return t('text.syncedDevices') + '\n' + t('tooltip.invertColors');
		case 'remoteChords':
			return t('text.syncedDevices') + '\n' + t('tooltip.chords' + (props.remoteText ? 'Show' : 'Hide'));
		default:
			break;
	}
};

// watcher: update remote position if autoSync is on
watch (currentPosition, (newPosition) => {
	if (props.sync) {
		emit('updatePosition', newPosition);
	}
});
// watcher: update local position, content display and theme if autoSync was turned on
watch (autoSync, () => {
	if (autoSync.value) {
		presentation.value.slideTo(props.position);
		hide.value = props.remoteHide;
		dark.value = !props.remoteLight;
	}
});
// watcher: maximize fontsize again when chords are toggled or songs change
watch (() => props.chords, () => maximizeFontsize());
watch (() => props.songs, () => maximizeFontsize());
// watcher: update local position if autoSync is on and remote position was updated
watch (() => props.position, () => {
	if (autoSync.value) {
		presentation.value.slideTo(props.position);
	}
});
// update local chord display if autoSync is on and remote chords were updated
watch (() => props.remoteText, () => {
	if (autoSync.value) {
		emit('chords');
	}
});
// toggle local theme mode if autoSync is on and remote theme mode was updated
watch (() => props.remoteLight, () => {
	if (autoSync.value) {
		dark.value = !dark.value;
	}
});
// toggle local content display if autoSync is on and remote content display was updated
watch (() => props.remoteHide, (val) => {
	if (autoSync.value) {
		hide.value = val;
	}
});

// handle mount / unmount hooks
onMounted(() => {
	// alternate colon visibility of clock each second
	setInterval(() => {
		now.value = new Date;
		blink.value = !blink.value;
	}, 1000);
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
