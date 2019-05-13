<template>
  <div class="modal modal-lg modal-full modal-setlist-presentation" :class="{ active: active }">
    <a href="#" class="modal-overlay" aria-label="Close" @click.prevent="$emit('closed')"></a>
    <div class="modal-container">
      <div v-if="songs && songs.length > 0" class="modal-body">
        <hooper :settings="settings" ref="presentation" class="presentation" id="presentation" @updated="maximizeFontsize" @slide="updatePosition">
          <slide v-for="(song, i) in songs" :key="i" :index="i">
            <SongContent
              :content="song.content"
              :chords="chords"
              :tuning="0"
              :tunes="tunes"
              :presentation="true"
              :ref="'songcontent' + i"
            />
          </slide>
          <hooper-pagination slot="hooper-addons"></hooper-pagination>
        </hooper>
      </div>
      <div class="modal-footer">
        <label class="form-switch">
          <input type="checkbox" v-model="autoSync">
          <i class="form-icon"></i><span class="hide-lg"> AutoSync</span>
        </label>
        <a class="btn btn-link btn-gray" href="#" aria-label="Maximize" @click.prevent="maximizeFontsize">
          <i class="icon ion-md-refresh"></i>
        </a>
        <a class="btn btn-link btn-gray" href="#" aria-label="Cancel" @click.prevent="$emit('closed')">
          <i class="icon ion-md-close"></i>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
// get slider component
import { Hooper, Slide, Pagination as HooperPagination } from 'hooper'
import 'hooper/dist/hooper.css'
// get internal components
import SongContent from '@/components/SongContent.vue'

export default {
  name: 'setlist-present',
  components: {
    Hooper,
    Slide,
    HooperPagination,
    SongContent
  },
  props: {
    active: Boolean,
    songs: Array,
    position: Number,
    chords: Boolean,
    tunes: Array
  },
  data () {
    return {
      settings: {
        infiniteScroll: false,
        keysControl: true,
      },
      autoSync: false,
    }
  },
  methods: {
    maximizeFontsize() {
      let self = this
      // wait for dom to be ready
      this.$nextTick(function () {
        // maximize content of each song/slide
        for (let i = 0; i < self.songs.length; i++) {
          self.$refs['songcontent' + i][0].maximizeFontsize()
        }
      })
    },
    updatePosition(payload) {
      this.$emit('updatePosition', payload.currentSlide)
    }
  },
  watch: {
    active() {
      // maximize fontsize when presentation view is opened
      if (this.active) {
        let self = this
        // wait for all compontents to be mounted
        this.$nextTick(function () {
          self.$refs.presentation.restart()
        })
      }
    },
    position() {
      if (this.autoSync) {
        this.$refs.presentation.slideTo(this.position)
      }
    },
    autoSync() {
      if (this.autoSync) {
        this.$refs.presentation.slideTo(this.position)
      }
    },
  }
}
</script>

<style lang="scss">
$black-color: #000000;

.modal-setlist-presentation {

  &.modal-lg.modal-full {
    .verse::before {
      background: $black-color;
    }
  }

  .modal-container .modal-header,
  .modal-container .modal-body {
    padding-bottom: 0;
    padding-left: 0;
    padding-right: 0;
  }
  
}
</style>
