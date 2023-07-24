<template>
	<div class="flex flex-col gap-6 w-full">
		<!-- page heading -->
		<div class="flex flex-col sm:flex-row justify-between items-stretch gap-4">
			<!-- title and search trigger -->
			<div
				v-if="ready.songs"
				class="flex gap-4 sm:gap-6 text-3xl uppercase font-thin tracking-wider"
			>
				<div class="whitespace-nowrap">
					<span class="font-semibold">{{ Object.keys(filteredSongs).length }}</span>
					{{ t('page.songs', Object.keys(filteredSongs).length) }}
				</div>
				<secondary-button
					@click="emit('addSong')"
					:title="t('tooltip.songAdd')"
				>
					<icon-plus class="w-5 h-5 stroke-1.5" />
				</secondary-button>
				<div
					class="
						px-1 pt-0.5 flex items-center cursor-pointer
						text-blade-500 hover:text-spring-600 transition-colors
					"
					@click="searchInput.focus()"
					:title="t('placeholder.searchSongTitle')"
				>
					<icon-search class="w-7 h-7 stroke-1.5" />
				</div>
			</div>
			<!-- pagination -->
			<div class="flex items-center flex-nowrap gap-2 mr-16 lg:mr-0">
				<secondary-button @click="!isFirstPage ? page-- : null" :disabled="isFirstPage">
					<icon-chevron-left class="w-5 h-5 stroke-1.5" />
				</secondary-button>
				<div
					v-for="(p, i) in pageCount" :key="i"
					v-show="showPageItem(p)"
				>
					<div v-show="showFirstEllipsis(p)">&hellip;</div>
					<div
						class="transition-colors cursor-pointer rounded-sm px-2 py-1 hover:bg-blade-300 dark:hover:bg-blade-750"
						:class="{ 'bg-spring-400 dark:bg-spring-700': (p-1) == page }"
						v-show="showPageItemLink(p)"
						@click="page = p-1"
					>
						{{ p }}
					</div>
					<div v-show="showLastEllipsis(p)">&hellip;</div>
				</div>
				<secondary-button @click="!isLastPage ? page++ : null" :disabled="isLastPage">
					<icon-chevron-right class="w-5 h-5 stroke-1.5" />
				</secondary-button>
			</div>
		</div>	

		<!-- empty songs collection -->
		<div v-if="noSongs" class="text-blade-500">
			{{ t('text.noSongsAvailable') }}
		</div>

		<!-- song list -->
		<table v-if="ready.songs && !noSongs" class="w-full">
			<thead>
				<!-- column titles -->
				<tr>
					<th
						v-for="col in ['title', 'authors', 'tags', 'language', 'year', 'tuning']"
						:key="col"
						class="cursor-pointer uppercase p-2 font-normal"
						:class="{
							'hidden 3xl:table-cell': col === 'tags',
							'hidden xl:table-cell': col === 'authors',
							'hidden md:table-cell w-24': ['language', 'year'].includes(col),
							'hidden xs:table-cell w-24': col === 'tuning',
						}"
						@click="sortList(col)"
					>
						<div
							class="flex items-center gap-2"
							:class="{ 'justify-center': ['language', 'year', 'tuning'].includes(col) }"
						>
							{{ t('field.' + col) }}
							<icon-sort-ascending
								v-if="order.field == col && !order.ascending"
								class="w-5 h-5 stroke-1.5 stroke-spring-600"
							/>
							<icon-sort-descending
								v-if="order.field == col && order.ascending"
								class="w-5 h-5 stroke-1.5 stroke-spring-600"
							/>
						</div>
					</th>
					<th class="w-11"></th>
				</tr>
				<!-- column filters -->
				<tr>
					<td>
						<label class="relative">
							<icon-filter class="absolute top-0 left-2 w-5 h-5 stroke-1.5 text-blade-500" />
							<input
								type="search"
								ref="searchInput"
								v-model="filter.fulltext"
								@input="e => filter.fulltext = e.target.value"
								class="w-full pl-8"
								:placeholder="t('placeholder.searchSongTitle')"
							/>
						</label>
					</td>
					<td class="hidden xl:table-cell">
						<label class="relative">
							<icon-filter class="absolute top-0 left-2 w-5 h-5 stroke-1.5 text-blade-500" />
							<input
								type="search"
								v-model="filter.authors"
								@input="e => filter.authors = e.target.value"
								class="w-full pl-8"
							/>
						</label>
					</td>
					<td class="hidden 3xl:table-cell">
						<label class="relative">
							<icon-filter class="absolute top-0 left-2 w-5 h-5 stroke-1.5 text-blade-500" />
							<select v-model="filter.tag" class="w-full pl-8">
								<option v-for="tag in tags" :key="tag.key" :value="tag.key">
									{{ tag[locale] ? tag[locale] : tag.key }}
								</option>
							</select>
						</label>
					</td>
					<td class="hidden md:table-cell">
						<label class="relative">
							<icon-filter class="absolute top-0 left-2 w-5 h-5 stroke-1.5 text-blade-500" />
							<select v-model="filter.language" class="w-full pl-8">
								<option v-for="(l, k) in languages" :key="k" :value="k">{{ l.label }}</option>
							</select>
						</label>
					</td>
					<td class="hidden md:table-cell">
						<label class="relative">
							<icon-filter class="absolute top-0 left-2 w-5 h-5 stroke-1.5 text-blade-500" />
							<input
								type="search"
								v-model="filter.year"
								@input="e => filter.year = e.target.value"
								class="w-full pl-8"
							/>
						</label>
					</td>
					<td class="hidden xs:table-cell">
						<label class="relative">
							<icon-filter class="absolute top-0 left-2 w-5 h-5 stroke-1.5 text-blade-500" />
							<select v-model="filter.key" class="w-full pl-8">
								<option v-for="t in keyScale" :key="t" :value="t">{{ t }}</option>
							</select>
						</label>
					</td>
					<td>
						<secondary-button @click="resetFilter" :disabled="!isFiltered">
							<icon-filter-off class="w-5 h-5 stroke-1.5" />
						</secondary-button>
					</td>
				</tr>
			</thead>
			<tbody v-if="ready.songs">
				<tr
					v-for="(song, i) in pagedSongs" :key="i"
					class="even:bg-blade-200/50 even:dark:bg-blade-900/50 hover:bg-blade-200 hover:dark:bg-blade-900"
				>
					<td
						class="cursor-pointer p-3 max-w-0"
						@click="router.push({ name: 'song-show', params: { id: song.id }})"
					>
						<div class="truncate">
							{{ song.title }}
							<span class="text-blade-500 ml-2">{{ song.subtitle }}</span>
						</div>
					</td>
					<td
						class="cursor-pointer p-3 max-w-0 hidden xl:table-cell"
						@click="router.push({ name: 'song-show', params: { id: song.id }})"
					>
						<div class="truncate">{{ song.authors }}</div>
					</td>
					<td class="cursor-pointer p-3 max-w-0 hidden 3xl:table-cell">
						<div v-if="ready.tags" class="flex flex-nowrap gap-1">
							<tag
								v-for="tag in sortedTags(song.tags).slice(0, 3)" :key="tag.key"
								:tag="tag"
								@click="router.push({ name: 'songs-tag', params: { tag: tag.key }})"
							/>
							<span v-if="song.tags.length > 3">&hellip;</span>
						</div>
					</td>
					<td
						class="cursor-pointer p-3 text-center uppercase hidden md:table-cell"
						@click="router.push({ name: 'song-show', params: { id: song.id }})"
					>
						{{ song.language }}
					</td>
					<td
						class="cursor-pointer p-3 text-center hidden md:table-cell"
						@click="router.push({ name: 'song-show', params: { id: song.id }})"
					>
						{{ song.year }}
					</td>
					<td
						class="cursor-pointer p-3 text-center hidden xs:table-cell"
						@click="router.push({ name: 'song-show', params: { id: song.id }})"
					>
						{{ song.tuning }}
					</td>
					<td>
						<dropdown>
							<router-link
								:to="{ name: 'song-show', params: { id: song.id }}"
								class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
							>
								<icon-eye class="w-5 h-5 stroke-1.5" />
								{{ t('button.show') }}
							</router-link>
							<button
								v-if="user && role > 2"
								class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
								@click="emit('editSong', { data: song, id: song.id, exists: true })"
							>
								<icon-edit class="w-5 h-5 stroke-1.5" />
								{{ t('button.edit') }}
							</button>
							<button
								v-if="user && role > 2"
								class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
								@click="emit('editSong', { data: song, id: song.id, exists: false })"
							>
								<icon-copy class="w-5 h-5 stroke-1.5" />
								{{ t('button.duplicate') }}
							</button>
							<button
								v-if="user && role > 2"
								class="px-3 py-2 w-full flex items-center gap-3 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30"
								@click="deleteDialog(song)"
							>
								<icon-trash class="w-5 h-5 stroke-1.5" />
								{{ t('button.delete') }}
							</button>
						</dropdown>
					</td>
				</tr>
			</tbody>
		</table>
		<!-- modals -->
		<song-delete
			:active="showModal.delete"
			:title="songDeleteModalData.title"
			:id="songDeleteModalData.key"
			:songs="songs"
			@closed="showModal.delete = false"
		/>
	</div>
