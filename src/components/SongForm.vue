<template>
  <div class="modal modal-md" :class="{ active: active }">
    <a href="#" class="modal-overlay" aria-label="Close" @click.prevent="$emit('closed')"></a>
    <div class="modal-container">
      <div class="modal-header">
        <a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="$emit('closed')"></a>
        <div class="modal-title h5">New Song</div>
      </div>
      <div class="modal-body">
        <div class="content">
          <form action="#forms">
            <fieldset disabled>
              <div class="form-group">
                <label class="form-label" for="input-example-19">Name</label>
                <input class="form-input" type="text" id="input-example-19" placeholder="Name">
              </div>
              <div class="form-group">
                <label class="form-label">Gender</label>
                <label class="form-radio">
                  <input type="radio" name="gender" disabled>
                  <i class="form-icon"></i> Male
                </label>
                <label class="form-radio">
                  <input type="radio" name="gender" disabled>
                  <i class="form-icon"></i> Female
                </label>
              </div>
              <div class="form-group">
                <select class="form-select" disabled>
                  <option>Choose an option</option>
                  <option>Slack</option>
                  <option>Skype</option>
                  <option>Hipchat</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-switch">
                  <input type="checkbox" disabled>
                  <i class="form-icon"></i> Send me emails with news and tips
                </label>
              </div>
              <div class="form-group">
                <label class="form-label" for="input-example-20">Message</label>
                <textarea class="form-input" id="input-example-20" placeholder="Textarea" rows="3" disabled></textarea>
              </div>
              <div class="form-group">
                <label class="form-checkbox">
                  <input type="checkbox" disabled>
                  <i class="form-icon"></i> Remember me
                </label>
              </div>
            </fieldset>
          </form>
        </div>
      </div>
      <div class="modal-footer">
        <a class="btn btn-link btn-gray ml-2" href="#" aria-label="Cancel" @click.prevent="$emit('closed')">Cancel</a>
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
