<template>
	<div class="songs">
		<div class="container no-sidebar">
			<div class="columns">
				<!-- heading -->
				<div class="column col-4 col-xl-12">
					<h2 class="view-title">
						<span v-if="ready" class="label text-bold mr-2 px-2">{{ filteredSongs.length }}</span>
						<div v-else class="loading loading-lg d-inline-block mr-3 px-3"></div>
						Songs
					</h2>
				</div>
				<!-- search title, subtitles -->
				<div class="column col-3 col-xl-6 col-sm-12 mb-1">
					<div class="input-group filter">
						<span class="input-group-addon addon-lg"><i class="form-icon icon ion-md-search"></i></span>
						<input type="search" v-model="search" class="form-input input-lg" placeholder="search ..." />
						<button class="btn input-group-btn btn-lg btn-link" @click="search = ''"><i class="form-icon icon ion-md-close"></i></button>
					</div>
				</div>
				<!-- filter tags -->
				<div class="column col-3 col-xl-6 col-sm-12 mb-1">
					<div class="input-group filter">
						<span class="input-group-addon addon-lg"><i class="form-icon icon ion-md-pricetag"></i></span>
						<select v-model="filter" class="form-select select-lg filter" required>
							<option value="" disabled selected>tags ...</option>
							<option v-for="tag in tags" :key="tag.key" :value="tag.key">{{ tag.key }}</option>
						</select>
						<button class="btn input-group-btn btn-lg btn-link" @click="filter = ''"><i class="form-icon icon ion-md-close"></i></button>
					</div>
				</div>
				<!-- filter tuning -->
				<div class="column col-2 col-xl-6 col-sm-12 mb-1">
					<div class="input-group filter">
						<span class="input-group-addon addon-lg"><i class="form-icon icon ion-md-musical-note"></i></span>
						<select v-model="tuning" class="form-select select-lg filter" required>
							<option value="" disabled selected>tuning ...</option>
							<option v-for="t in tunes" :key="t" :value="t">{{ t }}</option>
						</select>
						<button class="btn input-group-btn btn-lg btn-link" @click="tuning = ''"><i class="form-icon icon ion-md-close"></i></button>
					</div>
				</div>
			</div>
		
			<table v-if="ready" class="table table-striped table-hover">
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
						<td class="c-hand" @click="$router.push({ name: 'song-show', params: { id: song['.key'] }})">
							{{ song.title }} <div class="show-xl text-gray">{{ song.subtitle }}</div>
						</td>
						<td class="hide-xl c-hand" @click="$router.push({ name: 'song-show', params: { id: song['.key'] }})">{{ song.subtitle }}</td>
						<td class="hide-md c-hand" @click="$router.push({ name: 'song-show', params: { id: song['.key'] }})">{{ song.authors }}</td>
						<td class="hide-xl c-hand" @click="$router.push({ name: 'song-show', params: { id: song['.key'] }})">{{ song.year }}</td>
						<td class="text-center c-hand" @click="$router.push({ name: 'song-show', params: { id: song['.key'] }})">{{ song.tuning }}</td>
						<td class="text-right">
							<div class="dropdown dropdown-right">
								<div class="btn-group">
									<a class="btn btn-primary dropdown-toggle" tabindex="0">
										Action
										<i class="icon ion-md-arrow-dropdown"></i>
									</a>
									<ul class="menu text-left">
										<li class="menu-item">
											<router-link :to="{ name: 'song-show', params: { id: song['.key'] }}" class="py-3 px-3">
												<i class="icon ion-md-eye mr-2"></i> Show
											</router-link>
										</li>
										<li v-if="user && role > 2" class="menu-item">
											<a href="#" class="py-3 px-3" @click.prevent="active.title=song.title; active.song=song; active.existing=true; modal.set=true">
												<i class="icon ion-md-create mr-2"></i> Edit
											</a>
										</li>
										<li v-if="user && role > 2" class="menu-item">
											<a href="#" class="py-3 px-3" @click.prevent="active.title=song.title; active.song=song; active.existing=false; modal.set=true">
												<i class="icon ion-md-copy mr-2"></i> Duplicate
											</a>
										</li>
										<li v-if="user && role > 2" class="menu-item">
											<a href="#" class="py-3 px-3 text-error" @click.prevent="active.title=song.title; active.key=song['.key']; modal.delete=true">
												<i class="icon ion-md-trash mr-2"></i> Delete
											</a>
										</li>
									</ul>
								</div>
							</div>
						</td>
					</tr>
				</tbody>
			</table>
			<!-- modals -->
			<SongSet
				v-if="modal.set"
				:active="modal.set"
				:existing="active.existing"
				:initialSong="active.song"
				@closed="modal.set = false"
			/>
			<SongDelete
				v-if="modal.delete"
				:active="modal.delete"
				:title="active.title"
				:id="active.key"
				@closed="modal.delete = false"
			/>
		</div>
	</div>
</template>

<script>
// get components
import SongSet from '@/components/SongSet.vue'
import SongDelete from '@/components/SongDelete.vue'
// get database object authorized in config.js
import { db } from '@/firebase'

export default {
	name: 'songs',
	props: ['user', 'role'],
	components: {
		SongSet,
		SongDelete,
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
			search: '',
			filter: this.$route.params.tag ? this.$route.params.tag : '',
			tuning: '',
			ready: false,
			modal: {
				set: false,
				delete: false,
			},
			active: {
				title: '',
				key: '',
				song: {},
				existing: true
      },
      tunes: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'B', 'H']
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
			if (this.tuning != '') {
				songs = songs.filter(function(song) {
					// filter field: tuning
					return song.tuning.indexOf(self.tuning) !== -1
				})
			}
			return songs
		}
	}
}
</script>

<style lang="scss">

</style>
