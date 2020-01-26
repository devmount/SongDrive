<template>
	<div class="modal modal-lg" :class="{ active: active }">
		<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="cancel"></a>
		<div v-if="setlist && ready.songs" class="modal-container">
			<div class="modal-header">
				<a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="cancel"></a>
				<div v-if="!existing" class="modal-title h5">New Setlist<span v-if="setlist.title" class="ml-2 text-gray text-uppercase ls-1"> «{{ setlist.title }}»</span></div>
				<div v-else class="modal-title h5">Edit Setlist<span class="ml-2 text-gray text-uppercase ls-1"> «{{ setlist.title }}»</span></div>
			</div>
			<div class="modal-body">
				<div class="content">
					<div class="columns">
						<div class="column col-4 col-sm-12">
							<div class="columns">
								<!-- title -->
								<div class="column col-12">
									<div class="form-group" :class="{ 'has-error': error.title }">
										<label class="form-label" for="title">Title</label>
										<input v-if="existing" v-model="setlist.title" class="form-input" id="title" type="text" placeholder="setlist title" disabled>
										<input v-else v-model="setlist.title" class="form-input" id="title" type="text" placeholder="setlist title">
										<p v-if="error.title" class="form-input-hint">A title is required.</p>
									</div>
								</div>
								<!-- date -->
								<div class="column col-12">
									<div class="form-group mt-2">
										<label class="form-label" for="date">Event Date <span class="text-gray ml-2">{{ setlist.date }}</span></label>
										<datepicker
											:value="setlist.date != '' ? (new Date(setlist.date)) : (new Date())"
											format="yyyy-MM-dd"
											wrapper-class="calendar-wrapper"
											input-class="form-input"
											calendar-class="calendar"
											:typeable="true"
											:inline="true"
											:monday-first="true"
											:placeholder="'event date, e.g. ' + String((new Date()).toISOString()).slice(0,10)"
											:open-date="setlist.date != '' ? (new Date(setlist.date)) : (new Date())"
											name="setlistdate"
											@selected="updateDate"
										></datepicker>
									</div>
								</div>
							</div>
						</div>
						<div class="column col-8 col-sm-12">
							<!-- song selection -->
							<div class="columns">
								<div class="column col-6">
									<div class="columns col-gapless">
										<div class="column col-xl-12 col-4">
											<div class="input-group">
												<span class="input-group-addon"><i class="form-icon icon ion-md-search"></i></span>
												<input v-model="search" type="search" class="form-input" placeholder="search ..." />
												<button class="btn input-group-btn btn-link" @click="search = ''"><i class="form-icon icon ion-md-close"></i></button>
											</div>
										</div>
										<div class="column col-xl-12 col-4">
											<div class="input-group">
												<span class="input-group-addon"><i class="form-icon icon ion-md-pricetag"></i></span>
												<select v-model="filter" class="form-select filter" required>
													<option value="" disabled selected>tag ...</option>
													<option v-for="tag in tags" :key="tag.key" :value="tag.key">{{ tag.key }}</option>
												</select>
												<button class="btn input-group-btn btn-link" @click="filter = ''"><i class="form-icon icon ion-md-close"></i></button>
											</div>
										</div>
										<div class="column col-xl-12 col-4">
											<div class="input-group">
												<span class="input-group-addon"><i class="form-icon icon ion-md-musical-note"></i></span>
												<select v-model="tuning" class="form-select filter" required>
													<option value="" disabled selected>tune ...</option>
													<option v-for="t in tunes" :key="t" :value="t">{{ t }}</option>
												</select>
												<button class="btn input-group-btn btn-link" @click="tuning = ''"><i class="form-icon icon ion-md-close"></i></button>
											</div>
										</div>
									</div>
									<div class="form-group max-column mt-2">
										<label v-for="(fsong, key) in filteredSongs" :key="key" class="form-checkbox mt-2">
											<input v-model="setlistSongs" :value="key" type="checkbox">
											<i class="form-icon"></i> {{ fsong.title }} [{{ fsong.tuning }}]
											<div class="text-gray text-small">
												{{ fsong.subtitle }}
											</div>
										</label>
									</div>
								</div>
								<div class="column col-6">
									<div v-if="setlist.songs && setlist.songs.length == 0" class="empty">
										<div class="empty-icon">
											<i class="icon ion-md-musical-notes icon-4x"></i>
										</div>
										<p class="empty-title h5">No Songs selected</p>
										<p class="empty-subtitle">Select one ore more songs for this setlist.</p>
									</div>
									<div v-else>
										<h3 class="text-center">Selection</h3>
										<div v-sortable="{ onEnd: reorder, handle: '.handle' }">
											<div v-for="(song, i) in setlist.songs" :key="song.id" class="tile tile-centered mb-2">
												<span class="c-move text-center text-gray"><i class="icon ion-md-reorder px-2 mx-2 handle"></i></span>
												<button class="btn btn-secondary btn-sm btn-fw" @click.prevent="tuneDown(i)">
													<i class="icon ion-md-arrow-back"></i>
												</button>
												<div class="tile-icon">
													<figure class="avatar s-rounded" :data-initial="song.tuning ? song.tuning : songs[song.id].tuning"></figure>
												</div>
												<button class="btn btn-secondary btn-sm btn-fw" @click.prevent="tuneUp(i)">
													<i class="icon ion-md-arrow-forward"></i>
												</button>
												<div class="tile-content">
													<div class="tile-title">{{ songs[song.id].title }}</div>
													<div class="tile-subtitle text-gray text-small">{{ songs[song.id].subtitle }}</div>
												</div>
												<div class="tile-action">
													<button class="btn btn-link btn-action" @click="setlistSongs = setlistSongs.filter(function(k) {return k !== song.id})">
														<i class="icon ion-md-close"></i>
													</button>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="modal-footer">
				<button class="btn btn-link btn-gray" aria-label="Cancel" @click.prevent="cancel">Cancel</button>
				<button class="btn btn-primary ml-2" @click="set">
					<span v-if="!existing">Create</span>
					<span v-else>Update</span> Setlist
				</button>
			</div>
		</div>
	</div>
