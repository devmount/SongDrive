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
					<chevron-left-icon class="w-5 h-5 stroke-1.5" />
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
					<chevron-right-icon class="w-5 h-5 stroke-1.5" />
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
						class="cursor-pointer uppercase p-2 font-semibold"
						@click="sortList(col)"
					>
						<div class="flex items-center gap-2">
							{{ t('field.' + col) }}
							<sort-ascending-icon v-if="order.field == col && !order.ascending" class="w-5 h-5 stroke-1.5" />
							<sort-descending-icon v-if="order.field == col && order.ascending" class="w-5 h-5 stroke-1.5" />
						</div>
					</th>
					<th></th>
				</tr>
				<!-- column filters -->
				<tr>
					<td class="relative">
						<filter-icon class="absolute top-2.5 left-2 w-5 h-5 stroke-1.5 text-blade-500" />
						<input
							type="search"
							ref="searchInput"
							v-model="filter.fulltext"
							class="w-full pl-8"
							:placeholder="t('placeholder.searchSongTitle')"
						/>
					</td>
					<td class="relative">
						<filter-icon class="absolute top-2.5 left-2 w-5 h-5 stroke-1.5 text-blade-500" />
						<input
							type="search"
							v-model="filter.authors"
							class="w-full pl-8"
						/>
					</td>
					<td class="relative">
						<filter-icon class="absolute top-2.5 left-2 w-5 h-5 stroke-1.5 text-blade-500" />
						<select v-model="filter.tag" class="w-full pl-8">
							<option v-for="tag in tags" :key="tag.key" :value="tag.key">
								{{ tag[locale] ? tag[locale] : tag.key }}
							</option>
						</select>
					</td>
					<td class="relative">
						<filter-icon class="absolute top-2.5 left-2 w-5 h-5 stroke-1.5 text-blade-500" />
						<select v-model="filter.language" class="w-full pl-8">
							<option v-for="(l, k) in languages" :key="k" :value="k">{{ l.label }}</option>
						</select>
					</td>
					<td class="relative">
						<filter-icon class="absolute top-2.5 left-2 w-5 h-5 stroke-1.5 text-blade-500" />
						<input
							type="search"
							v-model="filter.year"
							class="w-full pl-8"
						/>
					</td>
					<td class="relative">
						<filter-icon class="absolute top-2.5 left-2 w-5 h-5 stroke-1.5 text-blade-500" />
						<select v-model="filter.key" class="w-full pl-8">
							<option v-for="t in keyScale" :key="t" :value="t">{{ t }}</option>
						</select>
					</td>
					<td>
						<secondary-button @click="resetFilter" :disabled="!isFiltered">
							<filter-off-icon class="w-5 h-5 stroke-1.5" />
						</secondary-button>
					</td>
				</tr>
			</thead>
			<tbody v-if="ready.songs">
				<tr v-for="(song, i) in pagedSongs" :key="i" class="even:bg-blade-900/50 hover:bg-blade-900">
					<td class="cursor-pointer px-3 py-2 w-auto max-w-xs" @click="$router.push({ name: 'song-show', params: { id: song.id }})">
						<div class="truncate">{{ song.title }} <span class="text-blade-500 ml-2">{{ song.subtitle }}</span></div>
					</td>
					<td class="cursor-pointer px-3 py-2 w-auto max-w-xs" @click="$router.push({ name: 'song-show', params: { id: song.id }})">
						<div class="truncate">{{ song.authors }}</div>
					</td>
					<td class="cursor-pointer px-3 py-2">
						<div v-if="ready.tags" class="flex flex-nowrap gap-1">
							<tag
								v-for="tag in song.tags.splice(0,3)" :key="tag"
								:tag="tags[tag]"
								@click="router.push({ name: 'songs-tag', params: { tag: tag }})"
							/>
							<span v-if="song.tags.length > 3">...</span>
						</div>
					</td>
					<td class="cursor-pointer px-3 py-2 uppercase" @click="$router.push({ name: 'song-show', params: { id: song.id }})">
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
									class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
								>
									<eye-icon class="w-5 h-5 stroke-1.5" />
									{{ t('button.show') }}
								</router-link>
								<button
									v-if="user && role > 1"
									class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
									@click.prevent="editDialog(song, true)"
								>
									<edit-icon class="w-5 h-5 stroke-1.5" />
									{{ t('button.edit') }}
								</button>
								<button
									v-if="user && role > 1"
									class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
									@click.prevent="editDialog(song, false)"
								>
									<copy-icon class="w-5 h-5 stroke-1.5" />
									{{ t('button.duplicate') }}
								</button>
								<button
									v-if="user && role > 2"
									class="px-3 py-2 w-full flex items-center gap-3 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30"
									@click.prevent="deleteDialog(song)"
								>
									<trash-icon class="w-5 h-5 stroke-1.5" />
									{{ t('button.delete') }}
								</button>
							</template>
						</dropdown>
					</td>
				</tr>
			</tbody>
		</table>
		<!-- modals -->
		<song-set
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
		<song-delete
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
	ChevronLeftIcon,
	ChevronRightIcon,
	CopyIcon,
	EditIcon,
	EyeIcon,
	FilterIcon,
	FilterOffIcon,
	SortAscendingIcon,
	SortDescendingIcon,
	TrashIcon,
} from "vue-tabler-icons";
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
const isFiltered = computed(() => {
	return filter.fulltext || filter.authors || filter.tag || filter.language || filter.key || filter.year;
});

// pagination
const page       = ref(0);
const listLength = 20;
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
