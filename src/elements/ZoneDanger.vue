<template>
  <div class="
    relative rounded-sm border-rose-400 border-2 flex flex-col gap-4 p-4
    dark:border-rose-800
  ">
    <div class="
      absolute -top-3 left-2.5 bg-blade-100 text-rose-500 uppercase tracking-widest text-sm px-1.5
      dark:bg-blade-850
    ">{{ label }}</div>
    <slot></slot>
  </div>
</template>

<script setup>
defineProps({
  label: String
})
</script>
