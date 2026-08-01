<template>
	<modal-dialog
		:active="active"
		:title="t('modal.translations')"
		size="xl3"
		:child="true"
		@closed="emit('closed')"
	>
		<div class="grow grid grid-cols-1 grid-rows-2 xs:grid-cols-2 xs:grid-rows-1 gap-4">
			<div class="max-h-[calc(50vh-6rem)] xs:max-h-[calc(66.666667vh-8.25rem)] flex flex-col gap-4">
				<label class="relative">
					<icon-filter class="absolute top-2 left-2 w-5 h-5 stroke-1.5 text-blade-500" />
					<input
						type="search"
						v-model="searchInput"
						class="w-full pl-8"
						:placeholder="t('placeholder.searchSongTitle')"
					/>
				</label>
				<div class="overflow-y-scroll h-full flex flex-col gap-2">
					<label v-for="fsong in filteredSongs" :key="fsong.id" class="flex items-center gap-2">
						<input
							v-model="selectedSongs"
							:value="fsong.id"
							type="checkbox"
							class="w-6 h-6 ml-2"
						/>
						<div class="truncate">
							{{ fsong.entity.title }}
							<span class="text-blade-500">{{ fsong.entity.subtitle }}</span>
						</div>
					</label>
				</div>
			</div>
			<div>
				<div v-if="selectedSongs.length == 0" class="flex flex-col items-center gap-2">
					<icon-language class="w-12 h-12 stroke-1 text-blade-500" />
					<div class="text-lg">{{ t('text.noSongsSelected') }}</div>
					<div class="text-blade-500 text-center w-4/5">{{ t('text.selectSomeTranslations') }}</div>
				</div>
				<div v-else class="flex flex-col gap-2">
					<div class="text-lg text-center mb-2">{{ t('text.selection') }}</div>
					<div v-for="tsong in selectedSongs" :key="tsong" class="flex items-center gap-3">
						<figure class="shrink-0 flex justify-center items-center bg-blade-300 dark:bg-blade-700 font-semibold py-1 w-12">
							<div class="-mt-0.5 uppercase">{{ findSong(tsong)?.language }}</div>
						</figure>
						<div class="flex flex-col overflow-hidden">
							<div class="-mt-1 truncate">{{ findSong(tsong)?.title }}</div>
							<div class="text-sm text-blade-500 -mt-1 truncate">{{ findSong(tsong)?.subtitle }}</div>
						</div>
						<button
							class="ml-auto"
							@click="selectedSongs = selectedSongs.filter(k => k !== tsong)"
						>
							<icon-x class="w-4 h-4 text-blade-500" />
						</button>
					</div>
				</div>
			</div>
		</div>
		<div class="flex flex-col justify-end items-center gap-4 2xs:flex-row">
			<button class="px-3 py-2 text-blade-500" aria-label="Cancel" @click.prevent="emit('closed')">
				{{ t('button.cancel') }}
			</button>
			<primary-button @click="emit('assign', selectedSongs)">
				{{ t('button.assign') }}
				<icon-arrow-back class="w-6 h-6 stroke-1.5" />
			</primary-button>
		</div>
	</modal-dialog>
</template>

<script setup lang="ts">
import { injectStrict, songsKey } from '@/keys';
import { ref, computed, onMounted, watch, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import ModalDialog from '@/elements/ModalDialog.vue';
import PrimaryButton from '@/elements/PrimaryButton.vue';

// icons
import {
	IconArrowBack,
	IconLanguage,
	IconX,
	IconFilter
} from '@tabler/icons-vue';

// component constants
const { t } = useI18n();

// global properties
const songs = injectStrict(songsKey);

// user input properties
const selectedSongs = ref<string[]>([]);
const searchInput = ref('');

// inherited properties
const props = defineProps({
	active:        Boolean, // state of modal display, true to show modal
	language:      String,  // language key of song
	id:            String,  // identifier of original song
	assignedSongs: { type: Array as PropType<string[]>, default: () => [] },   // already assigned songs
});
const initInput = () => {
	selectedSongs.value = props.assignedSongs ?? [];
};
onMounted(() => initInput());
watch(() => props.active, () => initInput());

// emits
const emit = defineEmits(['closed', 'assign']);

// computed: filter song list by search query
const filteredSongs = computed(() => {
	return songs.value.filter(s => {
		// exclude same language songs
		if (s.entity.language === props.language) return false;
		// handle filter input: search in title, subtitle and content
		if (searchInput.value === '') return true;
		const search = searchInput.value.toLowerCase();
		return (
			s.entity.title.toLowerCase().includes(search) ||
			(s.entity.subtitle ?? '').toLowerCase().includes(search) ||
			s.entity.content.toLowerCase().includes(search)
		);
	});
});

// find a song's entity by id, for the selection panel
const findSong = (id: string) => songs.value.find(s => s.id === id)?.entity;
</script>
