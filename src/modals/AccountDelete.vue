<template>
	<div class="modal modal-sm" :class="{ active: active }">
		<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="$emit('closed')"></a>
		<div class="modal-container">
			<div class="modal-header">
				<a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="$emit('closed')"></a>
				<div class="modal-title h5">{{ $t('modal.deleteAccount') }}</div>
			</div>
			<div class="modal-body">
				<div class="content">
					<p>{{ $t('text.reallyDeleteAccount') }}</p>
					<p class="text-danger">{{ $t('text.cannotBeUndone') }}</p>
					<!-- agree and enable further form elements -->
					<label class="form-checkbox mt-2">
						<input v-model="user.agreed" :value="true" type="checkbox">
						<i class="form-icon"></i> {{ $t('text.yesIUnderstand') }}
					</label>
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
					:disabled="!user.agreed"
				/>
				<p v-if="error.currentpassword.missing" class="form-input-hint">{{ $t('error.requiredPassword') }}</p>
				<p v-if="error.currentpassword.wrong" class="form-input-hint">{{ $t('error.wrongPassword') }}</p>
			</div>
			<div class="modal-footer">
				<a class="btn btn-link btn-gray" href="#" aria-label="Cancel" @click.prevent="$emit('closed')">
					{{ $t('button.cancel') }}
				</a>
				<button class="btn btn-error ml-2" @click="user.agreed ? deleteAccount() : null" :disabled="!user.agreed">{{ $t('button.delete') }}</button>
			</div>
		</div>
	</div>
</template>

<script>
import { defineComponent } from 'vue';
import firebase from 'firebase/compat/app';

export default defineComponent({
	name: 'account-delete',
	props: {
		active: Boolean,
	},
	data () {
		return {
			user: {
				agreed: false,
				currentpassword: ''
			},
			error: {
				currentpassword: {
					missing: false,
					wrong: false,
				}
			}
		}
	},
	methods: {
		// delete user account
		deleteAccount () {
			const user = firebase.auth().currentUser;
			// first check for form errors
			this.error.currentpassword.missing = this.user.currentpassword == '';
			// no errors: send submitted user data and close modal
			if (!this.errors) {
				// first reauthenticate user
				const credential = firebase.auth.EmailAuthProvider.credential(
					user.email, 
					this.user.currentpassword
				);
				user.reauthenticateWithCredential(credential).then(() => {
					// delete user record in users collection
					this.$db.collection('users').doc(user.uid).delete().then(() => {
						// delete user account
						user.delete().then(() => {
							this.$emit('closed');
							// toast success message
							this.$notify({
								title: this.$parent.$t('toast.accountDeleted'),
								text: this.$parent.$t('toast.accountDeletedText'),
								type: 'primary'
							});
						}).catch((error) => this.throwError(error));
					}).catch((error) => this.throwError(error));
				}).catch(() => {
					this.error.currentpassword.wrong = true;
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
				this.error.currentpassword.missing
			);
		}
	}
});
</script>
