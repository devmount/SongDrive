<template>
	<div
		class="flex flex-col gap-6 w-full focus:outline-none"
		ref="container"
		tabindex="0"
		@keydown.left.exact="!isFirstPage && !noSongs ? page-- : null"
		@keydown.right.exact="!isLastPage && !noSongs ? page++ : null"
		@keydown.ctrl.f.prevent="!noSongs ? searchInput.focus() : null"
		@keydown.esc.exact="resetFilter"
	>
		<!-- page heading -->
		<div class="flex flex-col sm:flex-row justify-between items-stretch gap-4">
			<!-- title -->
			<div v-if="ready.songs" class="text-3xl uppercase font-thin tracking-wider">
				<span class="font-semibold">{{ Object.keys(filteredSongs).length }}</span>
				{{ t('page.songs', Object.keys(filteredSongs).length) }}
			</div>
			<!-- pagination -->
			<div class="flex items-center flex-nowrap gap-2 mr-16 lg:mr-0">
				<secondary-button @click="!isFirstPage ? page-- : null" :disabled="isFirstPage">
					<ion-icon :icon="arrowBack" class="w-5 h-5" />
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
					<ion-icon :icon="arrowForward" class="w-5 h-5" />
				</secondary-button>
			</div>
		</div>	

		<!-- empty songs collection -->
		<div v-if="noSongs" class="text-blade-500">
			{{ t('text.noSongsAvailable') }}
		</div>

		<!-- song list -->
		<table v-if="ready.songs && !noSongs">
			<thead>
				<!-- column titles -->
				<tr>
					<th
						v-for="col in ['title', 'authors', 'tags', 'language', 'year', 'tuning']"
						:key="col"
						class="cursor-pointer p-2"
						:class="{ 'bg-blade-900': order.field == col }"
						@click="sortList(col)"
					>
						{{ t('field.' + col) }}
						<ion-icon :icon="caretDown" v-if="order.field == col && !order.ascending" class="icon-right" />
						<ion-icon :icon="caretUp" v-if="order.field == col && order.ascending" class="icon-right" />
					</th>
					<th></th>
				</tr>
				<!-- column filters -->
				<tr>
					<td>
						<input
							type="search"
							ref="searchInput"
							v-model="filter.fulltext"
							class="w-full"
							:placeholder="t('placeholder.searchSongTitle')"
						/>
					</td>
					<td>
						<input
							type="search"
							v-model="filter.authors"
							class="w-full"
						/>
					</td>
					<td>
						<select v-model="filter.tag" class="w-full">
							<option :value="null" disabled selected>{{ t('placeholder.tag') }}</option>
							<option v-for="tag in tags" :key="tag.key" :value="tag.key">
								{{ tag[locale] ? tag[locale] : tag.key }}
							</option>
						</select>
					</td>
					<td>
						<select v-model="filter.language" class="w-full">
							<option :value="null" disabled selected>{{ t('placeholder.language') }}</option>
							<option v-for="(l, k) in languages" :key="k" :value="k">{{ l.label }}</option>
						</select>
					</td>
					<td>
						<input
							type="search"
							v-model="filter.year"
							class="w-full"
						/>
					</td>
					<td>
						<select v-model="filter.key" class="w-full">
							<option :value="null" disabled selected>{{ t('placeholder.tuning') }}</option>
							<option v-for="t in keyScale" :key="t" :value="t">{{ t }}</option>
						</select>
					</td>
					<td>
						<secondary-button @click="resetFilter">
							<ion-icon :icon="close" />
						</secondary-button>
					</td>
				</tr>
			</thead>
			<tbody>
				<tr v-for="(song, i) in pagedSongs" :key="i" class="even:bg-blade-900/50 hover:bg-blade-900">
					<td class="cursor-pointer px-3 py-2" @click="$router.push({ name: 'song-show', params: { id: song.id }})">
						{{ song.title }}
						<div class="text-blade-500 max-w-xs truncate">{{ song.subtitle }}</div>
					</td>
					<td class="cursor-pointer px-3 py-2" @click="$router.push({ name: 'song-show', params: { id: song.id }})">
						<div class="max-w-xs truncate">{{ song.authors }}</div>
					</td>
					<td class="cursor-pointer px-3 py-2">
						<div class="flex flex-nowrap gap-1">
							<tag
								v-for="tag in song.tags.splice(0,3)" :key="tag"
								:tag="tags[tag]"
								@click="router.push({ name: 'songs-tag', params: { tag: tag }})"
							/>
							<span v-if="song.tags.length > 3">...</span>
						</div>
					</td>
					<td class="cursor-pointer px-3 py-2" @click="$router.push({ name: 'song-show', params: { id: song.id }})">
						{{ song.language }}
					</td>
					<td class="cursor-pointer px-3 py-2" @click="$router.push({ name: 'song-show', params: { id: song.id }})">
						{{ song.year }}
					</td>
					<td class="text-center cursor-pointer p-2" @click="$router.push({ name: 'song-show', params: { id: song.id }})">
						{{ song.tuning }}
					</td>
					<td>
						<dropdown>
							<template #default class="flex flex-col gap-1">
								<router-link
									:to="{ name: 'song-show', params: { id: song.id }}"
									class="px-3 py-2 w-full flex items-center gap-2 hover:bg-blade-100 dark:hover:bg-blade-750"
								>
									<ion-icon :icon="eyeOutline" class="mr-2" />
									{{ t('button.show') }}
								</router-link>
								<button
									v-if="user && role > 1"
									class="px-3 py-2 w-full flex items-center gap-2 hover:bg-blade-100 dark:hover:bg-blade-750"
									@click.prevent="editDialog(song, true)"
								>
									<ion-icon :icon="createOutline" class="mr-2" />
									{{ t('button.edit') }}
								</button>
								<button
									v-if="user && role > 1"
									class="px-3 py-2 w-full flex items-center gap-2 hover:bg-blade-100 dark:hover:bg-blade-750"
									@click.prevent="editDialog(song, false)"
								>
									<ion-icon :icon="copyOutline" class="mr-2" />
									{{ t('button.duplicate') }}
								</button>
								<button
									v-if="user && role > 2"
									class="px-3 py-2 w-full flex items-center gap-2 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30"
									@click.prevent="deleteDialog(song)"
								>
									<ion-icon :icon="trashOutline" class="mr-2" />
									{{ t('button.delete') }}
								</button>
							</template>
						</dropdown>
					</td>
				</tr>
			</tbody>
		</table>
		<!-- modals -->
		<SongSet
			v-if="modal.set"
			:active="modal.set"
			:existing="active.existing"
			:initialSong="active.song"
			:songKey="active.key"
			:songs="songs"
			:setlists="setlists"
			:tags="tags"
			:languages="languages"
			:ready="ready"
			@closed="modal.set = false"
		/>
		<SongDelete
			v-if="modal.delete"
			:active="modal.delete"
			:title="active.title"
			:id="active.key"
			:songs="songs"
			@closed="modal.delete = false"
		/>
	</div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from 'vue-router'
