<template>
  <div class="songs">
    <div class="container">
      <div class="columns">
        <div class="column col-4"><h1>{{ filteredSongs.length }} Songs</h1></div>
        <div class="column col-6">
          <div class="has-icon-left">
            <input type="search" v-model="query" class="form-input input-lg" placeholder="Search" />
            <i class="form-icon icon icon-search"></i>
          </div>
        </div>
        <div class="column col-2">
          <div class="form-group">
            <select class="form-select select-lg">
              <option value="">Filter</option>
              <option v-for="tag in tags" :key="tag.key" :value="tag.key">{{ tag.key }}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
    
    <table class="table table-striped table-hover">
      <thead>
        <tr>
          <th>Title</th>
          <th class="hide-sm">Subtitle</th>
          <th>Authors</th>
          <th class="hide-sm">Year</th>
          <th>Tuning</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(song, i) in filteredSongs" :key="i">
          <td>{{ song.title }} <div class="show-sm text-gray">{{ song.subtitle }}</div></td>
          <td class="hide-sm">{{ song.subtitle }}</td>
          <td>{{ song.authors.join(' | ')}}</td>
          <td class="hide-sm">{{ song.year }}</td>
          <td>{{ song.tuning }}</td>
          <td>
            <div class="dropdown">
              <div class="btn-group">
                <a class="btn btn-primary dropdown-toggle" tabindex="0">
                  Action
                  <i class="icon icon-caret"></i>
                </a>
                <ul class="menu">
                  <li class="menu-item"><a href="#" class="py-3 px-3"><i class="icon icon-resize-horiz mr-2"></i> Show</a></li>
                  <li class="menu-item"><a href="#" class="py-3 px-3"><i class="icon icon-edit mr-2"></i> Edit</a></li>
                  <li class="menu-item"><a href="#" class="py-3 px-3"><i class="icon icon-plus mr-2"></i> Duplicate</a></li>
                  <li class="menu-item"><a href="#" class="py-3 px-3 text-error"><i class="icon icon-delete mr-2"></i> Delete</a></li>
                </ul>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
// get database object authorized in config.js
import { db } from '../firebase'

export default {
  name: 'songs',
  firestore () {
    return {
      songs: db.collection('songs'),
      tags: db.collection('tags'),
    }
  },
  data () {
    return {
      query: ''
    }
  },
  computed: {
    filteredSongs () {
      if (this.query != '') {
        var self = this
        return this.songs.filter(function(song) {
          // filter fields: title, subtitle
          var key = self.query.toLowerCase()
          return song.title.toLowerCase().indexOf(key) !== -1 || song.subtitle.toLowerCase().indexOf(key) !== -1
        })
      } else {
        return this.songs
      }
    }
  }
}
</script>

<style lang="scss">

</style>
