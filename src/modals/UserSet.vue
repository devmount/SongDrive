<template>
	<div class="modal modal-sm" :class="{ active: active }">
		<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="$emit('closed')"></a>
		<div class="modal-container">
			<div class="modal-header">
				<a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="$emit('closed')"></a>
				<div class="modal-title h5">
					<span v-if="state=='new' || state=='registered'">{{ $t('modal.addUser') }}</span>
					<span v-if="state=='confirmed'">{{ $t('modal.editUser') }}</span>
				</div>
			</div>
			<div class="modal-body">
				<div class="content">
					<!-- name -->
					<label class="form-label" for="user-name">{{ $t('field.name') }} <span class="text-error">*</span></label>
					<input
						id="user-name"
						type="text"
						v-model="user.name"
						class="form-input mb-1"
						:class="{ 'is-error': error.name }"
						:placeholder="$t('placeholder.exampleUserName')"
					/>
					<p v-if="error.name" class="form-input-hint">{{ $t('error.requiredName') }}</p>
					<!-- email -->
					<label class="form-label" for="user-email">{{ $t('field.email') }} <span class="text-error">*</span></label>
					<input
						id="user-email"
						type="email"
						v-model="user.email"
						class="form-input mb-1"
						:class="{ 'is-error': error.email }"
						:placeholder="$t('placeholder.exampleUserEmail')"
					/>
					<p v-if="error.email" class="form-input-hint">{{ $t('error.requiredEmail') }}</p>
					<!-- password -->
					<div v-if="state=='new'">
						<label class="form-label" for="password">{{ $t('field.password') }} <span class="text-error">*</span></label>
						<input
							id="password"
							type="password"
							v-model="user.password"
							class="form-input mb-1"
							:class="{ 'is-error': error.password.missing || error.password.tooshort }"
							:placeholder="$t('placeholder.examplePassword', { p: example.password })"
						/>
						<p v-if="error.password.missing || error.password.tooshort" class="form-input-hint">
							<span v-if="error.password.missing">{{ $t('error.requiredPassword') }}</span>
							<span v-if="error.password.tooshort"> {{ $t('error.passwordTooShort') }}</span>
						</p>
					</div>
					<!-- role -->
					<label class="form-label" for="role">{{ $t('field.role') }} <span class="text-error">*</span></label>
					<select v-model="permission.role" id="role" class="form-select filter" required>
						<option value="" disabled selected>{{ $t('placeholder.select') }}</option>
						<option v-for="(r, k) in userRoles()" :key="k" :value="k">{{ $t('role.' + k) }}</option>
					</select>
				</div>
				<!-- admin password confirmation -->
				<div v-if="state=='new'">
					<hr />
					<label class="form-label" for="adminpassword">{{ $t('text.confirmWithAdminPassword') }} <span class="text-error">*</span></label>
					<input
						id="adminpassword"
						type="password"
						v-model="admin.password"
						class="form-input mb-1"
						:class="{ 'is-error': error.adminpassword }"
					/>
					<p v-if="error.adminpassword" class="form-input-hint">{{ $t('error.requiredPassword') }}</p>
				</div>
			</div>
			<div class="modal-footer">
				<a class="btn btn-link btn-gray" href="#" aria-label="Cancel" @click.prevent="$emit('closed')">
					{{ $t('button.cancel') }}
				</a>
				<button class="btn btn-primary ml-2" @click="setUser">
					<span v-if="state=='new' || state=='registered'">{{ $t('button.addUser') }}</span>
					<span v-if="state=='confirmed'">{{ $t('button.updateUser') }}</span>
				</button>
			</div>
		</div>
	</div>
</template>

<script>
import firebase from 'firebase/compat/app';

