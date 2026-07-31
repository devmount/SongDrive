<template>
	<div
		class="rounded-sm text-sm flex items-center bg-blade-300 dark:bg-blade-750 hover:bg-spring-700 gap-2 py-0.5 px-2"
	>
		<slot>
			<icon-tag class="shrink-0 w-4 h-4 stroke-1.5" />
			<div v-if="tag" class="whitespace-nowrap">
				{{ t(`tag.${tag}`) }}
			</div>
			<icon-x v-if="closable" class="cursor-pointer w-4 h-4 stroke-1.5"  @click="emit('close')" />
		</slot>
	</div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

// icons
import { IconTag, IconX } from '@tabler/icons-vue';

const { t } = useI18n();

// component properties
const props = defineProps({
	tag:      String,  // tag to display
	closable: Boolean, // display x to emit close event
});

// component emits
const emit = defineEmits(['close']);
</script>
