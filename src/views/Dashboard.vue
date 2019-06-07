<template>
	<div class="dashboard">
		<div class="container no-sidebar">
			<div class="columns">
				<!-- heading -->
				<div class="column col-12">
					<h2 class="view-title">
						Dashboard
					</h2>
				</div>
				<div class="column col-4">
					<h3>Latest Songs</h3>
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
