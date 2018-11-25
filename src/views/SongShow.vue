<template>
  <div class="profile">
    <h2>{{ song.title }}</h2>
    <h3>{{ song.subtitle }}</h3>
    <pre>{{ song.content }}</pre>
    <p>{{ song.authors.join(' | ')}}</p>
    <p>{{ song.tags.join(' | ')}}</p>
    <p>CCLI Song Number: <a :href="'https://songselect.ccli.com/Songs/' + song.ccli">{{ song.ccli }}</a></p>
    <p>&copy; {{song.year}} {{song.publisher}} </p>
  </div>
</template>

<script>
// get database object authorized in config.js
import { db } from '../firebase'

export default {
  name: 'song-show',
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
      transposed: 0
    }
  }
}
</script>

<style lang="scss">

</style>