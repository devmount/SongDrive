<template>
  <div>
    <!-- main modal: set song -->
    <div class="modal modal-lg" :class="{ active: active }">
      <a href="#" class="modal-overlay" aria-label="Close" @click.prevent="$emit('closed')"></a>
      <div class="modal-container">
        <div class="modal-header">
          <a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="$emit('closed')"></a>
          <div class="modal-title h5">New Song</div>
        </div>
        <div class="modal-body">
          <div class="content">
            <div class="columns">
              <div class="column col-6 col-sm-12">
                <div class="columns">
                  <div class="column col-12">
                    <div class="form-group">
                      <label class="form-label" for="title">Title</label>
                      <input v-model="song.title" class="form-input" id="title" type="text" placeholder="song title">
                    </div>
                  </div>
                  <div class="column col-8 col-md-12">
                    <div class="form-group">
                      <label class="form-label" for="subtitle">Subtitle</label>
                      <input v-model="song.subtitle" class="form-input" id="subtitle" type="text" placeholder="song subtitle">
                    </div>
                  </div>
                  <div class="column col-4 col-md-12">
                    <div class="form-group">
                      <label class="form-label" for="language">Language</label>
                      <select v-model="song.language" class="form-select" id="language">
                        <option value="">Choose...</option>
                        <option value="de">Deutsch</option>
                        <option value="en">English</option>
                        <option value="fr">Francais</option>
                        <option value="li">Lingala</option>
                      </select>
                    </div>
                  </div>
                  <div class="column col-8 col-md-12">
                    <div class="form-group">
                      <label class="form-label" for="authors">Authors</label>
                      <input v-model="song.authors" class="form-input" id="authors" type="text" placeholder="jon doe | jane dillon">
                    </div>
                  </div>
                  <div class="column col-4 col-md-12">
                    <div class="form-group">
                      <label class="form-label" for="tuning">Tuning</label>
                      <select v-model="song.tuning" class="form-select" id="tuning">
                        <option value="">Choose...</option>
                        <option v-for="tune in tunes" :key="tune">{{ tune }}</option>
                      </select>
                    </div>
                  </div>
                  <div class="column col-8 col-md-12">
                    <div class="form-group">
                      <label class="form-label" for="tags">Tags</label>
                      <select v-model="song.tags" class="form-select" id="tags">
                        <option value="">Choose...</option>
                        <option v-for="tag in tags" :key="tag.key">{{ tag.key }}</option>
                      </select>
                    </div>
                  </div>
                  <div class="column col-4 col-md-12">
                    <div class="form-group">
                      <label class="form-label" for="ccli">CCLI #</label>
                      <input v-model="song.ccli" class="form-input" id="ccli" type="number" placeholder="CCLI number">
                    </div>
                  </div>
                  <div class="column col-8 col-md-12">
                    <div class="form-group">
                      <label class="form-label" for="publisher">Publisher</label>
                      <textarea v-model="song.publisher" class="form-input" id="publisher" placeholder="publisher information" rows="2"></textarea>
                    </div>
                  </div>
                  <div class="column col-4 col-md-12">
                    <div class="form-group">
                      <label class="form-label" for="year">Year</label>
                      <input v-model="song.year" class="form-input" id="year" type="number" placeholder="year">
                    </div>
                  </div>
                  <div class="column col-12">
                    <div class="form-group">
                      <label class="form-label" for="note">Note</label>
                      <input v-model="song.note" class="form-input" id="note" type="text" placeholder="general notes, e.g. capo 3">
                    </div>
                  </div>
                  <div class="column col-12">
                    <label class="form-label">Translations</label>
                    <div v-if="song.translations.length == 0" class="text-gray">
                      <i class="icon icon-stop mr-1"></i> This song has no translation yet.
                    </div>
                    <div v-else>
                      <li v-for="tsong in song.translations" :key="tsong">{{ songs[tsong].title }}</li>
                    </div>
                  </div>
                </div>
              </div>
              <div class="column col-6 col-sm-12">
                <div class="form-group">
                  <label class="form-label" for="content">Content</label>
                  <textarea v-model="song.content" class="form-input" id="content" placeholder="songtext with chords and markers" rows="17"></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary float-left" @click="modalTranslations = true">Add Translation</button>
          <button class="btn btn-link btn-gray" aria-label="Cancel" @click.prevent="$emit('closed')">Cancel</button>
          <button class="btn btn-primary ml-2" @click="setSong">Add Song</button>
        </div>
      </div>
    </div>
    <!-- additional modal: add translation -->
    <div class="modal" :class="{ active: modalTranslations }">
      <a href="#" class="modal-overlay" aria-label="Close" @click.prevent="modalTranslations = false"></a>
      <div class="modal-container">
        <div class="modal-header">
          <a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="modalTranslations = false"></a>
          <div class="modal-title h5">Translations</div>
        </div>
        <div class="modal-body">
          <div class="content">
            <div class="columns">
              <div class="column col-6">
                <div class="form-group">
                  <input v-model="search" type="search" />
                </div>
                <div class="form-group">
                  <label v-for="fsong in filteredSongs" :key="fsong['.key']" class="form-checkbox">
                    <input v-model="song.translations" :value="createSlug(fsong.title)" type="checkbox">
                    <i class="form-icon"></i> {{ fsong.title }}
                  </label>
                </div>
              </div>
              <div class="column col-6">
                <div v-if="song.translations.length == 0" class="empty">
                  <div class="empty-icon">
                    <i class="icon icon-arrow-left icon-4x"></i>
                  </div>
                  <p class="empty-title h5">No Songs selected</p>
                  <p class="empty-subtitle">Select one ore more songs that are a translation to the current song.</p>
                </div>
                <div v-else>
                  <div v-for="tsong in song.translations" :key="tsong">{{ songs[tsong].title }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" aria-label="Close" @click.prevent="modalTranslations = false">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// get database object authorized in config.js
import { db } from '@/firebase'

export default {
  name: 'SongForm',
  props: {
    active: Boolean,
    new: Boolean,
    id: String
  },
  firestore () {
    return {
      songs: {
        ref: db.collection('songs'),
        objects: true,
        resolve: () => { this.ready = true },
        reject: () => { this.ready = true }
      },
      tags: db.collection('tags'),
    }
  },
  data () {
    return {
      modalTranslations: false,
      search: '',
      tunes: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'B', 'H'],
      song: {
        authors: '',
        ccli: '',
        content: '',
        language: '',
        note: '',
        publisher: '',
        subtitle: '',
        tags: '',
        title: '',
        translations: [],
        tuning: '',
        year: '',
      }
    }
  },
  methods: {
    setSong () {
      var self = this
      var processedSong = {
        authors: this.song.authors.split('|'),
        ccli: parseInt(this.song.ccli),
        content: this.song.content,
        language: this.song.language,
        note: this.song.note,
        publisher: this.song.publisher,
        subtitle: this.song.subtitle,
        tags: this.song.tags.split(' '),
        title: this.song.title,
        translations: this.song.translations,
        tuning: this.song.tuning,
        year: parseInt(this.song.year),
      }
      db.collection('songs').doc(this.createSlug(this.song.title)).set(processedSong)
      .then(function() {
        // TODO: toast success message
        self.$emit('closed')
        processedSong = {}
      })
      .catch(function() {
        // TODO: toast error message
        self.$emit('closed')
      });
    },
    createSlug (s) {
      return s
        .trim()
        .toLowerCase()
        .replace(/\s/g, '-')
        .replace(/'/g, '')
        .replace(/"/g, '')
        .replace(/,/g, '')
        .replace(/;/g, '')
        .replace(/\./g, '')
        .replace(/:/g, '')
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/ß/g, 'ss')
    }
  },
  computed: {
    filteredSongs () {
      var songs = this.songs, self = this
      if (this.search != '') {
        songs = songs.filter(function(song) {
          // filter fields: title, subtitle
          var key = self.search.toLowerCase()
          return song.title.toLowerCase().indexOf(key) !== -1 || song.subtitle.toLowerCase().indexOf(key) !== -1
        })
      }
      return songs
    }
  }
}
</script>

<style lang="scss">
#content {
  height: 55vh;
}
</style>
