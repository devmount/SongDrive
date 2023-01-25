<template>
	<div
    class="flex items-center gap-2 font-medium select-none"
    :class="{
      'flex-col 2xs:flex-row 2xs:items-baseline 2xs:font-normal': featured,
      'items-baseline': !featured
    }"
  >
		<img
      src="@/assets/logo.svg"
      alt="Logo of SongDrive Song Management Tool"
      :class="featured ? 'w-12': 'w-8'"
    />
		<div
      class="text-spring-600 leading-5 tracking-wide uppercase"
      :class="featured ? 'text-2xl 2xs:text-[2.1rem]': 'text-2xl'"
    >
      {{ t('app.name') }}
    </div>
	</div>
  <div v-if="showVersion" class="text-xs text-blade-500 text-right font-medium mt-1">
    v{{ version }}
  </div>
</template>

<script setup>
import { inject } from 'vue';
import { useI18n } from "vue-i18n";

// component constants
const { t } = useI18n();
const version = inject('version');

// component properties
defineProps({
  featured:    Boolean, // make logo big and stand out
  showVersion: Boolean, // show version hint
});
</script>
