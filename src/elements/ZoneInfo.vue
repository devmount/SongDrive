<template>
<div class="
  relative rounded-sm border-blade-400 border-2 flex flex-col gap-4 p-4
  dark:border-blade-800
">
  <!-- label -->
  <div class="
    -mt-7 px-1.5 -ml-1.5 inline-block uppercase max-w-max tracking-widest text-sm
    bg-blade-100 dark:bg-blade-850 text-blade-500
  ">
    <slot name="label"></slot>
  </div>
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
  closable: Boolean,
});

// component emits
const emit = defineEmits(['close']);
</script>
