<template>
	<div
		class="transition-all fixed top-0 left-0 z-40 w-screen h-screen bg-blade-750/50 dark:bg-black/50"
		:class="{ 'hidden': !active }"
		@click.prevent="emit('closed')"
	>
		<div
			class="
				fixed z-50 position-center rounded-sm w-full max-w-sm bg-blade-100 p-4 flex flex-col gap-4
				dark:bg-blade-850
			"
			@click.stop="null"
		>
			<div class="flex justify-between">
				<div class="text-lg uppercase font-medium">{{ t('modal.changeEmail') }}</div>
				<button aria-label="Close" @click="emit('closed')">
					<ion-icon :icon="closeOutline" class="w-6 h-6" />
				</button>
			</div>
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
				<!-- user password reauthentification -->
				<divider-horizontal />
				<label class="flex flex-col gap-1">
					<div>{{ t('text.confirmWithCurrentPassword') }} <span class="text-rose-600">*</span></div>
					<input
						id="currentpassword"
						type="password"
						v-model="user.currentpassword"
						class="form-input mb-1"
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
				<primary-button class="grow" @click="setEmail">
					{{ t('button.changeEmail') }}
					<ion-icon :icon="saveOutline" class="w-6 h-6" />
				</primary-button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { reactive, computed, inject } from 'vue';
import { useI18n } from "vue-i18n";
import { notify } from '@kyvg/vue3-notification';
import { closeOutline, saveOutline } from 'ionicons/icons';
import firebase from 'firebase/compat/app';
import { throwError } from '@/utils.js';
import DividerHorizontal from '@/elements/DividerHorizontal';
import PrimaryButton from '@/elements/PrimaryButton';
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
