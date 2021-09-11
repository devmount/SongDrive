<template>
	<div class="modal modal-lg" :class="{ active: active }">
		<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="cancel"></a>
		<div v-if="setlist && ready.songs" class="modal-container">
			<div class="modal-header">
				<a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="cancel"></a>
				<div v-if="!existing" class="modal-title h5">
					{{ $t('modal.newSetlist') }}
					<span v-if="setlist.title" class="ml-2 text-gray text-uppercase ls-1"> «{{ setlist.title }}»</span>
				</div>
				<div v-else class="modal-title h5">
					{{ $t('modal.editSetlist') }}
					<span class="ml-2 text-gray text-uppercase ls-1"> «{{ setlist.title }}»</span>
				</div>
			</div>
			<div class="modal-body">
				<div class="content">
					<div class="columns">
						<div class="column col-4 col-md-12">
							<div class="columns">
								<!-- title -->
								<div class="column col-12 col-md-6">
									<div class="form-group mb-2" :class="{ 'has-error': error.title || error.slug }">
										<label class="form-label" for="title">
											{{ $t('field.title') }} <span class="text-error">*</span>
										</label>
										<input
											v-model="setlist.title"
											class="form-input" id="title"
											type="text"
											:placeholder="$t('placeholder.exampleSetlistTitle')"
										>
										<p v-if="error.title" class="form-input-hint">{{ $t('error.requiredTitle') }}</p>
										<p v-if="error.slug" class="form-input-hint">{{ $t('error.setlistAlreadyExists') }}</p>
									</div>
								</div>
								<!-- date -->
								<div class="column col-12 col-md-6">
									<div class="form-group mb-2">
										<label class="form-label" for="date">
											{{ $t('field.date') }}
											<span class="text-gray ml-2">{{ humanDate(setlist.date, $i18n.locale) }}</span>
										</label>
										<datepicker
											:value="setlist.date != '' ? (new Date(setlist.date)) : (new Date())"
											format="yyyy-MM-dd"
											wrapper-class="calendar-wrapper hide-lg"
											input-class="form-input"
											calendar-class="calendar"
											:typeable="true"
											:inline="true"
											:monday-first="true"
											:open-date="setlist.date != '' ? (new Date(setlist.date)) : (new Date())"
											:language="calendarLanguage[$i18n.locale]"
											name="setlistdate"
											@selected="updateDate"
										></datepicker>
										<input
											class="form-input show-lg"
											type="date"
											v-model="setlist.date"
											pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
										/>
									</div>
								</div>
							</div>
						</div>
						<div class="column col-8 col-md-12">
							<!-- song selection -->
							<div class="columns">
								<div class="column col-6 col-sm-12">
									<label class="form-label" for="search">Songs</label>
									<div class="input-group filter">
										<!-- search title, subtitles -->
										<span class="input-group-addon"><ion-icon name="search-outline"></ion-icon></span>
										<input
											type="search"
											id="search"
											v-model="search"
											class="form-input"
											:placeholder="$t('placeholder.searchSongTitle')"
										/>
										<div class="dropdown dropdown-right">
											<div class="btn-group">
												<a
													class="btn input-group-btn btn-secondary dropdown-toggle"
													:class="{ 'badge': filter!=''||tuning!=''||language!=''}"
													tabindex="0"
												>
													<ion-icon name="filter-sharp"></ion-icon>
												</a>
												<ul class="menu text-left">
													<li class="menu-item">
														<!-- filter tag -->
														<select v-model="filter" class="form-select select-lg filter" required>
															<option value="" disabled selected>{{ $t('placeholder.tag') }}</option>
															<option v-for="tag in tags" :key="tag.key" :value="tag.key">
																{{ $t('tag.' + tag.key) }}
															</option>
														</select>
													</li>
													<li class="menu-item">
														<!-- filter key -->
														<select v-model="tuning" class="form-select select-lg filter" required>
															<option value="" disabled selected>{{ $t('placeholder.tuning') }}</option>
															<option v-for="t in keyScale()" :key="t" :value="t">{{ t }}</option>
														</select>
													</li>
													<li class="menu-item">
														<!-- filter language -->
														<select v-model="language" class="form-select select-lg filter" required>
															<option value="" disabled selected>{{ $t('placeholder.language') }}</option>
															<option v-for="(l, k) in songLanguages()" :key="k" :value="k">{{ l }}</option>
														</select>
													</li>
													<li class="menu-item">
														<!-- reset filter -->
														<button
															class="btn input-group-btn btn-lg btn-secondary btn-error stretch"
															@click="search=''; filter=''; tuning=''; language=''"
														>
															<ion-icon name="close"></ion-icon>
															{{ $t('button.reset') }}
														</button>
													</li>
												</ul>
											</div>
										</div>
									</div>
									<div class="form-group max-column mt-2">
										<label v-for="(fsong, key) in filteredSongs" :key="key" class="form-checkbox mt-2">
											<input v-model="setlistSongs" :value="key" type="checkbox">
											<i class="form-icon"></i> {{ fsong.title }} <label class="label px-2">{{ fsong.tuning }}</label>
											<div class="text-gray text-small">
												{{ fsong.subtitle }}
											</div>
										</label>
									</div>
								</div>
								<div class="column col-6 col-sm-12">
									<div v-if="setlist.songs && setlist.songs.length == 0" class="empty">
										<div class="empty-icon">
											<ion-icon name="musical-notes-outline" class="icon-4x"></ion-icon>
										</div>
										<p class="empty-title h5">{{ $t('text.noSongsSelected') }}</p>
										<p class="empty-subtitle">{{ $t('text.selectSomeSongs') }}</p>
									</div>
									<div v-else>
										<h3 class="text-center">{{ setlist.songs.length }} {{ $t('text.selected') }}</h3>
										<div v-sortable="{ onEnd: reorder, handle: '.handle' }">
											<div v-for="(song, i) in setlist.songs" :key="song.id" class="tile tile-centered mb-2">
												<span class="c-move text-center text-gray">
													<ion-icon name="reorder-four" class="px-2 mx-2 handle"></ion-icon>
												</span>
												<button class="btn btn-secondary btn-sm btn-fw" @click.prevent="tuneDown(i)">
													<ion-icon name="arrow-back" class="icon-sm"></ion-icon>
												</button>
												<div class="tile-icon">
													<figure
														class="avatar s-rounded"
														:data-initial="song.tuning ? song.tuning : songs[song.id].tuning"
													></figure>
												</div>
												<button class="btn btn-secondary btn-sm btn-fw" @click.prevent="tuneUp(i)">
													<ion-icon name="arrow-forward" class="icon-sm"></ion-icon>
												</button>
												<div class="tile-content">
													<div class="tile-title">{{ songs[song.id].title }}</div>
													<div class="tile-subtitle text-gray text-small">{{ songs[song.id].subtitle }}</div>
												</div>
												<div class="tile-action">
													<button
														class="btn btn-link btn-action"
														@click="setlistSongs = setlistSongs.filter(k => k !== song.id)"
													>
														<ion-icon name="close"></ion-icon>
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
				<button class="btn btn-link btn-gray" aria-label="Cancel" @click.prevent="cancel">
					{{ $t('button.cancel') }}
				</button>
				<button class="btn btn-primary ml-2" @click="set">
					<span v-if="!existing">{{ $t('button.createSetlist') }}</span>
					<span v-else>{{ $t('button.updateSetlist') }}</span>
				</button>
			</div>
		</div>
	</div>
