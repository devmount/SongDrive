<template>
	<div
		class="cursor-pointer rounded text-sm flex items-center bg-blade-300 dark:bg-blade-750 hover:bg-spring-700 gap-2 py-0.5 px-2"
	>
		<ion-icon :icon="pricetagOutline" class="w-4 h-4" />
		<div class="flex flex-nowrap">{{ tag[locale] ? tag[locale] : tag.key }}</div>
	</div>
</template>

<script setup>
import { pricetagOutline } from 'ionicons/icons';
import { useI18n } from "vue-i18n";
const { locale } = useI18n({ useScope: 'global' });

// inherited properties
const props = defineProps({
	tag: Object, // tag to display
});
</script>
