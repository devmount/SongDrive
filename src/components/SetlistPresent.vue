<template>
	<div class="modal modal-lg modal-full modal-setlist-presentation" :class="{ active: active }">
		<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="$emit('closed')"></a>
		<div class="modal-container">
			<div v-if="songs && songs.length > 0" class="modal-body">
				<hooper
					:settings="settings"
					ref="presentation"
					class="presentation"
					id="presentation"
					@updated="maximizeFontsize"
					@slide="updatePosition"
					v-shortkey="{ up: ['arrowup'], down: ['arrowdown'] }"
					@shortkey.native="navigate"
				>
					<slide v-for="(song, i) in songs" :key="i" :index="i">
						<SongContent
							:content="song.content"
							:chords="chords"
							:tuning="0"
							:tunes="tunes"
							:presentation="true"
							:ref="'songcontent' + i"
						/>
					</slide>
					<hooper-pagination slot="hooper-addons"></hooper-pagination>
				</hooper>
			</div>
			<div class="modal-footer">
				<a class="btn btn-lg btn-gray" :class="{ 'btn-secondary': !autoSync, 'btn-primary': autoSync }" href="#" aria-label="AutoSync" @click.prevent="autoSync = !autoSync">
					<i class="icon ion-md-sync"></i>
				</a>
				<a class="btn btn-lg btn-gray" :class="{ 'btn-secondary': !chords, 'btn-primary': chords }" href="#" aria-label="Chords" @click.prevent="$emit('chords')">
					<i class="icon ion-md-musical-notes"></i>
				</a>
				<a class="btn btn-secondary btn-lg btn-gray" href="#" aria-label="Maximize" @click.prevent="maximizeFontsize">
					<i class="icon ion-md-resize"></i>
				</a>
				<a class="btn btn-secondary btn-lg btn-gray" href="#" aria-label="Cancel" @click.prevent="$emit('closed')">
					<i class="icon ion-md-close"></i>
				</a>
			</div>
		</div>
	</div>
</template>

<script>
// get slider component
import { Hooper, Slide, Pagination as HooperPagination } from 'hooper'
import 'hooper/dist/hooper.css'
// get internal components
import SongContent from '@/components/SongContent.vue'

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
		tunes: Array
	},
	data () {
		return {
			settings: {
				infiniteScroll: false,
				keysControl: true,
			},
			autoSync: false,
		}
	},
	methods: {
		maximizeFontsize() {
			let self = this
			// wait for dom to be ready
			this.$nextTick(function () {
				// maximize content of each song/slide
				for (let i = 0; i < self.songs.length; i++) {
					self.$refs['songcontent' + i][0].maximizeFontsize()
				}
			})
		},
		updatePosition(payload) {
			this.$emit('updatePosition', payload.currentSlide)
		},
		navigate(event) {
			switch (event.srcKey) {
				case 'up':
					this.$refs.presentation.slidePrev()
					break
				case 'down':
					this.$refs.presentation.slideNext()
					break
			}
		}
	},
	watch: {
		active() {
			// maximize fontsize when presentation view is opened
			if (this.active) {
				let self = this
				// wait for all compontents to be mounted
				this.$nextTick(function () {
					self.$refs.presentation.restart()
				})
			}
		},
		position() {
			// update local position if autoSync is on and remote position was updated
			if (this.autoSync) {
				this.$refs.presentation.slideTo(this.position)
			}
		},
		autoSync() {
			// update local position if autoSync was turned on
			if (this.autoSync) {
				this.$refs.presentation.slideTo(this.position)
			}
		},
	}
}
</script>

<style lang="scss">
$black-color: #000000;

.modal-setlist-presentation {

	&.modal-lg.modal-full {
		.verse::before {
			background: $black-color;
		}
	}

	.modal-container .modal-header,
	.modal-container .modal-body {
		padding-bottom: 0;
		padding-left: 0;
		padding-right: 0;
	}
	
}
</style>
