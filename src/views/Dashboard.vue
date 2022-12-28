<template>
	<div class="flex flex-col gap-6 w-full">
		<!-- page heading -->
		<div class="text-3xl uppercase font-thin tracking-wider">
			{{ t('page.dashboard')}}
		</div>
		<div class="flex gap-8 w-max mx-auto" v-if="ready.songs && ready.setlists">
			<!-- stored songs count -->
			<div class="flex flex-col items-center">
				<div class="text-6xl font-thin">{{ Object.keys(songs).length }}</div>
				<div class="text-xl text-blade-600 dark:text-blade-400 flex gap-2">
					<ion-icon :icon="musicalNotes" class="shrink-0 w-5 h-5 mt-2" />
					{{ t('widget.songsStored') }}
				</div>
			</div>
			<!-- stored setlists count -->
			<div class="flex flex-col items-center">
				<div class="text-6xl font-thin">{{ setlistCount }}</div>
				<div class="text-xl text-blade-600 dark:text-blade-400 flex gap-2">
					<ion-icon :icon="list" class="shrink-0 w-5 h-5 mt-2" />
					{{ t('widget.setlistsStored') }}
				</div>
			</div>
			<!-- performed songs count -->
			<div class="flex flex-col items-center">
				<div class="text-6xl font-thin"><span class="text-blade-500">~</span>{{ songsPerformed }}</div>
				<div class="text-xl text-blade-600 dark:text-blade-400 flex gap-2">
					<ion-icon :icon="micOutline" class="shrink-0 w-5 h-5 mt-2" />
					{{ t('widget.songsPerformed') }}
				</div>
			</div>
			<!-- used languages count -->
			<div class="flex flex-col items-center">
				<div class="text-6xl font-thin">{{ languagesUsed }}</div>
				<div class="text-xl text-blade-600 dark:text-blade-400 flex gap-2">
					<ion-icon :icon="globeOutline" class="shrink-0 w-5 h-5 mt-2" />
					{{ t('widget.languages', languagesUsed) }}
				</div>
			</div>
		</div>

		<div class="grid grid-cols-3 gap-6 w-full" v-if="ready.songs && ready.setlists">
			<!-- song list -->
			<panel v-if="!noSongs" class="column col-4 col-xl-6 col-md-12">
				<div class="flex justify-between">
					<div class="text-2xl">{{ t('widget.' + songsProperty) }} {{ t('page.songs') }}</div>
					<div class="flex gap-1">
						<secondary-button
							:disabled="isFirstSongPage"
							@click="!isFirstSongPage ? songsPage-- : null"
						>
							<ion-icon :icon="arrowBack" />
						</secondary-button>
						<secondary-button
							:disabled="isLastSongPage"
							@click="!isLastSongPage ? songsPage++ : null"
						>
							<ion-icon :icon="arrowForward" />
						</secondary-button>
					</div>
				</div>
				<div class="flex flex-col gap-2">
					<div
						v-for="(song, i) in songlist"
						:key="i"
						class="flex gap-2 cursor-pointer p-2 hover:bg-blade-200 dark:hover:bg-blade-800"
						@click="router.push({ name: 'song-show', params: { id: song.id }})"
					>
						<div class="flex">
							<figure
								class="flex justify-center items-center bg-spring-700 font-semibold py-1 w-8"
								:title="t('title.songTuning')"
							>
								<div class="-mt-0.5">{{ song.tuning }}</div>
							</figure>
							<figure
								v-if="songsProperty == 'popular'"
								class="flex justify-center items-center bg-blade-700 font-semibold py-1 w-12"
								:title="t('title.songOccuredOn', { num: song.popularity })"
							>
								<div class="-mt-0.5">{{ song.popularity }}</div>
								<ion-icon :icon="closeOutline" class="w-3 h-3" />
							</figure>
							<figure
								v-if="songsProperty == 'newest' || songsProperty == 'oldest'"
								class="flex justify-center items-center bg-blade-700 font-semibold py-1 w-12"
								:title="song.year ? t('title.songPublishedIn', { year: song.year }) : t('title.noYear')"
							>
								<div class="-mt-0.5">{{ song.year ? song.year : '—' }}</div>
							</figure>
						</div>
						<div class="flex flex-col overflow-hidden">
							<div class="leading-4 truncate">{{ song.title }}</div>
							<div class="text-sm text-blade-500 leading-4 truncate">{{ song.subtitle }}</div>
						</div>
					</div>
				</div>
				<div class="flex flex-wrap gap-1">
					<secondary-button @click="shuffleSongs">
						<ion-icon :icon="shuffle" />
						{{ t('button.shuffle') }}
					</secondary-button>
					<secondary-button v-if="songsProperty != 'newest'" @click="newestSongs">
						<ion-icon :icon="arrowUp" />
						{{ t('widget.newest') }}
					</secondary-button>
					<secondary-button v-if="songsProperty == 'newest'" @click="oldestSongs">
						<ion-icon :icon="arrowDown" />
						{{ t('widget.oldest') }}
					</secondary-button>
					<secondary-button v-if="!noSetlists" @click="popularSongs">
						<ion-icon :icon="trendingUp" />
						{{ t('widget.popular') }}
					</secondary-button>
				</div>
				<link-button class="mt-auto" @click="router.push({ name: 'songs' })">
					{{ t('widget.showAllSongs') }}
					<ion-icon :icon="arrowForward" />
				</link-button>
			</panel>
			<!-- setlist list -->
			<panel v-if="!noSetlists" class="column col-4 col-xl-6 col-md-12">
				<div class="panel">
					<div class="panel-header">
						<div class="panel-title h5">
							{{ t('widget.' + setlistsProperty) }} {{ t('page.setlists') }}
							<div class="btn-group float-right">
								<secondary-button
									class=""
									:class="{ disabled: isFirstSetlistPage }"
									@click="!isFirstSetlistPage ? setlistsPage-- : null"
								>
									<ion-icon :icon="arrowBack" />
								</secondary-button>
								<secondary-button
									class=""
									:class="{ disabled: isLastSetlistPage }"
									@click="!isLastSetlistPage ? setlistsPage++ : null"
								>
									<ion-icon :icon="arrowForward" />
								</secondary-button>
							</div>
						</div>
					</div>
					<div class="panel-body">
						<div
							v-for="(setlist, i) in setlistlist"
							:key="i"
							class="tile tile-centered tile-hover c-hand p-2"
							@click="router.push({ name: 'setlist-show', params: { id: setlist.id }})"
						>
							<div class="tile-icon">
								<figure
									class="avatar avatar-secondary s-rounded"
									:data-initial="setlist.songs.length"
									:title="t('title.setlistContains', { num: setlist.songs.length})"
								></figure>
							</div>
							<div class="tile-content">
								<div class="tile-title">
									{{ setlist.title }}
									<span v-if="setlist.private" class="text-primary">
										<ion-icon :icon="lockClosedOutline" class="icon-sm" />
									</span>
								</div>
								<div class="tile-subtitle text-gray text-small">{{ setlist.date }}</div>
							</div>
						</div>
					</div>
					<div class="panel-footer">
						<div class="btn-group">
							<button v-if="setlistsProperty != 'newest'" class="btn btn-secondary" @click="newestSetlists">
								<ion-icon :icon="arrowUp" class="mr-2" />
								{{ t('widget.newest') }}
							</button>
							<button v-if="setlistsProperty == 'newest'" class="btn btn-secondary" @click="oldestSetlists">
								<ion-icon :icon="arrowDown" class="mr-2" />
								{{ t('widget.oldest') }}
							</button>
						</div>
					</div>
					<div class="panel-link">
						<router-link to="/setlists" class="btn btn-link btn-block">
							{{ t('widget.showAllSetlists') }}
							<ion-icon :icon="arrowForward" class="ml-1" />
						</router-link>
					</div>
				</div>
			</panel>
			<!-- song of the year -->
			<panel v-if="!noSongs && !noSetlists" class="column col-4 col-xl-6 col-md-12">
				<div class="panel">
					<div class="panel-header">
						<div class="panel-title h5">
							{{ t('widget.songOfYear') }}
						</div>
					</div>
					<div class="panel-body">
						<div
							v-for="(song, year) in songOfYear"
							:key="year"
							class="tile tile-centered tile-hover c-hand p-2"
							@click="router.push({ name: 'song-show', params: { id: song.id}})"
						>
							<div class="tile-icon">
								<figure class="avatar avatar-secondary bg-primary s-rounded" :data-initial="year"></figure>
								<figure
									class="avatar avatar-secondary s-rounded ml-1"
									:data-initial="song.count + 'x'"
									:title="t('title.songOccuredOn', { num: song.count })"
								></figure>
							</div>
							<div class="tile-content">
								<div class="tile-title">{{ songs[song.id].title }}</div>
								<div class="tile-subtitle text-gray text-small">{{ songs[song.id].subtitle }}</div>
							</div>
						</div>
					</div>
					<div class="panel-link">
						<router-link to="/songs" class="btn btn-link btn-block">
							{{ t('widget.showAllSongs') }}
							<ion-icon :icon="arrowForward" class="ml-1" />
						</router-link>
					</div>
				</div>
			</panel>
		</div>
		<div class="grid grid-cols-3 gap-6" v-if="ready.songs && ready.setlists">
			<panel v-if="!noSetlists" class="column col-4 col-xl-6 col-md-12">
				<div class="flex flex-col gap-4">
					<div class="text-2xl">
						{{ t('widget.setlistsCreatedPerYear') }}
					</div>
					<line-chart
						:datasets="setlistsPerYear.datasets"
						:labels="setlistsPerYear.labels"
						:ordinate="false"
						:abscissa="true"
					/>
				</div>
			</panel>
			<panel v-if="!noSongs && !noSetlists" class="column col-4 col-xl-6 col-md-12">
				<div class="flex flex-col gap-4">
					<div class="text-2xl">
						{{ t('widget.songsPerformedPerYear') }}
					</div>
					<line-chart
						:datasets="songsPerYear.datasets"
						:labels="songsPerYear.labels"
						:ordinate="false"
						:abscissa="true"
					/>
				</div>
			</panel>
			<panel v-if="!noSetlists" class="column col-4 col-xl-6 col-md-12">
				<div class="flex flex-col gap-4">
					<div class="text-2xl">
						{{ t('widget.setlistsPerWeekday') }}
					</div>
					<bar-chart
						:datasets="setlistsPerWeekday.datasets"
						:labels="setlistsPerWeekday.labels"
						:ordinate="false"
					/>
				</div>
			</panel>
		</div>
	</div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from "vue-i18n";
