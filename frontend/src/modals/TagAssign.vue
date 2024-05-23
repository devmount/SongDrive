<template>
	<modal
		:active="active"
		:title="t('modal.tags')"
		size="xl2"
		:child="true"
		@closed="emit('closed')"
	>
		<div class="grow grid grid-cols-1 grid-rows-2 xs:grid-cols-2 xs:grid-rows-1 gap-4">
			<div class="max-h-[calc(50vh_-_6rem)] xs:max-h-[calc(66.666667vh_-_8.25rem)] flex flex-col gap-4">
				<label class="relative">
					<icon-filter class="absolute top-2 left-2 w-5 h-5 stroke-1.5 text-blade-500" />
					<input
						type="search"
						v-model="searchInput"
						class="w-full pl-8"
						:placeholder="t('placeholder.searchTagName')"
					/>
				</label>
				<div class="overflow-y-scroll flex flex-col gap-2">
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
					<icon-tags class="w-12 h-12 stroke-1 text-blade-500" />
					<div class="text-lg">{{ t('text.noTagsSelected') }}</div>
					<div class="text-blade-500 text-center w-4/5">{{ t('text.selectSomeTags') }}</div>
				</div>
				<div v-else class="flex flex-col gap-2">
					<div class="text-lg text-center mb-2">{{ t('text.selection') }}</div>
					<div v-for="tag in sortedSelectedTags" :key="tag" class="flex items-center gap-2">
						<icon-tag class="w-4 h-4" />
						{{ tags[tag][locale] ? tags[tag][locale] : tag }}
						<button
							class="ml-auto"
							@click="selectedTags = selectedTags.filter(k => k !== tag)"
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
			<primary-button @click="emit('assign', selectedTags)">
				{{ t('button.assign') }}
				<icon-arrow-back class="w-6 h-6 stroke-1.5" />
			</primary-button>
		</div>
	</modal>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import Modal from '@/elements/Modal.vue';
import PrimaryButton from '@/elements/PrimaryButton.vue';

// icons
import {
	IconArrowBack,
	IconTags,
	IconTag,
	IconX,
	IconFilter
} from '@tabler/icons-vue';

// component constants
const { t, locale } = useI18n();

// user input properties
const selectedTags = ref([]);
const searchInput = ref('');

// inherited properties
const props = defineProps({
	active:       Boolean, // state of modal display, true to show modal
	tags:         Object,  // list of all available tags
	assignedTags: Array,   // already assigned tags
});
const initInput = () => {
	selectedTags.value = props.assignedTags ?? [];
};
onMounted(() => initInput());
watch(() => props.active, () => initInput());


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

// show selected tags sorted alphabeticaly
const sortedSelectedTags = computed(() => {
	return selectedTags.value.sort();
});
</script>
