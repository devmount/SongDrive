<template>
	<div class="profile">
		<div class="container no-sidebar">
			<div v-if="user && userObject" class="columns">
				<!-- heading -->
				<div class="column col-12">
					<h2 class="view-title">
						{{ $t('page.profile') }}
					</h2>
				</div>
				<div class="column col-4 col-xl-6 col-sm-12 mt-4">
					<div class="panel">
						<div class="panel-header text-center">
							<figure v-if="userObject.photoURL" class="avatar avatar-xxl mb-2">
								<img :src="userObject.photoURL" alt="Avatar" />
							</figure>
							<figure
								v-else-if="userName"
								class="avatar avatar-xxl mb-2"
								:data-initial="userName.substring(0,2).toUpperCase()"
							></figure>
							<div v-if="userName" class="panel-title h5">{{ userName }}</div>
							<div v-if="roleName" class="panel-subtitle text-gray">{{ $t('role.' + roleName) }}</div>
						</div>
						<div class="panel-body">
							<div v-if="userObject.email" class="tile tile-centered mb-2">
								<div class="tile-content">
									<div class="tile-title text-bold">{{ $t('field.email') }}</div>
									<div class="tile-subtitle text-gray">{{ userObject.email }}</div>
								</div>
								<div class="tile-icon text-gray">
									<ion-icon name="mail-outline" class="icon-1-5x"></ion-icon>
								</div>
							</div>
							<div v-if="userObject.photoURL" class="tile tile-centered mb-2">
								<div class="tile-content">
									<div class="tile-title text-bold">{{ $t('field.photo') }}</div>
									<div class="tile-subtitle text-gray">{{ userObject.photoURL.substr(0,40) }}...</div>
								</div>
								<div class="tile-icon text-gray">
									<ion-icon name="camera-outline" class="icon-1-5x"></ion-icon>
								</div>
							</div>
						</div>
						<div v-if="role" class="panel-footer">
							<router-link
								to="/settings"
								class="btn btn-secondary btn-block text-uppercase mb-1"
								@click.native="open = false"
							>
								<ion-icon name="options"></ion-icon>
								{{ $t('page.settings')}}
								<ion-icon name="create-outline" class="float-right ml-2"></ion-icon>
							</router-link>
						</div>
					</div>
				</div>
				<div v-if="role > 1" class="column col-4 col-xl-6 col-sm-12 mt-4">
					<div class="columns">
						<div class="column col-12">
							<div class="panel">
								<div class="panel-body text-center pb-3">
									<div v-if="!ready.setlists" class="loading loading-xl d-block text-huge">&nbsp;</div>
									<div v-else class="text-huge">{{ Object.keys(setlistsFromUser).length }}</div>
									<div class="panel-title h5">
										<ion-icon name="list" class="mr-2"></ion-icon>
										{{ $t('widget.setlistsCreated')}}
									</div>
								</div>
							</div>
						</div>
						<div class="column col-12 mt-4">
							<div class="panel">
								<div class="panel-body text-center pb-3">
									<div v-if="!ready.setlists" class="loading loading-xl d-block text-huge">&nbsp;</div>
									<div v-else class="text-huge">
										<span class="text-gray">~</span>{{ songsFromUser }}<span class="text-transparent">~</span>
									</div>
									<div class="panel-title h5">
										<ion-icon name="musical-notes" class="mr-2"></ion-icon>
										{{ $t('widget.songsPerformed') }}
									</div>
								</div>
							</div>
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
	props: ['setlists', 'user', 'users', 'userObject', 'role', 'roleName', 'ready'],
	computed: {
		userName () {
			return this.userObject.displayName
				? this.userObject.displayName
				: this.users[this.user]?.name ? this.users[this.user].name : '';
		},
		setlistsFromUser () {
			return Object.filter(this.setlists, s => s.creator == this.userObject.uid);
		},
		songsFromUser () {
			let list = this.setlistsFromUser;
			return Object.keys(list).reduce((previous, key) => previous + list[key].songs.length, 0);
		}
	}
}
</script>
