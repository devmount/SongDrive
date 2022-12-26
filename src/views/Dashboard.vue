<template>
	<div class="dashboard">
		<div class="container no-sidebar">
			<!-- heading -->
			<div class="columns">
				<div class="column">
					<h2 class="view-title">
						{{ t('page.dashboard')}}
					</h2>
				</div>
			</div>
			<!-- loader -->
			<div class="columns col-12 py-4 my-4" v-if="!ready.songs || !ready.setlists">
				<div class="column">
					<div class="loading loading-xl"></div>
				</div>
			</div>
			<!-- stored songs count -->
			<div class="columns" v-if="ready.songs && ready.setlists">
				<div class="column col-3 col-xl-6 mt-4">
					<div class="panel">
						<div class="panel-body text-center pb-3 featured">
							<div class="featured-number">{{ Object.keys(songs).length }}</div>
							<div class="panel-title h5 featured-description">
								<ion-icon :icon="musicalNotes" class="mr-2" />
								{{ t('widget.songsStored') }}
							</div>
						</div>
					</div>
				</div>
				<!-- stored setlists count -->
				<div class="column col-3 col-xl-6 mt-4">
					<div class="panel">
						<div class="panel-body text-center pb-3 featured">
							<div class="featured-number">{{ setlistCount }}</div>
							<div class="panel-title h5 featured-description">
								<ion-icon :icon="list" class="mr-2" />
								{{ t('widget.setlistsStored') }}
							</div>
						</div>
					</div>
				</div>
				<!-- performed songs count -->
				<div class="column col-3 col-xl-6 mt-4">
					<div class="panel">
						<div class="panel-body text-center pb-3 featured">
							<div class="featured-number"><span class="text-gray">~</span>{{ songsPerformed }}</div>
							<div class="panel-title h5 featured-description">
								<ion-icon :icon="micOutline" class="mr-2" />
								{{ t('widget.songsPerformed') }}
							</div>
						</div>
					</div>
				</div>
				<!-- used languages count -->
				<div class="column col-3 col-xl-6 mt-4">
					<div class="panel">
						<div class="panel-body text-center pb-3 featured">
							<div class="featured-number">{{ languagesUsed }}</div>
							<div class="panel-title h5 featured-description">
								<ion-icon :icon="globeOutline" class="mr-2" />
								{{ t('widget.languages', languagesUsed) }}
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="columns" v-if="ready.songs && ready.setlists">
				<!-- song list -->
				<div v-if="!noSongs" class="column col-4 col-xl-6 col-md-12 mt-4">
					<div class="panel">
						<div class="panel-header">
							<div class="panel-title h5">
								{{ t('widget.' + songsProperty) }} {{ t('page.songs') }}
								<div class="btn-group float-right">
									<button
										class="btn btn-secondary px-3"
										:class="{ disabled: isFirstSongPage }"
										@click="!isFirstSongPage ? songsPage-- : null"
									>
										<ion-icon :icon="arrowBack" />
									</button>
									<button
										class="btn btn-secondary px-3"
										:class="{ disabled: isLastSongPage }"
										@click="!isLastSongPage ? songsPage++ : null"
									>
										<ion-icon :icon="arrowForward" />
									</button>
								</div>
							</div>
						</div>
						<div class="panel-body">
							<div
								v-for="(song, i) in songlist"
								:key="i"
								class="tile tile-centered tile-hover c-hand p-2"
								@click="router.push({ name: 'song-show', params: { id: song.id }})"
							>
								<div class="tile-icon">
									<figure class="avatar s-rounded" :data-initial="song.tuning" :title="t('title.songTuning')"></figure>
									<figure
										v-if="songsProperty == 'popular'"
										class="avatar avatar-secondary s-rounded float-right ml-1"
										:data-initial="song.popularity + 'x'"
										:title="t('title.songOccuredOn', { num: song.popularity })"
									></figure>
									<figure
										v-if="songsProperty == 'newest' || songsProperty == 'oldest'"
										class="avatar avatar-secondary s-rounded float-right ml-1"
										:data-initial="song.year ? song.year : '—'"
										:title="song.year ? t('title.songPublishedIn', { year: song.year }) : t('title.noYear')"
									></figure>
								</div>
								<div class="tile-content">
									<div class="tile-title">{{ song.title }}</div>
									<div class="tile-subtitle text-gray text-small">{{ song.subtitle }}</div>
								</div>
							</div>
						</div>
						<div class="panel-footer">
							<div class="btn-group">
								<button class="btn btn-secondary" @click="shuffleSongs">
									<ion-icon :icon="shuffle" class="mr-2" />
									{{ t('button.shuffle') }}
								</button>
								<button v-if="songsProperty != 'newest'" class="btn btn-secondary" @click="newestSongs">
									<ion-icon :icon="arrowUp" class="mr-2" />
									{{ t('widget.newest') }}
								</button>
								<button v-if="songsProperty == 'newest'" class="btn btn-secondary" @click="oldestSongs">
									<ion-icon :icon="arrowDown" class="mr-2" />
									{{ t('widget.oldest') }}
								</button>
								<button v-if="!noSetlists" class="btn btn-secondary" @click="popularSongs">
									<ion-icon :icon="trendingUp" class="mr-2" />
									{{ t('widget.popular') }}
								</button>
							</div>
						</div>
						<div class="panel-link">
							<RouterLink to="/songs" class="btn btn-link btn-block">
								{{ t('widget.goToSongs') }}
								<ion-icon :icon="arrowForward" class="ml-1" />
							</RouterLink>
						</div>
					</div>
				</div>
				<!-- setlist list -->
				<div v-if="!noSetlists" class="column col-4 col-xl-6 col-md-12 mt-4">
					<div class="panel">
						<div class="panel-header">
							<div class="panel-title h5">
								{{ t('widget.' + setlistsProperty) }} {{ t('page.setlists') }}
								<div class="btn-group float-right">
									<button
										class="btn btn-secondary float-right px-3"
										:class="{ disabled: isFirstSetlistPage }"
										@click="!isFirstSetlistPage ? setlistsPage-- : null"
									>
										<ion-icon :icon="arrowBack" />
									</button>
									<button
										class="btn btn-secondary float-right px-3"
										:class="{ disabled: isLastSetlistPage }"
										@click="!isLastSetlistPage ? setlistsPage++ : null"
									>
										<ion-icon :icon="arrowForward" />
									</button>
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
							<RouterLink to="/setlists" class="btn btn-link btn-block">
								{{ t('widget.goToSetlists') }}
								<ion-icon :icon="arrowForward" class="ml-1" />
							</RouterLink>
						</div>
					</div>
				</div>
				<!-- song of the year -->
				<div v-if="!noSongs && !noSetlists" class="column col-4 col-xl-6 col-md-12 mt-4">
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
							<RouterLink to="/songs" class="btn btn-link btn-block">
								{{ t('widget.goToSongs') }}
								<ion-icon :icon="arrowForward" class="ml-1" />
							</RouterLink>
						</div>
					</div>
				</div>
			</div>
			<div class="columns" v-if="ready.songs && ready.setlists">
				<div v-if="!noSetlists" class="column col-4 col-xl-6 col-md-12 mt-4">
					<div class="panel">
						<div class="panel-header">
							<div class="panel-title h5">
								{{ t('widget.setlistsCreatedPerYear') }}
							</div>
						</div>
						<div class="panel-body">
							<LineChart
								:datasets="setlistsPerYear.datasets"
								:labels="setlistsPerYear.labels"
								:ordinate="false"
								:abscissa="true"
							/>
						</div>
					</div>
				</div>
				<div v-if="!noSongs && !noSetlists" class="column col-4 col-xl-6 col-md-12 mt-4">
					<div class="panel">
						<div class="panel-header">
							<div class="panel-title h5">
								{{ t('widget.songsPerformedPerYear') }}
							</div>
						</div>
						<div class="panel-body">
							<LineChart
								:datasets="songsPerYear.datasets"
								:labels="songsPerYear.labels"
								:ordinate="false"
								:abscissa="true"
							/>
						</div>
					</div>
				</div>
				<div v-if="!noSetlists" class="column col-4 col-xl-6 col-md-12 mt-4">
					<div class="panel">
						<div class="panel-header">
							<div class="panel-title h5">
								{{ t('widget.setlistsPerWeekday') }}
							</div>
						</div>
						<div class="panel-body">
							<BarChart
								:datasets="setlistsPerWeekday.datasets"
								:labels="setlistsPerWeekday.labels"
								:ordinate="false"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from "vue-i18n";
import LineChart from '@/charts/LineChart';
import BarChart  from '@/charts/BarChart';
import {
	arrowBack,
	arrowDown,
	arrowForward,
	arrowUp,
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
