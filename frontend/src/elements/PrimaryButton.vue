<template>
  <button
    class="
      text-white py-2 px-3 rounded-sm shadow-m flex justify-center items-center gap-2
      hover:shadow-l disabled:opacity-30 disabled:shadow-none
    "
    :class="{
      'bg-spring-600 hover:bg-spring-600/75 hover:disabled:bg-spring-600 dark:bg-spring-700 hover:dark:bg-spring-700/75 hover:disabled:dark:bg-spring-700': !type,
      'bg-rose-500 hover:bg-rose-500/75 hover:disabled:bg-rose-500': type === types.danger
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
