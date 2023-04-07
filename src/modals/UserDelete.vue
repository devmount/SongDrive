<template>
	<modal
		:active="active"
		:title="approved ? t('modal.deleteUser') : t('modal.deleteRegistration')"
		@closed="emit('closed')"
	>
		<div class="flex flex-col gap-2">
			<div>{{ t('text.reallyDeleteUser', { name: userName }) }}</div>
			<div class="text-rose-600">{{ t('text.cannotBeUndone') }}</div>
			<div>{{ t('text.selectUserForTransfer', { name: userName }) }}</div>
			<select v-model="transferUser" class="form-select">
				<option v-for="(user, key) in assignableUsers" :key="key" :value="key">
					{{ user.name }}
				</option>
			</select>
		</div>
		<div class="flex flex-col justify-end items-center gap-4 mt-4 2xs:flex-row">
			<button class="px-3 py-2 text-blade-500" aria-label="Cancel" @click.prevent="emit('closed')">
				{{ t('button.cancel') }}
			</button>
			<primary-button type="danger" :disabled="!transferUser" @click="deleteUser">
				{{ t('button.delete') }}
				<icon-loader2 v-if="busy" class="w-6 h-6 stroke-1.5 animate-spin" />
				<icon-trash v-else class="w-6 h-6 stroke-1.5" />
			</primary-button>
		</div>
	</modal>
</template>

<script setup>
import { notify } from '@kyvg/vue3-notification';
import { ref, computed, inject } from 'vue';
import { throwError } from '@/utils.js';
import { useI18n } from 'vue-i18n';
import Modal from '@/elements/Modal';
import PrimaryButton from '@/elements/PrimaryButton';

// icons
import {
	IconLoader2,
	IconTrash,
} from '@tabler/icons-vue';

// component constants
const { t } = useI18n();

// global properties
const db = inject('db');

// inherited properties
const props = defineProps({
	active:   Boolean, // state of modal display, true to show modal
	userName: String,  // display name of the user
	userKey:  String,  // user identifier
	approved: Boolean, // user holds an approved account or not
	users:    Object,  // list of all available users
	setlists: Object,  // list of all available setlists
});

// reactive data
const transferUser = ref(null);

// emits
const emit = defineEmits(['closed']);

// list of users that can be an assignment target
const assignableUsers = computed(() => {
	let users = JSON.parse(JSON.stringify(props.users));
	delete users[props.userKey];
	return users;
});

// total number of users
const numberOfUsers = computed(() => Object.keys(props.users).length);

// delete user if at least one user is left afterwards
const busy = ref(false);
const deleteUser = () => {
	if (numberOfUsers.value > 1) {
		busy.value = true;
		// delete approved user (living in users table) or unapproved user (living in registrations table)
		db.collection(props.approved ? 'users' : 'registrations').doc(props.userKey).delete().then(() => {
			if (props.approved) {
				db.collection('permissions').doc(props.userKey).delete();
			}
			// transfer content to selected user
			for (const setlistKey in props.setlists) {
				if (Object.hasOwnProperty.call(props.setlists, setlistKey)) {
					const setlist = props.setlists[setlistKey];
					if (setlist.creator == props.userKey) {
						db.collection('setlists').doc(setlistKey).update({ creator: transferUser.value });
					}
				}
			}
			emit('closed');
			// toast success message
			notify({
				title: t('toast.userDeleted'),
				text: t('toast.userDeletedText'),
				type: 'primary'
			});
			busy.value = false;
		}).catch((error) => throwError(error));
	}
};
</script>
