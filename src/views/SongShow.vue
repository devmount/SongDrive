<template>
  <div class="profile">
    <div class="off-canvas off-canvas-secondary">
      <div class="off-canvas-sidebar active">
        <button class="btn btn-primary d-block stretch" @click="$router.go(-1)">
          <i class="icon icon-arrow-left"></i><span class="hide-lg"> BACK</span>
        </button>
        <div class="divider text-center" data-content="VIEW"></div>
        <div class="form-group">
          <label class="form-switch">
            <input type="checkbox" v-model="chords" @click="toggleChords">
            <i class="form-icon"></i> CHORDS
          </label>
        </div>
        <div class="divider text-center" data-content="TRANSLATION"></div>
        <button class="btn btn-primary mr-1 text-uppercase disabled">{{ song.language }}</button>
        <router-link
          v-if="ready.songs"
          v-for="(tsong, i) in song.translations"
          :key="i"
          :to="{ name: 'song-show', params: { id: tsong }}"
          class="btn btn-primary mr-1 text-uppercase"
        >
          {{ songs[tsong].language }}
        </router-link>
      </div>
      <div class="off-canvas-content">
        <div class="container">
          <div class="columns">
            <div v-if="ready.song" class="column col-12">
              <h2>{{ song.title }}</h2>
              <h3>{{ song.subtitle }}</h3>
              <SongContent :content="song.content" :chords="chords" />
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
        resolve: () => { this.ready.song = true },
        reject: () => { this.ready.song = true }
      },
      songs: {
        ref: db.collection('songs'),
        objects: true,
        resolve: () => { this.ready.songs = true },
        reject: () => { this.ready.songs = true }
      },
    }
  },
  data () {
    return {
      chords: true,
      transposed: 0,
      ready: {
        song: false,
        songs: false,
      }
    }
  },
  methods: {
    toggleChords () {
      this.chords = !this.chords
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