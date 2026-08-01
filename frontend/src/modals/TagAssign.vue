<template>
	<modal-dialog
		:active="active"
		:title="t('modal.tags')"
		size="xl2"
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
						:placeholder="t('placeholder.searchTagName')"
					/>
				</label>
				<div class="overflow-y-scroll flex flex-col gap-2">
					<label v-for="tag in filteredTags" :key="tag" class="flex items-center gap-2">
						<input
							v-model="selectedTags"
							:value="tag"
							type="checkbox"
							class="w-6 h-6 ml-2"
						/>
						{{ t(`tag.${tag}`) }}
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
						{{ t(`tag.${tag}`) }}
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
	</modal-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { sortTags } from '@/utils.js';
import ModalDialog from '@/elements/ModalDialog.vue';
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
const loc = locale.value.substring(0, 2);

// user input properties
const selectedTags = ref<string[]>([]);
const searchInput = ref('');

// inherited properties
const props = defineProps({
	active:       Boolean, // state of modal display, true to show modal
	tags:         { type: Array as PropType<string[]>, default: () => [] },  // list of all available tags
	assignedTags: { type: Array as PropType<string[]>, default: () => [] },  // already assigned tags
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
	if (searchInput.value == '') return props.tags;
	const search = searchInput.value.toLowerCase();
	return props.tags.filter(tag => t(`tag.${tag}`).toLowerCase().indexOf(search) !== -1);
});

// show selected tags sorted by their translated label
const sortedSelectedTags = computed(() => sortTags(selectedTags.value, loc));
</script>
