<template>
	<div
		class="cursor-pointer rounded text-sm flex items-center bg-blade-300 dark:bg-blade-750 hover:bg-spring-700 gap-2 py-0.5 px-2"
	>
		<slot>
			<tag-icon class="shrink-0 w-4 h-4 stroke-1.5" />
			<div v-if="tag" class="whitespace-nowrap">
				{{ tag[locale] ? tag[locale] : tag.key }}
			</div>
		</slot>
	</div>
</template>

<script setup>
import { useI18n } from "vue-i18n";

// icons
import { TagIcon } from 'vue-tabler-icons';

// component constants
const { locale } = useI18n({ useScope: 'global' });

// component properties
const props = defineProps({
	tag: Object, // tag to display
});
</script>
