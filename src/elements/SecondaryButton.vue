<template>
  <button
    class="
      py-2 px-3 rounded-sm shadow-md flex justify-center items-center gap-2
      hover:bg-opacity-80 hover:shadow-l disabled:opacity-30 disabled:shadow-none hover:disabled:bg-opacity-100
    "
    :class="{
      'bg-blade-400 text-white dark:bg-blade-700': !type,
      'text-rose-600 bg-blade-350 dark:text-rose-500 dark:bg-blade-750': type === types.danger
    }"
  >
    <slot></slot>
  </button>
</template>

<script setup>
defineProps({
  type: String
})

const types = {
  danger: 'danger'
}
</script>
