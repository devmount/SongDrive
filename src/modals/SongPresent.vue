<template>
	<div
		class="modal modal-lg modal-full modal-presentation"
		:class="{ active: active }"
		ref="container"
		tabindex="0"
		@keydown.ctrl.75.prevent="chords = !chords"
		@keydown.esc.exact="$emit('closed')"
	>
		<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="$emit('closed')"></a>
		<div class="modal-container">
			<div class="modal-header">
				<div class="modal-title h5 text-center">
					{{ title }}
					<span class="modal-subtitle h6 text-gray ml-3">{{ subtitle }}</span>
				</div>
			</div>
			<div v-if="content" class="modal-body">
				<SongContent
					:content="content"
					:chords="chords"
					:tuning="tuning"
					:presentation="true"
					ref="songcontent"
				/>
			</div>
			<div class="modal-footer">
				<a class="btn btn-xl btn-fw btn-gray btn-toggle ml-1" :class="{ 'btn-secondary': !chords, 'btn-primary': chords }" href="#" aria-label="Chords" @click.prevent="$emit('chords')">
					<ion-icon name="musical-notes" class="icon-1-5x"></ion-icon>
				</a>
				<a class="btn btn-secondary btn-xl btn-fw btn-gray ml-1" href="#" aria-label="Cancel" @click.prevent="$emit('closed')">
					<ion-icon name="close" class="icon-1-5x"></ion-icon>
				</a>
			</div>
		</div>
	</div>
</template>

<script>
// get components
import SongContent from '@/partials/SongContent'

export default {
	name: 'song-present',
	components: {
		SongContent
	},
	props: {
		active: Boolean,
		title: String,
		subtitle: String,
		content: String,
		chords: Boolean,
		tuning: Number,
	},
	methods: {
		maximizeFontsize() {
			let self = this
			// wait for dom to be ready
			this.$nextTick(() => {
				// maximize content of each song/slide
				self.$refs.songcontent.maximizeFontsize()
			})
		}
	},
	mounted () {
		this.maximizeFontsize()
		this.$refs.container.focus()
	},
	watch: {
		chords() {
			// maximize fontsize when presentation view is opened
			this.maximizeFontsize()
		}
	}
}
</script>

<style lang="scss">
$black-color: #000000;

.modal-presentation {

	&.modal-lg.modal-full {
		.verse::before {
			background: $black-color;
		}
	}

	.modal-container .modal-header {
		padding-bottom: 0;
	}
	
}
</style>
