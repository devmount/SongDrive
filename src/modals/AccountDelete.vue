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
				class="grow"
				type="danger"
				@click="user.agreed ? deleteAccount() : null"
				:disabled="!user.agreed"
			>
				{{ t('button.delete') }}
				<ion-icon :icon="trashOutline" class="w-6 h-6" />
			</primary-button>
		</div>
	</modal>
</template>

<script setup>
import DividerHorizontal from '@/elements/DividerHorizontal';
import PrimaryButton from '@/elements/PrimaryButton';
import Modal from '@/elements/Modal';
import { reactive, computed, inject } from 'vue';
import { useI18n } from "vue-i18n";
import { notify } from '@kyvg/vue3-notification';
import { trashOutline } from 'ionicons/icons';
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
