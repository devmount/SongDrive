<template>
	<div class="modal modal-lg modal-wide" :class="{ active: active }">
		<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="cancel"></a>
		<div v-if="setlist && ready.songs" class="modal-container">
			<div class="modal-header">
				<a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="cancel"></a>
				<div v-if="!existing" class="modal-title h5">
					{{ t('modal.newSetlist') }}
					<span v-if="setlist.title" class="ml-2 text-gray text-uppercase ls-1"> «{{ setlist.title }}»</span>
				</div>
				<div v-else class="modal-title h5">
					{{ t('modal.editSetlist') }}
					<span class="ml-2 text-gray text-uppercase ls-1"> «{{ setlist.title }}»</span>
				</div>
			</div>
			<div class="modal-body">
				<div class="content">
					<div class="columns">
						<div class="column col-4 col-md-12">
							<div class="columns">
								<!-- title and visibility -->
								<div class="column col-12 col-md-6">
									<div class="columns">
										<div class="column col-8 col-xl-12">
											<div class="form-group mb-2" :class="{ 'has-error': error.title || error.slug }">
												<label class="form-label" for="title">
													{{ t('field.title') }} <span class="text-error">*</span>
												</label>
												<input
													v-model="setlist.title"
													id="title"
													class="form-input"
													type="text"
													:placeholder="t('placeholder.exampleSetlistTitle')"
												>
												<p v-if="error.title" class="form-input-hint">{{ t('error.requiredTitle') }}</p>
												<p v-if="error.slug" class="form-input-hint">{{ t('error.setlistAlreadyExists') }}</p>
											</div>
										</div>
										<div class="column col-4 col-xl-12">
											<div class="form-group mb-2">
												<label class="form-label" for="visibility">
													{{ t('field.visibility') }} <span class="text-error">*</span>
												</label>
												<select v-model="setlist.private" class="form-select" id="visibility" required>
													<option value="0">{{ t('option.public') }}</option>
													<option value="1">{{ t('option.private') }}</option>
												</select>
												<p v-if="setlist.private=='1'" class="form-input-hint">{{ t('text.visibleForYou') }}</p>
												<p v-if="setlist.private=='0'" class="form-input-hint">{{ t('text.visibleForAll') }}</p>
											</div>
										</div>
									</div>
								</div>
								<!-- date -->
								<div class="column col-12 col-md-6">
									<div class="form-group mb-2">
										<label class="form-label" for="date">
											{{ t('field.date') }} <span class="text-error">*</span><br />
											<span class="text-gray">{{ humanDate(setlist.date, locale) }}</span>
										</label>
										<Datepicker
											:modelValue="setlist.date != '' ? (new Date(setlist.date)) : (new Date())"
											format="yyyy-MM-dd"
											class="hide-lg"
											inputClassName="form-input"
											calendarClassName="calendar"
											textInput
											inline
											autoApply
											dark
											:enableTimePicker="false"
											:locale="locale"
											:formatLocale="calendarLanguage[locale]"
											@update:modelValue="updateDate"
										>
											<template #arrow-left>
												<ion-icon class="slot-icon" :icon="arrowBack"></ion-icon>
											</template>
											<template #arrow-right>
												<ion-icon class="slot-icon" :icon="arrowForward"></ion-icon>
											</template>
											<template #calendar-icon>
												<ion-icon class="slot-icon" :icon="calendarClearOutline"></ion-icon>
											</template>
										</Datepicker>
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
										<span class="input-group-addon"><ion-icon :icon="searchOutline"></ion-icon></span>
										<input
											type="search"
											id="search"
											v-model="search"
											class="form-input"
											:placeholder="t('placeholder.searchSongTitle')"
										/>
										<div class="dropdown dropdown-right">
											<div class="btn-group">
												<a
													class="btn input-group-btn btn-secondary dropdown-toggle"
													:class="{ 'badge': filter!=''||tuning!=''||language!=''}"
													tabindex="0"
												>
													<ion-icon :icon="filterSharp"></ion-icon>
												</a>
												<ul class="menu text-left">
													<li class="menu-item">
														<!-- filter tag -->
														<select v-model="filter" class="form-select select-lg filter">
															<option value="" disabled selected>{{ t('placeholder.tag') }}</option>
															<option v-for="tag in tags" :key="tag.key" :value="tag.key">
																{{ tag[locale] ? tag[locale] : tag.key }}
															</option>
														</select>
													</li>
													<li class="menu-item">
														<!-- filter key -->
														<select v-model="tuning" class="form-select select-lg filter">
															<option value="" disabled selected>{{ t('placeholder.tuning') }}</option>
															<option v-for="t in keyScale" :key="t" :value="t">{{ t }}</option>
														</select>
													</li>
													<li class="menu-item">
														<!-- filter language -->
														<select v-model="language" class="form-select select-lg filter">
															<option value="" disabled selected>{{ t('placeholder.language') }}</option>
															<option v-for="(l, k) in languages" :key="k" :value="k">{{ l.label }}</option>
														</select>
													</li>
													<li class="menu-item">
														<!-- reset filter -->
														<button
															class="btn input-group-btn btn-lg btn-error-secondary stretch"
															@click="search=''; filter=''; tuning=''; language=''"
														>
															<ion-icon :icon="close"></ion-icon>
															{{ t('button.reset') }}
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
												{{ fsong.subtitle }} <span v-if="performedSongs[key]" class="text-dark" :title="t('title.lastPerformed')">&nbsp;{{ performedSongs[key] }}</span>
											</div>
										</label>
									</div>
								</div>
								<div class="column col-6 col-sm-12">
									<div v-if="setlist.songs && setlist.songs.length == 0" class="empty">
										<div class="empty-icon">
											<ion-icon :icon="musicalNotesOutline" class="icon-4x"></ion-icon>
										</div>
										<p class="empty-title h5">{{ t('text.noSongsSelected') }}</p>
										<p class="empty-subtitle">{{ t('text.selectSomeSongs') }}</p>
									</div>
									<div v-else>
										<h3 class="text-center">{{ setlist.songs.length }} {{ t('text.selected') }}</h3>
										<div v-sortable="{ onEnd: reorder, handle: '.handle' }">
											<div v-for="(song, i) in setlist.songs" :key="song.id" class="tile tile-centered mb-2">
												<span class="c-move text-center text-gray">
													<ion-icon :icon="reorderFour" class="px-2 mx-2 handle"></ion-icon>
												</span>
												<button class="btn btn-secondary btn-sm btn-fw" @click.prevent="tuneDown(i)">
													<ion-icon :icon="arrowBack" class="icon-sm"></ion-icon>
												</button>
												<div class="tile-icon">
													<figure
														class="avatar s-rounded"
														:data-initial="song.tuning ? song.tuning : songs[song.id].tuning"
													></figure>
												</div>
												<button class="btn btn-secondary btn-sm btn-fw" @click.prevent="tuneUp(i)">
													<ion-icon :icon="arrowForward" class="icon-sm"></ion-icon>
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
														<ion-icon :icon="close"></ion-icon>
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
					{{ t('button.cancel') }}
				</button>
				<button class="btn btn-primary ml-2" @click="set">
					<span v-if="!existing">{{ t('button.createSetlist') }}</span>
					<span v-else>{{ t('button.updateSetlist') }}</span>
				</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, reactive, computed, inject, watch, onMounted } from 'vue';