import Panel from '@/elements/Panel.vue';
import SecondaryButton from '@/elements/SecondaryButton.vue';
import LinkButton from '@/elements/LinkButton.vue';
import LineChart from '@/charts/LineChart';
import BarChart  from '@/charts/BarChart';
import {
	arrowBack,
	arrowDown,
	arrowForward,
	arrowUp,
	closeOutline,
	globeOutline,
	list,
	lockClosedOutline,
	micOutline,
	musicalNotes,
	shuffle,
	trendingUp,
} from 'ionicons/icons';
const router = useRouter();
const { t, locale } = useI18n();

// inherited properties
const props = defineProps({
  songs:    Object,
  setlists: Object,
  ready:    Object,
  user:     String,
});

// reactive data
const songsProperty     = ref('newest');
const reorderedSongs    = ref([]);
const songsPage         = ref(0);
const setlistsProperty  = ref('newest');
const reorderedSetlists = ref([]);
const setlistsPage      = ref(0);
const listLength        = ref(6);

// methods
const shuffleSongs = () => {
	songsPage.value = 0;
	songsProperty.value = 'random';
	let list = songsArray.value;
	for (let i = list.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[list[i], list[j]] = [list[j], list[i]];
	}
	reorderedSongs.value = [...list];
};
const newestSongs = () => {
	songsPage.value = 0;
	songsProperty.value = 'newest';
	reorderedSongs.value = songsArray.value.filter(s => s.year > 0).sort(
		(a, b) => (a.year < b.year) ? 1 : ((b.year < a.year) ? -1 : 0)
	);
	return reorderedSongs.value;
};
const oldestSongs = () => {
	songsPage.value = 0;
	songsProperty.value = 'oldest';
	reorderedSongs.value = songsArray.value.filter(s => s.year > 0).sort(
		(a, b) => (a.year > b.year) ? 1 : ((b.year > a.year) ? -1 : 0)
	);
};
const popularSongs = () => {
	songsPage.value = 0;
	songsProperty.value = 'popular';
	let list = {};
	setlistsArray.value.forEach(setlist => {
		if (setlist.songs) {
			setlist.songs.forEach(song => {
				if (!list.hasOwnProperty(song.id)) {
					list[song.id] = 1;
				} else {
					list[song.id]++;
				}
			});
		}
	});
	var idList = [];
	for (var id in list) {
		idList.push([id, list[id]]);
	}
	let orderedSongIds = idList.sort((a, b) => b[1] - a[1]).reduce((a, c) => a.concat(c[0]), []);
	reorderedSongs.value = songsArray.value
		.filter(s => orderedSongIds.includes(s.id))
		.map(s => Object.assign({popularity: list[s.id]}, s))
		.sort((a, b) => (a.popularity < b.popularity) ? 1 : ((b.popularity < a.popularity) ? -1 : 0));
};
const newestSetlists = () => {
	setlistsPage.value = 0;
	setlistsProperty.value = 'newest';
	reorderedSetlists.value = setlistsArray.value.filter(s => s.date != '').sort(
		(a,b) => (new Date(a.date) < new Date(b.date)) ? 1 : ((new Date(b.date) < new Date(a.date)) ? -1 : 0)
	);
	return reorderedSetlists.value;
};
const oldestSetlists = () => {
	setlistsPage.value = 0;
	setlistsProperty.value = 'oldest';
	reorderedSetlists.value = setlistsArray.value.filter(s => s.date != '').sort(
		(a,b) => (new Date(a.date) > new Date(b.date)) ? 1 : ((new Date(b.date) > new Date(a.date)) ? -1 : 0)
	);
};

