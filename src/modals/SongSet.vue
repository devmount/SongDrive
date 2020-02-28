<template>
	<div>
		<!-- main modal: set song -->
		<div class="modal modal-lg" :class="{ active: active }">
			<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="$emit('closed')"></a>
			<div v-if="song && ready.songs" class="modal-container">
				<div class="modal-header">
					<a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="$emit('closed')"></a>
					<div v-if="!existing" class="modal-title h5">{{ $t('modal.newSong') }}</div>
					<div v-else class="modal-title h5">{{ $t('modal.editSong') }} «<span class="text-uppercase ls-1">{{ song.title }}</span>»</div>
				</div>
				<div class="modal-body">
					<div class="content">
						<div class="columns">
							<div class="column col-6 col-sm-12">
								<div class="columns">
									<div class="column col-12">
										<div class="form-group" :class="{ 'has-error': error.title || error.slug }">
											<label class="form-label" for="title">{{ $t('field.title') }} <span class="text-error">*</span></label>
											<input v-model="song.title" class="form-input" id="title" type="text" :placeholder="$t('placeholder.exampleSongTitle')">
											<p v-if="error.title" class="form-input-hint">{{ $t('error.requiredTitle') }}</p>
											<p v-if="error.slug" class="form-input-hint">{{ $t('error.songAlreadyExists') }}</p>
										</div>
									</div>
									<div class="column col-8 col-md-12">
										<div class="form-group">
											<label class="form-label" for="subtitle">{{ $t('field.subtitle') }}</label>
											<input v-model="song.subtitle" class="form-input" id="subtitle" type="text" :placeholder="$t('placeholder.exampleSongSubtitle')">
										</div>
									</div>
									<div class="column col-4 col-md-12">
										<div class="form-group" :class="{ 'has-error': error.language }">
											<label class="form-label" for="language">{{ $t('field.language') }} <span class="text-error">*</span></label>
											<select v-model="song.language" class="form-select" id="language">
												<option value="">{{ $t('placeholder.select') }}</option>
												<option v-for="(label, key) in languages" :value="key" :key="key">{{ label }}</option>
											</select>
											<p v-if="error.language" class="form-input-hint">{{ $t('error.requiredLanguage') }}</p>
										</div>
									</div>
									<div class="column col-8 col-md-12">
										<div class="form-group">
											<label class="form-label" for="authors">{{ $t('field.authors') }}</label>
											<input v-model="song.authors" class="form-input" id="authors" type="text" :placeholder="$t('placeholder.exampleSongAuthors')">
										</div>
									</div>
									<div class="column col-4 col-md-12">
										<div class="form-group">
											<label class="form-label" for="tuning">{{ $t('field.tuning') }}</label>
											<select v-model="song.tuning" class="form-select" id="tuning">
												<option value="">{{ $t('placeholder.select') }}</option>
												<option v-for="tune in tunes" :key="tune">{{ tune }}</option>
											</select>
										</div>
									</div>
									<div class="column col-8 col-md-12">
										<div class="form-group">
											<label class="form-label" for="tags">{{ $t('field.tags') }}</label>
											<div v-for="tag in song.tags" :key="tag" class="chip s-rounded">
												<ion-icon name="pricetag-outline" class="icon-sm mr-2"></ion-icon> {{ $t('tag.' + tag) }}
												<a href="#" class="btn btn-clear" aria-label="Close" role="button" @click="song.tags = song.tags.filter(function(k) {return k !== tag})"></a>
											</div>
											<button class="btn btn-secondary btn-sm" @click="modal.tags = true">
												<ion-icon name="add"></ion-icon>
											</button>
										</div>
									</div>
									<div class="column col-4 col-md-12">
										<div class="form-group">
											<label class="form-label" for="ccli">{{ $t('field.ccli') }} #</label>
											<input v-model="song.ccli" class="form-input" id="ccli" type="number" :placeholder="$t('placeholder.exampleSongCcli')">
										</div>
									</div>
									<div class="column col-8 col-md-12">
										<div class="form-group">
											<label class="form-label" for="publisher">{{ $t('field.publisher') }}</label>
											<textarea v-model="song.publisher" class="form-input" id="publisher" :placeholder="$t('placeholder.exampleSongPublisher')" rows="2"></textarea>
										</div>
									</div>
									<div class="column col-4 col-md-12">
										<div class="form-group">
											<label class="form-label" for="year">{{ $t('field.year') }}</label>
											<input v-model="song.year" class="form-input" id="year" type="number" :placeholder="$t('placeholder.exampleSongYear')">
										</div>
									</div>
									<div class="column col-8 col-md-12">
										<div class="form-group">
											<label class="form-label" for="note">{{ $t('field.note') }}</label>
											<input v-model="song.note" class="form-input" id="note" type="text" :placeholder="$t('placeholder.exampleSongNote')">
										</div>
									</div>
									<div class="column col-4 col-md-12">
										<div class="form-group">
											<label class="form-label" for="youtube">{{ $t('field.youtubeId') }}</label>
											<input v-model="song.youtube" class="form-input" id="youtube" type="text" :placeholder="$t('placeholder.exampleSongYoutubeId')">
										</div>
									</div>
									<div class="column col-12">
										<label class="form-label">{{ $t('field.translations') }}</label>
										<div v-if="song.translations && song.translations.length == 0" class="text-gray">
											<ion-icon name="information-circle-outline"></ion-icon> {{ $t('text.noTranslations') }}
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
														<ion-icon name="close"></ion-icon>
													</button>
												</div>
											</div>
										</div>
										<button class="btn btn-secondary btn-sm mt-1" @click="modal.translations = true">
											<ion-icon name="add"></ion-icon>
										</button>
									</div>
								</div>
							</div>
							<div class="column col-6 col-sm-12">
								<div class="form-group" :class="{ 'has-error': error.content }">
									<label class="form-label" for="content">{{ $t('field.content') }} <span class="text-error">*</span></label>
									<textarea v-model="song.content" class="form-input text-pre" id="content" :placeholder="$t('placeholder.exampleSongContent')" rows="17" required></textarea>
									<p v-if="error.content" class="form-input-hint">{{ $t('error.requiredContent') }}</p>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="modal-footer">
					<button class="btn btn-link btn-gray" aria-label="Cancel" @click.prevent="$emit('closed')">{{ $t('button.cancel') }}</button>
					<button class="btn btn-primary ml-2" @click="set">
						<span v-if="!existing">{{ $t('button.createSong') }}</span>
						<span v-else>{{ $t('button.updateSong') }}</span>
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
					<div class="modal-title h5">{{ $t('modal.tags') }}</div>
				</div>
				<div class="modal-body">
					<div class="content">
						<div class="columns">
							<div class="column col-6">
								<div class="input-group filter">
									<span class="input-group-addon"><ion-icon name="search-outline"></ion-icon></span>
									<input v-model="search.tags" type="search" class="form-input" :placeholder="$t('placeholder.searchTagName')" />
								</div>
								<div class="form-group max-column mt-2">
									<label v-for="tag in filteredTags" :key="tag.key" class="form-checkbox">
										<input v-model="song.tags" :value="tag.key" type="checkbox">
										<i class="form-icon"></i> {{ $t('tag.' + tag.key) }}
									</label>
								</div>
							</div>
							<div class="column col-6">
								<div v-if="song.tags && song.tags.length == 0" class="empty">
									<div class="empty-icon">
										<ion-icon name="pricetags-outline" class="icon-4x"></ion-icon>
									</div>
									<p class="empty-title h5">{{ $t('text.noTagsSelected') }}</p>
									<p class="empty-subtitle">{{ $t('text.selectSomeTags') }}</p>
								</div>
								<div v-else>
									<h3 class="text-center">{{ $t('text.selection') }}</h3>
									<div v-for="tag in song.tags" :key="tag" class="tile tile-centered">
										<div class="tile-content">
											<div class="tile-title"><ion-icon name="pricetag-outline" class="mr-2"></ion-icon> {{ $t('tag.' + tag) }}</div>
										</div>
										<div class="tile-action">
											<button class="btn btn-link btn-action" @click="song.tags = song.tags.filter(function(k) {return k !== tag})">
												<ion-icon name="close"></ion-icon>
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="modal-footer">
					<button class="btn btn-primary" aria-label="Close" @click.prevent="modal.tags = false">{{ $t('button.close') }}</button>
				</div>
			</div>
		</div>
		<!-- additional modal: add translation -->
		<div v-if="song && ready.songs" class="modal modal-secondary" :class="{ active: modal.translations }">
			<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="modal.translations = false"></a>
			<div class="modal-container">
				<div class="modal-header">
					<a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="modal.translations = false"></a>
					<div class="modal-title h5">{{ $t('modal.translations') }}</div>
				</div>
				<div class="modal-body">
					<div class="content">
						<div class="columns">
							<div class="column col-6">
								<div class="input-group filter">
									<span class="input-group-addon"><ion-icon name="search-outline"></ion-icon></span>
									<input v-model="search.translations" type="search" class="form-input" :placeholder="$t('placeholder.searchSongTitle')" />
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
										<ion-icon name="book-outline" class="icon-4x"></ion-icon>
									</div>
									<p class="empty-title h5">{{ $t('text.noSongsSelected') }}</p>
									<p class="empty-subtitle">{{ $t('text.selectSomeTranslations') }}</p>
								</div>
								<div v-else>
									<h3 class="text-center">{{ $t('text.selection') }}</h3>
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
												<ion-icon name="close"></ion-icon>
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="modal-footer">
					<button class="btn btn-primary" aria-label="Close" @click.prevent="modal.translations = false">{{ $t('button.close') }}</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
