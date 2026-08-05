<template>
	<modal-dialog
		:active="active"
		:title="!existing ? t('modal.newSetlist') : t('modal.editSetlist') + ' «' + setlist?.title + '»'"
		size="xl7"
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
						:class="{ 'border-rose-600!': (error.title && !setlist.title) || error.slug }"
						:placeholder="t('placeholder.exampleSetlistTitle')"
						required
					/>
					<div v-if="error.title && !setlist.title" class="text-rose-600">
						{{ t('error.requiredTitle') }}
					</div>
					<div v-if="error.slug" class="text-rose-600">
						{{ t('error.setlistAlreadyExists') }}
					</div>
				</label>
				<!-- visibility -->
				<label class="flex grow lg:grow-0 flex-col gap-1">
					<div>{{ t('field.visibility') }} <span class="text-rose-600">*</span></div>
					<select v-model="setlist.isPublic" required>
						<option :value="true">{{ t('option.public') }}</option>
						<option :value="false">{{ t('option.private') }}</option>
					</select>
					<div v-if="!setlist.isPublic" class="text-blade-500">
						{{ t('text.visibleForYou') }}
					</div>
					<div v-if="setlist.isPublic" class="text-blade-500">
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
					<div class="text-blade-500">{{ humanDate(setlist.date, loc) }}</div>
					<div v-if="error.date && !setlist.date" class="text-rose-600">
						{{ t('error.requiredDate') }}
					</div>
					<datepicker
						:model-value="setlist.date != '' ? (new Date(setlist.date)) : (new Date())"
						format="yyyy-MM-dd"
						class="hidden lg:block"
						:class="{ 'border border-rose-600!': error.date && !setlist.date }"
						inline
						auto-apply
						:dark="isDark"
						:enable-time-picker="false"
						:locale="calendarLanguage[loc]"
						:format-locale="calendarLanguage[loc]"
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
			<div class="max-h-[calc(50vh-6rem)] lg:max-h-[calc(80vh-8.25rem)] flex flex-col gap-1">
				<label>{{ t('field.songs') }}</label>
				<!-- filter -->
				<div class="flex gap-1">
					<!-- search in title, subtitle and content fulltext -->
					<label class="relative w-full">
						<icon-filter class="absolute top-2.5 left-2 w-5 h-5 stroke-1.5 text-blade-500" />
						<input
							type="search"
							v-model="filter.fulltext"
							@input="e => filter.fulltext = (e.target as HTMLInputElement).value"
							class="w-full pl-8"
							:placeholder="t('placeholder.searchSongTitle')"
						/>
					</label>
					<!-- filter by tag -->
					<div class="h-full">
						<drop-down :show-badge="filter.tag !== null">
							<template #trigger>
								<secondary-button class="h-full">
									<icon-tags class="w-5 h-5 stroke-1.5" />
								</secondary-button>
							</template>
							<div class="max-h-80 overflow-y-scroll flex flex-col gap-0.5 p-2! text-sm">
								<song-tag
									v-for="tag in sortTags(tags, loc)" :key="tag"
									:tag="tag"
									@click="filter.tag = tag"
									class="cursor-pointer"
									:class="{ 'bg-spring-700!': tag === filter.tag }"
								/>
							</div>
						</drop-down>
					</div>
					<!-- filter by key -->
					<div class="h-full">
						<drop-down :show-badge="filter.key !== null">
							<template #trigger>
								<secondary-button class="h-full">
									<icon-music class="w-5 h-5 stroke-1.5" />
								</secondary-button>
							</template>
							<div class="max-h-80 overflow-y-auto flex flex-col gap-0.5 p-2! text-sm font-mono">
								<secondary-button
									v-for="t in keyScale" :key="t"
									@click="filter.key = t"
									class="px-6!"
									:class="{ 'bg-spring-700!': t === filter.key }"
								>
									{{ t }}
								</secondary-button>
							</div>
						</drop-down>
					</div>
					<!-- filter by language -->
					<div class="h-full">
						<drop-down :show-badge="filter.language !== null">
							<template #trigger>
								<secondary-button class="h-full">
									<icon-world class="w-5 h-5 stroke-1.5" />
								</secondary-button>
							</template>
							<div class="max-h-80 overflow-y-auto flex flex-col gap-0.5 p-2! text-sm">
								<secondary-button
									v-for="l in languages" :key="l"
									@click="filter.language = l"
									:class="{ 'bg-spring-700!': l === filter.language }"
								>
									{{ t('language.' + l) }}
								</secondary-button>
							</div>
						</drop-down>
					</div>
					<!-- reset filter -->
					<button @click="resetFilter" :class="{ 'text-blade-500': !isFiltered }">
						<icon-x class="w-4 h-4" />
					</button>
				</div>
				<!-- song list -->
				<div class="overflow-y-scroll h-full flex flex-col gap-1 mt-3">
					<label
						v-for="fsong in filteredSongs" :key="fsong.id"
						class="flex items-center gap-2 cursor-pointer p-0.5 hover:bg-blade-200 dark:hover:bg-blade-800"
					>
						<input
							:checked="idExists(fsong.id)"
							@input="e => songSelection(fsong.id, (e.target as HTMLInputElement).checked)"
							type="checkbox"
							class="w-6 h-6 ml-2"
						/>
						<div class="flex">
							<figure
								class="flex justify-center items-center bg-blade-300 dark:bg-blade-700 text-white font-semibold py-1 w-8"
								:title="t('title.songTuning')"
							>
								<div class="-mt-0.5">{{ fsong.entity.key }}</div>
							</figure>
						</div>
						<div
							class="flex flex-col overflow-hidden"
							:title="performedSongs[fsong.id] ? `${t('title.lastPerformed')} ${performedSongs[fsong.id]}`: ''"
						>
							<div class="-mt-1 truncate">{{ fsong.entity.title }}</div>
							<div class="text-sm text-blade-500 -mt-1 truncate">
								{{ fsong.entity.subtitle }}
								<span v-if="performedSongs[fsong.id]" class="text-blade-700">
									{{ performedSongs[fsong.id] }}
								</span>
							</div>
						</div>
					</label>
				</div>
			</div>
			<!-- song preview -->
			<div class="max-h-[calc(50vh-6rem)] lg:max-h-[calc(80vh-8.25rem)] flex flex-col gap-1">
				<div v-if="setlist.songs?.length === 0" class="flex flex-col items-center gap-8 mt-4">
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
						:item-key="(el: SetlistEntry) => isSlide(el) ? `slide-${setlist.songs.indexOf(el)}` : el.id"
						handle=".handle"
						ghost-class="bg-blade-950!"
						class="overflow-y-scroll h-full flex flex-col gap-1 mt-3"
					>
						<template #item="{ element, index }">
							<div
								class="flex items-center gap-2 p-1 hover:bg-blade-200 dark:hover:bg-blade-800"
							>
								<button class="p-1 cursor-grab active:cursor-grabbing text-blade-500">
									<icon-menu-order class="handle w-5 h-5" />
								</button>
								<template v-if="isSlide(element)">
									<div class="flex-1 truncate">{{ element.title }}</div>
								</template>
								<template v-else>
									<div class="flex items-center">
										<secondary-button @click.prevent="tuneDown(index)" class="w-6 h-6 p-1!">
											<icon-chevron-left class="w-4 h-4 stroke-2 shrink-0" />
										</secondary-button>
										<figure
											class="flex justify-center items-center bg-spring-700 text-white font-semibold py-1 w-8"
											:title="t('title.songTuning')"
										>
											<div class="-mt-0.5">{{ element.key ?? findSong(element.id)?.key }}</div>
										</figure>
										<secondary-button @click.prevent="tuneUp(index)" class="w-6 h-6 p-1!">
											<icon-chevron-right class="w-4 h-4 stroke-2 shrink-0" />
										</secondary-button>
									</div>
									<div class="flex flex-col overflow-hidden">
										<div class="-mt-1 truncate">
											{{ findSong(element.id)?.title }}
										</div>
										<div class="text-sm text-blade-500 -mt-1 truncate">
											{{ findSong(element.id)?.subtitle }}
										</div>
									</div>
								</template>
								<button
									class="ml-auto p-1 text-blade-500"
									@click="removeEntry(index)"
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
	</modal-dialog>
