<template>
	<div class="profile">
		<div class="container no-sidebar">
			<div v-if="user && userObject" class="columns">
				<!-- heading -->
				<div class="column col-12">
					<h2 class="view-title">
						Profile
					</h2>
				</div>
				<div class="column col-4 col-xl-6 col-sm-12">
					<div class="panel mt-4">
						<div class="panel-header text-center">
							<figure v-if="userObject.photoURL" class="avatar avatar-xxl mb-2">
								<img :src="userObject.photoURL" alt="Avatar" />
							</figure>
							<figure v-else-if="userObject.displayName" class="avatar avatar-xxl mb-2" :data-initial="userObject.displayName.substring(0,2).toUpperCase()"></figure>
							<div v-if="userObject.displayName" class="panel-title h5">{{ userObject.displayName }}</div>
							<div v-if="roleName" class="panel-subtitle text-gray">{{ roleName }}</div>
						</div>
						<!-- <nav class="panel-nav">
							<ul class="tab tab-block">
								<li class="tab-item active"><a href="#panels">Profile</a></li>
								<li class="tab-item"><a href="#panels">Files</a></li>
								<li class="tab-item"><a href="#panels">Tasks</a></li>
							</ul>
						</nav> -->
						<div class="panel-body">
							<div v-if="userObject.email" class="tile tile-centered mb-2">
								<div class="tile-content">
									<div class="tile-title text-bold">Email</div>
									<div class="tile-subtitle text-gray">{{ userObject.email }}</div>
								</div>
								<div class="tile-icon text-gray">
									<ion-icon name="mail-outline" class="icon-1-5x"></ion-icon>
								</div>
							</div>
							<div v-if="userObject.photoURL" class="tile tile-centered mb-2">
								<div class="tile-content">
									<div class="tile-title text-bold">Photo URL</div>
									<div class="tile-subtitle text-gray">{{ userObject.photoURL.substr(0,50) }}...</div>
								</div>
								<div class="tile-icon text-gray">
									<ion-icon name="camera-outline" class="icon-1-5x"></ion-icon>
								</div>
							</div>
						</div>
						<div v-if="role" class="panel-footer">
							<router-link to="/settings" class="btn btn-secondary btn-block mb-1" @click.native="open = false">
								<ion-icon name="options"></ion-icon> SETTINGS <ion-icon name="create-outline" class="float-right ml-2"></ion-icon>
							</router-link>
						</div>
					</div>
				</div>
				<div v-if="role > 1" class="column col-4 col-xl-6 col-sm-12">
					<div class="panel mt-4">
						<div class="panel-body text-center pb-3">
							<div v-if="!ready.setlists" class="loading loading-xl d-block text-huge">&nbsp;</div>
							<div v-else class="text-huge">{{ Object.keys(setlistsFromUser).length }}</div>
							<div class="panel-title h5"><ion-icon name="list" class="mr-2"></ion-icon> Setlists created</div>
						</div>
					</div>
					<div class="panel mt-4">
						<div class="panel-body text-center pb-3">
							<div v-if="!ready.setlists" class="loading loading-xl d-block text-huge">&nbsp;</div>
							<div v-else class="text-huge"><span class="text-gray">~</span>{{ songsFromUser }}<span class="text-transparent">~</span></div>
							<div class="panel-title h5"><ion-icon name="musical-notes" class="mr-2"></ion-icon> Songs performed</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'profile',
	props: ['setlists', 'user', 'userObject', 'role', 'roleName', 'ready'],
	computed: {
		setlistsFromUser () {
			return Object.filter(this.setlists, s => s.creator == this.userObject.uid)
		},
		songsFromUser () {
			let list = this.setlistsFromUser
			return Object.keys(list).reduce(function (previous, key) {
				return previous + list[key].songs.length;
			}, 0)
		},
	}
}
</script>

<style lang="scss">

</style>
