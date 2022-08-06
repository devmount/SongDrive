<template>
	<div
		class="modal modal-lg modal-full modal-setlist-presentation"
		:class="{ active: active, light: !dark }"
		ref="container"
		tabindex="0"
		@keydown.up.exact="$refs.presentation.prev()"
		@keydown.left.exact="$refs.presentation.prev()"
		@keydown.down.exact="$refs.presentation.next()"
		@keydown.right.exact="$refs.presentation.next()"
		@keydown.ctrl.i.prevent="songs[currentPosition].note ? modal.infosongdata = !modal.infosongdata : null"
		@keydown.ctrl.s.prevent="autoSync = !autoSync"
		@keydown.ctrl.b.prevent="hide = !hide"
		@keydown.ctrl.l.prevent="dark = !dark"
		@keydown.esc.exact="$emit('closed')"
	>
		<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="$emit('closed')"></a>
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
							:ref="'songcontent' + i"
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
						@click.prevent="$refs.presentation.prev()"
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
						@click.prevent="$refs.presentation.next()"
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
					@click.prevent="$emit('chords')"
					:data-tooltip="tooltip('chords')"
				>
					<ion-icon :icon="musicalNotes" class="icon-1-5x"></ion-icon>
				</a>
				<a
					class="btn btn-secondary btn-xl btn-fw btn-gray tooltip ml-1"
					href="#"
					aria-label="Cancel"
					@click.prevent="$emit('closed')"
					:data-tooltip="tooltip('close')"
				>
					<ion-icon :icon="close" class="icon-1-5x"></ion-icon>
				</a>
				<div v-if="sync && !autoSync" class="remote-control">
					<span class="text-uppercase mr-2">{{ $t('text.remoteControl') }}</span>
					<a
						class="btn btn-xl btn-fw btn-gray btn-toggle tooltip ml-1"
						:class="{ 'btn-secondary': !remoteHide, 'btn-primary': remoteHide }"
						href="#"
						:data-tooltip="tooltip('remoteDisplay')"
						@click.prevent="$emit('updateHide', !remoteHide)"
					>
						<ion-icon :icon="eyeOffOutline" class="icon-1-5x"></ion-icon>
					</a>
					<a
						class="btn btn-xl btn-fw btn-gray btn-toggle tooltip ml-1"
						:class="{ 'btn-secondary': !remoteLight, 'btn-primary': remoteLight }"
						href="#"
						:data-tooltip="tooltip('remoteInvert')"
						@click.prevent="$emit('updateDark', !remoteLight)"
					>
						<ion-icon :icon="contrastOutline" class="icon-1-5x"></ion-icon>
					</a>
					<a
						class="btn btn-xl btn-fw btn-gray btn-toggle tooltip ml-1"
						:class="{ 'btn-secondary': remoteText, 'btn-primary': !remoteText }"
						href="#"
						:data-tooltip="tooltip('remoteChords')"
						@click.prevent="$emit('updateChords', !remoteText)"
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
// get icons
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
</script>

<script>
import { defineComponent } from 'vue';

// get carousel component
import 'vue3-carousel/dist/carousel.css';
import { Carousel, Slide, Pagination } from 'vue3-carousel';
// get internal components
import SongContent from '@/partials/SongContent';
import InfoSongData from '@/modals/InfoSongData';