import { useI18n } from "vue-i18n";
const { t, locale } = useI18n();
import { useRouter } from 'vue-router';
const router = useRouter();
import { notify } from '@kyvg/vue3-notification';
import { keyScale, humanDate, throwError, urlify } from '@/utils.js';

// init datepicker component
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { enGB, de } from 'date-fns/locale';

// get icons
import {
	arrowBack,
	arrowForward,
	close,
	filterSharp,
	musicalNotesOutline,
	reorderFour,
	searchOutline,
	calendarClearOutline
} from 'ionicons/icons';

// global properties
const db = inject('db');

// inherited properties
const props = defineProps({
	active:         Boolean, // state of modal display, true to show modal
	existing:       Boolean, // setlist already exists
	initialSetlist: Object,  // setlist structure to fill with data
	setlistKey:     String,  // setlist identifier
	user:           String,  // user identifier
	songs:          Object,  // list of all available songs
	setlists:       Object,  // list of all available setlists
	tags:           Object,  // list of all available tags
	languages:      Object,  // list of all available languages
	ready:          Object,  // object holding information about the retrieval state of collections
});

// reactive data
const sl = JSON.parse(JSON.stringify(props.initialSetlist));
sl.songs = sl.songs.filter(s => s.id in props.songs); // only show undeleted songs
sl.private = sl.private ? 1 : 0;                      // init visibility state if not existing
const setlist = ref(sl);
const setlistSongs = ref(sl.songs.map(s => s.id));
const search = ref('');
const filter = ref('');
const tuning = ref('');
const language = ref('');
const error = reactive({
	title: false,
	slug: false,
});
const calendarLanguage = reactive({
	en: enGB,
	de: de
});

// emits
const emit = defineEmits(['closed', 'reset']);

// computed: filter song list by search query
const filteredSongs = computed(() => {
	var songs = props.songs;
	if (search.value != '') {
		var key = search.value.toLowerCase();
		songs = Object.filter(
			songs,
			s => s.title.toLowerCase().indexOf(key) !== -1 ||
				s.subtitle.toLowerCase().indexOf(key) !== -1 ||
				s.content.toLowerCase().indexOf(key) !== -1
		);
	}
	if (filter.value != '') {
		songs = Object.filter(songs, s => s.tags.indexOf(filter.value) !== -1);
	}
	if (tuning.value != '') {
		songs = Object.filter(songs, s => s.tuning.indexOf(tuning.value) !== -1);
	}
	if (language.value != '') {
		songs = Object.filter(songs, s => s.language.indexOf(language.value) !== -1);
	}
	return songs;
});
// computed: list of songs and the date of their last performance
const performedSongs = computed(() => {
	let songs = {};
	let setlists = Object.values(props.setlists).sort((a, b) => b.date.localeCompare(a.date));
	setlists.forEach(setlist => {
		setlist.songs.forEach(song => {
			if (!(song.id in songs)) {
				songs[song.id] = humanDate(setlist.date, locale.value, false);
			}
		});
	});
	return songs;
});