</template>

<script setup>
import { ref, reactive, computed, watch, inject } from 'vue';
import { logicAnd } from '@vueuse/math';
import { keyScale, sortTags } from '@/utils.js';
import { useI18n } from 'vue-i18n';
import { whenever } from '@vueuse/core';
import { useRoute, useRouter } from 'vue-router'
import Dropdown from '@/elements/Dropdown.vue';
import SecondaryButton from '@/elements/SecondaryButton.vue';
import SongDelete from '@/modals/SongDelete.vue';
import Tag from '@/elements/Tag.vue';

// icons
import {
	IconChevronLeft,
	IconChevronRight,
	IconCopy,
	IconEdit,
	IconEye,
	IconFilter,
	IconFilterOff,
	IconPlus,
	IconSearch,
	IconSortAscending,
	IconSortDescending,
	IconTrash,
} from '@tabler/icons-vue';

// component constantes
const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();

// handle hotkeys for this component
const hkSearch = inject('hkSearch');
const hkBack = inject('hkBack');
const hkForward = inject('hkForward');
const hkCancel = inject('hkCancel');
const noActiveInput = inject('noActiveInput');
const noActiveModal = inject('noActiveModal');

// component properties
const props = defineProps({
  languages:     Object,
  ready:         Object,
  role:          Number,
  songs:         Object,
  tags:          Object,
  user:          String,
});

