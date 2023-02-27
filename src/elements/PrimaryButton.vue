<template>
  <button
    class="
      text-white py-2 px-3 rounded-sm shadow-m flex justify-center items-center gap-2
      hover:bg-opacity-80 hover:shadow-l disabled:opacity-30 disabled:shadow-none hover:disabled:bg-opacity-100
    "
    :class="{
      'bg-spring-600 dark:bg-spring-700': !type,
      'bg-rose-500': type === types.danger
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
