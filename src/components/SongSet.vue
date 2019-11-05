<template>
	<div>
		<!-- main modal: set song -->
		<div class="modal modal-lg" :class="{ active: active }">
			<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="$emit('closed')"></a>
			<div v-if="song && ready" class="modal-container">
				<div class="modal-header">
					<a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="$emit('closed')"></a>
					<div v-if="!existing" class="modal-title h5">New Song</div>
					<div v-else class="modal-title h5">Edit Song «<span class="text-uppercase ls-1">{{ song.title }}</span>»</div>
				</div>
				<div class="modal-body">
					<div class="content">
						<div class="columns">
							<div class="column col-6 col-sm-12">
								<div class="columns">
									<div class="column col-12">
										<div class="form-group">
											<label class="form-label" for="title">Title</label>
											<input v-if="existing" v-model="song.title" class="form-input" id="title" type="text" placeholder="song title" disabled>
											<input v-else v-model="song.title" class="form-input" id="title" type="text" placeholder="song title">
										</div>
									</div>
									<div class="column col-8 col-md-12">
										<div class="form-group">
											<label class="form-label" for="subtitle">Subtitle</label>
											<input v-model="song.subtitle" class="form-input" id="subtitle" type="text" placeholder="song subtitle">
										</div>
									</div>
									<div class="column col-4 col-md-12">
										<div class="form-group">
											<label class="form-label" for="language">Language</label>
											<select v-model="song.language" class="form-select" id="language">
												<option value="">Choose...</option>
												<option value="de">Deutsch</option>
												<option value="en">English</option>
												<option value="fr">Francais</option>
												<option value="li">Lingala</option>
											</select>
										</div>
									</div>
									<div class="column col-8 col-md-12">
										<div class="form-group">
											<label class="form-label" for="authors">Authors</label>
											<input v-model="song.authors" class="form-input" id="authors" type="text" placeholder="jon doe | jane dillon">
										</div>
									</div>
									<div class="column col-4 col-md-12">
										<div class="form-group">
											<label class="form-label" for="tuning">Tuning</label>
											<select v-model="song.tuning" class="form-select" id="tuning">
												<option value="">Choose...</option>
												<option v-for="tune in tunes" :key="tune">{{ tune }}</option>
											</select>
										</div>
									</div>
									<div class="column col-8 col-md-12">
										<div class="form-group">
											<label class="form-label" for="tags">Tags</label>
											<div v-for="tag in song.tags" :key="tag" class="chip s-rounded">
												<i class="icon ion-md-pricetag mr-2"></i> {{ tag }}
												<a href="#" class="btn btn-clear" aria-label="Close" role="button" @click="song.tags = song.tags.filter(function(k) {return k !== tag})"></a>
											</div>
											<button class="btn btn-secondary btn-sm" @click="modal.tags = true">
												<i class="icon ion-md-add px-1"></i>
											</button>
										</div>
									</div>
									<div class="column col-4 col-md-12">
										<div class="form-group">
											<label class="form-label" for="ccli">CCLI #</label>
											<input v-model="song.ccli" class="form-input" id="ccli" type="number" placeholder="CCLI number">
										</div>
									</div>
									<div class="column col-8 col-md-12">
										<div class="form-group">
											<label class="form-label" for="publisher">Publisher</label>
											<textarea v-model="song.publisher" class="form-input" id="publisher" placeholder="publisher information" rows="2"></textarea>
										</div>
									</div>
									<div class="column col-4 col-md-12">
										<div class="form-group">
											<label class="form-label" for="year">Year</label>
											<input v-model="song.year" class="form-input" id="year" type="number" placeholder="year">
										</div>
									</div>
									<div class="column col-12">
										<div class="form-group">
											<label class="form-label" for="note">Note</label>
											<input v-model="song.note" class="form-input" id="note" type="text" placeholder="general notes, e.g. capo 3">
										</div>
									</div>
									<div class="column col-12">
										<label class="form-label">Translations</label>
										<div v-if="song.translations && song.translations.length == 0" class="text-gray">
											<i class="icon ion-md-information-circle-outline mr-1"></i> This song has no translation yet.
										</div>
										<div v-else>
											<div v-for="tsong in song.translations" :key="tsong" class="tile tile-centered mb-1">
												<div class="tile-icon">
													<figure class="avatar s-rounded" :data-initial="songs[tsong].language"></figure>
												</div>
												<div class="tile-content">
													<div class="tile-title">{{ songs[tsong].title }}</div>
													<div class="tile-subtitle text-gray text-small">{{ songs[tsong].subtitle }}</div>
												</div>
												<div class="tile-action">
													<button class="btn btn-link btn-action" @click="song.translations = song.translations.filter(function(k) {return k !== tsong})">
														<i class="icon ion-md-close"></i>
													</button>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div class="column col-6 col-sm-12">
								<div class="form-group">
									<label class="form-label" for="content">Content</label>
									<textarea v-model="song.content" class="form-input text-pre" id="content" placeholder="songtext with chords and markers" rows="17"></textarea>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="modal-footer">
					<button class="btn btn-secondary float-left" @click="modal.translations = true">Add Translation</button>
					<button class="btn btn-link btn-gray" aria-label="Cancel" @click.prevent="$emit('closed')">Cancel</button>
					<button class="btn btn-primary ml-2" @click="setSong">
						<span v-if="!existing">Create</span>
						<span v-else>Update</span> Song
					</button>
				</div>
			</div>
		</div>
		<!-- additional modal: add tag -->
		<div v-if="song" class="modal modal-secondary" :class="{ active: modal.tags }">
			<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="modal.tags = false"></a>
			<div class="modal-container">
				<div class="modal-header">
					<a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="modal.tags = false"></a>
					<div class="modal-title h5">Tags</div>
				</div>
				<div class="modal-body">
					<div class="content">
						<div class="columns">
							<div class="column col-6">
								<div class="input-group">
									<span class="input-group-addon"><i class="form-icon icon ion-md-search"></i></span>
									<input v-model="search.tags" type="search" class="form-input" placeholder="search ..." />
								</div>
								<div class="form-group max-column mt-2">
									<label v-for="tag in filteredTags" :key="tag.key" class="form-checkbox">
										<input v-model="song.tags" :value="tag.key" type="checkbox">
										<i class="form-icon"></i> {{ tag.key }}
									</label>
								</div>
							</div>
							<div class="column col-6">
								<div v-if="song.tags && song.tags.length == 0" class="empty">
									<div class="empty-icon">
										<i class="icon ion-md-pricetags icon-4x"></i>
									</div>
									<p class="empty-title h5">No Tags selected</p>
									<p class="empty-subtitle">Select one ore more tags for the current song.</p>
								</div>
								<div v-else>
									<h3 class="text-center">Selection</h3>
									<div v-for="tag in song.tags" :key="tag" class="tile tile-centered">
										<div class="tile-content">
											<div class="tile-title"><i class="icon ion-md-pricetag mr-1"></i> {{ tag }}</div>
										</div>
										<div class="tile-action">
											<button class="btn btn-link btn-action" @click="song.tags = song.tags.filter(function(k) {return k !== tag})">
												<i class="icon ion-md-close"></i>
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="modal-footer">
					<button class="btn btn-primary" aria-label="Close" @click.prevent="modal.tags = false">Close</button>
				</div>
			</div>
		</div>
		<!-- additional modal: add translation -->
		<div v-if="song && ready" class="modal modal-secondary" :class="{ active: modal.translations }">
			<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="modal.translations = false"></a>
			<div class="modal-container">
				<div class="modal-header">
					<a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="modal.translations = false"></a>
					<div class="modal-title h5">Translations</div>
				</div>
				<div class="modal-body">
					<div class="content">
						<div class="columns">
							<div class="column col-6">
								<div class="input-group">
									<span class="input-group-addon"><i class="form-icon icon ion-md-search"></i></span>
									<input v-model="search.translations" type="search" class="form-input" placeholder="search ..." />
								</div>
								<div class="form-group max-column mt-2">
									<label v-for="(fsong, key) in filteredSongs" :key="key" class="form-checkbox mt-2">
										<input v-model="song.translations" :value="key" type="checkbox">
										<i class="form-icon"></i> {{ fsong.title }}
										<div class="text-gray text-small">
											{{ fsong.subtitle }}
										</div>
									</label>
								</div>
							</div>
							<div class="column col-6">
								<div v-if="song.translations && song.translations.length == 0" class="empty">
									<div class="empty-icon">
										<i class="icon ion-md-book icon-4x"></i>
									</div>
									<p class="empty-title h5">No Songs selected</p>
									<p class="empty-subtitle">Select one ore more songs that are a translation to the current song.</p>
								</div>
								<div v-else>
									<h3 class="text-center">Selection</h3>
									<div v-for="tsong in song.translations" :key="tsong" class="tile tile-centered mb-2">
										<div class="tile-icon">
											<figure class="avatar s-rounded" :data-initial="songs[tsong].language"></figure>
										</div>
										<div class="tile-content">
											<div class="tile-title">{{ songs[tsong].title }}</div>
											<div class="tile-subtitle text-gray text-small">{{ songs[tsong].subtitle }}</div>
										</div>
										<div class="tile-action">
											<button class="btn btn-link btn-action" @click="song.translations = song.translations.filter(function(k) {return k !== tsong})">
												<i class="icon ion-md-close"></i>
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="modal-footer">
					<button class="btn btn-primary" aria-label="Close" @click.prevent="modal.translations = false">Close</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
