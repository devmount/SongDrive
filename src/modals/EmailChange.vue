<template>
	<div class="modal modal-sm" :class="{ active: active }">
		<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="emit('closed')"></a>
		<div class="modal-container">
			<div class="modal-header">
				<a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="emit('closed')"></a>
				<div class="modal-title h5">{{ t('modal.changeEmail') }}</div>
			</div>
			<div class="modal-body">
				<div class="content">
					<!-- email -->
					<label class="form-label" for="newemail">
						{{ t('field.newEmail') }} <span class="text-error">*</span>
					</label>
					<input
						id="newemail"
						type="email"
						v-model="user.email"
						class="form-input mb-1"
						:class="{ 'is-error': error.email.missing || error.email.mismatch || error.email.notchanged }"
						:placeholder="t('placeholder.exampleUserEmail')"
					/>
					<input
						type="email"
						v-model="user.repeat"
						class="form-input mb-1"
						:class="{ 'is-error': error.email.missing || error.email.mismatch || error.email.notchanged }"
						:placeholder="t('placeholder.repeatEmail')"
					/>
					<p
						v-if="error.email.missing || error.email.mismatch || error.email.notchanged"
						class="form-input-hint"
					>
						<span v-if="error.email.missing">{{ t('error.requiredEmail') }}</span>
						<span v-if="error.email.mismatch"> {{ t('error.emailsDontMatch') }}</span>
						<span v-if="error.email.notchanged"> {{ t('error.emailNotChanged') }}</span>
					</p>
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
				/>
				<p v-if="error.currentpassword.missing" class="form-input-hint">{{ t('error.requiredPassword') }}</p>
				<p v-if="error.currentpassword.wrong" class="form-input-hint">{{ t('error.wrongPassword') }}</p>
			</div>
			<div class="modal-footer">
				<a class="btn btn-link btn-gray" href="#" aria-label="Cancel" @click.prevent="emit('closed')">
					{{ t('button.cancel') }}
				</a>
				<button class="btn btn-primary ml-2" @click="setEmail">{{ t('button.changeEmail') }}</button>
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
	email: '',
	repeat: '',
	currentpassword: ''
});
const error = reactive({
	email: {
		missing: false,
		mismatch: false,
		notchanged: false,
	},
	currentpassword: {
		missing: false,
		wrong: false,
	}
});

// emits
const emit = defineEmits(['closed']);

// computed
// calculate wether form errors occured
const errors = computed(() => (
	error.email.missing ||
	error.email.mismatch ||
	error.email.notchanged ||
	error.currentpassword.missing
));

// methods
// save user object to database
const setEmail = () => {
	const currentUser = firebase.auth().currentUser;
	// first check for form errors
	error.email.missing = user.email == '';
	error.email.mismatch = user.email != user.repeat;
	error.email.notchanged = user.email == currentUser.email;
	error.currentpassword.missing = user.currentpassword == '';
	// no errors: send submitted user data and close modal
	if (!errors.value) {
		// first reauthenticate user
		const credential = firebase.auth.EmailAuthProvider.credential(
			currentUser.email, 
			user.currentpassword
		);
		currentUser.reauthenticateWithCredential(credential).then(() => {
			// successfully reauthenticated, now update email address ...
			db.collection('users').doc(currentUser.uid).update({
				email: user.email,
			}).then(() => {
				currentUser.updateEmail(user.email).then(() => {
					// ... and send verification email
					currentUser.sendEmailVerification().then(() => {
						emit('closed');
						notify({
							title: t('toast.verficationSent'),
							text: t('toast.verficationSentText'),
							type: 'primary'
						});
					}).catch((error) => throwError(error));
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
};
</script>
