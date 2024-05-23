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
			<primary-button type="danger" @click="setEmail">
				{{ t('button.changeEmail') }}
				<icon-loader2 v-if="busy" class="w-6 h-6 stroke-1.5 animate-spin" />
				<icon-device-floppy v-else class="w-6 h-6 stroke-1.5" />
			</primary-button>
		</div>
	</modal>
</template>

<script setup>
import { notify } from '@kyvg/vue3-notification';
import { reactive, computed, inject, ref, watch } from 'vue';
import { throwError } from '@/utils.js';
import { useI18n } from 'vue-i18n';
import DividerHorizontal from '@/elements/DividerHorizontal.vue';
import { setDoc, doc } from 'firebase/firestore';
import { getAuth, reauthenticateWithCredential, EmailAuthProvider, sendEmailVerification, updateEmail } from "firebase/auth";
import Modal from '@/elements/Modal.vue';
import PrimaryButton from '@/elements/PrimaryButton.vue';

// icons
import {
	IconDeviceFloppy,
	IconLoader2,
} from '@tabler/icons-vue';

// component constants
const { t } = useI18n();

// global properties
const fb = inject('firebaseApp');
const db = inject('db');
const fbAuth = getAuth(fb);

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
	error.email.missing
	|| error.email.mismatch
	|| error.email.notchanged
	|| error.currentpassword.missing
));

// save user object to database
const busy = ref(false);
const setEmail = () => {
	const currentUser = fbAuth.currentUser;
	// first check for form errors
	error.email.missing = user.email == '';
	error.email.mismatch = user.email != user.repeat;
	error.email.notchanged = user.email == currentUser.email;
	error.currentpassword.missing = user.currentpassword == '';
	// no errors: send submitted user data and close modal
	if (!errors.value) {
		busy.value = true;
		// first reauthenticate user
		const credential = EmailAuthProvider.credential(
			currentUser.email,
			user.currentpassword
		);
		reauthenticateWithCredential(currentUser, credential).then(() => {
			// successfully reauthenticated, now update email address ...
			setDoc(doc(db, `users/${currentUser.uid}`), {
				email: user.email,
			}).then(() => {
				updateEmail(currentUser, user.email).then(() => {
					// ... and send verification email
					sendEmailVerification(currentUser).then(() => {
						emit('closed');
						notify({
							title: t('toast.verficationSent'),
							text: t('toast.verficationSentText'),
							type: 'primary'
						});
						busy.value = false;
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
			busy.value = false;
		});
	}
};

// reset input when reopen modal
watch (() => props.active, (newActive) => {
	if (newActive) {
		user.email = '';
		user.repeat = '';
		user.currentpassword = '';
		error.email.missing = false;
		error.email.mismatch = false;
		error.email.notchanged = false;
		error.currentpassword.missing = false;
		error.currentpassword.wrong = false;
	}
});
</script>
