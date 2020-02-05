<template>
	<div class="settings">
		<div class="container no-sidebar">
			<div v-if="user && userObject" class="columns">
				<!-- heading -->
				<div class="column col-12">
					<h2 class="view-title">
						Settings
					</h2>
				</div>
				<div class="column col-4 col-xl-6 col-md-12">
					<div class="panel mt-3">
						<div class="panel-header text-center">
							<i class="icon ion-md-person icon-2x"></i>
							<div class="panel-title h5 mt-1">Profile</div>
							<div class="panel-subtitle text-gray">Customize your profile data</div>
						</div>
						<div class="panel-body">
							<div class="form-group">
								<label class="form-label" for="name">Name</label>
								<input v-model="profile.displayName" class="form-input" id="name" type="text" placeholder="john doe" />
							</div>
							<div class="form-group">
								<label class="form-label" for="role">Role</label>
								<input v-model="profile.role" class="form-input" id="role" type="text" placeholder="reader" disabled />
							</div>
							<div class="form-group">
								<label class="form-label" for="email">Email</label>
								<input v-model="profile.email" class="form-input" id="email" type="text" placeholder="john@doe.com" disabled />
							</div>
							<div class="form-group mb-3">
								<label class="form-label" for="photo">Photo</label>
								<input v-model="profile.photoURL" class="form-input" id="photo" type="text" placeholder="https://your-photo.link/image.png" />
							</div>
							<label for="preview" class="mr-4">Preview:</label>
							<figure v-if="profile.photoURL" id="preview" class="avatar avatar-xxl mb-2">
								<img :src="profile.photoURL" alt="Avatar" />
							</figure>
							<figure v-else-if="profile.displayName" id="preview" class="avatar avatar-xxl" :data-initial="profile.displayName.substring(0,2).toUpperCase()"></figure>
						</div>
						<div class="panel-footer mt-5">
							<button class="btn btn-primary btn-block text-uppercase" @click="updateProfile">
								<i class="icon ion-md-save float-left ml-1"></i> Save Profile
							</button>
						</div>
					</div>
				</div>
				<div v-if="role > 3" class="column col-4 col-xl-6 col-md-12">
					<div class="panel mt-3">
						<div class="panel-header text-center">
							<i class="icon ion-md-people icon-2x"></i>
							<div class="panel-title h5 mt-1">{{ Object.keys(users).length }} Users</div>
							<div class="panel-subtitle text-gray">Manage all users</div>
						</div>
						<div class="panel-body">
							<div
								v-for="(u, k) in users" :key="k"
								class="tile tile-centered tile-hover p-2"
							>
								<div class="tile-icon">
									<figure v-if="u.photoURL" class="avatar mr-2">
										<img :src="u.photoURL" alt="Avatar" />
									</figure>
									<div v-else class="avatar text-center">
										<i class="icon ion-md-person"></i>
									</div>
								</div>
								<div class="tile-content">
									<span class="label float-right py-1 px-2">{{ u.role }}</span>
									<div class="tile-title">{{ u.name }}</div>
									<div class="tile-subtitle text-gray text-small">{{ u.email }}</div>
								</div>
								<div class="tile-action">
									<button class="btn btn-link btn-action" @click.prevent="active.user=u; active.key=k; active.existing=true; modal.userset=true">
										<i class="icon ion-md-create"></i>
									</button>
								</div>
							</div>
						</div>
						<div class="panel-footer mt-5">
							<div class="panel-title h5 mt-1 text-center">{{ Object.keys(registrations).length }} Registrations</div>
							<div class="panel-subtitle mb-4 text-gray text-center">Manage all unconfirmed users</div>
							<div
								v-for="r in registrations" :key="r['.key']"
								class="tile tile-centered tile-hover p-2"
							>
								<div class="tile-icon">
									<div class="avatar bg-dark text-center">
										<i class="icon ion-md-person"></i>
									</div>
								</div>
								<div class="tile-content">
									<span class="label float-right py-1 px-2">unconfirmed</span>
									<div class="tile-title">{{ r.name }}</div>
									<div class="tile-subtitle text-gray text-small">{{ r.email }}</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div v-if="role > 3" class="column col-4 col-xl-6 col-md-12">
					<div class="panel mt-3">
						<div class="panel-header text-center">
							<i class="icon ion-md-pricetags icon-2x"></i>
							<div class="panel-title h5 mt-1">{{ Object.keys(tags).length }} Tags</div>
							<div class="panel-subtitle text-gray">Manage all tags</div>
						</div>
						<div class="panel-body">
							<router-link v-for="tag in tags" :key="tag.key" :to="{ name: 'songs-tag', params: { tag: tag.key }}" class="mr-2">
								<span class="label px-2 py-1 my-1">
									<i class="icon ion-md-pricetag mr-1"></i>
									{{ tag.key }}
								</span>
							</router-link>
						</div>
						<!-- <div class="panel-footer mt-5">
							<button class="btn btn-primary btn-block text-uppercase" @click="updateTags">
								<i class="icon ion-md-save float-left ml-1"></i> Save Tags
							</button>
						</div> -->
					</div>
				</div>
				<div v-if="role > 3" class="column col-4 col-xl-6 col-md-12">
					<div class="panel mt-3">
						<div class="panel-header text-center">
							<i class="icon ion-md-filing icon-2x"></i>
							<div class="panel-title h5 mt-1">Backup</div>
							<div class="panel-subtitle text-gray">Export and import SongDrive data</div>
						</div>
						<!-- <div class="panel-body">
							<router-link v-for="tag in tags" :key="tag.key" :to="{ name: 'songs-tag', params: { tag: tag.key }}" class="mr-2">
								<span class="label px-2 py-1 my-1">
									<i class="icon ion-md-pricetag mr-1"></i>
									{{ tag.key }}
								</span>
							</router-link>
						</div> -->
						<div class="panel-footer mt-5">
							<button class="btn btn-primary btn-block text-uppercase" @click="exportDb">
								<i class="icon ion-md-download float-left ml-1"></i> Export
							</button>
						</div>
					</div>
				</div>
			</div>

			<UserSet
				v-if="modal.userset"
				:db="db"
				:active="modal.userset"
				:existing="active.existing"
				:initialUser="active.user"
				:userKey="active.key"
				@closed="modal.userset = false"
			/>
		</div>
	</div>
