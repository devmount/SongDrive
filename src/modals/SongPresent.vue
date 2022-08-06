<template>
	<div
		class="modal modal-lg modal-full modal-presentation"
		:class="{ active: active, light: !dark }"
		ref="container"
		tabindex="0"
		@keydown.ctrl.i.prevent="song.note ? modal.infosongdata = !modal.infosongdata : null"
		@keydown.ctrl.l.prevent="dark = !dark"
		@keydown.esc.exact="$emit('closed')"
	>
		<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="$emit('closed')"></a>
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
// get icons
import {
	close,
	contrastOutline,
	informationOutline,
	musicalNotes
} from 'ionicons/icons';
</script>

<script>
import { defineComponent } from 'vue';

// get components
import SongContent from '@/partials/SongContent';
import InfoSongData from '@/modals/InfoSongData';

export default defineComponent({
	name: 'song-present',
	components: {
		SongContent,
		InfoSongData,
	},
	props: {
		active: Boolean,
		song: Object,
		chords: Boolean,
		tuning: Number,
	},
	data () {
		return {
			modal: {
				infosongdata: false
			},
			dark: true,
			resizeTimeout: null
		};
	},
	created () {
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
	methods: {
		// adapt song content to viewport size
		maximizeFontsize() {
			// wait for dom to be ready
			this.$nextTick(() => {
				// maximize content of each song/slide
				this.$refs.songcontent?.maximizeFontsize();
			});
		},
		// handle viewport resize
		resizeHandler() {
			clearTimeout(this.resizeTimeout);
			this.resizeTimeout = setTimeout(() => {
				this.maximizeFontsize();
			}, 500);
		},
		// handle tooltips
		tooltip(target) {
			switch (target) {
				case 'info':
					return this.song.note
						? this.$t('tooltip.infoSongData') + '\n' + this.$t('key.ctrl') + ' + ' + this.$t('key.I')
						: this.$t('tooltip.noSongInfo');
				case 'lightMode':
					return this.$t('tooltip.invertColors') + '\n' + this.$t('key.ctrl') + ' + ' + this.$t('key.L');
				case 'chords':
					return this.$t('tooltip.chords' + (!this.chords ? 'Show' : 'Hide')) + '\n' + this.$t('key.ctrl') + ' + ' + this.$t('key.K');
				case 'close':
					return this.$t('tooltip.presentationClose') + '\n' + this.$t('key.esc');
				default:
					break;
			}
		}
	},
	watch: {
		chords() {
			// maximize fontsize when presentation view is opened
			this.maximizeFontsize();
		}
	}
});
</script>