// computed
const songsPerformed = computed(() => setlistsArray.value.reduce((a, c) => a + c.songs.length, 0));
const songsArray = computed(() => {
	let list = Object.keys(props.songs).map((key) => {
		let song = props.songs[key];
		song['id'] = key;
		return song;
	});
	return list.sort((a, b) => (a.year < b.year) ? 1 : ((b.year < a.year) ? -1 : 0));
});
const noSongs = computed(() => props.ready.songs && songsArray.value.length == 0);
const languagesUsed = computed(() => {
	let languages = [];
	songsArray.value.forEach(song => {
		if (!languages.includes(song.language)) {
			languages.push(song.language);
		}
	})
	return languages.length;
});
const songlist = computed(() => {
	const list = reorderedSongs.value.length > 0 ? reorderedSongs.value : newestSongs();
	return list.slice(songsPage.value*listLength.value, (songsPage.value+1)*listLength.value);
});
const setlistsArray = computed(() => {
	return Object.keys(props.setlists).map((key) => {
		let setlist = props.setlists[key];
		setlist['id'] = key;
		return setlist;
	}).filter(s => !s.private || s.private && s.creator==props.user);
});
const setlistCount = computed(() => setlistsArray.value.length);
const noSetlists = computed(() => props.ready.setlists && setlistsArray.value.length == 0);
const setlistlist = computed(() => {
	const list = reorderedSetlists.value.length > 0 ? reorderedSetlists.value : newestSetlists();
	return list.slice(setlistsPage.value*listLength.value, (setlistsPage.value+1)*listLength.value);
});
const songOfYear = computed(() => {
	let list = {};
	setlistsArray.value.forEach(setlist => {
		let year = setlist.date.slice(0, 4);
		if (year && setlist.songs) {
			if (!list.hasOwnProperty(year)) {
				list[year] = {};
			}
			setlist.songs.forEach(song => {
				if (!list[year].hasOwnProperty(song.id)) {
					list[year][song.id] = 1;
				} else {
					list[year][song.id]++;
				}
			});
		}
	});
	let songsToYear = {};
	for (let year in list) {
		let maxId = '', maxCount = 0;
		for (let id in list[year]) {
			if (list[year][id] > maxCount) {
				maxId = id;
				maxCount = list[year][id];
			}
		}
		songsToYear[year] = { id: maxId, count: maxCount };
	}
	return songsToYear;
});
const setlistsPerYear = computed(() => {
	let years = {};
	setlistsArray.value.forEach(setlist => {
		let year = setlist.date.slice(0, 4);
		if (year) {
			if (!years.hasOwnProperty(year)) {
				years[year] = 1;
			} else {
				years[year]++;
			}
		}
	});
	return {
		datasets: [
			{ label: t('page.setlists'), data: Object.values(years), borderColor: '#88b544' },
		],
		labels: Object.keys(years)
	};
});
const songsPerYear = computed(() => {
	let years = {};
	setlistsArray.value.forEach(setlist => {
		let year = setlist.date.slice(0, 4);
		if (year) {
			if (!years.hasOwnProperty(year)) {
				years[year] = 0;
			}
			years[year] += setlist.songs.length;
		}
	});
	return {
		datasets: [
			{ label: t('page.songs'), data: Object.values(years), borderColor: '#88b544' },
		],
		labels: Object.keys(years)
	};
});
const setlistsPerWeekday = computed(() => {
	let weekday = {};
	for (let i = 0; i < getWeekDays.value.length; i++) {
		weekday[getWeekDays.value[i]] = 0;
	}
	setlistsArray.value.forEach(setlist => {
		let w = (new Date(setlist.date)).toLocaleDateString(locale.value, { weekday: 'long' });
		weekday[w]++;
	});
	return {
		datasets: [
			{ label: t('page.setlists'), data: Object.values(weekday), borderColor: '#88b544' },
		],
		labels: Object.keys(weekday).map(d => d.slice(0,2))
	};
});
const getWeekDays = computed(() => {
	var d = new Date(Date.UTC(2017, 0, 2)); // start with a Monday
	var names = [];
	for(let i = 0; i < 7; i++) {
		names.push(d.toLocaleDateString(locale.value, { weekday: 'long' }));
		d.setDate(d.getDate() + 1);
	}
	return names;
});
const isFirstSongPage = computed(() => songsPage.value == 0);
const isLastSongPage = computed(() => songlist.value.length < listLength.value);
const isFirstSetlistPage = computed(() => setlistsPage.value == 0);
const isLastSetlistPage = computed(() => setlistlist.value.length < listLength.value);
</script>

<style>
.dashboard .avatar-secondary {
  width: 2rem;
  font-size: 0.7rem;
}
.dashboard .avatar-secondary::before {
  text-transform: unset;
}
</style>
