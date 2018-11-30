<template>
  <div class="profile">
    <div class="off-canvas off-canvas-secondary">
      <div class="off-canvas-sidebar active">
        <button class="btn btn-primary d-block" @click="$router.go(-1)">
          <i class="icon icon-arrow-left"></i><span class="hide-lg"> back</span>
        </button>
      </div>
      <div class="off-canvas-content">
        <div class="container">
          <div class="columns">
            <div v-if="ready" class="column col-12">
              <h2>{{ song.title }}</h2>
              <h3>{{ song.subtitle }}</h3>
              <SongContent :content="song.content" />
              <footer>
                <p>{{ song.authors.join(' | ')}}</p>
                <p>
                  <router-link v-for="tag in song.tags" :key="tag" :to="{ name: 'songs-tag', params: { tag: tag }}" class="mr-2">
                    <span class="label label-primary px-2 py-1">
                      <i class="icon icon-bookmark"></i>
                      {{ tag }}
                    </span>
                  </router-link>
                </p>
                <div>CCLI Song Number: <a :href="'https://songselect.ccli.com/Songs/' + song.ccli">{{ song.ccli }}</a></div>
                <div>&copy; {{song.year}} {{song.publisher}}</div>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// get components
import SongContent from '@/components/SongContent.vue'
// get database object authorized in config.js
import { db } from '../firebase'

export default {
  name: 'song-show',
  components: {
    SongContent
  },
  firestore () {
    return {
      song: {
        ref: db.collection('songs').doc(this.$route.params.id),
        resolve: () => { this.ready = true },
        reject: () => { this.ready = true }
      },
    }
  },
  data () {
    return {
      chords: true,
      transposed: 0,
      ready: false
    }
  }
}
</script>

<style lang="scss">
  footer {
    padding-top: 2.5em;
    padding-bottom: 2em;
    font-size: .8em;
  }
</style>