// template references
const searchInput = ref(null);

// injects and emits
const emit = defineEmits(['started', 'addSong', 'editSong', 'editSetlist']);

// table filter
const filter = reactive({
	fulltext: null,
	authors: null,
	tag: route.params.tag ?? null,
	language: null,
	key: null,
	year: null,
});
const resetFilter = () => {
	for (const field in filter) {
		if (Object.hasOwnProperty.call(filter, field)) {
			filter[field] = null;
		}
	}
};
const isFiltered = computed(() => {
	return filter.fulltext || filter.authors || filter.tag || filter.language || filter.key || filter.year;
});

// pagination and sorting
const page       = ref(0);
const listLength = 16;
const order = reactive({ 
	field: 'title',
	ascending: true
});

// computed
const songsArray = computed(() => {
	const songs = [];
	for (const key in props.songs) {
		if (Object.hasOwnProperty.call(props.songs, key)) {
			const element = props.songs[key];
			element['id'] = key;
			songs.push(element);
		}
	}
	songs.sort((a, b) => {
		let propA = String(a[order.field]).toLowerCase().trim();
		let propB = String(b[order.field]).toLowerCase().trim();
		if (order.ascending) {
			if (propA < propB) { return -1 };
			if (propA > propB) { return 1 };
		} else {
			if (propA < propB) { return 1 };
			if (propA > propB) { return -1 };
		}
		return 0;
	})
	return songs;
});
const filteredSongs = computed(() => {
	let songs = songsArray.value;
	if (filter.fulltext) {
		// filter fields: title, subtitle, content
		songs = songs.filter(song => {
			const key = filter.fulltext.toLowerCase();
			return song.title.toLowerCase().indexOf(key) !== -1
				|| song.subtitle.toLowerCase().indexOf(key) !== -1
				|| song.content.toLowerCase().indexOf(key) !== -1
		});
	}
	if (filter.authors) {
		// filter field: authors
		songs = songs.filter(song => {
			const key = filter.authors.toLowerCase();
			return song.authors.toLowerCase().indexOf(key) !== -1;
		});
	}
	if (filter.tag) {
		// filter field: tags
		songs = songs.filter(song => {
			return song.tags.indexOf(filter.tag) !== -1;
		});
	}
	if (filter.language) {
		// filter field: language
		songs = songs.filter(song => {
			return song.language.indexOf(filter.language) !== -1;
		});
	}
	if (filter.year) {
		// filter field: year
		songs = songs.filter(song => {
			return String(song.year).indexOf(filter.year) !== -1;
		});
	}
	if (filter.key) {
		// filter field: key
		songs = songs.filter(song => {
			return song.tuning.indexOf(filter.key) !== -1;
		});
	}
	return songs
});
const noSongs = computed(() => {
	return props.ready.songs && songsArray.value.length == 0;
});
const pagedSongs = computed(() => {
	return filteredSongs.value.slice(page.value*listLength, (page.value+1)*listLength);
});
const isFirstPage = computed(() => {
	return page.value == 0;
});
const isLastPage = computed(() => {
	return page.value == pageCount.value-1;
});
const pageCount = computed(() => {
	return Math.ceil(filteredSongs.value.length/listLength);
});

