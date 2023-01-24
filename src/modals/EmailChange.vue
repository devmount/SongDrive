<template>
	<modal :active="active" :title="t('modal.changeEmail')" @closed="emit('closed')">
		<div class="flex flex-col gap-2">
			<!-- email -->
			<label class="flex flex-col gap-1">
				<div>{{ t('field.newEmail') }} <span class="text-rose-600">*</span></div>
				<input
					type="email"
					v-model="user.email"
					:class="{ 'border-rose-600': error.email.missing || error.email.mismatch || error.email.notchanged }"
					:placeholder="t('placeholder.exampleUserEmail')"
				/>
				<input
					type="email"
					v-model="user.repeat"
					:class="{ 'border-rose-600': error.email.missing || error.email.mismatch || error.email.notchanged }"
					:placeholder="t('placeholder.repeatEmail')"
				/>
			</label>
			<div
				v-if="error.email.missing || error.email.mismatch || error.email.notchanged"
				class="text-rose-600"
			>
				<span v-if="error.email.missing">{{ t('error.requiredEmail') }}&nbsp;</span>
				<span v-if="error.email.mismatch"> {{ t('error.emailsDontMatch') }}&nbsp;</span>
				<span v-if="error.email.notchanged"> {{ t('error.emailNotChanged') }}</span>
			</div>
			<divider-horizontal />
			<!-- user password reauthentification -->
			<label class="flex flex-col gap-1">
				<div>{{ t('text.confirmWithCurrentPassword') }} <span class="text-rose-600">*</span></div>
				<input
					type="password"
					v-model="user.currentpassword"
					:class="{ 'border-rose-600': error.currentpassword.missing || error.currentpassword.wrong }"
				/>
			</label>
			<div v-if="error.currentpassword.missing" class="text-rose-600">
				{{ t('error.requiredPassword') }}
			</div>
			<div v-if="error.currentpassword.wrong" class="text-rose-600">
				{{ t('error.wrongPassword') }}
			</div>
		</div>
		<div class="flex flex-col justify-end items-center gap-4 mt-4 2xs:flex-row">
			<button class="px-3 py-2 text-blade-500" aria-label="Cancel" @click.prevent="emit('closed')">
				{{ t('button.cancel') }}
			</button>
			<primary-button class="grow" type="danger" @click="setEmail">
				{{ t('button.changeEmail') }}
				<device-floppy-icon class="w-6 h-6 stroke-1.5" />
			</primary-button>
		</div>
	</modal>
</template>

<script setup>
import { notify } from '@kyvg/vue3-notification';
import { reactive, computed, inject } from 'vue';
import { throwError } from '@/utils.js';
import { useI18n } from "vue-i18n";
import DividerHorizontal from '@/elements/DividerHorizontal';
import firebase from 'firebase/compat/app';
import Modal from '@/elements/Modal';
import PrimaryButton from '@/elements/PrimaryButton';

// icons
import { DeviceFloppyIcon } from "vue-tabler-icons";

// component constants
const { t } = useI18n();

// global properties
const db = inject('db');

// component properties
const props = defineProps({
	active: Boolean // state of modal display, true to show modal
});

// user input data
const user = reactive({
	email: '',
	repeat: '',
	currentpassword: ''
});

// emits
const emit = defineEmits(['closed']);

// calculate wether form errors occured
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
const errors = computed(() => (
	error.email.missing ||
	error.email.mismatch ||
	error.email.notchanged ||
	error.currentpassword.missing
));

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
