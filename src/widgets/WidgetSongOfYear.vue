<template>
	<panel v-if="songs && setlists.length > 0">
		<div class="flex justify-between">
			<div class="text-2xl">
				{{ t('widget.songOfYear') }}
			</div>
			<div class="flex gap-1">
				<secondary-button
					:disabled="isFirstPage"
					@click="!isFirstPage ? page-- : null"
				>
					<icon-arrow-left />
				</secondary-button>
				<secondary-button
					:disabled="isLastPage"
					@click="!isLastPage ? page++ : null"
				>
					<icon-arrow-right />
				</secondary-button>
			</div>
		</div>
		<div class="flex flex-col">
			<div
				v-for="obj in songlist"
				:key="obj.year"
				class="flex gap-2 cursor-pointer p-2 hover:bg-blade-200 dark:hover:bg-blade-800"
				@click="router.push({ name: 'song-show', params: { id: obj.song.id}})"
			>
				<div class="flex">
					<figure
						class="flex justify-center items-center bg-spring-700 text-white font-semibold py-1 w-12"
						:title="t('title.songTuning')"
					>
						<div class="-mt-0.5">{{ obj.year }}</div>
					</figure>
					<figure
						class="flex justify-center items-center bg-blade-300 dark:bg-blade-700 font-semibold py-1 w-12"
						:title="t('title.songOccuredOn', { num: obj.count })"
					>
						<div class="-mt-0.5">{{ obj.count }}</div>
						<icon-x class="w-3 h-3 stroke-2 -mr-1" />
					</figure>
				</div>
				<div class="flex flex-col overflow-hidden">
					<div class="-mt-1 truncate">{{ obj.song.title }}</div>
					<div class="text-sm text-blade-500 -mt-1 truncate">{{ obj.song.subtitle }}</div>
				</div>
			</div>
		</div>
		<link-button class="mt-auto" @click="router.push({ name: 'songs' })">
			{{ t('widget.showAllSongs') }}
			<icon-arrow-right />
		</link-button>
	</panel>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import LinkButton from '@/elements/LinkButton';
import Panel from '@/elements/Panel';
import SecondaryButton from '@/elements/SecondaryButton';

// icons
import {
	IconArrowLeft,
	IconArrowRight,
	IconX,
} from '@tabler/icons-vue';

// component constants
const { t } = useI18n();
const router = useRouter();

// component properties
const props = defineProps({
	setlists: Array,
  songs: Object,
});

// list data
const page       = ref(0);
const listLength = 7;

// build song of year list
const songOfYear = computed(() => {
	let list = {};
	props.setlists.forEach(setlist => {
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
	let songsToYear = [];
	for (let year in list) {
		let maxId = '', maxCount = 0;
		for (let id in list[year]) {
			if (list[year][id] > maxCount) {
				maxId = id;
				maxCount = list[year][id];
			}
		}
		songsToYear.push({ year: year, song: props.songs[maxId], count: maxCount });
	}
	return songsToYear;
});

// handle pagination
const songlist = computed(() => {
	const list = songOfYear.value.sort((a,b) => b.year - a.year);
	return list.slice(page.value*listLength, (page.value+1)*listLength);
});
const isFirstPage = computed(() => page.value == 0);
const isLastPage = computed(() => (page.value+1)*listLength >= songOfYear.value.length);
</script>