</template>

<script>
// init datepicker component
import Datepicker from 'vuejs-datepicker';

export default {
	name: 'setlist-set',
	components: {
		Datepicker
	},
	props: {
		db: Object,
		active: Boolean,
		existing: Boolean,
		initialSetlist: Object,
		setlistKey: String,
		songs: Object,
		tags: Object,
		ready: Object,
	},
	data () {
		return {
			setlist: JSON.parse(JSON.stringify(this.initialSetlist)),
			setlistSongs: JSON.parse(JSON.stringify(this.initialSetlist)).songs.map(s => s.id),
			search: '',
			filter: '',
			tuning: '',
			error: {
				title: false,
			},
			tunes: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'B', 'H'],
		}
	},
	watch: {
		// update this.setlist.songs according to selection
		setlistSongs: function (newList, oldList) {
			// song was added
			if (newList.length > oldList.length) {
				let songAdded = newList.filter(x => !oldList.includes(x))[0]
				this.setlist.songs.push({ id: songAdded, tuning: this.songs[songAdded].tuning })
			}
			// song was removed
			else {
				let songRemoved = oldList.filter(x => !newList.includes(x))[0], newSongs = []
				for (var i in this.setlist.songs) {
					if (this.setlist.songs[i].id != songRemoved) {
						newSongs.push({ id: this.setlist.songs[i].id, tuning: this.setlist.songs[i].tuning })
					}
				}
				this.setlist.songs = newSongs
			}
		}
	},
	mounted () {
		// initial date today for new setlists
		if (!this.existing) {
			this.updateDate(new Date())
		}
	},
	methods: {
		// update setlist date from datepicker
		updateDate (newDate) {
			this.setlist.date = newDate.toISOString().slice(0,10)
		},
		// update song order of setlist songs
		reorder ({oldIndex, newIndex}) {
			const movedItem = this.setlist.songs.splice(oldIndex, 1)[0]
			this.setlist.songs.splice(newIndex, 0, movedItem)
		},
		// tune the song at given position up
		tuneUp (position) {
			let songs = this.setlist.songs
			// update tuning
			let tone = songs[position].tuning ? songs[position].tuning : this.songs[songs[position].id].tuning
			let i = this.tunes.indexOf(tone)
			if (i>=this.tunes.length-1) {
				tone = this.tunes[0]
			} else {
				tone = this.tunes[++i]
			}
			// save tuning in setlist
			this.setlist.songs[position].tuning = tone
		},
		// tune the song at given position down
		tuneDown (position) {
			let songs = this.setlist.songs
			// update tuning
			let tone = songs[position].tuning ? songs[position].tuning : this.songs[songs[position].id].tuning
			let i = this.tunes.indexOf(tone)
			if (i<=0) {
				tone = this.tunes[this.tunes.length-1]
			} else {
				tone = this.tunes[--i]
			}
			// save tuning in setlist
			this.setlist.songs[position].tuning = tone
		},
		// add or save edits of setlist to db 
		set () {
			// first check for form errors
			this.error.title = this.setlist.title == ''
			// no errors: start saving song data
			if (!this.error.title) {
				var self = this
				var processedSetlist = {
					active: false,
					creator: '8DfoOAcEpCWh5gsVGmyzDXVAsZV2', // TODO
					position: 0,
					title: this.setlist.title,
					date: this.setlist.date,
					songs: this.setlist.songs,
				}
				// new setlist should be created
				if (!this.existing) {
					let slug = this.createSlug()
					this.db.collection('setlists').doc(slug).set(processedSetlist)
					.then(function() {
						self.$emit('closed')
						self.$emit('reset')
						processedSetlist = {}
						self.$router.push({ name: 'setlist-show', params: { id: slug }})
						// toast success creation message
						self.$notify({
							title: '<button class="btn btn-clear float-right"></button>Success!',
							text: 'The new setlist was added.',
							type: 'toast-primary'
						})
					})
					.catch(function() {
						self.$emit('closed')
						// toast error creation message
						self.$notify({
							title: '<button class="btn btn-clear float-right"></button>Error!',
							text: 'The new setlist could not be added.',
							type: 'toast-error'
						})
					})
				}
				// existing setlist should be updated
				else {
					this.db.collection('setlists').doc(this.setlistKey).update(processedSetlist)
					.then(function() {
						self.$emit('closed')
						self.$emit('reset')
						processedSetlist = {}
						// toast success update message
						self.$notify({
							title: '<button class="btn btn-clear float-right"></button>Success!',
							text: 'The setlist was updated.',
							type: 'toast-primary'
						})
					})
					.catch(function() {
						self.$emit('closed')
						// toast error update message
						self.$notify({
							title: '<button class="btn btn-clear float-right"></button>Error!',
							text: 'The setlist could not be updated.',
							type: 'toast-error'
						})
					})
				}
			}
		},
		// create a human readable record key of format YYYYMMDD-the-setlist-title
		createSlug () {
			return this.setlist.date.replace(/-/g, '') + '-' + this.slug(this.setlist.title)
		},
		slug (s) {
			return s
				.trim()
				.toLowerCase()
				.replace(/\s/g, '-')
				.replace(/\//g, '-')
				.replace(/'/g, '')
				.replace(/"/g, '')
				.replace(/,/g, '')
				.replace(/;/g, '')
				.replace(/\./g, '')
				.replace(/:/g, '')
				.replace(/ä/g, 'ae')
				.replace(/ö/g, 'oe')
				.replace(/ü/g, 'ue')
				.replace(/ß/g, 'ss')
		},
		cancel () {
			this.$emit('closed')
		}
	},
	computed: {
		// filter song list by search query
		filteredSongs () {
			var songs = this.songs
			if (this.search != '') {
				var key = this.search.toLowerCase()
				songs = Object.filter(
					songs,
					s => s.title.toLowerCase().indexOf(key) !== -1 || s.subtitle.toLowerCase().indexOf(key) !== -1
				)
			}
			if (this.filter != '') {
				songs = Object.filter(songs, s => s.tags.indexOf(this.filter) !== -1)
			}
			if (this.tuning != '') {
				songs = Object.filter(songs, s => s.tuning.indexOf(this.tuning) !== -1)
			}
			return songs
		},
	}
}
</script>

<style lang="scss">
.modal-lg {
	.max-column {
		height: 66vh;
		overflow-y: scroll;
	}
}
</style>
