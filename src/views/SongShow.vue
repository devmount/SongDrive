<template>
  <div class="profile">
    <div class="off-canvas off-canvas-secondary">
      <div class="off-canvas-sidebar active">
        <button class="btn btn-primary d-block stretch mb-1" @click="$router.go(-1)">
          <i class="icon icon-arrow-left"></i><span class="hide-lg"> BACK</span>
        </button>
        <button class="btn btn-primary d-block stretch mb-1">
          <i class="icon icon-edit"></i><span class="hide-lg"> EDIT</span>
        </button>
        <button class="btn btn-primary d-block stretch mb-1">
          <i class="icon icon-copy"></i><span class="hide-lg"> CLONE</span>
        </button>
        <button class="btn btn-error d-block stretch">
          <i class="icon icon-cross"></i><span class="hide-lg"> DELETE</span>
        </button>
        <div class="divider text-center show-lg"></div>
        <div class="divider text-center hide-lg" data-content="LANGUAGE"></div>
        <div class="d-flex">
          <router-link
            v-if="ready.songs"
            v-for="(tsong, i) in showLanguages"
            :key="i"
            :to="{ name: 'song-show', params: { id: tsong[0] }}"
            class="btn btn-primary text-uppercase mb-1"
            :class="{ disabled: (song['.key'] == tsong[0]) }"
          >
            {{ tsong[1] }}
          </router-link>
        </div>
        <div class="divider text-center show-lg"></div>
        <div class="divider text-center hide-lg" data-content="VIEW"></div>
        <div class="form-group">
          <label class="form-switch">
            <input type="checkbox" v-model="chords" @click="toggleChords">
            <i class="form-icon"></i><span class="hide-lg"> CHORDS</span>
          </label>
        </div>
        <button class="btn btn-primary d-block stretch">
          <i class="icon icon-resize-horiz"></i><span class="hide-lg"> FULLSCREEN</span>
        </button>
        <div class="divider text-center show-lg"></div>
        <div class="divider text-center hide-lg" data-content="TUNING"></div>
        <div class="d-flex mb-2">
          <span class="text-center text-pre text-gray text-large hide-lg">{{ showTuning.previous }}</span>
          <span class="label label-rounded text-center text-large text-pre text-bold">{{ showTuning.current }}</span>
          <span class="text-center text-pre text-gray text-large hide-lg">{{ showTuning.next }}</span>
        </div>
        <div class="d-flex">
          <button class="btn btn-primary mb-1 hide-lg" :class="{ disabled: !chords }" @click="tuning--"><i class="icon icon-arrow-left"></i></button>
          <button class="btn btn-primary mb-1 show-lg" :class="{ disabled: !chords }" @click="tuning--"><i class="icon icon-arrow-up"></i></button>
          <button class="btn btn-primary mb-1" :class="{ disabled: !chords }" @click="tuning = 0"><i class="icon icon-refresh"></i></button>
          <button class="btn btn-primary mb-1 hide-lg" :class="{ disabled: !chords }" @click="tuning++"><i class="icon icon-arrow-right"></i></button>
          <button class="btn btn-primary mb-1 show-lg" :class="{ disabled: !chords }" @click="tuning++"><i class="icon icon-arrow-down"></i></button>
        </div>
      </div>
      <div class="off-canvas-content">
        <div class="container">
          <div class="columns">
            <div v-if="ready.song" class="column col-12">
              <h2>{{ song.title }} <span class="label text-pre ml-2 px-3">{{ showTuning.current }}</span></h2>
              <h3>{{ song.subtitle }}</h3>
              <SongContent :content="song.content" :chords="chords" :tuning="tuning" :tunes="tunes" />
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
      tuning: 0,
      ready: {
        song: false,
        songs: false,
      },
      tunes: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'B', 'H']
    }
  },
  methods: {
    toggleChords () {
      this.chords = !this.chords
    }
  },
  computed: {
    showLanguages () {
      if (this.ready.song && this.ready.songs) {
        var languages = [[this.$route.params.id, this.song.language]]
        for (const key in this.song.translations) {
          if (this.song.translations.hasOwnProperty(key)) {
            const songKey = this.song.translations[key];
            languages.push([songKey, this.songs[songKey].language])
          }
        }
        return languages.sort(function(a, b) { 
          return a[1] > b[1] ? 1 : -1
        })
      } else {
        return []
      }
    },
    showTuning () {
      return {
        previous: this.tunes[(12 + this.tunes.indexOf(this.song.tuning) + (this.tuning-1 % 12)) % 12],
        current: this.tunes[(12 + this.tunes.indexOf(this.song.tuning) + (this.tuning % 12)) % 12],
        next: this.tunes[(12 + this.tunes.indexOf(this.song.tuning) + (this.tuning+1 % 12)) % 12],
      }
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