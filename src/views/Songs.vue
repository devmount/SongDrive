<template>
  <div class="songs">
    <h1>{{ songs.length }} Songs</h1>
    <table class="table table-striped table-hover">
      <thead>
        <tr>
          <th>Title</th>
          <th>Subtitle</th>
          <th>Authors</th>
          <th>Year</th>
          <th>Tuning</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="song in songs">
          <td>{{ song.title }}</td>
          <td>{{ song.subtitle }}</td>
          <td><span v-for="author in song.authors">{{ author }}</span></td>
          <td>{{ song.year }}</td>
          <td>{{ song.tuning }}</td>
          <td>
            <div class="dropdown">
              <div class="btn-group">
                <a class="btn btn-primary dropdown-toggle" tabindex="0">
                  Action
                  <i class="icon icon-caret"></i>
                </a>
                <ul class="menu">
                  <li class="menu-item"><a href="#" class="py-3 px-3"><i class="icon icon-resize-horiz mr-2"></i> View</a></li>
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
    }
  },
}
</script>

<style lang="scss">

</style>
