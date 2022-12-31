<template>
  <img
    v-if="photoUrl"
    class="rounded-full bg-spring-600"
    :class="{
      'w-6 h-6': size === sizes.sm,
      'w-10 h-10': size === sizes.md,
      'w-32 h-32': size === sizes.lg,
    }"
    :src="photoUrl"
    alt="Avatar"
  />
  <figure
    v-else-if="name"
    class="rounded-full bg-spring-600"
    :class="{
      'w-6 h-6': size === sizes.sm,
      'w-10 h-10': size === sizes.md,
      'w-32 h-32': size === sizes.lg,
    }"
    alt="Avatar"
  >
    {{ initials(name) }}
  </figure>
  <figure
    v-else
    class="rounded-full bg-spring-600"
    :class="{
      'w-6 h-6': size === sizes.sm,
      'w-10 h-10': size === sizes.md,
      'w-32 h-32': size === sizes.lg,
    }"
    alt="Avatar"
  >
    <ion-icon :icon="person" />
  </figure>
</template>

<script setup>
import { initials } from '@/utils.js';
import { person } from 'ionicons/icons';

// inherited properties
defineProps({
  photoUrl: String, // actual url of a profile image
  name:     String, // name of the user
  size:     String, // avatar size: sm | md | lg
});

// available avatar sizes
const sizes = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
}
</script>
