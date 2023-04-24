<template>
  <div class="
    relative sm:min-w-[40vw] rounded-sm border-blade-400 border-2 flex flex-col gap-4 p-4
    dark:border-blade-800
  ">
    <!-- label -->
    <div class="
      sm:absolute sm:-top-3 sm:left-2.5 uppercase tracking-widest text-sm sm:px-1.5
      sm:bg-blade-100 sm:dark:bg-blade-850 text-blade-500
    ">{{ label }}</div>
    <!-- close button -->
    <div
      v-if="closable"
      class="bg-blade-100 dark:bg-blade-850 text-blade-500 cursor-pointer absolute -top-3 -right-2"
      @click="emit('close')"
      :title="t('tooltip.hideThisSection')"
    >
      <icon-x class="w-5 h-5" />
    </div>
    <!-- content -->
    <slot></slot>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

// icons
import { IconX } from '@tabler/icons-vue';

// component constants
const { t } = useI18n();

// component properties
defineProps({
  label:    String,
  closable: Boolean,
});

// component emits
const emit = defineEmits(['close']);
</script>
