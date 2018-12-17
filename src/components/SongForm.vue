<template>
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
                    <input class="form-input" type="text" id="title" placeholder="Title">
                  </div>
                </div>
                <div class="column col-8 col-md-12">
                  <div class="form-group">
                    <label class="form-label" for="subtitle">Subtitle</label>
                    <input class="form-input" type="text" id="subtitle" placeholder="Subtitle">
                  </div>
                </div>
                <div class="column col-4 col-md-12">
                  <div class="form-group">
                    <label class="form-label" for="language">Language</label>
                    <select class="form-select" id="language">
                      <option>Choose...</option>
                      <option>Slack</option>
                      <option>Skype</option>
                      <option>Hipchat</option>
                    </select>
                  </div>
                </div>
                <div class="column col-8 col-md-12">
                  <div class="form-group">
                    <label class="form-label" for="authors">Authors</label>
                    <input class="form-input" type="text" id="authors" placeholder="Authors">
                  </div>
                </div>
                <div class="column col-4 col-md-12">
                  <div class="form-group">
                    <label class="form-label" for="tuning">Tuning</label>
                    <select class="form-select" id="tuning">
                      <option>Choose...</option>
                      <option v-for="tune in tunes" :key="tune">{{ tune }}</option>
                    </select>
                  </div>
                </div>
                <div class="column col-8 col-md-12">
                  <div class="form-group">
                    <label class="form-label" for="tags">Tags</label>
                    <select class="form-select" id="tags">
                      <option>Choose...</option>
                      <option v-for="tag in tags" :key="tag.key">{{ tag.key }}</option>
                    </select>
                  </div>
                </div>
                <div class="column col-4 col-md-12">
                  <div class="form-group">
                    <label class="form-label" for="ccli">CCLI #</label>
                    <input class="form-input" type="number" id="ccli" placeholder="CCLI #">
                  </div>
                </div>
                <div class="column col-8 col-md-12">
                  <div class="form-group">
                    <label class="form-label" for="publisher">Publisher</label>
                    <textarea class="form-input" id="publisher" placeholder="Publisher" rows="2"></textarea>
                  </div>
                </div>
                <div class="column col-4 col-md-12">
                  <div class="form-group">
                    <label class="form-label" for="year">Year</label>
                    <input class="form-input" type="number" id="year" placeholder="Year">
                  </div>
                </div>
                <div class="column col-12">
                  <div class="form-group">
                    <label class="form-label" for="note">Note</label>
                    <input class="form-input" type="text" id="note" placeholder="Note">
                  </div>
                </div>
              </div>
            </div>
            <div class="column col-6 col-sm-12">
              <div class="form-group">
                <label class="form-label" for="content">Content</label>
                <textarea class="form-input" id="content" placeholder="Content" rows="17"></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <a class="btn btn-link btn-gray" href="#" aria-label="Cancel" @click.prevent="$emit('closed')">Cancel</a>
        <button class="btn btn-primary ml-2" @click="setSong">Add it!</button>
      </div>
    </div>
  </div>
</template>

<script>
// get database object authorized in config.js
import { db } from '../firebase'

export default {
  name: 'SongForm',
  props: {
    active: Boolean,
    new: Boolean,
    song: Object,
    id: String
  },
  firestore () {
    return {
      songs: {
        ref: db.collection('songs'),
        resolve: () => { this.ready = true },
        reject: () => { this.ready = true }
      },
      tags: db.collection('tags'),
    }
  },
  data () {
    return {
      tunes: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'B', 'H']
    }
  },
  methods: {
    setSong () {
      // db.collection('songs').doc(this.id).delete().then(function() {
      //   // TODO: toast success message
      // }).catch(function() {
      //   // TODO: toast error message
      // });
    },
  }
}
</script>

<style lang="scss">

</style>
