<template>
	<div class="flex flex-col gap-6 w-full">
		<!-- page heading -->
		<div class="text-3xl uppercase font-thin tracking-wider">
			{{ t('page.dashboard')}}
		</div>
		<div class="flex flex-wrap gap-8 w-full justify-evenly" v-if="ready.songs && ready.setlists">
			<!-- stored songs count -->
			<div class="flex flex-col items-center">
				<div class="text-4xl sm:text-6xl font-thin">
					{{ Object.keys(songs).length }}
				</div>
				<div class="text-xl text-blade-600 dark:text-blade-400 flex gap-2">
					<ion-icon :icon="musicalNotes" class="shrink-0 w-5 h-5 mt-2" />
					{{ t('widget.songsStored') }}
				</div>
			</div>
			<!-- stored setlists count -->
			<div class="flex flex-col items-center">
				<div class="text-4xl sm:text-6xl font-thin">
					{{ setlistCount }}
				</div>
				<div class="text-xl text-blade-600 dark:text-blade-400 flex gap-2">
					<ion-icon :icon="list" class="shrink-0 w-5 h-5 mt-2" />
					{{ t('widget.publicSetlists') }}
				</div>
			</div>
			<!-- performed songs count -->
			<div class="flex flex-col items-center">
				<div class="text-4xl sm:text-6xl font-thin">
					<span class="text-blade-500">~</span>{{ songsPerformed }}
				</div>
				<div class="text-xl text-blade-600 dark:text-blade-400 flex gap-2">
					<ion-icon :icon="micOutline" class="shrink-0 w-5 h-5 mt-2" />
					{{ t('widget.songsPerformed') }}
				</div>
			</div>
			<!-- used languages count -->
			<div class="flex flex-col items-center">
				<div class="text-4xl sm:text-6xl font-thin">
					{{ languagesUsed }}
				</div>
				<div class="text-xl text-blade-600 dark:text-blade-400 flex gap-2">
					<ion-icon :icon="globeOutline" class="shrink-0 w-5 h-5 mt-2" />
					{{ t('widget.languages', languagesUsed) }}
				</div>
			</div>
		</div>

		<div
			v-if="ready.songs && ready.setlists"
			class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
		>
			<!-- song list -->
			<widget-song-list :songs="songsArray" :setlists="setlistsArray" />
			<!-- setlist list -->
			<widget-setlist-list :setlists="setlistsArray" />
			<!-- song of the year -->
			<widget-song-of-year :songs="songs" :setlists="setlistsArray" />
		</div>
		<div
			v-if="ready.songs && ready.setlists"
			class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
		>
			<panel v-if="!noSetlists" class="flex flex-col gap-4">
				<div class="text-2xl">
					{{ t('widget.setlistsCreatedPerYear') }}
				</div>
				<line-chart
					:datasets="setlistsPerYear.datasets"
					:labels="setlistsPerYear.labels"
					:ordinate="false"
					:abscissa="true"
				/>
			</panel>
			<panel v-if="!noSongs && !noSetlists" class="flex flex-col gap-4">
				<div class="text-2xl">
					{{ t('widget.songsPerformedPerYear') }}
				</div>
				<line-chart
					:datasets="songsPerYear.datasets"
					:labels="songsPerYear.labels"
					:ordinate="false"
					:abscissa="true"
				/>
			</panel>
			<panel v-if="!noSetlists" class="flex flex-col gap-4">
				<div class="text-2xl">
					{{ t('widget.setlistsPerWeekday') }}
				</div>
				<bar-chart
					:datasets="setlistsPerWeekday.datasets"
					:labels="setlistsPerWeekday.labels"
					:ordinate="false"
				/>
			</panel>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from "vue-i18n";
import Panel from '@/elements/Panel';
import LineChart from '@/charts/LineChart';
import BarChart  from '@/charts/BarChart';
import WidgetSongList from '@/widgets/WidgetSongList';
import WidgetSetlistList from '@/widgets/WidgetSetlistList';
import WidgetSongOfYear from '@/widgets/WidgetSongOfYear';
import {
	globeOutline,
	list,
	micOutline,
	musicalNotes
} from 'ionicons/icons';
const { t, locale } = useI18n();

// inherited properties
const props = defineProps({
  songs:    Object,
  setlists: Object,
  ready:    Object,
  user:     String,
});

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
</script>
