<template>
	<modal
		:active="active"
		:title="!existing ? t('modal.newSetlist') : t('modal.editSetlist') + ' «' + setlist.title + '»'"
		size="xl6"
		@closed="emit('closed')"
	>
		<div class="flex flex-col lg:grid lg:grid-cols-3 gap-4 overflow-y-auto h-full">
			<div class="flex lg:flex-col flex-wrap gap-2">
				<!-- title -->
				<label class="flex grow lg:grow-0 flex-col gap-1">
					<div>{{ t('field.title') }} <span class="text-rose-600">*</span></div>
					<input
						type="text"
						v-model="setlist.title"
						:class="{ '!border-rose-600': (error.title & !setlist.title) || error.slug }"
						:placeholder="t('placeholder.exampleSetlistTitle')"
						:disabled="existing"
						required
					/>
					<div v-if="error.title & !setlist.title" class="text-rose-600">
						{{ t('error.requiredTitle') }}
					</div>
					<div v-if="error.slug" class="text-rose-600">
						{{ t('error.setlistAlreadyExists') }}
					</div>
				</label>
				<!-- visibility -->
				<label class="flex grow lg:grow-0 flex-col gap-1">
					<div>{{ t('field.visibility') }} <span class="text-rose-600">*</span></div>
					<select v-model="setlist.private" required>
						<option value="0">{{ t('option.public') }}</option>
						<option value="1">{{ t('option.private') }}</option>
					</select>
					<div v-if="setlist.private=='1'" class="text-blade-500">
						{{ t('text.visibleForYou') }}
					</div>
					<div v-if="setlist.private=='0'" class="text-blade-500">
						{{ t('text.visibleForAll') }}
					</div>
				</label>
				<!-- date -->
				<label class="flex grow lg:grow-0 flex-col gap-1">
					<div>{{ t('field.dateOfEvent') }} <span class="text-rose-600">*</span></div>
					<input
						type="date"
						v-model="setlist.date"
						class="lg:hidden"
						pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
					/>
					<div class="text-blade-500">{{ humanDate(setlist.date, locale) }}</div>
					<div v-if="error.date & !setlist.date" class="text-rose-600">
						{{ t('error.requiredDate') }}
					</div>
					<datepicker
						:model-value="setlist.date != '' ? (new Date(setlist.date)) : (new Date())"
						format="yyyy-MM-dd"
						class="hidden lg:block"
						:class="{ 'border !border-rose-600': error.date & !setlist.date }"
						inline
						auto-apply
						:dark="isDark"
						:enable-time-picker="false"
						:locale="locale"
						:format-locale="calendarLanguage[locale]"
						@update:model-value="updateDate"
					>
						<template #arrow-left>
							<icon-arrow-left class="w-4 h-4 stroke-2" />
						</template>
						<template #arrow-right>
							<icon-arrow-right class="w-4 h-4 stroke-2" />
						</template>
						<template #icon-calendar>
							<icon-calendar class="w-4 h-4 stroke-2" />
						</template>
					</datepicker>
				</label>
			</div>
			<!-- song selection -->
			<div class="max-h-[calc(50vh_-_6rem)] lg:max-h-[calc(80vh_-_8.25rem)] flex flex-col gap-1">
				<label>{{ t('field.songs') }}</label>
				<!-- filter -->
				<div class="flex gap-1">
					<!-- search in title, subtitle and content fulltext -->
					<label class="relative w-full">
						<icon-filter class="absolute top-2.5 left-2 w-5 h-5 stroke-1.5 text-blade-500" />
						<input
							type="search"
							v-model="filter.fulltext"
							@input="e => filter.fulltext = e.target.value"
							class="w-full pl-8"
							:placeholder="t('placeholder.searchSongTitle')"
						/>
					</label>
					<!-- filter by tag -->
					<div class="h-full">
						<dropdown :show-badge="filter.tag !== null">
							<template #trigger>
								<secondary-button class="h-full">
									<icon-tags class="w-5 h-5 stroke-1.5" />
								</secondary-button>
							</template>
							<div class="max-h-80 overflow-y-auto flex flex-col gap-0.5 !p-2 text-sm">
								<tag
									v-for="tag in tags" :key="tag.key"
									:tag="tag"
									@click="filter.tag = tag.key"
									class="cursor-pointer"
									:class="{ '!bg-spring-700': tag.key === filter.tag }"
								/>
							</div>
						</dropdown>
					</div>
					<!-- filter by key -->
					<div class="h-full">
						<dropdown :show-badge="filter.key !== null">
							<template #trigger>
								<secondary-button class="h-full">
									<icon-music class="w-5 h-5 stroke-1.5" />
								</secondary-button>
							</template>
							<div class="max-h-80 overflow-y-auto flex flex-col gap-0.5 !p-2 text-sm font-mono">
								<secondary-button
									v-for="t in keyScale" :key="t"
									@click="filter.key = t"
									:class="{ '!bg-spring-700': t === filter.key }"
								>
									{{ t }}
								</secondary-button>
							</div>
						</dropdown>
					</div>
					<!-- filter by language -->
					<div class="h-full">
						<dropdown :show-badge="filter.language !== null">
							<template #trigger>
								<secondary-button class="h-full">
									<icon-world class="w-5 h-5 stroke-1.5" />
								</secondary-button>
							</template>
							<div class="max-h-80 overflow-y-auto flex flex-col gap-0.5 !p-2 text-sm">
								<secondary-button 
									v-for="(l, k) in languages" :key="k"
									@click="filter.language = k"
									:class="{ '!bg-spring-700': k === filter.language }"
								>
									{{ l.label }}
								</secondary-button>
							</div>
						</dropdown>
					</div>
					<!-- reset filter -->
					<button @click="resetFilter" :class="{ 'text-blade-500': !isFiltered }">
						<icon-x class="w-4 h-4" />
					</button>
				</div>
				<!-- song list -->
				<div class="overflow-y-scroll h-full flex flex-col gap-1 mt-3">
					<label
						v-for="(fsong, key) in filteredSongs" :key="key"
						class="flex items-center gap-2 cursor-pointer p-0.5 hover:bg-blade-200 dark:hover:bg-blade-800"
					>
						<input
							v-model="setlistSongs"
							:value="key"
							type="checkbox"
							class="w-6 h-6 ml-2"
						/>
						<div class="flex">
							<figure
								class="flex justify-center items-center bg-blade-300 dark:bg-blade-700 text-white font-semibold py-1 w-8"
								:title="t('title.songTuning')"
							>
								<div class="-mt-0.5">{{ fsong.tuning }}</div>
							</figure>
						</div>
						<div class="flex flex-col overflow-hidden">
							<div class="-mt-1 truncate">{{ fsong.title }}</div>
							<div class="text-sm text-blade-500 -mt-1 truncate">
								{{ fsong.subtitle }}
								<span v-if="performedSongs[key]" class="text-blade-700" :title="t('title.lastPerformed')">
									{{ performedSongs[key] }}
								</span>
							</div>
						</div>
					</label>
				</div>
			</div>
			<!-- song preview -->
			<div class="max-h-[calc(50vh_-_6rem)] lg:max-h-[calc(80vh_-_8.25rem)] flex flex-col gap-1">
				<div v-if="setlist.songs && setlist.songs.length == 0" class="flex flex-col items-center gap-8 mt-4">
					<icon-playlist class="w-12 h-12 stroke-1 text-blade-500" />
					<div class="text-center">
						<div class="text-lg">{{ t('text.noSongsSelected') }}</div>
						<div class="text-blade-500">{{ t('text.selectSomeSongs') }}</div>
					</div>
				</div>
				<div v-else>
					<div class="text-center">{{ setlist.songs?.length }} {{ t('text.selected') }}</div>
					<draggable
						v-model="setlist.songs"
						item-key="id"
						handle=".handle"
						ghost-class="!bg-blade-950"
						class="overflow-y-scroll h-full flex flex-col gap-1 mt-3"
					>
						<template #item="{ element }">
							<div
								class="flex items-center gap-2 p-1 hover:bg-blade-200 dark:hover:bg-blade-800"
							>
								<button class="p-1 cursor-grab active:cursor-grabbing text-blade-500">
									<icon-menu-order class="handle w-5 h-5" />
								</button>
								<div class="flex items-center">
									<secondary-button @click.prevent="tuneDown(i)" class="w-6 h-6 !p-1">
										<icon-arrow-left class="w-4 h-4 stroke-2 shrink-0" />
									</secondary-button>
									<figure
										class="flex justify-center items-center bg-spring-700 text-white font-semibold py-1 w-8"
										:title="t('title.songTuning')"
									>
										<div class="-mt-0.5">{{ element.tuning ? element.tuning : songs[element.id].tuning }}</div>
									</figure>
									<secondary-button @click.prevent="tuneUp(i)" class="w-6 h-6 !p-1">
										<icon-arrow-right class="w-4 h-4 stroke-2 shrink-0" />
									</secondary-button>
								</div>
								<div class="flex flex-col overflow-hidden">
									<div class="-mt-1 truncate">
										{{ songs[element.id].title }}
									</div>
									<div class="text-sm text-blade-500 -mt-1 truncate">
										{{ songs[element.id].subtitle }}
									</div>
								</div>
								<button
									class="ml-auto p-1 text-blade-500"
									@click="setlistSongs = setlistSongs.filter(k => k !== element.id)"
								>
									<icon-x class="w-4 h-4" />
								</button>
							</div>
						</template>
					</draggable>
				</div>
			</div>
		</div>
		<div class="flex flex-col justify-end items-center gap-4 2xs:flex-row">
			<button class="px-3 py-2 text-blade-500" aria-label="Cancel" @click.prevent="emit('closed')">
				{{ t('button.cancel') }}
			</button>
			<primary-button @click="setSetlist">
				<span v-if="!existing">{{ t('button.createSetlist') }}</span>
				<span v-else>{{ t('button.updateSetlist') }}</span>
				<icon-loader2 v-if="busy" class="w-6 h-6 stroke-1.5 animate-spin" />
				<template v-else>
					<icon-plus v-if="!existing" class="w-6 h-6 stroke-1.5" />
					<icon-device-floppy v-else class="w-6 h-6 stroke-1.5" />
				</template>
			</primary-button>
		</div>
	</modal>
