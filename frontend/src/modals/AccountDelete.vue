<template>
	<modal :active="active" :title="t('modal.deleteAccount')" @closed="emit('closed')">
		<div class="flex flex-col gap-2">
			<p>{{ t('text.reallyDeleteAccount') }}</p>
			<p class="text-rose-600">{{ t('text.cannotBeUndone') }}</p>
			<!-- agree and enable further form elements -->
			<label class="flex items-center gap-3 mt-4">
				<input v-model="user.agreed" :value="true" type="checkbox" class="w-6 h-6" />
				{{ t('text.yesIUnderstand') }}
			</label>
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
			<primary-button
				type="danger"
				@click="user.agreed ? deleteAccount() : null"
				:disabled="!user.agreed"
			>
				{{ t('button.delete') }}
				<icon-loader2 v-if="busy" class="w-6 h-6 stroke-1.5 animate-spin" />
				<icon-trash v-else class="w-6 h-6 stroke-1.5" />
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
import { deleteDoc, doc } from 'firebase/firestore';
import { getAuth, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import Modal from '@/elements/Modal.vue';
import PrimaryButton from '@/elements/PrimaryButton.vue';

// icons
import {
	IconLoader2,
	IconTrash,
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

// current user input data
const user = reactive({
	agreed: false,
	currentpassword: ''
});

// emits
const emit = defineEmits(['closed']);

// calculate wether form errors occured
const error = reactive({
	currentpassword: {
		missing: false,
		wrong: false,
	}
});
const errors = computed(() => error.currentpassword.missing);

// delete user account
const busy = ref(false);
const deleteAccount = () => {
	const currentUser = fbAuth.currentUser;
	// first check for form errors
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
			// delete user record in users collection
			deleteDoc(doc(db, `users/${currentUser.uid}`)).then(() => {
				// delete user account
				currentUser.delete().then(() => {
					emit('closed');
					// toast success message
					notify({
						title: t('toast.accountDeleted'),
						text: t('toast.accountDeletedText'),
						type: 'primary'
					});
					busy.value = false;
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
		user.agreed = false;
		user.currentpassword = '';
		error.currentpassword.missing = false;
		error.currentpassword.wrong = false;
	}
});
</script>
