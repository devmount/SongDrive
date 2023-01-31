<template>
	<div
		class="rounded text-sm flex items-center bg-blade-300 dark:bg-blade-750 hover:bg-spring-700 gap-2 py-0.5 px-2"
	>
		<slot>
			<tag-icon class="shrink-0 w-4 h-4 stroke-1.5" />
			<div v-if="tag" class="whitespace-nowrap">
				{{ tag[locale] ? tag[locale] : tag.key }}
			</div>
			<x-icon v-if="closable" class="cursor-pointer w-4 h-4 stroke-1.5"  @click="emit('close')" />
		</slot>
	</div>
</template>

<script setup>
import { useI18n } from "vue-i18n";

// icons
import { TagIcon, XIcon } from 'vue-tabler-icons';

// component constants
const { locale } = useI18n({ useScope: 'global' });

// component properties
const props = defineProps({
	tag:      Object,  // tag to display
	closable: Boolean, // display x to emit close event
});

// component emits
const emit = defineEmits(['close']);
</script>