export default {
	name: 'user-set',
	props: {
		active: Boolean,     // state of modal display, true to show modal
		userId: String,      // user id, if user or registration exists
		initialUser: Object, // user object with name, email and password
		role: String,        // user role for permission
		state: String,       // user state: confirmed | registered | new
	},
	data () {
		return {
			user: JSON.parse(JSON.stringify(this.initialUser)),
			permission: {
				role: this.role
			},
			admin: {
				password: ''
			},
			example: {
				password: this.examplePassword(8)
			},
			error: {
				name: false,
				email: false,
				password: {
					missing: false,
					tooshort: false,
				},
				role: false,
				adminpassword: false
			}
		}
	},
	methods: {
		// save user object to database
		setUser() {
			// first check for form errors
			this.error.name = this.user.name == '';
			this.error.email = this.user.email == '';
			this.error.password.missing = this.state == 'new' && this.user.password == '';
			this.error.password.tooshort = this.state == 'new' && this.user.password.length < 8;
			this.error.role = this.permission.role == '';
			this.error.adminpassword = this.state == 'new' && this.admin.password == '';
			// no errors: send submitted user data and close modal
			if (!this.errors) {
				// user exists and is confirmed
				if (this.state == 'confirmed') {
					console.log(this.userId);
					// first set permissions
					this.$db.collection('permissions').doc(this.userId).update(this.permission).then(() => {
						// permissions updated successfully, now update user
						this.$db.collection('users').doc(this.userId).update({
							name: this.user.name,
							email: this.user.email,
						}).then(() => {
							this.$emit('closed');
							this.$notify({
								title: this.$parent.$t('toast.userUpdated'),
								text: this.$parent.$t('toast.userSavedText'),
								type: 'primary'
							});
						}).catch((error) => this.throwError(error));
					}).catch((error) => this.throwError(error));
				}
				// user is not yet confirmed
				if (this.state == 'registered') {
					// first set permissions
					this.$db.collection('permissions').doc(this.userId).set(this.permission).then(() => {
						// permissions updated successfully, now create user
						this.$db.collection('users').doc(this.userId).set({
							name: this.user.name,
							email: this.user.email,
						}).then(() => {
							// user created successfully, now delete registration
							this.$db.collection('registrations').doc(this.userId).delete().then(() => {
								this.$emit('closed');
								this.$notify({
									title: this.$parent.$t('toast.userAdded'),
									text: this.$parent.$t('toast.userSavedText'),
									type: 'primary'
								});
							}).catch((error) => this.throwError(error));
						}).catch((error) => this.throwError(error));
					}).catch((error) => this.throwError(error));
				}
				// user doesn't exist
				if (this.state == 'new') {
					const email = firebase.auth().currentUser.email;
					// create firebase user first
					firebase.auth().createUserWithEmailAndPassword(this.user.email, this.user.password).then(() => {
						// get new user id
						const userId = firebase.auth().currentUser.uid;
						// relogin with admin user
						firebase.auth().signOut().then(() => {
							firebase.auth().signInWithEmailAndPassword(email, this.admin.password).then(() => {
								// now set permissions
								this.$db.collection('permissions').doc(userId).set(this.permission).then(() => {
									// permissions created successfully, now create user
									this.$db.collection('users').doc(userId).set({
										name: this.user.name,
										email: this.user.email,
									}).then(() => {
										this.$emit('closed');
										this.$notify({
											title: this.$parent.$t('toast.userAdded'),
											text: this.$parent.$t('toast.userSavedText'),
											type: 'primary'
										});
									}).catch((error) => this.throwError(error));
								}).catch((error) => this.throwError(error));
							}).catch((error) => this.throwError(error));
						}).catch((error) => this.throwError(error));
					}).catch((error) => this.throwError(error));
				}
			}
		}
	},
	computed: {
		// calculate wether form errors occured
		errors () {
			return (
				this.error.name ||
				this.error.email ||
				this.error.password.missing ||
				this.error.password.tooshort ||
				this.error.role ||
				this.error.adminpassword
			);
		}
	}
}
</script>
