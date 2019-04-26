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
        <a class="btn btn-link btn-gray" href="#" aria-label="Cancel" @click.prevent="$emit('closed')">Cancel</a>
        <button class="btn btn-error ml-2" @click="deleteSong">Delete it!</button>
      </div>
    </div>
  </div>
</template>

<script>
// get database object authorized in config.js
import { db } from '@/firebase'

export default {
  name: 'song-delete',
  props: {
    active: Boolean,
    title: String,
    id: String
  },
  methods: {
    deleteSong () {
      var self = this
      db.collection('songs').doc(this.id).delete().then(function() {
        self.$emit('closed')
        self.$router.push({ name: 'songs' })
        // toast success message
        self.$notify({
          title: '<button class="btn btn-clear float-right"></button>Success!',
          text: 'The song was removed.',
          type: 'toast-primary'
        });
      }).catch(function() {
        self.$emit('closed')
        // toast error message
        self.$notify({
          title: '<button class="btn btn-clear float-right"></button>Error!',
          text: 'The song could not be removed.',
          type: 'toast-error'
        });
      });
    },
  }
}
</script>

<style lang="scss">

</style>
