<template>
	<div
		class="modal modal-lg modal-full modal-setlist-presentation"
		:class="{ active: active, light: !dark }"
		ref="container"
		tabindex="0"
		@keydown.up.exact="$refs.presentation.slidePrev()"
		@keydown.left.exact="$refs.presentation.slidePrev()"
		@keydown.down.exact="$refs.presentation.slideNext()"
		@keydown.right.exact="$refs.presentation.slideNext()"
		@keydown.ctrl.83.prevent="autoSync = !autoSync"
		@keydown.ctrl.66.prevent="hide = !hide"
		@keydown.ctrl.76.prevent="dark = !dark"
		@keydown.esc.exact="$emit('closed')"
	>
		<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="$emit('closed')"></a>
		<transition name="fade">
			<div v-if="hide" class="hide"></div>
		</transition>
		<div class="modal-container">
			<div v-if="songs && songs.length > 0" class="modal-body">
				<hooper
					:settings="settings"
					ref="presentation"
					class="presentation"
					id="presentation"
					@updated="maximizeFontsize"
					@slide="updatePosition"
				>
					<slide v-for="(song, i) in songs" :key="i" :index="i">
						<SongContent
							:content="song.content"
							:chords="chords"
							:tuning="song.customTuningDelta"
							:presentation="true"
							:ref="'songcontent' + i"
						/>
					</slide>
					<hooper-pagination slot="hooper-addons"></hooper-pagination>
				</hooper>
			</div>
			<div class="modal-footer" :class="{ 'hidden': !chords}">
				<div class="navigation-prev">
					<a
						class="btn btn-secondary btn-xl btn-gray px-3"
						:class="{ disabled: currentPosition == 0 }"
						href="#"
						aria-label="Previous Song"
						@click.prevent="$refs.presentation.slidePrev()"
					>
						<ion-icon name="arrow-back" class="icon-1-5x"></ion-icon>
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
						@click.prevent="$refs.presentation.slideNext()"
					>
						<span v-if="currentPosition < songs.length-1" class="mr-3">
							{{ songs[currentPosition+1].title }}
							<span class="chords ml-2">{{ songs[currentPosition+1].customTuning }}</span>
						</span>
						<ion-icon name="arrow-forward" class="icon-1-5x"></ion-icon>
					</a>
				</div>
				<span class="clock px-4">{{ timeonly }}</span>
				<a
					class="btn btn-xl btn-fw btn-gray btn-toggle tooltip ml-4"
					:class="{ 'btn-secondary': !autoSync, 'btn-primary': autoSync }"
					href="#"
					aria-label="AutoSync"
					@click.prevent="autoSync = !autoSync"
					:data-tooltip="$t('tooltip.sync' + (!autoSync ? 'On' : 'Off')) + '\n' + $t('key.ctrl') + ' + ' + $t('key.S')"
				>
					<ion-icon name="sync" class="icon-1-5x"></ion-icon>
				</a>
				<a
					class="btn btn-xl btn-fw btn-gray btn-toggle tooltip ml-1"
					:class="{ 'btn-secondary': !hide, 'btn-primary': hide }"
					href="#"
					aria-label="Hide"
					@click.prevent="hide = !hide"
					:data-tooltip="$t('tooltip.presentation' + (hide ? 'Show' : 'Hide')) + '\n' + $t('key.ctrl') + ' + ' + $t('key.B')"
				>
					<ion-icon name="eye-off-outline" class="icon-1-5x"></ion-icon>
				</a>
				<a
					class="btn btn-xl btn-fw btn-gray btn-toggle tooltip ml-1"
					:class="{ 'btn-secondary': dark, 'btn-primary': !dark }"
					href="#"
					aria-label="Light mode"
					@click.prevent="dark = !dark"
					:data-tooltip="$t('tooltip.lightModeOnOff') + '\n' + $t('key.ctrl') + ' + ' + $t('key.L')"
				>
					<ion-icon name="contrast-outline" class="icon-1-5x"></ion-icon>
				</a>
				<a
					class="btn btn-xl btn-fw btn-gray btn-toggle tooltip ml-1"
					:class="{ 'btn-secondary': !chords, 'btn-primary': chords }"
					href="#"
					aria-label="Chords"
					@click.prevent="$emit('chords')"
					:data-tooltip="$t('tooltip.chords' + (!chords ? 'Show' : 'Hide')) + '\n' + $t('key.ctrl') + ' + ' + $t('key.K')"
				>
					<ion-icon name="musical-notes" class="icon-1-5x"></ion-icon>
				</a>
				<a
					class="btn btn-secondary btn-xl btn-fw btn-gray tooltip ml-1"
					href="#"
					aria-label="Cancel"
					@click.prevent="$emit('closed')"
					:data-tooltip="$t('tooltip.presentationClose') + '\n' + $t('key.esc')"
				>
					<ion-icon name="close" class="icon-1-5x"></ion-icon>
				</a>
			</div>
		</div>
	</div>
</template>

<script>
// get slider component
import { Hooper, Slide, Pagination as HooperPagination } from 'hooper';
import 'hooper/dist/hooper.css';
// get internal components
import SongContent from '@/partials/SongContent';

export default {
	name: 'setlist-present',
	components: {
		Hooper,
		Slide,
		HooperPagination,
		SongContent
	},
	props: {
		active: Boolean,
		songs: Array,
		position: Number,
		chords: Boolean,
	},
	data () {
		return {
			settings: {
				infiniteScroll: false,
				keysControl: true,
			},
			currentPosition: 0,
			autoSync: false,
			hide: false,
			dark: true,
			now: new Date,
			blink: true,
		};
	},
	created () {
		setInterval(() => { this.now = new Date; this.blink = !this.blink }, 1000);
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
		maximizeFontsize() {
			// wait for dom to be ready
			this.$nextTick(() => {
				// maximize content of each song/slide
				for (let i = 0; i < this.songs.length; i++) {
					this.$refs['songcontent' + i][0].maximizeFontsize();
				}
			});
		},
		updatePosition(payload) {
			this.currentPosition = payload.currentSlide;
			this.$emit('updatePosition', payload.currentSlide);
		},
	},
	watch: {
		active() {
			// maximize fontsize when presentation view is opened
			if (this.active) {
				// wait for all compontents to be mounted
				this.$nextTick(() => {
					this.$refs.presentation.restart();
				});
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
		autoSync() {
			// update local position if autoSync was turned on
			if (this.autoSync) {
				this.$refs.presentation.slideTo(this.position);
			}
		},
	}
}
</script>
