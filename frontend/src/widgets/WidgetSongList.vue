<template>
	<panel-box v-if="songs?.length > 0">
		<div class="flex justify-between items-start">
			<div class="text-2xl">
				{{ t('widget.' + order) }} {{ t('page.songs', 2) }}
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
				@click="router.push({ name: 'song-show', params: { id: song.entity.slug }})"
			>
				<div class="flex">
					<figure
						class="flex justify-center items-center bg-spring-700 text-white font-semibold py-1 w-8"
						:title="t('title.songTuning')"
					>
						<div class="-mt-0.5">{{ song.entity.key }}</div>
					</figure>
					<figure
						v-if="order == SortOrder.Popular"
						class="flex justify-center items-center bg-blade-300 dark:bg-blade-700 font-semibold py-1 w-12"
						:title="t('title.songOccuredOn', { num: song.popularity })"
					>
						<div class="-mt-0.5">{{ song.popularity }}</div>
						<icon-x class="w-3 h-3 stroke-2 -mr-1" />
					</figure>
					<figure
						v-if="order == SortOrder.Newest || order == SortOrder.Oldest"
						class="flex justify-center items-center bg-blade-300 dark:bg-blade-700 font-semibold py-1 w-12"
						:title="song.entity.year ? t('title.songPublishedIn', { year: song.entity.year }) : t('title.noYear')"
					>
						<div class="-mt-0.5">{{ song.entity.year ? song.entity.year : '—' }}</div>
					</figure>
				</div>
				<div class="flex flex-col overflow-hidden">
					<div class="-mt-1 truncate">{{ song.entity.title }}</div>
					<div class="text-sm text-blade-500 -mt-1 truncate">{{ song.entity.subtitle }}</div>
				</div>
			</div>
		</div>
		<div class="flex flex-wrap gap-1">
			<secondary-button @click="shuffleSongs">
				<icon-arrows-shuffle class="w-5 h-5 stroke-1.5" />
				{{ t('button.shuffle') }}
			</secondary-button>
			<secondary-button v-if="order != SortOrder.Newest" @click="newestSongs">
				<icon-arrow-up class="w-5 h-5 stroke-1.5" />
				{{ t('widget.newest') }}
			</secondary-button>
			<secondary-button v-if="order == SortOrder.Newest" @click="oldestSongs">
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
	</panel-box>
</template>

<script setup lang="ts">
import { injectStrict, setlistsKey, songsKey } from '@/keys';
import { SortOrder } from '@/definitions';
import { isSlide } from '@/utils.js';
import { ref, computed } from 'vue';
import type { Song } from '@backend/models';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import LinkButton from '@/elements/LinkButton.vue';
import PanelBox from '@/elements/PanelBox.vue';
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

// injected properties
const songs = injectStrict(songsKey);
const setlists = injectStrict(setlistsKey);

// list data
const order      = ref<SortOrder>(SortOrder.Newest);
const reordered  = ref<(Song & { popularity?: number })[]>([]);
const page       = ref(0);
const listLength = 6;

// sort song list
const shuffleSongs = () => {
	page.value = 0;
	order.value = SortOrder.Random;
	let list = songs.value;
	for (let i = list.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[list[i], list[j]] = [list[j], list[i]];
	}
	reordered.value = [...list];
};
const newestSongs = () => {
	page.value = 0;
	order.value = SortOrder.Newest;
	reordered.value = songs.value.filter(s => (s.entity.year ?? 0) > 0).sort(
		(a, b) => ((a.entity.year ?? 0) < (b.entity.year ?? 0)) ? 1 : (((b.entity.year ?? 0) < (a.entity.year ?? 0)) ? -1 : 0)
	);
	return reordered.value;
};
const oldestSongs = () => {
	page.value = 0;
	order.value = SortOrder.Oldest;
	reordered.value = songs.value.filter(s => (s.entity.year ?? 0) > 0).sort(
		(a, b) => ((a.entity.year ?? 0) > (b.entity.year ?? 0)) ? 1 : (((b.entity.year ?? 0) > (a.entity.year ?? 0)) ? -1 : 0)
	);
};
const popularSongs = () => {
	page.value = 0;
	order.value = SortOrder.Popular;
	let list: Record<string, number> = {};
	setlists.value.forEach(setlist => {
		if (setlist.entity.entries) {
			setlist.entity.entries.forEach(song => {
				if (isSlide(song)) return;
				if (!list.hasOwnProperty(song.id)) {
					list[song.id] = 1;
				} else {
					list[song.id]++;
				}
			});
		}
	});
	var idList: [string, number][] = [];
	for (var id in list) {
		idList.push([id, list[id]]);
	}
	let orderedSongIds = idList.sort((a, b) => b[1] - a[1]).reduce((a: string[], c) => a.concat(c[0]), []);
	reordered.value = songs.value
		.filter(s => orderedSongIds.includes(s.id))
		.map(s => Object.assign({popularity: list[s.id]}, s))
		.sort((a, b) => ((a.popularity ?? 0) < (b.popularity ?? 0)) ? 1 : (((b.popularity ?? 0) < (a.popularity ?? 0)) ? -1 : 0));
};

// handle pagination
const songlist = computed(() => {
	const list = reordered.value.length > 0 ? reordered.value : newestSongs();
	return list.slice(page.value*listLength, (page.value+1)*listLength);
});
const isFirstPage = computed(() => page.value == 0);
const isLastPage = computed(() => (page.value+1)*listLength >= reordered.value.length);
</script>
