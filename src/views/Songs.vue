<template>
	<div class="songs">
		<div class="container no-sidebar">
			<div class="columns">
				<!-- heading -->
				<div class="column col-6 col-xl-12">
					<h2 class="view-title">
						<span v-if="ready.songs" class="label text-bold mr-2 px-2">{{ Object.keys(filteredSongs).length }}</span>
						<div v-else class="loading loading-lg d-inline-block mr-3 px-3"></div>
						Songs
					</h2>
				</div>
				<!-- search title, subtitles -->
				<div class="column col-2 col-xl-12 mb-1">
					<div class="input-group filter">
						<span class="input-group-addon addon-lg"><i class="form-icon icon ion-md-search"></i></span>
						<input type="search" v-model="search" class="form-input input-lg" placeholder="search ..." />
						<button class="btn input-group-btn btn-lg btn-link" @click="search = ''"><i class="form-icon icon ion-md-close"></i></button>
					</div>
				</div>
				<!-- filter tags -->
				<div class="column col-2 col-xl-6 col-sm-12 mb-1">
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
		
			<table v-if="ready.songs" class="table table-striped table-hover">
				<thead>
					<tr>
						<th class="c-hand" :class="{ 'bg-primary-dark': order.field == 'title' }" @click="sortList('title')">
							Title
							<i class="icon ml-1" :class="{ 'ion-md-arrow-down': order.field == 'title' && !order.ascending, 'ion-md-arrow-up': order.field == 'title' && order.ascending }"></i>
						</th>
						<th class="c-hand hide-xl" :class="{ 'bg-primary-dark': order.field == 'subtitle' }" @click="sortList('subtitle')">
							Subtitle
							<i class="icon ml-1" :class="{ 'ion-md-arrow-down': order.field == 'subtitle' && !order.ascending, 'ion-md-arrow-up': order.field == 'subtitle' && order.ascending }"></i>
						</th>
						<th class="c-hand hide-md" :class="{ 'bg-primary-dark': order.field == 'authors' }" @click="sortList('authors')">
							Authors
							<i class="icon ml-1" :class="{ 'ion-md-arrow-down': order.field == 'authors' && !order.ascending, 'ion-md-arrow-up': order.field == 'authors' && order.ascending }"></i>
						</th>
						<th class="c-hand hide-xl" :class="{ 'bg-primary-dark': order.field == 'year' }" @click="sortList('year')">
							Year
							<i class="icon ml-1" :class="{ 'ion-md-arrow-down': order.field == 'year' && !order.ascending, 'ion-md-arrow-up': order.field == 'year' && order.ascending }"></i>
						</th>
						<th class="c-hand" :class="{ 'bg-primary-dark': order.field == 'tuning' }" @click="sortList('tuning')">
							Tuning
							<i class="icon ml-1" :class="{ 'ion-md-arrow-down': order.field == 'tuning' && !order.ascending, 'ion-md-arrow-up': order.field == 'tuning' && order.ascending }"></i>
						</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(song, i) in filteredSongs" :key="i">
						<td class="c-hand" @click="$router.push({ name: 'song-show', params: { id: song.id }})">
							{{ song.title }} <div class="show-xl text-gray">{{ song.subtitle }}</div>
						</td>
						<td class="hide-xl c-hand" @click="$router.push({ name: 'song-show', params: { id: song.id }})">{{ song.subtitle }}</td>
						<td class="hide-md c-hand" @click="$router.push({ name: 'song-show', params: { id: song.id }})">{{ song.authors }}</td>
						<td class="hide-xl c-hand" @click="$router.push({ name: 'song-show', params: { id: song.id }})">{{ song.year }}</td>
						<td class="text-center c-hand" @click="$router.push({ name: 'song-show', params: { id: song.id }})">{{ song.tuning }}</td>
						<td class="text-right">
							<div class="dropdown dropdown-right">
								<div class="btn-group">
									<a class="btn btn-primary dropdown-toggle" tabindex="0">
										Action
										<i class="icon ion-md-arrow-dropdown"></i>
									</a>
									<ul class="menu text-left">
										<li class="menu-item">
											<router-link :to="{ name: 'song-show', params: { id: song.id }}" class="py-3 px-3">
												<i class="icon ion-md-eye mr-2"></i> Show
											</router-link>
										</li>
										<li v-if="user && role > 2" class="menu-item">
											<a href="#" class="py-3 px-3" @click.prevent="active.title=song.title; active.song=song; active.key=song.id; active.existing=true; modal.set=true">
												<i class="icon ion-md-create mr-2"></i> Edit
											</a>
										</li>
										<li v-if="user && role > 2" class="menu-item">
											<a href="#" class="py-3 px-3" @click.prevent="active.title=song.title; active.song=song; active.key=song.id; active.existing=false; modal.set=true">
												<i class="icon ion-md-copy mr-2"></i> Duplicate
											</a>
										</li>
										<li v-if="user && role > 2" class="menu-item">
											<a href="#" class="py-3 px-3 text-error" @click.prevent="active.title=song.title; active.key=song.id; modal.delete=true">
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
				:db="db"
				:active="modal.set"
				:existing="active.existing"
				:initialSong="active.song"
				:songKey="active.key"
				:songs="songs"
				:tags="tags"
				:ready="ready"
				@closed="modal.set = false"
			/>
			<SongDelete
				v-if="modal.delete"
				:db="db"
				:active="modal.delete"
				:title="active.title"
				:id="active.key"
				@closed="modal.delete = false"
			/>
		</div>
	</div>
</template>

<script>
// get basic program parameters
import basics from '@/basics.js'
// get components
import SongSet from '@/components/SongSet.vue'
import SongDelete from '@/components/SongDelete.vue'

export default {
	name: 'songs',
	props: ['db', 'songs', 'tags', 'user', 'role', 'ready'],
	components: {
		SongSet,
		SongDelete,
	},
	data () {
		return {
			search: '',
			filter: this.$route.params.tag ? this.$route.params.tag : '',
			tuning: '',
			order: { 
				field: 'title',
				ascending: true
			},
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
			tunes: basics.tunes
		}
	},
	computed: {
		songsArray () {
			let self = this
			let songs = Object.keys(this.songs).map(function (key) {
				let song = self.songs[key]
				song['id'] = key
				return song
			})
			songs.sort(function(a, b) {
				var propA = String(a[self.order.field]).toLowerCase().trim()
				var propB = String(b[self.order.field]).toLowerCase().trim()
				if (self.order.ascending) {
					if (propA < propB) { return -1 }
					if (propA > propB) { return 1 }
				} else {
					if (propA < propB) { return 1 }
					if (propA > propB) { return -1 }
				}
				return 0
			})
			return songs
		},
		filteredSongs () {
			var songs = this.songsArray, self = this
			if (this.search != '') {
				songs = songs.filter(song => {
					// filter fields: title, subtitle
					var key = self.search.toLowerCase()
					return song.title.toLowerCase().indexOf(key) !== -1 || song.subtitle.toLowerCase().indexOf(key) !== -1
				})
			}
			if (this.filter != '') {
				songs = songs.filter(song => {
					// filter field: tags
					return song.tags.indexOf(self.filter) !== -1
				})
			}
			if (this.tuning != '') {
				songs = songs.filter(song => {
					// filter field: tuning
					return song.tuning.indexOf(self.tuning) !== -1
				})
			}
			return songs
		}
	},
	methods: {
		sortList (field) {
			if (this.order.field == field) {
				this.order.ascending = !this.order.ascending
			} else {
				this.order.ascending = true
			}
			this.order.field = field
		}
	}
}
</script>

<style lang="scss">

</style>
