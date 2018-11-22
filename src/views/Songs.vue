<template>
  <div class="songs">
    <div class="container">
      <div class="columns">
        <!-- heading -->
        <div class="column col-4 col-xl-12"><h2><span class="label text-bold mr-2 px-2">{{ filteredSongs.length }}</span> Songs</h2></div>
        <!-- search title, subtitles -->
        <div class="column col-5 col-xl-6 col-sm-12">
          <div class="input-group">
            <span class="input-group-addon addon-lg"><i class="form-icon icon icon-search"></i></span>
            <input type="search" v-model="search" class="form-input input-lg" placeholder="Search ..." />
            <button class="btn input-group-btn btn-lg btn-link" @click="search = ''"><i class="form-icon icon icon-cross"></i></button>
          </div>
        </div>
        <!-- filter tags -->
        <div class="column col-3 col-xl-6 col-sm-12">
          <div class="input-group">
            <span class="input-group-addon addon-lg"><i class="form-icon icon icon-bookmark"></i></span>
            <select v-model="filter" class="form-select select-lg filter">
              <option value="" disabled selected>Filter ...</option>
              <option v-for="tag in tags" :key="tag.key" :value="tag.key">{{ tag.key }}</option>
            </select>
            <button class="btn input-group-btn btn-lg btn-link" @click="filter = ''"><i class="form-icon icon icon-cross"></i></button>
          </div>
        </div>
      </div>
    </div>
    
    <table class="table table-striped table-hover">
      <thead>
        <tr>
          <th>Title</th>
          <th class="hide-xl">Subtitle</th>
          <th class="hide-md">Authors</th>
          <th class="hide-xl">Year</th>
          <th>Tuning</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(song, i) in filteredSongs" :key="i">
          <td>{{ song.title }} <div class="show-xl text-gray">{{ song.subtitle }}</div></td>
          <td class="hide-xl">{{ song.subtitle }}</td>
          <td class="hide-md">{{ song.authors.join(' | ')}}</td>
          <td class="hide-xl">{{ song.year }}</td>
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
      search: '',
      filter: ''
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
      if (this.filter != '') {
        songs = songs.filter(function(song) {
          // filter field: tags
          return song.tags.indexOf(self.filter) !== -1
        })
      }
      return songs
    }
  }
}
</script>

<style lang="scss">
.filter:required:invalid {
  color: #5e6769;
}
.filter option[value=""][disabled] {
  display: none;
}
</style>