</template>

<script setup>
import '@vuepic/vue-datepicker/dist/main.css';
import { enGB, de } from 'date-fns/locale';
import { keyScale, humanDate, throwError, urlify, browserPrefersDark } from '@/utils.js';
import { notify } from '@kyvg/vue3-notification';
import { ref, reactive, computed, inject, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import Datepicker from '@vuepic/vue-datepicker';
import draggable from 'vuedraggable';
import Dropdown from '@/elements/Dropdown.vue';
import Modal from '@/elements/Modal.vue';
import PrimaryButton from '@/elements/PrimaryButton.vue';
import SecondaryButton from '@/elements/SecondaryButton.vue';
import Tag from '@/elements/Tag.vue';

// icons
import {
	IconArrowLeft,
	IconArrowRight,
	IconCalendar,
	IconDeviceFloppy,
	IconFilter,
	IconLoader2,
	IconMenuOrder,
	IconMusic,
	IconPlaylist,
	IconPlus,
	IconTags,
	IconWorld,
	IconX,
} from '@tabler/icons-vue';

// component constants
const { t, locale } = useI18n();
const calendarLanguage = {
	en: enGB,
	de: de
};
const router = useRouter();

// global properties
const db = inject('db');

// component properties
const props = defineProps({
	active:         Boolean, // state of modal display, true to show modal
	existing:       Boolean, // setlist already exists
	initialSetlist: Object,  // setlist structure to fill with data
	id:             String,  // setlist identifier
	user:           String,  // user identifier
	songs:          Object,  // list of all available songs
	setlists:       Object,  // list of all available setlists
	tags:           Object,  // list of all available tags
	languages:      Object,  // list of all available languages
	ready:          Object,  // object holding information about the retrieval state of collections
});

// check if browser prefers dark
const isDark = ref(false);
watch(
	() => props.active,
	() => { isDark.value = browserPrefersDark(); }
);

// check if errors occured
const error = reactive({
	title: false,
	slug:  false,
	date:  false,
});
const errors = computed(() => {
	return (error.title || error.slug || error.date);
});
const resetErrors = () => {
	for (const key in error) {
		if (Object.hasOwnProperty.call(error, key)) {
			error[key] = false;
		}
	}
};

// setlist input data
const setlist = ref({});
const setlistSongs = ref(null);
const initInput = () => {
	resetErrors();
	resetFilter();
	const sl = props.initialSetlist;
	// only show undeleted songs
	sl.songs = sl.songs.filter(s => s.id in props.songs);
	// init visibility state if not existing
	sl.private = sl.private ? 1 : 0;
	// apply initial values
	setlist.value = sl;
	setlistSongs.value = sl.songs.map(s => s.id);
};
watch(() => props.active, () => initInput());

// filter input
const filter = reactive({
	fulltext: null,
	tag:      null,
	key:      null,
	language: null,
});
const resetFilter = () => {
	for (const field in filter) {
		if (Object.hasOwnProperty.call(filter, field)) {
			filter[field] = null;
		}
	}
};
const isFiltered = computed(() => {
	return filter.fulltext || filter.tag || filter.language || filter.key;
});

// emits
const emit = defineEmits(['closed']);

// filter song list by search query and other filter fields
const filteredSongs = computed(() => {
	let songs = {...props.songs};
	if (filter.fulltext) {
		// filter fields: title, subtitle, content
		const key = filter.fulltext.toLowerCase();
		songs = Object.filter(
			songs,
			song => song.title.toLowerCase().indexOf(key) !== -1
				|| song.subtitle.toLowerCase().indexOf(key) !== -1
				|| song.content.toLowerCase().indexOf(key) !== -1
		);
	}
	if (filter.tag) {
		// filter field: tags
		songs = Object.filter(
			songs,
			song => song.tags.indexOf(filter.tag) !== -1
		);
	}
	if (filter.language) {
		// filter field: language
		songs = Object.filter(
			songs,
			song => song.language.indexOf(filter.language) !== -1
		);
	}
	if (filter.key) {
		// filter field: key
		songs = Object.filter(
			songs,
			song => song.tuning.indexOf(filter.key) !== -1
		);
	}
	return songs
});

// list of songs and the date of their last performance by song id
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
const busy = ref(false);
const setSetlist = () => {
	const slug = createSlug();
	// first check for form errors
	error.title = setlist.value.title == '';
	error.date = setlist.value.date == '';
	error.slug = props.existing && props.id == slug ? false : props.setlists.hasOwnProperty(slug);
	// no errors: start saving song data
	if (!errors.value) {
		busy.value = true;
		var processedSetlist = {
			active:   false,
			creator:  !props.existing ? props.user : setlist.value.creator,
			position: 0,
			title:    setlist.value.title,
			private:  setlist.value.private == 1,
			date:     setlist.value.date,
			songs:    setlist.value.songs,
		};
		// new setlist should be created
		if (!props.existing) {
			db.collection('setlists').doc(slug).set(processedSetlist).then(() => {
				emit('closed');
				processedSetlist = {};
				router.push({ name: 'setlist-show', params: { id: slug }});
				// toast success creation message
				notify({
					title: t('toast.setlistAdded'),
					text:  t('toast.setlistSavedText'),
					type:  'primary'
				});
				busy.value = false;
			}).catch((error) => throwError(error));
		}
		// existing setlist should be updated
		else {
			// check if key remained (no title or date change)
			if (props.id == slug) {
				// just update the existing setlist
				db.collection('setlists').doc(props.id).update(processedSetlist).then(() => {
					emit('closed');
					processedSetlist = {};
					// toast success update message
					notify({
						title: t('toast.setlistUpdated'),
						text:  t('toast.setlistSavedText'),
						type:  'primary'
					});
					busy.value = false;
				}).catch((error) => throwError(error));
			} else {
				// update key by adding a new setlist and removing the old one
				db.collection('setlists').doc(props.id).delete();
				db.collection('setlists').doc(slug).set(processedSetlist).then(() => {
					emit('closed');
					processedSetlist = {};
					router.push({ name: 'setlist-show', params: { id: slug }});
					// toast success update message
					notify({
						title: t('toast.setlistUpdated'),
						text:  t('toast.setlistSavedText'),
						type:  'primary'
					});
					busy.value = false;
				}).catch((error) => throwError(error));
			}
		}
	}
};

// sync selected songs with setlist assigned songs
watch (setlistSongs, (newList, oldList) => {
	if (oldList !== null) {
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
	}
});
</script>
