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
					<h3>Latest Songs</h3>
					<div
						v-for="(song, i) in songs.slice(0, 10)"
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
				</div>
				<div class="column col-4">
					<h3>Latest Setlists</h3>
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
				ref: db.collection('songs'),
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
		}
	},
}
</script>

<style lang="scss">

</style>
