<template>
	<panel v-if="setlists?.length > 0">
		<div class="flex justify-between items-start">
			<div class="text-2xl">
				{{ t('widget.' + keyByValue(sortBy, order)) }} {{ t('page.setlists', 2) }}
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
						<icon-lock v-if="setlist.private" class="w-5 h-5 stroke-1.5 text-spring-600 mt-1" />
					</div>
					<div class="text-sm text-blade-500 -mt-1 truncate">{{ humanDate(setlist.date, locale) }}</div>
				</div>
			</div>
		</div>
		<div class="flex flex-wrap gap-1">
			<secondary-button v-if="order != sortBy.newest" @click="newestSetlists">
				<icon-arrow-up class="w-5 h-5 stroke-1.5" />
				{{ t('widget.newest') }}
			</secondary-button>
			<secondary-button v-if="order == sortBy.newest" @click="oldestSetlists">
				<icon-arrow-down class="w-5 h-5 stroke-1.5" />
				{{ t('widget.oldest') }}
			</secondary-button>
		</div>
		<link-button class="mt-auto" @click="router.push({ name: 'setlists' })">
			{{ t('widget.showAllSetlists') }}
			<icon-arrow-right class="w-5 h-5 stroke-1.5" />
		</link-button>
	</panel>
</template>

<script setup>
import { keyByValue, humanDate } from '@/utils.js';
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
	IconLock,
} from '@tabler/icons-vue';

// component constants
const { t, locale } = useI18n();
const router = useRouter();

// component properties
const props = defineProps({
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
