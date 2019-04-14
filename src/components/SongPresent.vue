<template>
  <div class="modal modal-lg modal-full" :class="{ active: active }">
    <a href="#" class="modal-overlay" aria-label="Close" @click.prevent="$emit('closed')"></a>
    <div class="modal-container">
      <div class="modal-header">
        <div class="modal-title h5">{{ title }}</div>
        <div class="modal-subtitle h6 text-gray">{{ subtitle }}</div>
      </div>
      <div class="modal-body" v-if="content">
        <SongContent :content="content" :chords="chords" :tuning="tuning" :tunes="tunes" />
      </div>
      <div class="modal-footer">
        <a class="btn btn-link btn-gray" href="#" aria-label="Cancel" @click.prevent="$emit('closed')">Close</a>
      </div>
    </div>
  </div>
</template>

<script>
// get components
import SongContent from '@/components/SongContent.vue'

export default {
  name: 'SongPresent',
  components: {
    SongContent
  },
  props: {
    active: Boolean,
    title: String,
    subtitle: String,
    content: String,
    chords: Boolean,
    tuning: Number,
    tunes: Array
  }
}
</script>

<style lang="scss">
$black-color: #000000;

.modal-lg.modal-full {
  .verse::before {
    background: $black-color;
  }
}
</style>
