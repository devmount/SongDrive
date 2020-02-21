<template>
	<div class="modal modal-sm" :class="{ active: active }">
		<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="$emit('closed')"></a>
		<div class="modal-container">
			<div class="modal-header">
				<a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="$emit('closed')"></a>
				<div class="modal-title h5">
					<span v-if="!existing">{{ $t('modal.addUser') }}</span>
					<span v-else>{{ $t('modal.editUser') }}</span>
				</div>
			</div>
			<div class="modal-body">
				<div class="content">
					<label class="form-label" for="name">{{ $t('field.name') }} <span class="text-error">*</span></label>
					<input id="name" type="text" v-model="user.name" class="form-input mb-1" :class="{ 'is-error': error.name }" :placeholder="$t('placeholder.exampleUserName')" />
					<p v-if="error.name" class="form-input-hint">{{ $t('error.requiredName') }}</p>
					<label class="form-label" for="email">{{ $t('field.email') }} <span class="text-error">*</span></label>
					<input id="email" type="email" v-model="user.email" class="form-input mb-1" :class="{ 'is-error': error.email }" :placeholder="$t('placeholder.exampleUserEmail')" />
					<p v-if="error.email" class="form-input-hint">{{ $t('error.requiredEmail') }}</p>
					<label class="form-label" for="role">{{ $t('field.role') }} <span class="text-error">*</span></label>
					<select v-model="user.role" id="role" class="form-select filter" required>
						<option value="" disabled selected>{{ $t('placeholder.select') }}</option>
						<option v-for="(r,k) in roles" :key="k" :value="k">{{ k }}</option>
					</select>
				</div>
			</div>
			<div class="modal-footer">
				<a class="btn btn-link btn-gray" href="#" aria-label="Cancel" @click.prevent="$emit('closed')">{{ $t('button.cancel') }}</a>
				<button class="btn btn-primary ml-2" @click="setUser">
					<span v-if="!existing">{{ $t('button.addUser') }}</span>
					<span v-else>{{ $t('button.updateUser') }}</span>
				</button>
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
			this.error.role = this.user.role == ''
			// no errors: send submitted user data and close modal
			if (!this.errors) {
				let self = this
				if (this.existing) {
					this.db.collection('users').doc(this.userKey).update({
						name: self.user.name,
						email: self.user.email,
						role: self.user.role
					}).then(function() {
						// user updated successfully!
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
				// user is not yet confirmed
				else {
					this.db.collection('users').doc(this.userKey).set({
						name: self.user.name,
						email: self.user.email,
						role: self.user.role
					}).then(function() {
						// user added successfully, now delete temporary registration
						self.db.collection('registrations').doc(self.userKey).delete().then(function() {
							self.$notify({
								title: '<button class="btn btn-clear float-right"></button>Success!',
								text: 'User was successfully added.',
								type: 'toast-primary'
							})
						})
					})
					.catch(function() {
						// An error happened.
						self.$notify({
							title: '<button class="btn btn-clear float-right"></button>Error!',
							text: 'There was an error when adding user.',
							type: 'toast-error'
						})
					})
					this.$emit('closed')
				}
			}
		}
	},
	computed: {
		// calculate wether form errors occured
		errors () {
			return (this.error.name || this.error.email || this.error.role)
		}
	}
}
</script>

<style lang="scss">

</style>