// update setlist date from datepicker
const updateDate = (newDate) => {
	setlist.value.date = newDate.toISOString().slice(0,10);
};
// update song order of setlist songs
const reorder = ({oldIndex, newIndex}) => {
	const movedItem = setlist.value.songs.splice(oldIndex, 1)[0];
	setlist.value.songs.splice(newIndex, 0, movedItem);
};
// tune the song at given position up
const tuneUp = (position) => {
	let songs = setlist.value.songs;
	// update tuning
	let tone = songs[position].tuning ? songs[position].tuning : props.songs[songs[position].id].tuning;
	let i = keyScale.indexOf(tone);
	if (i>=keyScale.length-1) {
		tone = keyScale[0];
	} else {
		tone = keyScale[++i];
	}
	// save tuning in setlist
	setlist.value.songs[position].tuning = tone;
};
// tune the song at given position down
const tuneDown = (position) => {
	let songs = setlist.value.songs;
	// update tuning
	let tone = songs[position].tuning ? songs[position].tuning : props.songs[songs[position].id].tuning;
	let i = keyScale.indexOf(tone);
	if (i<=0) {
		tone = keyScale[keyScale.length-1];
	} else {
		tone = keyScale[--i];
	}
	// save tuning in setlist
	setlist.value.songs[position].tuning = tone;
};
// create a human readable record key of format YYYYMMDD-the-setlist-title
const createSlug = () => {
	return setlist.value.date.replace(/-/g, '') + '-' + urlify(setlist.value.title);
};
// add or save edits of setlist to db 
const set = () => {
	// first check for form errors
	error.title = setlist.value.title == '';
	let slug = createSlug();
	error.slug = props.existing && props.setlistKey == slug ? false : props.setlists.hasOwnProperty(slug);
	// no errors: start saving song data
	if (!error.title && !error.slug) {
		var processedSetlist = {
			active: false,
			creator: !props.existing ? props.user : setlist.value.creator,
			position: 0,
			title: setlist.value.title,
			private: setlist.value.private == 1,
			date: setlist.value.date,
			songs: setlist.value.songs,
		};
		// new setlist should be created
		if (!props.existing) {
			db.collection('setlists').doc(slug).set(processedSetlist).then(() => {
				emit('closed');
				emit('reset');
				processedSetlist = {};
				router.push({ name: 'setlist-show', params: { id: slug }});
				// toast success creation message
				notify({
					title: t('toast.setlistAdded'),
					text: t('toast.setlistSavedText'),
					type: 'primary'
				});
			}).catch((error) => throwError(error));
		}
		// existing setlist should be updated
		else {
			// check if key remained (no title or date change)
			if (props.setlistKey == slug) {
				// just update the existing setlist
				db.collection('setlists').doc(props.setlistKey).update(processedSetlist).then(() => {
					emit('closed');
					emit('reset');
					processedSetlist = {};
					// toast success update message
					notify({
						title: t('toast.setlistUpdated'),
						text: t('toast.setlistSavedText'),
						type: 'primary'
					});
				}).catch((error) => throwError(error));
			} else {
				// update key by adding a new setlist and removing the old one
				db.collection('setlists').doc(props.setlistKey).delete();
				db.collection('setlists').doc(slug).set(processedSetlist).then(() => {
					emit('closed');
					emit('reset');
					processedSetlist = {};
					router.push({ name: 'setlist-show', params: { id: slug }});
					// toast success update message
					notify({
						title: t('toast.setlistUpdated'),
						text: t('toast.setlistSavedText'),
						type: 'primary'
					});
				}).catch((error) => throwError(error));
			}
		}
	}
};
// close modal
const cancel = () => {
	emit('closed');
}

// toggle local content display if autoSync is on and remote content display was updated
watch (setlistSongs, (newList, oldList) => {
	// song was added
	if (newList.length > oldList.length) {
		let songAdded = newList.filter(x => !oldList.includes(x))[0];
		setlist.value.songs.push({ id: songAdded, tuning: props.songs[songAdded]?.tuning });
	}
	// song was removed
	else {
		let songRemoved = oldList.filter(x => !newList.includes(x))[0], newSongs = [];
		for (var i in setlist.value.songs) {
			if (setlist.value.songs[i].id != songRemoved) {
				newSongs.push({ id: setlist.value.songs[i].id, tuning: setlist.value.songs[i]?.tuning });
			}
		}
		setlist.value.songs = newSongs;
	}
});

// handle mount hooks
onMounted(() => {
	// initial date today for new setlists
	if (!props.existing) {
		updateDate(new Date());
	}
});
</script>
