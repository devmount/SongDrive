<template>
  <div class="
    relative min-w-[50vw] rounded-sm border-blade-400 border-2 flex flex-col gap-4 p-4
    dark:border-blade-800
  ">
    <!-- label -->
    <div class="
      absolute -top-3 left-2.5 uppercase tracking-widest text-sm px-1.5
      bg-blade-100 dark:bg-blade-850 text-blade-500
    ">{{ label }}</div>
    <!-- close button -->
    <div
      v-if="closable"
      class="bg-blade-100 dark:bg-blade-850 text-blade-500 cursor-pointer absolute -top-3 -right-2"
      @click="emit('close')"
    >
      <icon-x class="w-5 h-5" />
    </div>
    <!-- content -->
    <slot></slot>
  </div>
</template>

<script setup>
// icons
import { IconX } from '@tabler/icons-vue';

// component properties
defineProps({
  label:    String,
  closable: Boolean,
})

// component emits
const emit = defineEmits(['close']);
</script>