// get basic program parameters
import basics from '@/basics'

export default {
	name: 'song-set',
	props: {
		db: Object,
		active: Boolean,
		existing: Boolean,
		initialSong: Object,
		songKey: String,
		songs: Object,
		tags: Object,
		ready: Object,
	},
	data () {
		return {
			song: JSON.parse(JSON.stringify(this.initialSong)),
			modal: {
				tags: false,
				translations: false,
			},
			search: {
				tags: '',
				translations: '',
			},
			error: {
				title: false,
				language: false,
				content: false,
				slug: false,
			},
			tunes: basics.tunes,
			languages: basics.languages,
		}
	},
	methods: {
		set () {
			// first check for form errors
			this.error.title = this.song.title == ''
			this.error.language = this.song.language == ''
			this.error.content = this.song.content == ''
			let slug = this.createSlug()
			this.error.slug = this.existing && this.songKey == slug ? false : this.songs.hasOwnProperty(slug)
			// no errors: start saving song data
			if (!this.errors) {
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
					youtube: this.song.youtube,
				}
				// new song should be created
				if (!this.existing) {
					this.db.collection('songs').doc(slug).set(processedSong)
					.then(function() {
						self.$emit('closed')
						self.$emit('reset')
						processedSong = {}
						self.$router.push({ name: 'song-show', params: { id: slug }})
						// toast success creation message
						self.$notify({ title: self.$parent.$t('toast.songAdded'), text: self.$parent.$t('toast.songSavedText'), type: 'primary' })
					})
					.catch(function(error) {
						self.$emit('closed')
						// toast error on creation message
						self.$notify({ title: error.code, text: error.message, type: 'error' })
					})
				}
				// existing song should be updated
				else {
					// check if key remained (no title or language changes)
					if (this.songKey == slug) {
						// just update the existing setlist
						this.db.collection('songs').doc(this.songKey).update(processedSong)
						.then(function() {
							self.$emit('closed')
							self.$emit('reset')
							processedSong = {}
							// toast success update message
							self.$notify({ title: self.$parent.$t('toast.songUpdated'), text: self.$parent.$t('toast.songSavedText'), type: 'primary' })
						})
						.catch(function(error) {
							self.$emit('closed')
							// toast error on creation message
							self.$notify({ title: error.code, text: error.message, type: 'error' })
						})
					} else {
						// update key by adding a new song and removing the old one
						this.db.collection('songs').doc(this.songKey).delete()
						this.db.collection('songs').doc(slug).set(processedSong)
						.then(function() {
							self.$emit('closed')
							self.$emit('reset')
							processedSong = {}
							self.$router.push({ name: 'song-show', params: { id: slug }})
							// toast success update message
							self.$notify({ title: self.$parent.$t('toast.songUpdated'), text: self.$parent.$t('toast.songSavedText'), type: 'primary' })
						})
						.catch(function(error) {
							self.$emit('closed')
							// toast error on creation message
							self.$notify({ title: error.code, text: error.message, type: 'error' })
						})
					}
				}
			}
		},
		// create a human readable record key of format YYYYMMDD-the-setlist-title
		createSlug () {
			return this.slug(this.song.title) + '-' + this.song.language
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
						// search in tag labels
						if (self.$parent.$t('tag.' + tag.key).toLowerCase().indexOf(search) !== -1) {
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
						if (song.title.toLowerCase().indexOf(search) !== -1 || song.subtitle.toLowerCase().indexOf(search) !== -1 || song.content.toLowerCase().indexOf(search) !== -1) {
							songs[key] = song
						}
					}
				}
				return songs
			} else {
				return this.songs
			}
		},
		// calculate wether form errors occured
		errors () {
			return (this.error.title || this.error.language || this.error.content || this.error.slug)
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
