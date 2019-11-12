<template>
	<div class="settings">
		<div class="container no-sidebar">
			<div class="columns">
				<!-- heading -->
				<div class="column col-12">
					<h2 class="view-title">
						Settings
					</h2>
				</div>
				<div class="column col-4">
					<div class="panel mt-3">
						<div class="panel-body">
							<div class="form-group">
								<label class="form-label" for="name">Name</label>
								<input v-model="user.displayName" class="form-input" id="name" type="text" placeholder="john doe" />
							</div>
							<div class="form-group">
								<label class="form-label" for="role">Role</label>
								<input v-model="user.role" class="form-input" id="role" type="text" placeholder="reader" disabled />
							</div>
							<div class="form-group">
								<label class="form-label" for="email">Email</label>
								<input v-model="user.email" class="form-input" id="email" type="text" placeholder="john@doe.com" disabled />
							</div>
							<div class="form-group mb-3">
								<label class="form-label" for="photo">Photo</label>
								<input v-model="user.photoURL" class="form-input" id="photo" type="text" placeholder="https://your-photo.link/image.png" />
							</div>
							<label for="preview" class="mr-4">Preview:</label>
							<figure v-if="user.photoURL" id="preview" class="avatar avatar-xxl mb-2">
								<img :src="user.photoURL" alt="Avatar" />
							</figure>
							<figure v-else id="preview" class="avatar avatar-xxl" :data-initial="user.displayName.substring(0,2).toUpperCase()"></figure>
						</div>
						<div class="panel-footer mt-5">
							<button class="btn btn-primary btn-block text-uppercase" @click="updateUser">
								<i class="icon ion-md-save float-left ml-1"></i> Save
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
// get database object authorized in config.js
import { db } from '@/firebase'

export default {
	name: 'settings',
	props: ['userObject', 'roleName'],
	data () {
		return {
			user: {
				displayName: this.userObject.displayName,
				role: this.roleName,
				email: this.userObject.email,
				photoURL: this.userObject.photoURL
			}
		}
	},
	methods: {
		updateUser () {
			let self = this
			this.userObject.updateProfile(this.user).then(function() {
				db.collection('users').doc(self.userObject.uid).update({
					name: self.user.displayName,
					email: self.user.email
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
						text: 'There was an error when updateing user data.',
						type: 'toast-error'
					})
				})
			}, function() {
				// An error happened.
				self.$notify({
					title: '<button class="btn btn-clear float-right"></button>Error!',
					text: 'There was an error when updateing user data.',
					type: 'toast-error'
				})
			});
		}
	}
}
</script>

<style lang="scss">

</style>
