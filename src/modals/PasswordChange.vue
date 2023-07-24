<template>
	<modal :active="active" :title="t('modal.changePassword')" @closed="emit('closed')">
		<div class="flex flex-col gap-2">
			<!-- password -->
			<label class="flex flex-col gap-1">
				<span class="flex justify-between">
					<span>{{ t('field.newPassword') }} <span class="text-rose-600">*</span></span>
					<span :class="{ 'text-rose-600': user.password.length < 8 }">
						{{ user.password.length }}<span v-if="user.password.length < 8"> / 8</span>
					</span>
				</span>
				<input
					type="password"
					v-model="user.password"
					:class="{ 'border-rose-600': error.password.missing || error.password.mismatch || error.password.tooshort }"
					:placeholder="t('placeholder.examplePassword', { p: examplePassword })"
				/>
				<input
					type="password"
					v-model="user.repeat"
					:class="{ 'border-rose-600': error.password.missing || error.password.mismatch }"
					:placeholder="t('placeholder.repeatPassword')"
				/>
			</label>
			<div
				v-if="error.password.missing || error.password.mismatch || error.password.tooshort"
				class="text-rose-600"
			>
				<span v-if="error.password.missing">{{ t('error.requiredPassword') }}&nbsp;</span>
				<span v-if="error.password.mismatch"> {{ t('error.passwordsDontMatch') }}&nbsp;</span>
				<span v-if="error.password.tooshort"> {{ t('error.passwordTooShort') }}</span>
			</div>
			<!-- user password reauthentification -->
			<divider-horizontal />
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
			<primary-button @click="setPassword">
				{{ t('button.changePassword') }}
				<icon-loader2 v-if="busy" class="w-6 h-6 stroke-1.5 animate-spin" />
				<icon-device-floppy v-else class="w-6 h-6 stroke-1.5" />
			</primary-button>
		</div>
	</modal>
</template>

<script setup>
import { notify } from '@kyvg/vue3-notification';
import { reactive, computed, ref, watch, inject } from 'vue';
import { throwError, randomString } from '@/utils.js';
import { useI18n } from 'vue-i18n';
import DividerHorizontal from '@/elements/DividerHorizontal.vue';
import { getAuth, reauthenticateWithCredential, updatePassword, EmailAuthProvider } from "firebase/auth";
import Modal from '@/elements/Modal.vue';
import PrimaryButton from '@/elements/PrimaryButton.vue';

// icons
import {
	IconDeviceFloppy,
	IconLoader2,
} from '@tabler/icons-vue';

// component constants
const { t } = useI18n();
const examplePassword = randomString(8);
const fb = inject('firebaseApp');
const fbAuth = getAuth(fb);

// inherited properties
const props = defineProps({
	active: Boolean // state of modal display, true to show modal
});

// input data
const user = reactive({
	password: '',
	repeat: '',
	currentpassword: '',
});

// emits
const emit = defineEmits(['closed']);

// available form errors
const error = reactive({
	password: {
		missing: false,
		mismatch: false,
		tooshort: false,
	},
	currentpassword: {
		missing: false,
		wrong: false,
	}
});
const errors = computed(() => (
	error.password.missing
	|| error.password.mismatch
	|| error.password.tooshort
	|| error.currentpassword.missing
));

// save new password for current user
const busy = ref(false);
const setPassword = () => {
	// first check for form errors
	error.password.missing = user.password == '';
	error.password.mismatch = user.password != user.repeat;
	error.password.tooshort = user.password.length < 8;
	error.currentpassword.missing = user.currentpassword == '';
	// no errors: send submitted user data and close modal
	if (!errors.value) {
		busy.value = true;
		// first reauthenticate user
		const currentUser = fbAuth.currentUser;
		const credential = EmailAuthProvider.credential(
			currentUser.email,
			user.currentpassword
		);
		reauthenticateWithCredential(currentUser, credential).then(() => {
			// successfully reauthenticated, now update password
			updatePassword(currentUser, user.password).then(() => {
				emit('closed');
				notify({
					title: t('toast.userUpdated'),
					text: t('toast.userUpdatedText'),
					type: 'primary'
				});
				busy.value = false;
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
		user.password = '';
		user.repeat = '';
		user.currentpassword = '';
		error.password.missing = false;
		error.password.mismatch = false;
		error.password.tooshort = false;
		error.currentpassword.missing = false;
		error.currentpassword.wrong = false;
	}
});
</script>
