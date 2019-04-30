<template>
  <div class="modal modal-lg" :class="{ active: active }">
    <a href="#" class="modal-overlay" aria-label="Close" @click.prevent="$emit('closed')"></a>
    <div v-if="setlist && ready" class="modal-container">
      <div class="modal-header">
        <a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="$emit('closed')"></a>
        <div v-if="!existing" class="modal-title h5">New Setlist</div>
        <div v-else class="modal-title h5">Edit Setlist «<span class="text-uppercase ls-1">{{ setlist.title }}</span>»</div>
      </div>
      <div class="modal-body">
        <div class="content">
          <div class="columns">
            <div class="column col-4 col-sm-12">
              <div class="columns">
                <!-- title -->
                <div class="column col-12">
                  <div class="form-group">
                    <label class="form-label" for="title">Title</label>
                    <input v-if="existing" v-model="setlist.title" class="form-input" id="title" type="text" placeholder="setlist title" disabled>
                    <input v-else v-model="setlist.title" class="form-input" id="title" type="text" placeholder="setlist title">
                  </div>
                </div>
                <!-- date -->
                <div class="column col-12">
                  <div class="form-group">
                    <label class="form-label" for="date">Event Date</label>
                    <input v-model="setlist.date" class="form-input" id="date" type="text" placeholder="event date">
                  </div>
                </div>
              </div>
            </div>
            <div class="column col-8 col-sm-12">
              <!-- song selection -->
              <div class="columns">
                <div class="column col-6">
                  <div class="input-group">
                    <span class="input-group-addon"><i class="form-icon icon ion-md-search"></i></span>
                    <input v-model="search.songs" type="search" class="form-input" placeholder="search ..." />
                  </div>
                  <div class="form-group">
                    <label v-for="(fsong, key) in filteredSongs" :key="key" class="form-checkbox">
                      <input v-model="setlist.songs" :value="key" type="checkbox">
                      <i class="form-icon"></i> {{ fsong.title }} [{{ fsong.tuning }}]
                      <div class="text-gray text-small">
                        {{ fsong.subtitle }}
                      </div>
                    </label>
                  </div>
                </div>
                <div class="column col-6">
                  <div v-if="setlist.songs && setlist.songs.length == 0" class="empty">
                    <div class="empty-icon">
                      <i class="icon ion-md-musical-notes icon-4x"></i>
                    </div>
                    <p class="empty-title h5">No Songs selected</p>
                    <p class="empty-subtitle">Select one ore more songs for this setlist.</p>
                  </div>
                  <div v-else>
                    <h3 class="text-center">Selection</h3>
                    <div v-for="key in setlist.songs" :key="key" class="tile tile-centered mb-1">
                      <div class="tile-icon">
                        <figure class="avatar s-rounded" :data-initial="songs[key].tuning"></figure>
                      </div>
                      <div class="tile-content">
                        <div class="tile-title">{{ songs[key].title }}</div>
                        <div class="tile-subtitle text-gray text-small">{{ songs[key].subtitle }}</div>
                      </div>
                      <div class="tile-action">
                        <button class="btn btn-link btn-action" @click="setlist.songs = setlist.songs.filter(function(k) {return k !== key})">
                          <i class="icon ion-md-close"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-link btn-gray" aria-label="Cancel" @click.prevent="$emit('closed')">Cancel</button>
        <button class="btn btn-primary ml-2" @click="setSetlist">
          <span v-if="!existing">Create</span>
          <span v-else>Update</span> Setlist
        </button>
      </div>
    </div>
  </div>
</template>

<script>
// get database object authorized in config.js
import { db } from '@/firebase'

export default {
  name: 'setlist-set',
  props: {
    active: Boolean,
    existing: Boolean,
    setlist: Object
  },
  firestore () {
    return {
      songs: {
        ref: db.collection('songs'),
        objects: true,
        resolve: () => { this.ready = true },
        reject: () => { this.ready = true }
      }
    }
  },
  data () {
    return {
      ready: false,
      search: {
        songs: '',
      },
      tunes: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'B', 'H'],
    }
  },
  methods: {
    setSetlist () {
      var self = this
      var processedSetlist = {
        title: this.setlist.title,
        date: this.setlist.date,
        songs: this.setlist.songs,
      }
      // new setlist should be created
      if (!this.existing) {
        let slug = this.createSlug()
        db.collection('setlists').doc(slug).set(processedSetlist)
        .then(function() {
          self.$emit('closed')
          self.$emit('reset')
          processedSetlist = {}
          self.$router.push({ name: 'setlist-show', params: { id: slug }})
          // toast success creation message
          self.$notify({
            title: '<button class="btn btn-clear float-right"></button>Success!',
            text: 'The new setlist was added.',
            type: 'toast-primary'
          })
        })
        .catch(function() {
          self.$emit('closed')
          // toast error creation message
          self.$notify({
            title: '<button class="btn btn-clear float-right"></button>Error!',
            text: 'The new setlist could not be added.',
            type: 'toast-error'
          })
        })
      }
      // existing setlist should be updated
      else {
        db.collection('setlists').doc(this.setlist['.key']).update(processedSetlist)
        .then(function() {
          self.$emit('closed')
          self.$emit('reset')
          processedSetlist = {}
          self.$router.push({ name: 'setlist-show', params: { id: self.setlist['.key'] }})
          // toast success update message
          self.$notify({
            title: '<button class="btn btn-clear float-right"></button>Success!',
            text: 'The setlist was updated.',
            type: 'toast-primary'
          })
        })
        .catch(function() {
          self.$emit('closed')
          // toast error update message
          self.$notify({
            title: '<button class="btn btn-clear float-right"></button>Error!',
            text: 'The setlist could not be updated.',
            type: 'toast-error'
          })
        })
      }
    },
    createSlug () {
      let r = Math.random().toString(36).substring(2, 6)
      return this.setlist.date.replace(/-/g, '') + '-' + r
    }
  },
  computed: {
    // filter song list by search query
    filteredSongs () {
      var songs = {}, self = this
      if (this.search.songs != '') {
        for (const key in self.songs) {
          if (self.songs.hasOwnProperty(key)) {
            const song = self.songs[key];
            var search = self.search.songs.toLowerCase()
            // search in title and subtitle
            if (song.title.toLowerCase().indexOf(search) !== -1 || song.subtitle.toLowerCase().indexOf(search) !== -1) {
              songs[key] = song
            }
          }
        }
        return songs
      } else {
        return this.songs
      }
    }
  }
}
</script>

<style lang="scss">

</style>