// get database object authorized in config.js
import { db } from '@/firebase'

export default {
	name: 'song-set',
	props: {
		active: Boolean,
		existing: Boolean,
		initialSong: Object
	},
	firestore () {
		return {
			songs: {
				ref: db.collection('songs'),
				objects: true,
				resolve: () => { this.ready = true },
				reject: () => { this.ready = true }
			},
			tags: db.collection('tags'),
		}
	},
	data () {
		return {
			song: JSON.parse(JSON.stringify(this.initialSong)),
			ready: false,
			modal: {
				tags: false,
				translations: false,
			},
			search: {
				tags: '',
				translations: '',
			},
			tunes: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'B', 'H'],
		}
	},
	methods: {
		setSong () {
			var self = this
			var processedSong = {
				authors: this.song.authors,
				ccli: this.song.ccli ? parseInt(this.song.ccli) : '',
				content: this.song.content,
				language: this.song.language,
				note: this.song.note,
				publisher: this.song.publisher,
				subtitle: this.song.subtitle,
				tags: this.song.tags,
				title: this.song.title,
				translations: this.song.translations,
				tuning: this.song.tuning,
				year: this.song.year ? parseInt(this.song.year) : '',
			}
			// new song should be created
			if (!this.existing) {
				db.collection('songs').doc(this.createSlug(this.song.title)).set(processedSong)
				.then(function() {
					self.$emit('closed')
					self.$emit('reset')
					processedSong = {}
					self.$router.push({ name: 'song-show', params: { id: self.createSlug(self.song.title) }})
					// toast success creation message
					self.$notify({
						title: '<button class="btn btn-clear float-right"></button>Success!',
						text: 'The new song was added.',
						type: 'toast-primary'
					})
				})
				.catch(function() {
					self.$emit('closed')
					// toast error creation message
					self.$notify({
						title: '<button class="btn btn-clear float-right"></button>Error!',
						text: 'The new song could not be added.',
						type: 'toast-error'
					})
				})
			}
			// existing song should be updated
			else {
				db.collection('songs').doc(this.song['.key']).update(processedSong)
				.then(function() {
					self.$emit('closed')
					self.$emit('reset')
					processedSong = {}
					self.$router.push({ name: 'song-show', params: { id: self.song['.key'] }})
					// toast success update message
					self.$notify({
						title: '<button class="btn btn-clear float-right"></button>Success!',
						text: 'The song was updated.',
						type: 'toast-primary'
					})
				})
				.catch(function() {
					self.$emit('closed')
					// toast error update message
					self.$notify({
						title: '<button class="btn btn-clear float-right"></button>Error!',
						text: 'The song could not be updated.',
						type: 'toast-error'
					})
				})
			}
		},
		createSlug (s) {
			return s
				.trim()
				.toLowerCase()
				.replace(/\s/g, '-')
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
		}
	},
	computed: {
		// filter song list by search query
		filteredTags () {
			var tags = {}, self = this
			if (this.search.tags != '') {
				for (const key in self.tags) {
					if (self.tags.hasOwnProperty(key)) {
						const tag = self.tags[key];
						var search = self.search.tags.toLowerCase()
						// search in tag keys
						if (tag.key.toLowerCase().indexOf(search) !== -1) {
							tags[key] = tag
						}
					}
				}
				return tags
			} else {
				return this.tags
			}
		},
		// filter song list by search query
		filteredSongs () {
			var songs = {}, self = this
			if (this.search.translations != '') {
				for (const key in self.songs) {
					if (self.songs.hasOwnProperty(key)) {
						const song = self.songs[key];
						var search = self.search.translations.toLowerCase()
						// search in title and subtitle
						if (song.title.toLowerCase().indexOf(search) !== -1 || song.subtitle.toLowerCase().indexOf(search) !== -1) {
							songs[key] = song
						}
					}
				}
				return songs
			} else {
				return this.songs
			}
		}
	}
}
</script>

<style lang="scss">
#content {
	height: 55vh;
	font-size: .7em;
	line-height: 1.3em;
}
.modal-secondary {
	.max-column {
		height: 42vh;
		overflow-y: scroll;
	}
}
</style>
