<template>
  <div class="modal modal-lg modal-full modal-presentation" :class="{ active: active }">
    <a href="#" class="modal-overlay" aria-label="Close" @click.prevent="$emit('closed')"></a>
    <div class="modal-container">
      <div class="modal-header">
        <div class="modal-title h5">
          {{ title }}
          <span class="modal-subtitle h6 text-gray ml-3">{{ subtitle }}</span>
        </div>
      </div>
      <div v-if="content" class="modal-body">
        <SongContent
          :content="content"
          :chords="chords"
          :tuning="tuning"
          :tunes="tunes"
          :presentation="true"
          ref="songcontent"
        />
      </div>
      <div class="modal-footer">
        <a class="btn btn-link btn-gray" href="#" aria-label="maximize" @click.prevent="maximizeFontsize">
          <i class="icon icon-refresh"></i>
        </a>
        <a class="btn btn-link btn-gray" href="#" aria-label="Cancel" @click.prevent="$emit('closed')">
          <i class="icon icon-cross"></i>
        </a>
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
  },
  methods: {
    maximizeFontsize() {
      var songcontent = this.$refs.songcontent
      songcontent.maximizeFontsize()
    }
  }
}
</script>

<style lang="scss">
$black-color: #000000;

.modal-presentation {

  &.modal-lg.modal-full {
    .verse::before {
      background: $black-color;
    }
  }

  .modal-container .modal-header {
    padding-bottom: 0;
  }
  
}
</style>
