<template>
	<div class="dashboard">
		<div class="container no-sidebar">
			<div class="columns">
				<!-- heading -->
				<div class="column col-12 mb-4">
					<h2 class="view-title">
						Dashboard
					</h2>
				</div>
				<div class="column col-4">
					<h3>{{ songsProperty }} Songs</h3>
					<div
						v-for="(song, i) in songlist"
						:key="i"
						class="tile tile-centered tile-hover c-hand p-2"
						@click="$router.push({ name: 'song-show', params: { id: song['.key'] }})"
					>
						<div class="tile-icon">
							<figure class="avatar s-rounded" :data-initial="song.tuning"></figure>
						</div>
						<div class="tile-content">
							<div class="tile-title">{{ song.title }}</div>
							<div class="tile-subtitle text-gray text-small">{{ song.subtitle }}</div>
						</div>
					</div>
					<button class="btn btn-secondary btn-sm mt-2 mr-2" @click="shuffleSongs"><i class="form-icon icon ion-md-shuffle mr-2"></i>Shuffle</button>
					<button class="btn btn-secondary btn-sm mt-2 mr-2" @click="newestSongs"><i class="form-icon icon ion-md-arrow-up mr-2"></i>Newest</button>
					<button class="btn btn-secondary btn-sm mt-2 mr-2" @click="oldestSongs"><i class="form-icon icon ion-md-arrow-down mr-2"></i>Oldest</button>
					<button class="btn btn-secondary btn-sm mt-2 mr-2" @click="popularSongs"><i class="form-icon icon ion-md-trending-up mr-2"></i>Popular</button>
				</div>
				<div class="column col-4">
					<h3>{{ setlistsProperty }} Setlists</h3>
					<div
						v-for="(setlist, i) in setlistlist"
						:key="i"
						class="tile tile-centered tile-hover c-hand p-2"
						@click="$router.push({ name: 'setlist-show', params: { id: setlist['.key'] }})"
					>
						<div class="tile-icon">
							<figure class="avatar s-rounded" :data-initial="setlist.songs.length"></figure>
						</div>
						<div class="tile-content">
							<div class="tile-title">{{ setlist.title }}</div>
							<div class="tile-subtitle text-gray text-small">{{ setlist.date }}</div>
						</div>
					</div>
					<button class="btn btn-secondary btn-sm mt-2 mr-2" @click="newestSetlists"><i class="form-icon icon ion-md-arrow-up mr-2"></i>Newest</button>
					<button class="btn btn-secondary btn-sm mt-2 mr-2" @click="oldestSetlists"><i class="form-icon icon ion-md-arrow-down mr-2"></i>Oldest</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
// get database object authorized in config.js
import { db } from '@/firebase'

export default {
	name: 'dashboard',
	firestore () {
		return {
			songs: {
				ref: db.collection('songs').orderBy('year', 'desc'),
				resolve: () => { this.ready.songs = true },
				reject: () => { this.ready.songs = true }
			},
			setlists: {
				ref: db.collection('setlists').orderBy('date', 'desc'),
				resolve: () => { this.ready.setlists = true },
				reject: () => { this.ready.setlists = true }
			},
			tags: db.collection('tags'),
		}
	},
	data () {
		return {
			ready: {
				songs: false,
				setlists: false,
			},
			songsProperty: 'newest',
			reorderedSongs: [],
			setlistsProperty: 'newest',
			reorderedSetlists: [],
			listLength: 8
		}
	},
	methods: {
		shuffleSongs () {
			let songs = this.songs
			for (let i = songs.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[songs[i], songs[j]] = [songs[j], songs[i]]
			}
			this.songsProperty = 'random'
			this.reorderedSongs = songs.slice(0, this.listLength)
		},
		newestSongs () {
			this.songsProperty = 'newest'
			this.reorderedSongs = this.songs.filter(s => s.year > 0).sort((a,b) => (a.year < b.year) ? 1 : ((b.year < a.year) ? -1 : 0)).slice(0, this.listLength)
		},
		oldestSongs () {
			this.songsProperty = 'oldest'
			this.reorderedSongs = this.songs.filter(s => s.year > 0).sort((a,b) => (a.year > b.year) ? 1 : ((b.year > a.year) ? -1 : 0)).slice(0, this.listLength)
		},
		popularSongs () {
			this.songsProperty = 'popular'
			var ids = {}
			this.setlists.forEach(function(setlist, i) {
				if (setlist.songs) {
					setlist.songs.forEach(function(id) {
						if (!ids.hasOwnProperty(id)) {
							ids[id] = 0
						} else {
							ids[id]++
						}
					})
				}
			})
			var sorted_ids = []
			for (var id in ids) {
				sorted_ids.push([id, ids[id]])
			}
			this.reorderedSongs = sorted_ids.sort((a, b) => b[1] - a[1]).splice(0, this.listLength)
		},
		newestSetlists () {
			this.setlistsProperty = 'newest'
			this.reorderedSetlists = this.setlists.filter(s => s.date != '').sort((a,b) => (new Date(a.date) < new Date(b.date)) ? 1 : ((new Date(b.date) < new Date(a.date)) ? -1 : 0)).slice(0, this.listLength)
		},
		oldestSetlists () {
			this.setlistsProperty = 'oldest'
			this.reorderedSetlists = this.setlists.filter(s => s.date != '').sort((a,b) => (new Date(a.date) > new Date(b.date)) ? 1 : ((new Date(b.date) > new Date(a.date)) ? -1 : 0)).slice(0, this.listLength)
		},
	},
	computed: {
		songlist () {
			if (this.reorderedSongs.length === 0) {
				return this.songs.slice(0, this.listLength)
			} else {
				return this.reorderedSongs
			}
		},
		setlistlist () {
			if (this.reorderedSetlists.length === 0) {
				return this.setlists.slice(0, this.listLength)
			} else {
				return this.reorderedSetlists
			}
		}
	}
}
</script>

<style lang="scss">

</style>
