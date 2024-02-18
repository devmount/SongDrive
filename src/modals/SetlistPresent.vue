<template>
	<modal
		:active="active"
		:theme="dark ? 'black' : 'white'"
		size="full"
		@closed="emit('closed')"
	>
		<template #close><i></i></template>
		<div class="h-full !w-full overflow-y-auto pb-12 xs:pb-0">
			<div
				v-if="songs && songs.length > 0"
				class="transition-opacity h-full"
				:class="{ 'opacity-0': hide }"
			>
				<carousel
					ref="presentation"
					class="!w-full h-full bg-transparent"
					v-model="currentPosition"
				>
					<slide v-for="(song, i) in songs" :key="i" :index="i" class="!items-start text-left">
						<song-content
							:content="song.content"
							:chords="chords"
							:tuning="song.customTuningDelta"
							:presentation="true"
							ref="songContentRef"
						/>
					</slide>
					<template #addons>
						<pagination
							class="fixed md:absolute w-screen md:w-auto z-50 bottom-0 left-0 md:left-2 !m-0 md:gap-2"
						/>
					</template>
				</carousel>
			</div>
			<!-- toolbar -->
			<div
				class="group fixed z-40 bottom-2 right-2 w-full flex justify-end items-center gap-1 transition-opacity"
				:class="{ 'opacity-0 hover:opacity-100': !chords }"
			>
				<!-- back navigation -->
				<secondary-button
					class="absolute bottom-0 left-4 md:left-auto md:right-1/2 flex items-center gap-1 mr-0.5"
					:disabled="currentPosition == 0"
					title="Previous Song"
					@click="presentation.prev()"
				>
					<icon-arrow-left />
					<div v-if="currentPosition > 0" class="hidden md:flex items-center gap-2">
						<div class="hidden 2xl:block max-w-3xs truncate">
							{{ songs[currentPosition-1].title }}
						</div>
						<div class="text-lg leading-4 font-mono font-bold text-spring-600 dark:text-spring-400">
							{{ songs[currentPosition-1].customTuning }}
						</div>
					</div>
				</secondary-button>
				<!-- forward navigation -->
				<secondary-button
					class="absolute bottom-0 left-16 md:left-1/2 flex items-center gap-1 ml-0.5"
					:disabled="currentPosition == songs.length-1"
					title="Next Song"
					@click="presentation.next()"
				>
					<div v-if="currentPosition < songs.length-1" class="hidden md:flex items-center gap-2">
						<div class="hidden 2xl:block max-w-3xs truncate">
							{{ songs[currentPosition+1].title }}
						</div>
						<div class="text-lg leading-4 font-mono font-bold text-spring-600 dark:text-spring-400">
							{{ songs[currentPosition+1].customTuning }}
						</div>
					</div>
					<icon-arrow-right />
				</secondary-button>
				<!-- live clock -->
				<div class="font-mono text-2xl px-4">{{ timeonly }}</div>
				<!-- song info -->
				<secondary-button
					class="hidden lg:block"
					:disabled="!songs[currentPosition].note"
					:title="tooltip('info')"
					@click="songs[currentPosition].note ? showModal.infosongdata = true : null"
				>
					<icon-info-circle :class="{ 'stroke-spring-400': showModal.infosongdata }" />
				</secondary-button>
				<!-- toggle synchronisation -->
				<secondary-button
					class="hidden lg:block"
					:title="tooltip('sync')"
					@click="autoSync = !autoSync"
				>
					<icon-refresh v-if="autoSync" class="stroke-spring-400" />
					<icon-refresh-off v-else />
				</secondary-button>
				<!-- toggle content visibility -->
				<secondary-button
					class="hidden lg:block"
					:title="tooltip('display')"
					@click="hide = !hide"
				>
					<icon-eye v-if="!hide" class="stroke-spring-400" />
					<icon-eye-off v-else />
				</secondary-button>
				<!-- toggle theme -->
				<secondary-button
					class="hidden lg:block"
					:title="tooltip('invert')"
					@click="dark = !dark"
				>
					<icon-brightness :class="{ 'stroke-spring-400': !dark }" />
				</secondary-button>
				<!-- toggle chords -->
				<secondary-button
					class="hidden lg:block"
					:title="tooltip('chords')"
					@click="emit('chords')"
				>
					<icon-music v-if="chords" class="stroke-spring-400" />
					<icon-music-off v-else />
				</secondary-button>
				<!-- dropdown for small viewports -->
				<div class="lg:hidden">
					<dropdown position="up">
						<button
							class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
							:disabled="!songs[currentPosition].note"
							@click="songs[currentPosition].note ? showModal.infosongdata = true : null"
						>
							<icon-info-circle :class="{ 'stroke-spring-400': showModal.infosongdata }" />
							{{ songs[currentPosition].note ? t('tooltip.infoSongData') : t('tooltip.noSongInfo') }}
						</button>
						<!-- toggle synchronisation -->
						<button
							class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
							@click="autoSync = !autoSync"
						>
							<icon-refresh v-if="autoSync" class="stroke-spring-400" />
							<icon-refresh-off v-else />
							{{ t('tooltip.sync' + (!autoSync ? 'On' : 'Off')) }}
						</button>
						<!-- toggle content visibility -->
						<button
							class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
							@click="hide = !hide"
						>
							<icon-eye v-if="!hide" class="stroke-spring-400" />
							<icon-eye-off v-else />
							{{ t('tooltip.presentation' + (hide ? 'Show' : 'Hide')) }}
						</button>
						<!-- toggle theme -->
						<button
							class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
							@click="dark = !dark"
						>
							<icon-brightness :class="{ 'stroke-spring-400': !dark }" />
							{{ t('tooltip.invertColors') }}
						</button>
						<!-- toggle chords -->
						<button
							class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
							@click="emit('chords')"
						>
							<icon-music v-if="chords" class="stroke-spring-400" />
							<icon-music-off v-else />
							{{ t('tooltip.chords' + (!chords ? 'Show' : 'Hide')) }}
						</button>
					</dropdown>
				</div>
				<!-- exit presentation -->
				<button
					class="p-2 text-blade-500"
					:title="tooltip('close')"
					@click="emit('closed')"
				>
					<icon-x />
				</button>
				<!-- remote toolbar -->
				<div
					v-if="sync && !autoSync"
					class="flex items-center gap-1 p-1 absolute -top-8 right-10 opacity-0 transition-all group-hover:-top-12 group-hover:opacity-100"
				>
					<span class="text-uppercase mr-2">{{ t('text.remoteControl') }}</span>
					<secondary-button
						:title="tooltip('remoteDisplay')"
						@click="emit('updateHide', !remoteHide)"
					>
						<icon-eye v-if="!remoteHide" class="stroke-spring-400" />
						<icon-eye-off v-else />
					</secondary-button>
					<secondary-button
						:title="tooltip('remoteInvert')"
						@click="emit('updateDark', !remoteLight)"
					>
						<icon-brightness :class="{ 'stroke-spring-400': remoteLight }" />
					</secondary-button>
					<secondary-button
						:title="tooltip('remoteChords')"
						@click="emit('updateChords', !remoteText)"
					>
						<icon-music v-if="!remoteText" class="stroke-spring-400" />
						<icon-music-off v-else />
					</secondary-button>
				</div>
			</div>
		</div>
	</modal>
	<!-- modal: info song note -->
	<info-song-data
		:active="showModal.infosongdata"
		:song="songs[currentPosition]"
		@closed="showModal.infosongdata = false"
	/>