export default defineComponent({
	name: 'setlist-present',
	components: {
		Carousel,
		Slide,
		Pagination,
		SongContent,
		InfoSongData,
	},
	props: {
		active: Boolean,
		songs: Array,
		sync: Boolean,
		position: Number,
		chords: Boolean,
		remoteHide: Boolean,
		remoteLight: Boolean,
		remoteText: Boolean,
	},
	data () {
		return {
			modal: {
				infosongdata: false
			},
			currentPosition: 0,
			autoSync: false,
			hide: false,
			dark: true,
			now: new Date,
			blink: true,
			resizeTimeout: null
		};
	},
	created () {
		// alternate colon visibility of clock each second
		setInterval(() => {
			this.now = new Date;
			this.blink = !this.blink;
		}, 1000);
		// handle viewport resizes
		window.addEventListener('resize', this.resizeHandler);
		// initially fit presentation into viewport
		this.maximizeFontsize();
	},
	destroyed()  {
		window.removeEventListener('resize', this.resizeHandler);
	},
	mounted () {
		this.$refs.container.focus();
	},
	computed: {
		timeonly() {
			let timestring = String(this.now).slice(16, 21);
			return this.blink ? timestring : timestring.replace(':', ' ');
		}
	},
	methods: {
		// adapt presentation content to viewport
		maximizeFontsize() {
			// wait for dom to be ready
			this.$nextTick(() => {
				// maximize content of each song/slide
				for (let i = 0; i < this.songs.length; i++) {
					this.$refs['songcontent' + i][0]?.maximizeFontsize();
				}
			});
		},
		// handle viewport resize
		resizeHandler () {
			clearTimeout(this.resizeTimeout);
			this.resizeTimeout = setTimeout(() => {
				this.maximizeFontsize();
			}, 500);
		},
		// handle tooltips
		tooltip(target) {
			switch (target) {
				case 'info': return this.songs[this.currentPosition].note
					? this.$t('tooltip.infoSongData') + '\n' + this.$t('key.ctrl') + ' + ' + this.$t('key.I')
					: this.$t('tooltip.noSongInfo');
				case 'sync':
					return this.$t('tooltip.sync' + (!this.autoSync ? 'On' : 'Off')) + '\n' + this.$t('key.ctrl') + ' + ' + this.$t('key.S');
				case 'display':
					return this.$t('tooltip.presentation' + (this.hide ? 'Show' : 'Hide')) + '\n' + this.$t('key.ctrl') + ' + ' + this.$t('key.B');
				case 'invert':
					return this.$t('tooltip.invertColors') + '\n' + this.$t('key.ctrl') + ' + ' + this.$t('key.L');
				case 'chords':
					return this.$t('tooltip.chords' + (!this.chords ? 'Show' : 'Hide')) + '\n' + this.$t('key.ctrl') + ' + ' + this.$t('key.K');
				case 'close':
					return this.$t('tooltip.presentationClose') + '\n' + this.$t('key.esc');
				case 'remoteDisplay':
					return this.$t('text.syncedDevices') + '\n' + this.$t('tooltip.presentation' + (this.remoteHide ? 'Show' : 'Hide'));
				case 'remoteInvert':
					return this.$t('text.syncedDevices') + '\n' + this.$t('tooltip.invertColors');
				case 'remoteChords':
					return this.$t('text.syncedDevices') + '\n' + this.$t('tooltip.chords' + (this.remoteText ? 'Show' : 'Hide'));
				default:
					break;
			}
		}
	},
	watch: {
		currentPosition(newPosition) {
			// update remote position if autoSync is on
			if (this.sync) {
				this.$emit('updatePosition', newPosition);
			}
		},
		autoSync() {
			// update local position, content display and theme if autoSync was turned on
			if (this.autoSync) {
				this.$refs.presentation.slideTo(this.position);
				this.hide = this.remoteHide;
				this.dark = !this.remoteLight;
			}
		},
		chords() {
			// maximize fontsize again when chords are toggled
			this.maximizeFontsize();
		},
		position() {
			// update local position if autoSync is on and remote position was updated
			if (this.autoSync) {
				this.$refs.presentation.slideTo(this.position);
			}
		},
		remoteText () {
			// update local chord display if autoSync is on and remote chords were updated
			if (this.autoSync) {
				this.$emit('chords');
			}
		},
		remoteLight () {
			// toggle local theme mode if autoSync is on and remote theme mode was updated
			if (this.autoSync) {
				this.dark = !this.dark;
			}
		},
		remoteHide (val) {
			// toggle local content display if autoSync is on and remote content display was updated
			if (this.autoSync) {
				this.hide = val;
			}
		},
	}
});
</script>
