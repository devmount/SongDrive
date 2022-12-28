<template>
	<panel v-if="songs?.length > 0">
		<div class="flex justify-between">
			<div class="text-2xl">
				{{ t('widget.' + keyByValue(sortBy, order)) }} {{ t('page.songs') }}
			</div>
			<div class="flex gap-1">
				<secondary-button
					:disabled="isFirstSongPage"
					@click="!isFirstSongPage ? page-- : null"
				>
					<ion-icon :icon="arrowBack" />
				</secondary-button>
				<secondary-button
					:disabled="isLastSongPage"
					@click="!isLastSongPage ? page++ : null"
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
						v-if="order == sortBy.popular"
						class="flex justify-center items-center bg-blade-700 font-semibold py-1 w-12"
						:title="t('title.songOccuredOn', { num: song.popularity })"
					>
						<div class="-mt-0.5">{{ song.popularity }}</div>
						<ion-icon :icon="closeOutline" class="w-3 h-3" />
					</figure>
					<figure
						v-if="order == sortBy.newest || order == sortBy.oldest"
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
			<secondary-button v-if="order != sortBy.newest" @click="newestSongs">
				<ion-icon :icon="arrowUp" />
				{{ t('widget.newest') }}
			</secondary-button>
			<secondary-button v-if="order == sortBy.newest" @click="oldestSongs">
				<ion-icon :icon="arrowDown" />
				{{ t('widget.oldest') }}
			</secondary-button>
			<secondary-button v-if="setlists?.length > 0" @click="popularSongs">
				<ion-icon :icon="trendingUp" />
				{{ t('widget.popular') }}
			</secondary-button>
		</div>
		<link-button class="mt-auto" @click="router.push({ name: 'songs' })">
			{{ t('widget.showAllSongs') }}
			<ion-icon :icon="arrowForward" />
		</link-button>
	</panel>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from "vue-i18n";
import {
	arrowBack,
	arrowDown,
	arrowForward,
	arrowUp,
	closeOutline,
	shuffle,
	trendingUp
} from 'ionicons/icons';
import Panel from '@/elements/Panel.vue';
import LinkButton from '@/elements/LinkButton.vue';
import SecondaryButton from '@/elements/SecondaryButton.vue';
import { keyByValue } from "@/utils";
const router = useRouter();
const { t } = useI18n();

// component properties
const props = defineProps({
  songs: Array,
  setlists: Array,
});

// sorting order
const sortBy = {
	newest: 1,
	oldest: 2,
	random: 3,
	popular: 4,
}

// list data
const order      = ref(sortBy.newest);
const reordered  = ref([]);
const page       = ref(0);
const listLength = 6;

// sort song list
const shuffleSongs = () => {
	page.value = 0;
	order.value = sortBy.random;
	let list = props.songs;
	for (let i = list.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[list[i], list[j]] = [list[j], list[i]];
	}
	reordered.value = [...list];
};
const newestSongs = () => {
	page.value = 0;
	order.value = sortBy.newest;
	reordered.value = props.songs.filter(s => s.year > 0).sort(
		(a, b) => (a.year < b.year) ? 1 : ((b.year < a.year) ? -1 : 0)
	);
	return reordered.value;
};
const oldestSongs = () => {
	page.value = 0;
	order.value = sortBy.oldest;
	reordered.value = props.songs.filter(s => s.year > 0).sort(
		(a, b) => (a.year > b.year) ? 1 : ((b.year > a.year) ? -1 : 0)
	);
};
const popularSongs = () => {
	page.value = 0;
	order.value = sortBy.popular;
	let list = {};
	props.setlists.forEach(setlist => {
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
	reordered.value = props.songs
		.filter(s => orderedSongIds.includes(s.id))
		.map(s => Object.assign({popularity: list[s.id]}, s))
		.sort((a, b) => (a.popularity < b.popularity) ? 1 : ((b.popularity < a.popularity) ? -1 : 0));
};

// handle pagination
const songlist = computed(() => {
	const list = reordered.value.length > 0 ? reordered.value : newestSongs();
	return list.slice(page.value*listLength, (page.value+1)*listLength);
});
const isFirstSongPage = computed(() => page.value == 0);
const isLastSongPage = computed(() => songlist.value.length < listLength);
</script>
