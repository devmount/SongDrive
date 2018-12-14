<template>
  <div class="modal modal-sm" :class="{ active: active }">
    <a href="#" class="modal-overlay" aria-label="Close" @click.prevent="$emit('closed')"></a>
    <div class="modal-container">
      <div class="modal-header">
        <a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="$emit('closed')"></a>
        <div class="modal-title h5">Delete Song</div>
      </div>
      <div class="modal-body">
        <div class="content">
          <p>Do you really want to delete the Song «<span class="text-uppercase ls-1">{{ title }}</span>» ?</p>
          <p>This cannot be undone.</p>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-error" @click="deleteSong">Delete it!</button>
        <a class="btn btn-link btn-gray ml-2" href="#" aria-label="Cancel" @click.prevent="$emit('closed')">Cancel</a>
      </div>
    </div>
  </div>
</template>

<script>
// get database object authorized in config.js
import { db } from '../firebase'

export default {
  name: 'SongContent',
  props: {
    active: Boolean,
    title: String,
    id: String
  },
  methods: {
    deleteSong () {
      db.collection('songs').doc(this.id).delete().then(function() {
        // TODO: toast success message
      }).catch(function() {
        // TODO: toast error message
      });
    },
  }
}
</script>

<style lang="scss">

</style>
