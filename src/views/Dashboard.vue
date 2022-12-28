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
					{{ t('widget.publicSetlists') }}
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
			<widget-song-list :songs="songsArray" :setlists="setlistsArray" />
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
import LineChart from '@/charts/LineChart';
import BarChart  from '@/charts/BarChart';
import WidgetSongList from '@/widgets/WidgetSongList.vue';
import {
	arrowBack,
	arrowDown,
	arrowForward,
	arrowUp,
	globeOutline,
	list,
	lockClosedOutline,
	micOutline,
	musicalNotes
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
const setlistsProperty  = ref('newest');
const reorderedSetlists = ref([]);
const setlistsPage      = ref(0);
const listLength        = ref(6);

// methods
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
const setlistsArray = computed(() => {
	return Object.keys(props.setlists).map((key) => {
		let setlist = props.setlists[key];
		setlist['id'] = key;
		return setlist;
	}).filter(s => !s.private || s.private && s.creator==props.user);
});
const setlistCount = computed(() => setlistsArray.value.filter(s => !s.private).length);
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
