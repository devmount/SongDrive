<template>
	<modal :active="active" :title="t('modal.tags')" size="xl" @closed="emit('closed')">
		<div class="grid grid-cols-2 gap-4">
			<div class="flex flex-col gap-4">
				<label class="relative">
					<filter-icon class="absolute top-2 left-2 w-5 h-5 stroke-1.5 text-blade-500" />
					<input
						type="search"
						v-model="searchInput"
						class="w-full pl-8"
						:placeholder="t('placeholder.searchTagName')"
					/>
				</label>
				<div class="h-64 overflow-y-scroll flex flex-col gap-2">
					<label v-for="tag in filteredTags" :key="tag.key" class="flex items-center gap-2">
						<input
							v-model="selectedTags"
							:value="tag.key"
							type="checkbox"
							class="w-6 h-6 ml-2"
						/>
						{{ tag[locale] ? tag[locale] : tag.key }}
					</label>
				</div>
			</div>
			<div>
				<div v-if="selectedTags.length == 0" class="flex flex-col items-center gap-2">
					<tags-icon class="w-12 h-12 stroke-1 text-blade-500" />
					<div class="text-lg">{{ t('text.noTagsSelected') }}</div>
					<div class="text-blade-500 text-center w-4/5">{{ t('text.selectSomeTags') }}</div>
				</div>
				<div v-else class="flex flex-col gap-2">
					<div class="text-lg text-center mb-2">{{ t('text.selection') }}</div>
					<div v-for="tag in selectedTags" :key="tag" class="flex items-center gap-2">
						<tag-icon class="w-4 h-4" />
						{{ tags[tag][locale] ? tags[tag][locale] : tag }}
						<button
							class="ml-auto"
							@click="selectedTags = selectedTags.filter(k => k !== tag)"
						>
							<x-icon class="w-4 h-4 text-blade-500" />
						</button>
					</div>
				</div>
			</div>
		</div>
		<div class="flex flex-col justify-end items-center gap-4 mt-4 2xs:flex-row">
			<button class="px-3 py-2 text-blade-500" aria-label="Cancel" @click.prevent="emit('closed')">
				{{ t('button.cancel') }}
			</button>
			<primary-button @click="emit('assign', selectedTags)">
				{{ t('button.assign') }}
				<arrow-back-icon class="w-6 h-6 stroke-1.5" />
			</primary-button>
		</div>
	</modal>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from "vue-i18n";
import Modal from '@/elements/Modal';
import PrimaryButton from '@/elements/PrimaryButton';

// icons
import {
	ArrowBackIcon,
	TagsIcon,
	TagIcon,
	XIcon,
	FilterIcon
} from "vue-tabler-icons";

// component constants
const { t, locale } = useI18n();

// user input properties
const selectedTags = ref([]);
const searchInput = ref('');

// inherited properties
const props = defineProps({
	active: Boolean, // state of modal display, true to show modal
	tags:   Object,  // list of all available tags
});

// emits
const emit = defineEmits(['closed', 'assign']);

// computed: filter song list by search query
const filteredTags = computed(() => {
	let tags = {};
	if (searchInput.value != '') {
		for (const key in props.tags) {
			if (props.tags.hasOwnProperty(key)) {
				const tag = props.tags[key];
				let search = searchInput.value.toLowerCase();
				// search in tag labels
				let label = tag[locale.value] ? tag[locale.value] : key;
				if (label.toLowerCase().indexOf(search) !== -1) {
					tags[key] = tag;
				}
			}
		}
		return tags;
	} else {
		return props.tags;
	}
});
</script>