</template>

<script setup>
import 'vue3-carousel/dist/carousel.css';
import { Carousel, Slide, Pagination } from 'vue3-carousel';
import { logicOr } from '@vueuse/math';
import { whenever } from '@vueuse/core';
import { reactive, ref, computed, watch, onMounted, onUnmounted, nextTick, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import Dropdown from '@/elements/Dropdown.vue';
import InfoSongData from '@/modals/InfoSongData.vue';
import Modal from '@/elements/Modal.vue';
import SecondaryButton from '@/elements/SecondaryButton.vue';
import SongContent from '@/partials/SongContent.vue';

// icons
import {
	IconArrowLeft,
	IconArrowRight,
	IconBrightness,
	IconEye,
	IconEyeOff,
	IconInfoCircle,
	IconMusic,
	IconMusicOff,
	IconRefresh,
	IconRefreshOff,
	IconX,
} from '@tabler/icons-vue';

// component constants
const { t } = useI18n();

// handle hotkeys for this component
const hkBack = inject('hkBack');
const hkForward = inject('hkForward');
const hkUp = inject('hkUp');
const hkDown = inject('hkDown');
const hkInfo = inject('hkInfo');
const hkSync = inject('hkSync');
const hkHide = inject('hkHide');
const hkTheme = inject('hkTheme');
const hkChords = inject('hkChords');
const hkCancel = inject('hkCancel');

// inherited properties
const props = defineProps({
	active:      Boolean, // state of modal display, true to show modal
	chords:      Boolean, // true if chords shall be rendered
	position:    Number,  // list position of current song in the presentation
	remoteHide:  Boolean, // true if synced presentation should fade ouot
	remoteLight: Boolean, // true if synced presentation should show up in light mde
	remoteText:  Boolean, // true if synced presentation should be rendered without chords
	songs:       Array,   // list of songs to present
	sync:        Boolean, // true if setlist should send sync signals
});

// reactive data
const showModal = reactive({
	infosongdata: false
});
const presentation = ref(null);
const songContentRef = ref([]);
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
		for (let i = 0; i < songContentRef.value.length; i++) {
			songContentRef.value[i].maximizeFontsize();
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
watch (
	[() => props.active, () => props.chords, () => props.songs],
	() => maximizeFontsize()
);
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
	// TODO: workaround for initial slide width
	setInterval(() => {
		presentation.value?.updateSlideWidth();
	}, 0);
});
onUnmounted(() => {
	window.removeEventListener('resize', resizeHandler);
});


// component shortcuts
whenever(
	logicOr(hkUp, hkBack),
	() => presentation.value?.prev()
);
whenever(
	logicOr(hkDown, hkForward),
	() => presentation.value?.next()
);
whenever(
	hkInfo,
	() => props.songs[currentPosition.value].note ? showModal.infosongdata = !showModal.infosongdata : null
);
whenever(
	hkSync,
	() => autoSync.value = !autoSync.value
);
whenever(
	hkHide,
	() => hide.value = !hide.value
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