import { keyScale } from '@/utils.js';
import SongSet from '@/modals/SongSet';
import SongDelete from '@/modals/SongDelete';
import SecondaryButton from '@/elements/SecondaryButton.vue';
import Tag from '@/elements/Tag';
import Dropdown from '@/elements/Dropdown';
import {
	arrowBack,
	arrowForward,
	caretDown,
	caretUp,
	close,
	copyOutline,
	createOutline,
	ellipsisHorizontalOutline,
	eyeOutline,
	filterSharp,
	trashOutline
} from 'ionicons/icons';
const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();

// inherited properties
const props = defineProps({
  songs:     Object,
  setlists:  Object,
  tags:      Object,
  languages: Object,
  user:      String,
  role:      Number,
  ready:     Object,
});

// template references
const container   = ref(null);
const searchInput = ref(null);

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

// pagination
const page       = ref(0);
const listLength = ref(12);
const order = reactive({ 
	field: 'date',
	ascending: true
});
const modal = reactive({
	set: false,
	delete: false,
});
const active = reactive({
	title: '',
	key: '',
	song: {},
	existing: true
});

// mounted
onMounted(() => {
	container.value.focus();
});

// computed
const songsArray = computed(() => {
	let songs = Object.keys(props.songs).map((key) => {
		let song = props.songs[key];
		song['id'] = key;
		return song;
	})
	songs.sort((a, b) => {
		var propA = String(a[order.field]).toLowerCase().trim();
		var propB = String(b[order.field]).toLowerCase().trim();
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
	var songs = songsArray.value;
	if (filter.fulltext) {
		songs = songs.filter(song => {
			// filter fields: title, subtitle
			var key = filter.fulltext;
			return song.title.toLowerCase().indexOf(key) !== -1
				|| song.subtitle.toLowerCase().indexOf(key) !== -1
				|| song.content.toLowerCase().indexOf(key) !== -1
		});
	}
	if (filter.authors) {
		songs = songs.filter(song => {
			// filter field: tags
			return song.authors.toLowerCase().indexOf(filter.tag) !== -1;
		});
	}
	if (filter.tag) {
		songs = songs.filter(song => {
			// filter field: tags
			return song.tags.indexOf(filter.tag) !== -1;
		});
	}
	if (filter.language) {
		songs = songs.filter(song => {
			// filter field: language
			return song.language.indexOf(filter.language) !== -1;
		});
	}
	if (filter.year) {
		songs = songs.filter(song => {
			// filter field: year
			return String(song.year).indexOf(filter.year) !== -1;
		});
	}
	if (filter.key) {
		songs = songs.filter(song => {
			// filter field: key
			return song.tuning.indexOf(filter.key) !== -1;
		});
	}
	return songs
});
const noSongs = computed(() => {
	return props.ready.songs && songsArray.value.length == 0;
});
const pagedSongs = computed(() => {
	return filteredSongs.value.slice(page.value*listLength.value, (page.value+1)*listLength.value);
});
const isFirstPage = computed(() => {
	return page.value == 0;
});
const isLastPage = computed(() => {
	return page.value == pageCount.value-1;
});
const pageCount = computed(() => {
	return Math.ceil(filteredSongs.value.length/listLength.value);
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
const editDialog = (song, existing) => {
	active.title = song.title;
	active.song = song;
	active.key = song.id;
	active.existing = existing;
	modal.set = true;
};
const deleteDialog = (song) => {
	active.title = song.title;
	active.key = song.id;
	modal.delete = true;
};

// watcher
watch (filter, () => { page.value = 0 });
</script>
