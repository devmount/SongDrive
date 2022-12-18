<template>
	<div class="modal modal-sm" :class="{ active: active }">
		<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="emit('closed')"></a>
		<div class="modal-container">
			<div class="modal-header">
				<a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="emit('closed')"></a>
				<div class="modal-title h5">{{ t('modal.deleteAccount') }}</div>
			</div>
			<div class="modal-body">
				<div class="content">
					<p>{{ t('text.reallyDeleteAccount') }}</p>
					<p class="text-danger">{{ t('text.cannotBeUndone') }}</p>
					<!-- agree and enable further form elements -->
					<label class="form-checkbox mt-2">
						<input v-model="user.agreed" :value="true" type="checkbox">
						<i class="form-icon"></i> {{ t('text.yesIUnderstand') }}
					</label>
				</div>
				<!-- user password reauthentification -->
				<hr />
				<label class="form-label" for="currentpassword">{{ t('text.confirmWithCurrentPassword') }} <span class="text-error">*</span></label>
				<input
					id="currentpassword"
					type="password"
					v-model="user.currentpassword"
					class="form-input mb-1"
					:class="{ 'is-error': error.currentpassword.missing || error.currentpassword.wrong }"
					:disabled="!user.agreed"
				/>
				<p v-if="error.currentpassword.missing" class="form-input-hint">{{ t('error.requiredPassword') }}</p>
				<p v-if="error.currentpassword.wrong" class="form-input-hint">{{ t('error.wrongPassword') }}</p>
			</div>
			<div class="modal-footer">
				<a class="btn btn-link btn-gray" href="#" aria-label="Cancel" @click.prevent="emit('closed')">
					{{ t('button.cancel') }}
				</a>
				<button class="btn btn-error ml-2" @click="user.agreed ? deleteAccount() : null" :disabled="!user.agreed">{{ t('button.delete') }}</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { reactive, computed, inject } from 'vue';
import { useI18n } from "vue-i18n";
import { notify } from '@kyvg/vue3-notification';
import firebase from 'firebase/compat/app';
import { throwError } from '@/utils.js';
const { t } = useI18n();

// global properties
const db = inject('db');

// inherited properties
const props = defineProps({
	active: Boolean // state of modal display, true to show modal
});

// reactive data
const user = reactive({
	agreed: false,
	currentpassword: ''
});
const error = reactive({
	currentpassword: {
		missing: false,
		wrong: false,
	}
});

// emits
const emit = defineEmits(['closed']);

// computed
// calculate wether form errors occured
const errors = computed(() => error.currentpassword.missing);

// methods
// delete user account
const deleteAccount = () => {
	const currentUser = firebase.auth().currentUser;
	// first check for form errors
	error.currentpassword.missing = user.currentpassword == '';
	// no errors: send submitted user data and close modal
	if (!errors.value) {
		// first reauthenticate user
		const credential = firebase.auth.EmailAuthProvider.credential(
			currentUser.email, 
			user.currentpassword
		);
		currentUser.reauthenticateWithCredential(credential).then(() => {
			// delete user record in users collection
			db.collection('users').doc(currentUser.uid).delete().then(() => {
				// delete user account
				currentUser.delete().then(() => {
					emit('closed');
					// toast success message
					notify({
						title: t('toast.accountDeleted'),
						text: t('toast.accountDeletedText'),
						type: 'primary'
					});
				}).catch((error) => throwError(error));
			}).catch((error) => throwError(error));
		}).catch(() => {
			error.currentpassword.wrong = true;
			notify({
				title: t('toast.passwordWrong'),
				text: t('toast.passwordWrongText'),
				type: 'error'
			});
		});
	}
}
</script>
