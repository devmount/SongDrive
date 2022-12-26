<template>
	<div class="songs">
		<div
			class="container no-sidebar"
			ref="container"
			tabindex="0"
			@keydown.left.exact="!isFirstPage && !noSongs ? page-- : null"
			@keydown.right.exact="!isLastPage && !noSongs ? page++ : null"
			@keydown.ctrl.f.prevent="!noSongs ? searchInput.focus() : null"
			@keydown.esc.exact="search=''; filter=''; tuning=''"
		>
			<div class="columns">
				<!-- heading -->
				<div class="column col-12">
					<h2 class="view-title">
						<span v-if="ready.songs" class="text-bold">{{ Object.keys(filteredSongs).length }}</span>
						<div v-else class="loading loading-lg d-inline-block mr-3 px-3"></div>
						{{ t('page.songs') }}
					</h2>
				</div>
			</div>

			<div v-if="noSongs" class="columns mt-2">
				<!-- heading -->
				<div class="column col-12">
					<span v-if="user && role">{{ t('text.noSongsAvailableSignedIn') }}</span>
					<span v-else>{{ t('text.noSongsAvailableSignedOut') }}</span>
				</div>
			</div>

			<div v-if="ready.songs && !noSongs" class="columns mt-2 mb-3">
				<!-- pagination -->
				<div class="column col-3 col-xl-6 col-md-9 col-sm-12 col-mx-auto">
					<ul class="pagination">
						<li class="page-item" :class="{ disabled: isFirstPage }">
							<a class="btn btn-secondary" @click="!isFirstPage ? page-- : null">
								<ion-icon :icon="arrowBack" />
							</a>
						</li>
						<li
							class="page-item"
							:class="{ active: (p-1) == page }"
							v-for="(p, i) in pageCount"
							:key="i"
							v-show="showPageItem(p)"
						>
							<span v-show="showFirstEllipsis(p)">...</span>
							<a
								class="c-hand"
								v-show="showPageItemLink(p)"
								@click="page = p-1"
							>
								{{ p }}
							</a>
							<span v-show="showLastEllipsis(p)">...</span>
						</li>
						<li class="page-item" :class="{ disabled: isLastPage }">
							<a class="btn btn-secondary" @click="!isLastPage ? page++ : null">
								<ion-icon :icon="arrowForward" />
							</a>
						</li>
					</ul>
				</div>
				<div class="column col-1 hide-xl"></div>
				<!-- search and filter -->
				<div class="column col-8 col-xl-12">
					<div class="input-group filter">
						<!-- search title, subtitles -->
						<span class="input-group-addon addon-lg"><ion-icon :icon="searchIcon" /></span>
						<input
							type="search"
							ref="searchInput"
							v-model="search"
							class="form-input input-lg"
							:placeholder="t('placeholder.searchSongTitle')"
						/>
						<div class="dropdown dropdown-right">
							<div class="btn-group">
								<a
									class="btn input-group-btn btn-secondary btn-lg dropdown-toggle"
									:class="{ 'badge': filter!=''||tuning!=''||language!=''}"
									tabindex="0"
								>
									<ion-icon :icon="filterSharp" />
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
											<ion-icon :icon="close" />
											{{ t('button.reset') }}
										</button>
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>
		
			<!-- song list -->
			<table v-if="ready.songs && !noSongs" class="table table-striped table-hover">
				<thead>
					<tr>
						<th
							v-for="col in ['title', 'subtitle', 'authors', 'year', 'tuning']"
							:key="col"
							class="c-hand"
							:class="{
								'bg-primary-dark': order.field == col,
								'hide-md': col == 'authors',
								'hide-xl': col == 'subtitle' || col == 'year'
							}"
							@click="sortList(col)"
						>
							{{ t('field.' + col) }}
							<ion-icon :icon="caretDown" v-if="order.field == col && !order.ascending" class="icon-right" />
							<ion-icon :icon="caretUp" v-if="order.field == col && order.ascending" class="icon-right" />
						</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(song, i) in pagedSongs" :key="i">
						<td class="c-hand" @click="$router.push({ name: 'song-show', params: { id: song.id }})">
							{{ song.title }} <div class="show-xl text-gray">{{ song.subtitle }}</div>
						</td>
						<td class="hide-xl c-hand" @click="$router.push({ name: 'song-show', params: { id: song.id }})">
							{{ song.subtitle }}
						</td>
						<td class="hide-md c-hand" @click="$router.push({ name: 'song-show', params: { id: song.id }})">
							{{ song.authors }}
						</td>
						<td class="hide-xl c-hand" @click="$router.push({ name: 'song-show', params: { id: song.id }})">
							{{ song.year }}
						</td>
						<td class="text-center c-hand" @click="$router.push({ name: 'song-show', params: { id: song.id }})">
							{{ song.tuning }}
						</td>
						<td class="text-right">
							<div class="dropdown dropdown-right">
								<div class="btn-group">
									<a class="btn btn-primary dropdown-toggle" tabindex="0">
										<ion-icon :icon="ellipsisHorizontalOutline" />
									</a>
									<ul class="menu text-left">
										<li class="menu-item">
											<router-link :to="{ name: 'song-show', params: { id: song.id }}" class="py-3 px-3">
												<ion-icon :icon="eyeOutline" class="mr-2" /> {{ t('button.show') }}
											</router-link>
										</li>
										<li v-if="user && role > 1" class="menu-item">
											<a
												href="#"
												class="py-3 px-3"
												@click.prevent="editDialog(song, true)"
											>
												<ion-icon :icon="createOutline" class="mr-2" /> {{ t('button.edit') }}
											</a>
										</li>
										<li v-if="user && role > 1" class="menu-item">
											<a
												href="#"
												class="py-3 px-3"
												@click.prevent="editDialog(song, false)"
											>
												<ion-icon :icon="copyOutline" class="mr-2" /> {{ t('button.duplicate') }}
											</a>
										</li>
										<li v-if="user && role > 2" class="menu-item">
											<a
												href="#"
												class="py-3 px-3 text-error"
												@click.prevent="deleteDialog(song)"
											>
												<ion-icon :icon="trashOutline" class="mr-2" /> {{ t('button.delete') }}
											</a>
										</li>
									</ul>
								</div>
							</div>
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
	</div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useI18n } from "vue-i18n";
import { useRoute } from 'vue-router'
import { keyScale } from '@/utils.js';
import SongSet from '@/modals/SongSet';
import SongDelete from '@/modals/SongDelete';
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
	search as searchIcon,
	trashOutline
} from 'ionicons/icons';
const { t, locale } = useI18n();
const route = useRoute()

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

// reactive data
const search     = ref('');
const filter     = ref(route.params.tag ? route.params.tag : '');
const tuning     = ref('');
const language   = ref('');
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
	if (search.value != '') {
		songs = songs.filter(song => {
			// filter fields: title, subtitle
			var key = search.value;
			return song.title.toLowerCase().indexOf(key) !== -1
				|| song.subtitle.toLowerCase().indexOf(key) !== -1
				|| song.content.toLowerCase().indexOf(key) !== -1
		});
	}
	if (filter.value != '') {
		songs = songs.filter(song => {
			// filter field: tags
			return song.tags.indexOf(filter.value) !== -1;
		});
	}
	if (tuning.value != '') {
		songs = songs.filter(song => {
			// filter field: tuning
			return song.tuning.indexOf(tuning.value) !== -1;
		});
	}
	if (language.value != '') {
		songs = songs.filter(song => {
			// filter field: language
			return song.language.indexOf(language.value) !== -1;
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
watch ([search, filter, tuning, language], () => { page.value = 0 });
</script>
