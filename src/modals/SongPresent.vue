<template>
	<div
		class="modal modal-lg modal-full modal-presentation"
		:class="{ active: active, light: !dark }"
		ref="container"
		tabindex="0"
		@keydown.ctrl.73.prevent="modal.infosongdata = !modal.infosongdata"
		@keydown.ctrl.76.prevent="dark = !dark"
		@keydown.ctrl.75.prevent="chords = !chords"
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
					:class="{ 'btn-secondary': !modal.infosongdata, 'btn-primary': modal.infosongdata }"
					href="#"
					aria-label="Song Data"
					@click="modal.infosongdata = true"
					:data-tooltip="$t('tooltip.infoSongData') + '\n' + $t('key.ctrl') + ' + ' + $t('key.I')"
				>
					<ion-icon name="information-outline" class="icon-1-5x"></ion-icon>
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
		<!-- modal: info song note -->
		<InfoSongData
			v-if="modal.infosongdata"
			:active="modal.infosongdata"
			:song="song"
			@closed="modal.infosongdata = false"
		/>
	</div>
</template>

<script>
// get components
import SongContent from '@/partials/SongContent';
import InfoSongData from '@/modals/InfoSongData';

export default {
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
			dark: true,
			modal: {
				infosongdata: false
			}
		};
	},
	methods: {
		maximizeFontsize() {
			// wait for dom to be ready
			this.$nextTick(() => {
				// maximize content of each song/slide
				this.$refs.songcontent.maximizeFontsize();
			});
		}
	},
	mounted () {
		this.maximizeFontsize();
		this.$refs.container.focus();
	},
	watch: {
		chords() {
			// maximize fontsize when presentation view is opened
			this.maximizeFontsize();
		}
	}
}
</script>
