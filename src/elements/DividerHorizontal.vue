<template>
  <div class="flex gap-2 items-center my-2">
    <div class="h-px bg-blade-200 dark:bg-blade-800 w-full"></div>
    <div v-if="label" class="text-blade-500 uppercase text-sm tracking-wider">{{ label }}</div>
    <div v-if="label" class="h-px bg-blade-200 dark:bg-blade-800 w-full"></div>
  </div>
</template>

<script setup>
defineProps({
  label: String // optional text to display in divider
})
</script>
