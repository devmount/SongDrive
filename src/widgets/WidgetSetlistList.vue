<template>
	<panel v-if="setlists?.length > 0">
		<div class="flex justify-between">
			<div class="text-2xl">
				{{ t('widget.' + keyByValue(sortBy, order)) }} {{ t('page.setlists') }}
			</div>
			<div class="flex gap-1">
				<secondary-button
					:disabled="isFirstPage"
					@click="!isFirstPage ? page-- : null"
				>
					<ion-icon :icon="arrowBack" />
				</secondary-button>
				<secondary-button
					:disabled="isLastPage"
					@click="!isLastPage ? page++ : null"
				>
					<ion-icon :icon="arrowForward" />
				</secondary-button>
			</div>
		</div>
		<div class="flex flex-col">
			<div
				v-for="(setlist, i) in setlistlist"
				:key="i"
				class="flex gap-2 cursor-pointer p-2 hover:bg-blade-200 dark:hover:bg-blade-800"
				@click="router.push({ name: 'setlist-show', params: { id: setlist.id }})"
			>
				<div class="flex">
					<figure
						class="flex justify-center items-center bg-blade-300 dark:bg-blade-700 font-semibold py-1 w-8"
						:title="t('title.setlistContains', { num: setlist.songs.length })"
					>
						<div class="-mt-0.5">{{ setlist.songs.length }}</div>
					</figure>
				</div>
				<div class="flex flex-col overflow-hidden">
					<div class="-mt-1 flex gap-1 items-center">
						<div class="truncate">{{ setlist.title }}</div>
						<ion-icon v-if="setlist.private" :icon="lockClosedOutline" class="w-5 h-5 text-spring-600 mt-1" />
					</div>
					<div class="text-sm text-blade-500 -mt-1 truncate">{{ setlist.date }}</div>
				</div>
			</div>
		</div>
		<div class="flex flex-wrap gap-1">
			<secondary-button v-if="order != sortBy.newest" @click="newestSetlists">
				<ion-icon :icon="arrowUp" />
				{{ t('widget.newest') }}
			</secondary-button>
			<secondary-button v-if="order == sortBy.newest" @click="oldestSetlists">
				<ion-icon :icon="arrowDown" />
				{{ t('widget.oldest') }}
			</secondary-button>
		</div>
		<link-button class="mt-auto" @click="router.push({ name: 'setlists' })">
			{{ t('widget.showAllSetlists') }}
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
	lockClosedOutline,
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
}

// list data
const order      = ref(sortBy.newest);
const reordered  = ref([]);
const page       = ref(0);
const listLength = 6;

// sort song list
const newestSetlists = () => {
	page.value = 0;
	order.value = sortBy.newest;
	reordered.value = props.setlists.filter(s => s.date != '').sort(
		(a,b) => (new Date(a.date) < new Date(b.date)) ? 1 : ((new Date(b.date) < new Date(a.date)) ? -1 : 0)
	);
	return reordered.value;
};
const oldestSetlists = () => {
	page.value = 0;
	order.value = sortBy.oldest;
	reordered.value = props.setlists.filter(s => s.date != '').sort(
		(a,b) => (new Date(a.date) > new Date(b.date)) ? 1 : ((new Date(b.date) > new Date(a.date)) ? -1 : 0)
	);
};

// handle pagination
const setlistlist = computed(() => {
	const list = reordered.value.length > 0 ? reordered.value : newestSetlists();
	return list.slice(page.value*listLength, (page.value+1)*listLength);
});
const isFirstPage = computed(() => page.value == 0);
const isLastPage = computed(() => (page.value+1)*listLength >= reordered.value.length);
</script>