// methods
const sortList = (field) => {
	if (order.field == field) {
		order.ascending = !order.ascending;
	} else {
		order.ascending = true;
	}
	order.field = field;
};
const showPageItem = (p) => {
	return pageCount.value < 6 || (
		p == 1 || p == 2
		|| (page.value == 0 && p == 3)
		|| ((page.value == 0 || page.value == 1) && p == 4)
		|| (p > page.value-1 && p < page.value+3)
		|| ((page.value == pageCount.value-1||page.value == pageCount.value-2) && p == pageCount.value-3)
		|| (page.value == pageCount.value-1 && p == pageCount.value-2)
		|| p == pageCount.value-1 || p == pageCount.value
	);
};
const showFirstEllipsis = (p) => {
	return pageCount.value >= 6 && page.value > 2 && p == 2;
};
const showPageItemLink = (p) => {
	return pageCount.value < 6 || (
		p == 1
		|| (page.value == 0 && p == 3)
		|| ((page.value == 0 || page.value == 1) && p == 4)
		|| (p > page.value-1 && p < page.value+3)
		|| ((page.value == pageCount.value-1 || page.value == pageCount.value-2) && p == pageCount.value-3)
		|| (page.value == pageCount.value-1 && p == pageCount.value-2)
		|| p == pageCount.value
	);
};
const showLastEllipsis = (p) => {
	return pageCount.value >= 6 && page.value < pageCount.value-3 && p == pageCount.value-1;
};

// handle modals
const showModal = reactive({
	delete: false,
});

// delete song
const songDeleteModalData = reactive({
	title: '',
	key:   '',
});
const deleteDialog = (song) => {
	songDeleteModalData.title = song.title;
	songDeleteModalData.key   = song.id;
	showModal.delete          = true;
};

// sort song tags alphabetically
const sortedTags = (tagKeys) => {
	const tags = tagKeys.map(t => props.tags[t]);
	return sortTags(tags, locale.value);
};

// reset page when filter changes
watch (filter, () => { page.value = 0 });

// component shortcuts
whenever(
	logicAnd(hkSearch, noActiveModal),
	() => !noSongs.value ? searchInput.value.focus() : null
);
whenever(
	logicAnd(hkCancel, noActiveModal),
	() => resetFilter()
);
whenever(
	logicAnd(hkBack, noActiveInput, noActiveModal),
	() => !isFirstPage.value && !noSongs.value ? page.value-- : null
);
whenever(
	logicAnd(hkForward, noActiveInput, noActiveModal),
	() => !isLastPage.value && !noSongs.value ? page.value++ : null
);
</script>
