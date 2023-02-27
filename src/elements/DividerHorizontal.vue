<template>
  <div class="flex gap-2 items-center mt-4 mb-2">
    <div class="h-px bg-blade-300 dark:bg-blade-800 w-full"></div>
    <div v-if="label" class="text-blade-500 uppercase text-sm tracking-wider">{{ label }}</div>
    <div v-if="label" class="h-px bg-blade-300 dark:bg-blade-800 w-full"></div>
  </div>
</template>

<script setup>
defineProps({
  label: String // optional text to display in divider
})
</script>
