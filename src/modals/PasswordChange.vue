<template>
	<div class="modal modal-sm" :class="{ active: active }">
		<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="emit('closed')"></a>
		<div class="modal-container">
			<div class="modal-header">
				<a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="emit('closed')"></a>
				<div class="modal-title h5">{{ t('modal.changePassword') }}</div>
			</div>
			<div class="modal-body">
				<div class="content">
					<!-- password -->
					<label class="form-label" for="password">
						{{ t('field.newPassword') }} <span class="text-error">*</span>
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
						:placeholder="t('placeholder.examplePassword', { p: examplePassword })"
					/>
					<input
						type="password"
						v-model="user.repeat"
						class="form-input mb-1"
						:class="{ 'is-error': error.password.missing || error.password.mismatch }"
						:placeholder="t('placeholder.repeatPassword')"
					/>
					<p
						v-if="error.password.missing || error.password.mismatch || error.password.tooshort"
						class="form-input-hint"
					>
						<span v-if="error.password.missing">{{ t('error.requiredPassword') }}</span>
						<span v-if="error.password.mismatch"> {{ t('error.passwordsDontMatch') }}</span>
						<span v-if="error.password.tooshort"> {{ t('error.passwordTooShort') }}</span>
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
					:class="{ 'is-error': error.currentpassword }"
				/>
				<p v-if="error.currentpassword" class="form-input-hint">{{ t('error.requiredPassword') }}</p>
			</div>
			<div class="modal-footer">
				<a class="btn btn-link btn-gray" href="#" aria-label="Cancel" @click.prevent="emit('closed')">
					{{ t('button.cancel') }}
				</a>
				<button class="btn btn-primary ml-2" @click="setPassword">{{ t('button.changePassword') }}</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { reactive, computed } from 'vue';
import { useI18n } from "vue-i18n";
const { t } = useI18n();
import { notify } from '@kyvg/vue3-notification';
import firebase from 'firebase/compat/app';
import { throwError, randomString } from '@/utils.js';

// inherited properties
const props = defineProps({
	active: Boolean // state of modal display, true to show modal
});

// non reactive data
const examplePassword = randomString(8);

// reactive data
const user = reactive({
	password: '',
	repeat: '',
	currentpassword: ''
});
const error = reactive({
	password: {
		missing: false,
		mismatch: false,
		tooshort: false,
	},
	currentpassword: false
});

// emits
const emit = defineEmits(['closed']);

// computed: calculate wether form errors occured
const errors = computed(() => (
	error.password.missing
	|| error.password.mismatch
	|| error.password.tooshort
	|| error.currentpassword
));

// save new password for current user
const setPassword = () => {
	// first check for form errors
	error.password.missing = user.password == '';
	error.password.mismatch = user.password != user.repeat;
	error.password.tooshort = user.password.length < 8;
	error.currentpassword = user.currentpassword == '';
	// no errors: send submitted user data and close modal
	if (!errors.value) {
		// first reauthenticate user
		const currentUser = firebase.auth().currentUser;
		const credential = firebase.auth.EmailAuthProvider.credential(
			currentUser.email, 
			user.currentpassword
		);
		currentUser.reauthenticateWithCredential(credential).then(() => {
			// successfully reauthenticated, now update password
			currentUser.updatePassword(user.password).then(() => {
				emit('closed');
				notify({
					title: t('toast.userUpdated'),
					text: t('toast.userUpdatedText'),
					type: 'primary'
				});
			}).catch((error) => throwError(error));
		}).catch(() => {
			notify({
				title: t('toast.passwordWrong'),
				text: t('toast.passwordWrongText'),
				type: 'error'
			});
		});
	}
};
</script>