</template>

<script>
// init datepicker component
import Datepicker from 'vuejs-datepicker';
import { en, de } from 'vuejs-datepicker/dist/locale';

export default {
	name: 'setlist-set',
	components: {
		Datepicker
	},
	props: {
		active: Boolean,
		existing: Boolean,
		initialSetlist: Object,
		setlistKey: String,
		user: String,
		songs: Object,
		setlists: Object,
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
			language: '',
			error: {
				title: false,
				slug: false,
			},
			calendarLanguage: {
				en: en,
				de: de
			}
		};
	},
	watch: {
		// update this.setlist.songs according to selection
		setlistSongs (newList, oldList) {
			// song was added
			if (newList.length > oldList.length) {
				let songAdded = newList.filter(x => !oldList.includes(x))[0];
				this.setlist.songs.push({ id: songAdded, tuning: this.songs[songAdded].tuning });
			}
			// song was removed
			else {
				let songRemoved = oldList.filter(x => !newList.includes(x))[0], newSongs = [];
				for (var i in this.setlist.songs) {
					if (this.setlist.songs[i].id != songRemoved) {
						newSongs.push({ id: this.setlist.songs[i].id, tuning: this.setlist.songs[i].tuning });
					}
				}
				this.setlist.songs = newSongs;
			}
		}
	},
	mounted () {
		// initial date today for new setlists
		if (!this.existing) {
			this.updateDate(new Date());
		}
	},
	methods: {
		// update setlist date from datepicker
		updateDate (newDate) {
			this.setlist.date = newDate.toISOString().slice(0,10);
		},
		// update song order of setlist songs
		reorder ({oldIndex, newIndex}) {
			const movedItem = this.setlist.songs.splice(oldIndex, 1)[0];
			this.setlist.songs.splice(newIndex, 0, movedItem);
		},
		// tune the song at given position up
		tuneUp (position) {
			let songs = this.setlist.songs;
			// update tuning
			let tone = songs[position].tuning ? songs[position].tuning : this.songs[songs[position].id].tuning;
			let i = this.keyScale().indexOf(tone);
			if (i>=this.keyScale().length-1) {
				tone = this.keyScale()[0];
			} else {
				tone = this.keyScale()[++i];
			}
			// save tuning in setlist
			this.setlist.songs[position].tuning = tone;
		},
		// tune the song at given position down
		tuneDown (position) {
			let songs = this.setlist.songs;
			// update tuning
			let tone = songs[position].tuning ? songs[position].tuning : this.songs[songs[position].id].tuning;
			let i = this.keyScale().indexOf(tone);
			if (i<=0) {
				tone = this.keyScale()[this.keyScale().length-1];
			} else {
				tone = this.keyScale()[--i];
			}
			// save tuning in setlist
			this.setlist.songs[position].tuning = tone;
		},
		// add or save edits of setlist to db 
		set () {
			// first check for form errors
			this.error.title = this.setlist.title == '';
			let slug = this.createSlug();
			this.error.slug = this.existing && this.setlistKey == slug ? false : this.setlists.hasOwnProperty(slug);
			// no errors: start saving song data
			if (!this.error.title && !this.error.slug) {
				var processedSetlist = {
					active: false,
					creator: !this.existing ? this.user : this.setlist.creator,
					position: 0,
					title: this.setlist.title,
					date: this.setlist.date,
					songs: this.setlist.songs,
				};
				// new setlist should be created
				if (!this.existing) {
					this.$db.collection('setlists').doc(slug).set(processedSetlist)
						.then(() => {
							this.$emit('closed');
							this.$emit('reset');
							processedSetlist = {};
							this.$router.push({ name: 'setlist-show', params: { id: slug }});
							// toast success creation message
							this.$notify({
								title: this.$parent.$t('toast.setlistAdded'),
								text: this.$parent.$t('toast.setlistSavedText'),
								type: 'primary'
							});
						})
						.catch((error) => {
							this.$emit('closed');
							// toast error on creation message
							this.$notify({ title: error.code, text: error.message, type: 'error' });
						})
				}
				// existing setlist should be updated
				else {
					// check if key remained (no title or date change)
					if (this.setlistKey == slug) {
						// just update the existing setlist
						this.$db.collection('setlists').doc(this.setlistKey).update(processedSetlist)
							.then(() => {
								this.$emit('closed');
								this.$emit('reset');
								processedSetlist = {};
								// toast success update message
								this.$notify({
									title: this.$parent.$t('toast.setlistUpdated'),
									text: this.$parent.$t('toast.setlistSavedText'),
									type: 'primary'
								});
							})
							.catch((error) => {
								this.$emit('closed');
								// toast error on update message
								this.$notify({ title: error.code, text: error.message, type: 'error' });
							})
					} else {
						// update key by adding a new setlist and removing the old one
						this.$db.collection('setlists').doc(this.setlistKey).delete();
						this.$db.collection('setlists').doc(slug).set(processedSetlist)
							.then(() => {
								this.$emit('closed');
								this.$emit('reset');
								processedSetlist = {};
								this.$router.push({ name: 'setlist-show', params: { id: slug }});
								// toast success update message
								this.$notify({
									title: this.$parent.$t('toast.setlistUpdated'),
									text: this.$parent.$t('toast.setlistSavedText'),
									type: 'primary'
								});
							})
							.catch((error) => {
								this.$emit('closed');
								// toast error on update message
								this.$notify({ title: error.code, text: error.message, type: 'error' });
							})
					}
				}
			}
		},
		// create a human readable record key of format YYYYMMDD-the-setlist-title
		createSlug () {
			return this.setlist.date.replace(/-/g, '') + '-' + this.slug(this.setlist.title);
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
				.replace(/ß/g, 'ss');
		},
		cancel () {
			this.$emit('closed');
		}
	},
	computed: {
		// filter song list by search query
		filteredSongs () {
			var songs = this.songs;
			if (this.search != '') {
				var key = this.search.toLowerCase();
				songs = Object.filter(
					songs,
					s => s.title.toLowerCase().indexOf(key) !== -1 ||
						s.subtitle.toLowerCase().indexOf(key) !== -1 ||
						s.content.toLowerCase().indexOf(key) !== -1
				);
			}
			if (this.filter != '') {
				songs = Object.filter(songs, s => s.tags.indexOf(this.filter) !== -1);
			}
			if (this.tuning != '') {
				songs = Object.filter(songs, s => s.tuning.indexOf(this.tuning) !== -1);
			}
			if (this.language != '') {
				songs = Object.filter(songs, s => s.language.indexOf(this.language) !== -1);
			}
			return songs;
		},
	},
}
</script>