</template>

<script>
// get basic program parameters
import basics from '@/basics.js'
// get components
import UserSet from '@/components/UserSet.vue'

export default {
	name: 'settings',
	components: {
		UserSet,
	},
	props: ['db', 'user', 'userObject', 'roleName', 'role', 'users', 'registrations', 'tags', 'songs', 'setlists'],
	data () {
		return {
			profile: {
				displayName: this.userObject.displayName,
				role: this.roleName,
				email: this.userObject.email,
				photoURL: this.userObject.photoURL
			},
			modal: {
				userset: false,
			},
			active: {
				user: {},
				key: '',
				existing: true,
			}
		}
	},
	methods: {
		updateProfile () {
			let self = this
			this.userObject.updateProfile(this.profile).then(function() {
				self.db.collection('users').doc(self.userObject.uid).update({
					name: self.profile.displayName,
					email: self.profile.email
				}).then(function() {
					// Profile updated successfully!
					self.$notify({
						title: '<button class="btn btn-clear float-right"></button>Success!',
						text: 'User data was updated.',
						type: 'toast-primary'
					})
				})
				.catch(function() {
					// An error happened.
					self.$notify({
						title: '<button class="btn btn-clear float-right"></button>Error!',
						text: 'There was an error when updating user data.',
						type: 'toast-error'
					})
				})
			}, function() {
				// An error happened.
				self.$notify({
					title: '<button class="btn btn-clear float-right"></button>Error!',
					text: 'There was an error when updating user data.',
					type: 'toast-error'
				})
			});
		},
		updateTags () {
			// TODO
		},
		exportDb () {
			let data = {
				'songs': this.songs,
				'setlists': this.setlists,
				'users': this.users,
				'tags': this.tags
			}
			basics.download(JSON.stringify(data), (new Date().toJSON().slice(0,10).replace(/-/g, '')) + '_songdrive.json')
			// toast success message
			this.$notify({
				title: '<button class="btn btn-clear float-right"></button>Success!',
				text: 'The song was exported as text file.',
				type: 'toast-primary'
			})
		},
	}
}
</script>

<style lang="scss">

</style>
