<template>
	<div class="modal modal-sm" :class="{ active: active }">
		<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="$emit('closed')"></a>
		<div class="modal-container">
			<div class="modal-header">
				<a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="$emit('closed')"></a>
				<div class="modal-title h5">Edit user</div>
			</div>
			<div class="modal-body">
				<div class="content">
					<label class="form-label" for="name">Name <span class="text-error">*</span></label>
					<input id="name" type="text" v-model="user.name" class="form-input mb-1" :class="{ 'is-error': error.name }" placeholder="John Doe" />
					<p v-if="error.name" class="form-input-hint">A name is required.</p>
					<label class="form-label" for="email">Email <span class="text-error">*</span></label>
					<input id="email" type="email" v-model="user.email" class="form-input mb-1" :class="{ 'is-error': error.email }" placeholder="john.doe@example.com" />
					<p v-if="error.email" class="form-input-hint">An email address is required.</p>
					<label class="form-label" for="role">Role <span class="text-error">*</span></label>
					<select v-model="user.role" id="role" class="form-select select-lg filter" required>
						<option value="" disabled selected>role ...</option>
						<option v-for="(r,k) in roles" :key="k" :value="k">{{ k }}</option>
					</select>
				</div>
			</div>
			<div class="modal-footer">
				<a class="btn btn-link btn-gray" href="#" aria-label="Cancel" @click.prevent="$emit('closed')">Cancel</a>
				<button class="btn btn-primary ml-2" @click="setUser">Update user</button>
			</div>
		</div>
	</div>
</template>

<script>
// get basic program parameters
import basics from '@/basics.js'

export default {
	name: 'user-set',
	props: {
		db: Object,
		active: Boolean,
		initialUser: Object,
		existing: Boolean,
		userKey: String,
	},
	data () {
		return {
			user: JSON.parse(JSON.stringify(this.initialUser)),
			error: {
				name: false,
				email: false,
			},
			roles: basics.roles,
		}
	},
	methods: {
		setUser() {
			// first check for form errors
			this.error.name = this.user.name == ''
			this.error.email = this.user.email == ''
			// no errors: send submitted user data and close modal
			if (!this.errors) {
				let self = this
				this.db.collection('users').doc(this.userKey).update({
					name: self.user.name,
					email: self.user.email,
					role: self.user.role
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
				this.$emit('closed')
			}
		}
	},
	computed: {
		// calculate wether form errors occured
		errors () {
			return (this.error.name || this.error.email)
		}
	}
}
</script>

<style lang="scss">

</style>
