<template>
	<div class="modal modal-sm" :class="{ active: active }">
		<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="$emit('closed')"></a>
		<div class="modal-container">
			<div class="modal-header">
				<a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="$emit('closed')"></a>
				<div class="modal-title h5">{{ $t('modal.changeEmail') }}</div>
			</div>
			<div class="modal-body">
				<div class="content">
					<!-- email -->
					<label class="form-label" for="newemail">
						{{ $t('field.newEmail') }} <span class="text-error">*</span>
					</label>
					<input
						id="newemail"
						type="email"
						v-model="user.email"
						class="form-input mb-1"
						:class="{ 'is-error': error.email.missing || error.email.mismatch || error.email.notchanged }"
						:placeholder="$t('placeholder.exampleUserEmail')"
					/>
					<input
						type="email"
						v-model="user.repeat"
						class="form-input mb-1"
						:class="{ 'is-error': error.email.missing || error.email.mismatch || error.email.notchanged }"
						:placeholder="$t('placeholder.repeatEmail')"
					/>
					<p
						v-if="error.email.missing || error.email.mismatch || error.email.notchanged"
						class="form-input-hint"
					>
						<span v-if="error.email.missing">{{ $t('error.requiredEmail') }}</span>
						<span v-if="error.email.mismatch"> {{ $t('error.emailsDontMatch') }}</span>
						<span v-if="error.email.notchanged"> {{ $t('error.emailNotChanged') }}</span>
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
					:class="{ 'is-error': error.currentpassword.missing || error.currentpassword.wrong }"
				/>
				<p v-if="error.currentpassword.missing" class="form-input-hint">{{ $t('error.requiredPassword') }}</p>
				<p v-if="error.currentpassword.wrong" class="form-input-hint">{{ $t('error.wrongPassword') }}</p>
			</div>
			<div class="modal-footer">
				<a class="btn btn-link btn-gray" href="#" aria-label="Cancel" @click.prevent="$emit('closed')">
					{{ $t('button.cancel') }}
				</a>
				<button class="btn btn-primary ml-2" @click="setEmail">{{ $t('button.changeEmail') }}</button>
			</div>
		</div>
	</div>
</template>

<script>
import { defineComponent } from 'vue';
import firebase from 'firebase/compat/app';

export default defineComponent({
	name: 'email-change',
	props: {
		active: Boolean, // state of modal display, true to show modal
	},
	data () {
		return {
			user: {
				email: '',
				repeat: '',
				currentpassword: ''
			},
			error: {
				email: {
					missing: false,
					mismatch: false,
					notchanged: false,
				},
				currentpassword: {
					missing: false,
					wrong: false,
				}
			}
		}
	},
	methods: {
		// save user object to database
		setEmail() {
			const user = firebase.auth().currentUser;
			// first check for form errors
			this.error.email.missing = this.user.email == '';
			this.error.email.mismatch = this.user.email != this.user.repeat;
			this.error.email.notchanged = this.user.email == user.email;
			this.error.currentpassword.missing = this.user.currentpassword == '';
			// no errors: send submitted user data and close modal
			if (!this.errors) {
				// first reauthenticate user
				const credential = firebase.auth.EmailAuthProvider.credential(
					user.email, 
					this.user.currentpassword
				);
				user.reauthenticateWithCredential(credential).then(() => {
					// successfully reauthenticated, now update email address ...
					this.$db.collection('users').doc(user.uid).update({
						email: this.user.email,
					}).then(() => {
						user.updateEmail(this.user.email).then(() => {
							// ... and send verification email
							user.sendEmailVerification().then(() => {
								this.$emit('closed');
								this.$notify({
									title: this.$t('toast.verficationSent'),
									text: this.$t('toast.verficationSentText'),
									type: 'primary'
								});
							}).catch((error) => this.throwError(error));
						}).catch((error) => this.throwError(error));
					}).catch((error) => this.throwError(error));
				}).catch(() => {
					this.error.currentpassword.wrong = true;
					this.$notify({
						title: this.$t('toast.passwordWrong'),
						text: this.$t('toast.passwordWrongText'),
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
				this.error.email.missing ||
				this.error.email.mismatch ||
				this.error.email.notchanged ||
				this.error.currentpassword.missing
			);
		}
	}
});
</script>
