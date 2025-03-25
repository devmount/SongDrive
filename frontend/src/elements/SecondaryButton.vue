<template>
  <button
    class="
      py-2 px-3 rounded-sm shadow-md flex justify-center items-center gap-2
			hover:shadow-l disabled:opacity-30 disabled:shadow-none
    "
    :class="{
      'bg-blade-400 hover:bg-blade-400/75 hover:disabled:bg-blade-400 text-white dark:bg-blade-700 dark:hover:bg-blade-700/75 dark:hover:disabled:bg-blade-700': !type,
      'text-rose-600 bg-blade-350 hover:bg-blade-350/75 hover:disabled:bg-blade-350 dark:text-rose-500 dark:bg-blade-750 dark:hover:bg-blade-750/75 dark:hover:disabled:bg-blade-750': type === types.danger
    }"
  >
    <slot></slot>
  </button>
</template>

<script setup>
// component properties
defineProps({
  type: String
})

// available additional button types
const types = {
  danger: 'danger'
}
</script>