</template>

<script setup lang="ts">
import { injectStrict, setlistCollectionKey, setlistsKey, songsKey, userKey } from '@/keys';
import '@vuepic/vue-datepicker/dist/main.css';
import { enGB, de } from 'date-fns/locale';
import type { Locale } from 'date-fns';
import { keyScale, humanDate, throwError, urlify, browserPrefersDark, sortTags, isSlide } from '@/utils.js';
import type { ThrowableError, SetlistFormData } from '@/definitions';
import { notify } from '@kyvg/vue3-notification';
import { ref, reactive, computed, watch, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { SongLanguage, SongTag as SongTagEnum } from '@backend/definitions';
import type { SetlistEntity, SetlistEntry, SetlistSong } from '@backend/models';
import { VueDatePicker as Datepicker } from '@vuepic/vue-datepicker';
import draggable from 'vuedraggable';
import DropDown from '@/elements/DropDown.vue';
import ModalDialog from '@/elements/ModalDialog.vue';
import PrimaryButton from '@/elements/PrimaryButton.vue';
import SecondaryButton from '@/elements/SecondaryButton.vue';
import SongTag from '@/elements/SongTag.vue';

// icons
import {
	IconArrowLeft,
	IconArrowRight,
	IconCalendar,
	IconChevronLeft,
	IconChevronRight,
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
const loc = locale.value.substring(0, 2);

const calendarLanguage: Record<string, Locale> = {
	en: enGB,
	de: de
};
const router = useRouter();

// global properties
const songs = injectStrict(songsKey);
const setlists = injectStrict(setlistsKey);
const user = injectStrict(userKey);
const setlistCollection = injectStrict(setlistCollectionKey);
const languages = Object.values(SongLanguage);
const tags = Object.values(SongTagEnum);

// find a song's entity by id
const findSong = (id: string) => songs.value.find(s => s.id === id)?.entity;

// component properties
const props = defineProps({
	active:         Boolean, // state of modal display, true to show modal
	existing:       Boolean, // setlist already exists
	initialSetlist: { type: Object as PropType<SetlistFormData>, required: true },  // setlist structure to fill with data
	id:             String,  // setlist identifier
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
	for (const key of Object.keys(error) as (keyof typeof error)[]) {
		error[key] = false;
	}
};

// build local editable setlist state from the initial (blank or existing) setlist
const buildFormState = (initial: SetlistFormData): SetlistFormData => ({
	...initial,
	// only show undeleted songs, keep slides as-is
	songs: initial.songs.filter(s => isSlide(s) || findSong(s.id)),
});

// setlist input data
const setlist = ref<SetlistFormData>(buildFormState(props.initialSetlist));
const initInput = () => {
	resetErrors();
	resetFilter();
	setlist.value = buildFormState(props.initialSetlist);
};
watch(() => props.active === true, () => initInput());

// add song to current song selection
const addSong = (id: string) => {
	setlist.value.songs.push({ id: id, key: findSong(id)?.key ?? '' });
};

// remove song from current song selection
const removeSong = (id: string) => {
	setlist.value.songs = setlist.value.songs.filter((s) => isSlide(s) || s.id !== id);
};

// remove the setlist entry (song or slide) at the given position
const removeEntry = (index: number) => {
	setlist.value.songs.splice(index, 1);
};

// check if given song exists on current song selection
const idExists = (id: string) => setlist.value?.songs.some((s) => !isSlide(s) && s.id === id);

// add or remove song of given id
const songSelection = (id: string, addition: boolean) => {
	if (addition) {
		addSong(id);
	} else {
		removeSong(id);
	}
};

// filter input
const filter = reactive<{ fulltext: string | null; tag: string | null; key: string | null; language: string | null }>({
	fulltext: null,
	tag:      null,
	key:      null,
	language: null,
});
const resetFilter = () => {
	for (const field of Object.keys(filter) as (keyof typeof filter)[]) {
		filter[field] = null;
	}
};
const isFiltered = computed(() => {
	return filter.fulltext || filter.tag || filter.language || filter.key;
});

// emits
const emit = defineEmits(['closed']);

// filter song list by search query and other filter fields
const filteredSongs = computed(() => {
	let result = songs.value;
	if (filter.fulltext) {
		// filter fields: title, subtitle, content
		const key = filter.fulltext.toLowerCase();
		result = result.filter(s =>
			s.entity.title.toLowerCase().indexOf(key) !== -1
				|| (s.entity.subtitle ?? '').toLowerCase().indexOf(key) !== -1
				|| s.entity.content.toLowerCase().indexOf(key) !== -1
		);
	}
	if (filter.tag) {
		// filter field: tags
		result = result.filter(s => s.entity.tags.indexOf(filter.tag!) !== -1);
	}
	if (filter.language) {
		// filter field: language
		result = result.filter(s => s.entity.language.indexOf(filter.language!) !== -1);
	}
	if (filter.key) {
		// filter field: key
		result = result.filter(s => s.entity.key?.indexOf(filter.key!) !== -1);
	}
	return result;
});

// list of songs and the date of their last performance by song id
const performedSongs = computed(() => {
	let songs: Record<string, string> = {};
	let sortedSetlists = setlists.value.toSorted((a, b) => b.entity.date.localeCompare(a.entity.date));
	sortedSetlists.forEach(setlist => {
		setlist.entity.songs.forEach(song => {
			if (isSlide(song)) return;
			if (!(song.id in songs)) {
				songs[song.id] = humanDate(setlist.entity.date, loc, false);
			}
		});
	});
	return songs;
});

// update setlist date from datepicker
const updateDate = (newDate: Date) => {
	setlist.value.date = newDate.toISOString().slice(0,10);
};

// tune the song at given position up (only ever called for song entries, never slides)
const tuneUp = (position: number) => {
	let songs = setlist.value.songs as SetlistSong[];
	// update tuning
	let tone = songs[position].key ? songs[position].key : findSong(songs[position].id)?.key;
	let i = keyScale.indexOf(tone ?? '');
	if (i>=keyScale.length-1) {
		tone = keyScale[0];
	} else {
		tone = keyScale[++i];
	}
	// save tuning in setlist
	songs[position].key = tone;
};

// tune the song at given position down (only ever called for song entries, never slides)
const tuneDown = (position: number) => {
	let songs = setlist.value.songs as SetlistSong[];
	// update tuning
	let tone = songs[position].key ? songs[position].key : findSong(songs[position].id)?.key;
	let i = keyScale.indexOf(tone ?? '');
	if (i<=0) {
		tone = keyScale[keyScale.length-1];
	} else {
		tone = keyScale[--i];
	}
	// save tuning in setlist
	songs[position].key = tone;
};

// create a human readable record key of format YYYYMMDD-the-setlist-title
const createSlug = () => {
	return setlist.value.date.replace(/-/g, '') + '-' + urlify(setlist.value.title);
};

// build the entity payload to send to Amberbase
const buildEntity = (slug: string): SetlistEntity => ({
	active:      (props.existing ? props.initialSetlist.active : false) ?? false,
	createdBy:   (props.existing ? props.initialSetlist.createdBy : user.value.id) ?? '',
	date:        setlist.value.date,
	isPublic:    setlist.value.isPublic,
	position:    (props.existing ? props.initialSetlist.position : 0) ?? 0,
	remoteHide:  props.existing ? props.initialSetlist.remoteHide : undefined,
	remoteLight: props.existing ? props.initialSetlist.remoteLight : undefined,
	remoteText:  props.existing ? props.initialSetlist.remoteText : undefined,
	sharedWith:  (props.existing ? props.initialSetlist.sharedWith : []) ?? [],
	slug,
	songs:       setlist.value.songs,
	title:       setlist.value.title,
});

// add or save edits of setlist to db
const busy = ref(false);
const setSetlist = async () => {
	const slug = createSlug();
	// first check for form errors
	error.title = setlist.value.title == '';
	error.date = setlist.value.date == '';
	error.slug = (props.existing && props.id === slug) ? false : setlists.value.some(s => s.entity.slug === slug);
	// errors occured: abort
	if (errors.value) return;

	if (!setlistCollection.value) return;
	busy.value = true;
	const entity = buildEntity(slug);
	const collection = setlistCollection.value;

	try {
		// new setlist should be created
		if (!props.existing) {
			await collection.createDoc(entity, slug);
			router.push({ name: 'setlist-show', params: { id: slug }});
			// toast success creation message
			notify({
				title: t('toast.setlistAdded'),
				text:  t('toast.setlistSavedText'),
				type:  'primary'
			});
		}
		// existing setlist should be updated
		else if (props.id === slug) {
			// just update the existing setlist
			const current = setlists.value.find(s => s.entity.slug === props.id);
			if (!current) return;
			await collection.updateDoc(current.id, current.changeNumber ?? 0, entity);
			// toast success update message
			notify({
				title: t('toast.setlistUpdated'),
				text:  t('toast.setlistSavedText'),
				type:  'primary'
			});
		} else {
			// update key by adding a new setlist and removing the old one
			const current = setlists.value.find(s => s.entity.slug === props.id);
			if (!current) return;
			await collection.createDoc(entity, slug);
			await collection.deleteDoc(current.id);
			router.push({ name: 'setlist-show', params: { id: slug }});
			// toast success update message
			notify({
				title: t('toast.setlistUpdated'),
				text:  t('toast.setlistSavedText'),
				type:  'primary'
			});
		}
		emit('closed');
	} catch (err) {
		throwError(err as ThrowableError);
	} finally {
		busy.value = false;
	}
};
</script>
