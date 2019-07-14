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
							:tuning="song.customTuningDelta"
							:tunes="tunes"
							:presentation="true"
							:ref="'songcontent' + i"
						/>
					</slide>
					<hooper-pagination slot="hooper-addons"></hooper-pagination>
				</hooper>
			</div>
			<div class="modal-footer">
				<div class="navigation-prev">
					<a
						class="btn btn-secondary btn-xl btn-gray px-3"
						:class="{ disabled: currentPosition == 0 }"
						href="#"
						aria-label="Previous Song"
						@click.prevent="$refs.presentation.slidePrev()"
					>
						<i class="icon ion-md-arrow-round-back"></i>
						<span v-if="currentPosition > 0" class="ml-2">
							{{ songs[currentPosition-1].title }} <span class="chords ml-2">{{ songs[currentPosition-1].customTuning }}</span>
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
							{{ songs[currentPosition+1].title }} <span class="chords ml-2">{{ songs[currentPosition+1].customTuning }}</span>
						</span>
						<i class="icon ion-md-arrow-round-forward"></i>
					</a>
				</div>
				<span class="clock px-4">{{ timeonly }}</span>
				<a class="btn btn-xl btn-fw btn-gray btn-toggle ml-4" :class="{ 'btn-secondary': !autoSync, 'btn-primary': autoSync }" href="#" aria-label="AutoSync" @click.prevent="autoSync = !autoSync">
					<i class="icon ion-md-sync"></i>
				</a>
				<a class="btn btn-xl btn-fw btn-gray btn-toggle ml-1" :class="{ 'btn-secondary': !chords, 'btn-primary': chords }" href="#" aria-label="Chords" @click.prevent="$emit('chords')">
					<i class="icon ion-md-musical-notes"></i>
				</a>
				<a class="btn btn-secondary btn-xl btn-fw btn-gray ml-1" href="#" aria-label="Maximize" @click.prevent="maximizeFontsize">
					<i class="icon ion-md-resize"></i>
				</a>
				<a class="btn btn-secondary btn-xl btn-fw btn-gray ml-1" href="#" aria-label="Cancel" @click.prevent="$emit('closed')">
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
			currentPosition: 0,
      autoSync: false,
			now: new Date,
			blink: true,
		}
	},
	created () {
		setInterval(() => { this.now = new Date; this.blink = !this.blink }, 1000)
	},
	computed: {
		timeonly() {
			let timestring = String(this.now).slice(16, 21)
			return this.blink ? timestring : timestring.replace(':', ' ')
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
			this.currentPosition = payload.currentSlide
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
$primary-color: #88b544;
$black-color: #000000;
$mono-font-family: "Fira Code", "Fira Mono", monospace;

.modal-setlist-presentation {

	&.modal-lg.modal-full {
		.verse::before {
			background: $black-color;
		}
	}

	.modal-container {
		.modal-header,
		.modal-body {
			padding-bottom: 0;
			padding-left: 0;
			padding-right: 0;
		}

		.modal-footer {
			width: 100%;

			.navigation-prev {
				position: absolute;
				bottom: .8rem;
				right: 50%;
			}
			.navigation-next {
				position: absolute;
				bottom: .8rem;
				left: 50%;
			}
			.chords {
				font-weight: bold;
				color: $primary-color;
			}

			.clock {
				font-family: $mono-font-family;
				font-size: 1.5em;
				vertical-align: middle;
			}
		}
	}
}

</style>
