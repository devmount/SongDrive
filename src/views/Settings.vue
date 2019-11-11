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
				<div class="column col-6">
					<div class="form-group">
						<label class="form-label" for="name">Name</label>
						<input v-model="user.displayName" class="form-input" id="name" type="text" placeholder="john doe" />
					</div>
					<div class="form-group">
						<label class="form-label" for="email">Email</label>
						<input v-model="user.email" class="form-input" id="email" type="text" placeholder="john@doe.com" disabled />
					</div>
					<div class="form-group">
						<label class="form-label" for="photo">Photo</label>
						<input v-model="user.photoURL" class="form-input" id="photo" type="text" placeholder="https://your-photo.link/image.png" />
					</div>
					<button class="btn btn-primary" @click="updateUser">
						Update User
					</button>
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
	props: ['userObject'],
	data () {
		return {
			user: {
				displayName: this.userObject.displayName,
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
