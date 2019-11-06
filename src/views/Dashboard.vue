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
				<!-- song list -->
				<div class="column col-4">
					<h3>{{ songsProperty }} Songs</h3>
					<div
						v-for="(song, i) in songlist"
						:key="i"
						class="tile tile-centered tile-hover c-hand p-2"
						@click="$router.push({ name: 'song-show', params: { id: song['.key'] }})"
					>
						<div class="tile-icon">
							<figure class="avatar s-rounded" :data-initial="song.tuning" title="Song tuning"></figure>
							<figure
								v-if="songsProperty == 'popular'"
								class="avatar avatar-secondary s-rounded float-right ml-1"
								:data-initial="song.popularity + 'x'"
								:title="'This song occured on ' + song.popularity + ' setlists'"
							></figure>
							<figure
								v-if="songsProperty == 'newest' || songsProperty == 'oldest'"
								class="avatar avatar-secondary s-rounded float-right ml-1"
								:data-initial="song.year"
								:title="'This song was published in ' + song.year"
							></figure>
						</div>
						<div class="tile-content">
							<div class="tile-title">{{ song.title }}</div>
							<div class="tile-subtitle text-gray text-small">{{ song.subtitle }}</div>
						</div>
					</div>
					<div class="btn-group">
						<button class="btn btn-secondary" @click="shuffleSongs"><i class="form-icon icon ion-md-shuffle mr-2"></i>Shuffle</button>
						<button v-if="songsProperty != 'newest'" class="btn btn-secondary" @click="newestSongs"><i class="form-icon icon ion-md-arrow-up mr-2"></i>Newest</button>
						<button v-if="songsProperty == 'newest'" class="btn btn-secondary" @click="oldestSongs"><i class="form-icon icon ion-md-arrow-down mr-2"></i>Oldest</button>
						<button class="btn btn-secondary" @click="popularSongs"><i class="form-icon icon ion-md-trending-up mr-2"></i>Popular</button>
						<router-link to="/songs" class="btn btn-secondary" ><i class="form-icon icon ion-md-arrow-forward mr-2"></i>All Songs</router-link>
					</div>
				</div>
				<!-- setlist list -->
				<div class="column col-4">
					<h3>{{ setlistsProperty }} Setlists</h3>
					<div
						v-for="(setlist, i) in setlistlist"
						:key="i"
						class="tile tile-centered tile-hover c-hand p-2"
						@click="$router.push({ name: 'setlist-show', params: { id: setlist['.key'] }})"
					>
						<div class="tile-icon">
							<figure
								class="avatar avatar-secondary s-rounded"
								:data-initial="setlist.songs.length"
								:title="'This setlist contains ' + setlist.songs.length + ' songs'"
							></figure>
						</div>
						<div class="tile-content">
							<div class="tile-title">{{ setlist.title }}</div>
							<div class="tile-subtitle text-gray text-small">{{ setlist.date }}</div>
						</div>
					</div>
					<div class="btn-group">
						<button v-if="setlistsProperty != 'newest'" class="btn btn-secondary" @click="newestSetlists"><i class="form-icon icon ion-md-arrow-up mr-2"></i>Newest</button>
						<button v-if="setlistsProperty == 'newest'" class="btn btn-secondary" @click="oldestSetlists"><i class="form-icon icon ion-md-arrow-down mr-2"></i>Oldest</button>
						<router-link to="/setlists" class="btn btn-secondary" ><i class="form-icon icon ion-md-arrow-forward mr-2"></i>All Setlists</router-link>
					</div>
				</div>
				<!-- version info -->
				<div class="column col-12 mt-4 pt-4">
					<h3>About</h3>
					<p>SongDrive <code>v1.0.3</code></p>
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
			this.reorderedSongs = this.songs.filter(s => s.year > 0).sort((a, b) => (a.year < b.year) ? 1 : ((b.year < a.year) ? -1 : 0)).slice(0, this.listLength)
		},
		oldestSongs () {
			this.songsProperty = 'oldest'
			this.reorderedSongs = this.songs.filter(s => s.year > 0).sort((a, b) => (a.year > b.year) ? 1 : ((b.year > a.year) ? -1 : 0)).slice(0, this.listLength)
		},
		popularSongs () {
			this.songsProperty = 'popular'
			let popularSongs = {}
			this.setlists.forEach(setlist => {
				if (setlist.songs) {
					setlist.songs.forEach(song => {
						if (!popularSongs.hasOwnProperty(song.id)) {
							popularSongs[song.id] = 0
						} else {
							popularSongs[song.id]++
						}
					})
				}
			})
			var idList = []
			for (var id in popularSongs) {
				idList.push([id, popularSongs[id]])
			}
			let orderedSongIds = idList.sort((a, b) => b[1] - a[1]).splice(0, this.listLength).reduce((a, c) => a.concat(c[0]), [])
			this.reorderedSongs = this.songs
				.filter(s => orderedSongIds.includes(s['.key']))
				.map(s => Object.assign({popularity: popularSongs[s['.key']]}, s))
				.sort((a, b) => (a.popularity < b.popularity) ? 1 : ((b.popularity < a.popularity) ? -1 : 0))
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
.dashboard {
	.tile .tile-icon .avatar-secondary {
		width: 2rem;
		font-size: 0.7rem;
	}
}
</style>
