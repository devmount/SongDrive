<template>
	<panel v-if="songs?.length > 0">
		<div class="flex justify-between items-start">
			<div class="text-2xl">
				{{ t('widget.' + keyByValue(sortBy, order)) }} {{ t('page.songs', 2) }}
			</div>
			<div class="flex gap-1">
				<secondary-button
					:disabled="isFirstPage"
					@click="!isFirstPage ? page-- : null"
				>
					<icon-arrow-left class="w-5 h-5 stroke-1.5" />
				</secondary-button>
				<secondary-button
					:disabled="isLastPage"
					@click="!isLastPage ? page++ : null"
				>
					<icon-arrow-right class="w-5 h-5 stroke-1.5" />
				</secondary-button>
			</div>
		</div>
		<div class="flex flex-col">
			<div
				v-for="(song, i) in songlist" :key="i"
				class="flex gap-2 cursor-pointer p-2 hover:bg-blade-200 dark:hover:bg-blade-800"
				@click="router.push({ name: 'song-show', params: { id: song.id }})"
			>
				<div class="flex">
					<figure
						class="flex justify-center items-center bg-spring-700 text-white font-semibold py-1 w-8"
						:title="t('title.songTuning')"
					>
						<div class="-mt-0.5">{{ song.tuning }}</div>
					</figure>
					<figure
						v-if="order == sortBy.popular"
						class="flex justify-center items-center bg-blade-300 dark:bg-blade-700 font-semibold py-1 w-12"
						:title="t('title.songOccuredOn', { num: song.popularity })"
					>
						<div class="-mt-0.5">{{ song.popularity }}</div>
						<icon-x class="w-3 h-3 stroke-2 -mr-1" />
					</figure>
					<figure
						v-if="order == sortBy.newest || order == sortBy.oldest"
						class="flex justify-center items-center bg-blade-300 dark:bg-blade-700 font-semibold py-1 w-12"
						:title="song.year ? t('title.songPublishedIn', { year: song.year }) : t('title.noYear')"
					>
						<div class="-mt-0.5">{{ song.year ? song.year : '—' }}</div>
					</figure>
				</div>
				<div class="flex flex-col overflow-hidden">
					<div class="-mt-1 truncate">{{ song.title }}</div>
					<div class="text-sm text-blade-500 -mt-1 truncate">{{ song.subtitle }}</div>
				</div>
			</div>
		</div>
		<div class="flex flex-wrap gap-1">
			<secondary-button @click="shuffleSongs">
				<icon-arrows-shuffle class="w-5 h-5 stroke-1.5" />
				{{ t('button.shuffle') }}
			</secondary-button>
			<secondary-button v-if="order != sortBy.newest" @click="newestSongs">
				<icon-arrow-up class="w-5 h-5 stroke-1.5" />
				{{ t('widget.newest') }}
			</secondary-button>
			<secondary-button v-if="order == sortBy.newest" @click="oldestSongs">
				<icon-arrow-down class="w-5 h-5 stroke-1.5" />
				{{ t('widget.oldest') }}
			</secondary-button>
			<secondary-button v-if="setlists?.length > 0" @click="popularSongs">
				<icon-trending-up class="w-5 h-5 stroke-1.5" />
				{{ t('widget.popular') }}
			</secondary-button>
		</div>
		<link-button class="mt-auto" @click="router.push({ name: 'songs' })">
			{{ t('widget.showAllSongs') }}
			<icon-arrow-right class="w-5 h-5 stroke-1.5" />
		</link-button>
	</panel>
</template>

<script setup>
import { keyByValue } from '@/utils.js';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import LinkButton from '@/elements/LinkButton.vue';
import Panel from '@/elements/Panel.vue';
import SecondaryButton from '@/elements/SecondaryButton.vue';

// icons
import {
	IconArrowDown,
	IconArrowLeft,
	IconArrowRight,
	IconArrowUp,
	IconArrowsShuffle,
	IconTrendingUp,
	IconX,
} from '@tabler/icons-vue';

// component constants
const { t } = useI18n();
const router = useRouter();

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
const isFirstPage = computed(() => page.value == 0);
const isLastPage = computed(() => (page.value+1)*listLength >= reordered.value.length);
</script>
