<template>
	<div class="flex items-baseline gap-2 select-none">
		<img
      src="@/assets/logo.svg"
      alt="Logo of SongDrive Song Management Tool"
      :class="featured ? 'w-12': 'w-8'"
    />
		<div
      class="text-spring-400 leading-5 tracking-wide uppercase"
      :class="featured ? 'text-[2.1rem]': 'text-2xl'"
    >
      {{ t('app.name') }}
    </div>
	</div>
  <div v-if="showVersion" class="text-xs text-zinc-500 text-right font-medium">v{{ version }}</div>
</template>

<script setup>
import { inject } from 'vue';
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const version = inject('version');

defineProps({
  featured:    Boolean, // make logo big and stand out
  showVersion: Boolean, // show version hint
});
</script>
