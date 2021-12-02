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
					<input
						id="name"
						type="text"
						v-model="user.name"
						class="form-input mb-1"
						:class="{ 'is-error': error.name }"
						:placeholder="$t('placeholder.exampleUserName')"
					/>
					<p v-if="error.name" class="form-input-hint">{{ $t('error.requiredName') }}</p>
					<label class="form-label" for="email">{{ $t('field.email') }} <span class="text-error">*</span></label>
					<input
						id="email"
						type="email"
						v-model="user.email"
						class="form-input mb-1"
						:class="{ 'is-error': error.email }"
						:placeholder="$t('placeholder.exampleUserEmail')"
					/>
					<p v-if="error.email" class="form-input-hint">{{ $t('error.requiredEmail') }}</p>
					<label class="form-label" for="role">{{ $t('field.role') }} <span class="text-error">*</span></label>
					<select v-model="permission.role" id="role" class="form-select filter" required>
						<option value="" disabled selected>{{ $t('placeholder.select') }}</option>
						<option v-for="(r, k) in userRoles()" :key="k" :value="k">{{ $t('role.' + k) }}</option>
					</select>
				</div>
			</div>
			<div class="modal-footer">
				<a class="btn btn-link btn-gray" href="#" aria-label="Cancel" @click.prevent="$emit('closed')">
					{{ $t('button.cancel') }}
				</a>
				<button class="btn btn-primary ml-2" @click="setUser">
					<span v-if="!existing">{{ $t('button.addUser') }}</span>
					<span v-else>{{ $t('button.updateUser') }}</span>
				</button>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'user-set',
	props: {
		active: Boolean,
		initialUser: Object,
		role: String,
		existing: Boolean,
		userKey: String,
	},
	data () {
		return {
			user: JSON.parse(JSON.stringify(this.initialUser)),
			permission: {
				role: this.role
			},
			error: {
				name: false,
				email: false,
				role: false,
			}
		}
	},
	methods: {
		// save user object to database
		setUser() {
			// first check for form errors
			this.error.name = this.user.name == '';
			this.error.email = this.user.email == '';
			this.error.role = this.permission.role == '';
			// no errors: send submitted user data and close modal
			if (!this.errors) {
				if (this.existing) {
					// first set permissions
					this.$db.collection('permissions').doc(this.userKey).update(this.permission).then(() => {
						// permissions updated successfully, now update user
						this.$db.collection('users').doc(this.userKey).update({
							name: this.user.name,
							email: this.user.email,
						}).then(() => {
							this.$notify({
								title: this.$parent.$t('toast.userUpdated'),
								text: this.$parent.$t('toast.userSavedText'),
								type: 'primary'
							});
						}).catch((error) => this.throwError(error));
					}).catch((error) => this.throwError(error));
					this.$emit('closed');
				}
				// user is not yet confirmed
				else {
					this.$db.collection('users').doc(this.userKey).set({
						name: this.user.name,
						email: this.user.email,
					}).then(() => {
						// user added successfully, now add permission and delete temporary registration
						this.$db.collection('permissions').doc(this.userKey).set(this.permission).then(() => {
							this.$db.collection('registrations').doc(this.userKey).delete().then(() => {
								this.$notify({
									title: this.$parent.$t('toast.userAdded'),
									text: this.$parent.$t('toast.userSavedText'),
									type: 'primary'
								});
							}).catch((error) => this.throwError(error));
						}).catch((error) => this.throwError(error));
					}).catch((error) => this.throwError(error));
					this.$emit('closed');
				}
			}
		}
	},
	computed: {
		// calculate wether form errors occured
		errors () {
			return (this.error.name || this.error.email || this.error.role);
		}
	}
}
</script>
