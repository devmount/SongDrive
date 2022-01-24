<template>
	<div class="modal modal-sm" :class="{ active: active }">
		<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="$emit('closed')"></a>
		<div class="modal-container">
			<div class="modal-header">
				<a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="$emit('closed')"></a>
				<div class="modal-title h5">{{ $t('modal.changePassword') }}</div>
			</div>
			<div class="modal-body">
				<div class="content">
					<!-- password -->
					<label class="form-label" for="password">
						{{ $t('field.newPassword') }} <span class="text-error">*</span>
						<span class="float-right" :class="{ 'text-error': user.password.length < 8 }">
							{{ user.password.length }}<span v-if="user.password.length < 8"> / 8</span>
						</span>
					</label>
					<input
						id="password"
						type="password"
						v-model="user.password"
						class="form-input mb-1"
						:class="{ 'is-error': error.password.missing || error.password.mismatch || error.password.tooshort }"
						:placeholder="$t('placeholder.examplePassword', { p: example.password })"
					/>
					<input
						type="password"
						v-model="user.repeat"
						class="form-input mb-1"
						:class="{ 'is-error': error.password.missing || error.password.mismatch }"
						:placeholder="$t('placeholder.repeatPassword')"
					/>
					<p
						v-if="error.password.missing || error.password.mismatch || error.password.tooshort"
						class="form-input-hint"
					>
						<span v-if="error.password.missing">{{ $t('error.requiredPassword') }}</span>
						<span v-if="error.password.mismatch"> {{ $t('error.passwordsDontMatch') }}</span>
						<span v-if="error.password.tooshort"> {{ $t('error.passwordTooShort') }}</span>
					</p>
				</div>
				<!-- user password reauthentification -->
				<hr />
				<label class="form-label" for="currentpassword">{{ $t('text.confirmWithCurrentPassword') }} <span class="text-error">*</span></label>
				<input
					id="currentpassword"
					type="password"
					v-model="user.currentpassword"
					class="form-input mb-1"
					:class="{ 'is-error': error.currentpassword }"
				/>
				<p v-if="error.currentpassword" class="form-input-hint">{{ $t('error.requiredPassword') }}</p>
			</div>
			<div class="modal-footer">
				<a class="btn btn-link btn-gray" href="#" aria-label="Cancel" @click.prevent="$emit('closed')">
					{{ $t('button.cancel') }}
				</a>
				<button class="btn btn-primary ml-2" @click="setPassword">{{ $t('button.changePassword') }}</button>
			</div>
		</div>
	</div>
</template>

<script>
import firebase from 'firebase/compat/app';

export default {
	name: 'password-change',
	props: {
		active: Boolean,    // state of modal display, true to show modal
		userObject: Object, // currently logged in user object
	},
	data () {
		return {
			user: {
				password: '',
				repeat: '',
				currentpassword: ''
			},
			example: {
				password: this.examplePassword(8)
			},
			error: {
				password: {
					missing: false,
					mismatch: false,
					tooshort: false,
				},
				currentpassword: false
			}
		}
	},
	methods: {
		// save new password for current user
		setPassword() {
			// first check for form errors
			this.error.password.missing = this.user.password == '';
			this.error.password.mismatch = this.user.password != this.user.repeat;
			this.error.password.tooshort = this.user.password.length < 8;
			this.error.currentpassword = this.user.currentpassword == '';
			// no errors: send submitted user data and close modal
			if (!this.errors) {
				// first reauthenticate user
				const user = firebase.auth().currentUser;
				const credential = firebase.auth.EmailAuthProvider.credential(
					user.email, 
					this.user.currentpassword
				);
				user.reauthenticateWithCredential(credential).then(() => {
					// successfully reauthenticated, now update password
					user.updatePassword(this.user.password).then(() => {
						this.$emit('closed');
						this.$notify({
							title: this.$parent.$t('toast.userUpdated'),
							text: this.$parent.$t('toast.userSavedText'),
							type: 'primary'
						});
					}).catch((error) => this.throwError(error));
				}).catch(() => {
					this.$notify({
						title: this.$parent.$t('toast.passwordWrong'),
						text: this.$parent.$t('toast.passwordWrongText'),
						type: 'error'
					});
				});
			}
		}
	},
	computed: {
		// calculate wether form errors occured
		errors () {
			return (
				this.error.password.missing ||
				this.error.password.mismatch ||
				this.error.password.tooshort ||
				this.error.currentpassword
			);
		}
	}
}
</script>
