<template>
	<div
    class="flex font-medium select-none"
    :class="{
      'gap-3 flex-col 2xs:flex-row items-center 2xs:items-baseline 2xs:font-normal': featured,
      'gap-2 items-baseline': !featured
    }"
  >
		<img
      src="@/assets/logo.svg"
      alt="Logo of SongDrive Song Management Tool"
      :class="featured ? 'w-12': 'w-8'"
    />
		<div
      class="text-spring-600 tracking-wide uppercase text-2xl"
      :class="{ '2xs:text-4xl': featured }"
    >
      {{ t('app.name') }}
    </div>
	</div>
  <div v-if="showVersion" class="text-xs text-blade-500 text-right font-medium mr-0.5">
    {{ version }}
  </div>
</template>

<script setup>
import { inject } from 'vue';
import { useI18n } from 'vue-i18n';

// component constants
const { t } = useI18n();
const version = inject('version');

// component properties
defineProps({
  featured:    Boolean, // make logo big and stand out
  showVersion: Boolean, // show version hint
});
</script>
