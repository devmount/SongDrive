<template>
	<div class="modal modal-sm" :class="{ active: active }">
		<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="emit('closed')"></a>
		<div class="modal-container">
			<div class="modal-header">
				<a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="emit('closed')"></a>
				<div class="modal-title h5">{{ t(approved ? 'modal.deleteUser' : 'modal.deleteRegistration') }}</div>
			</div>
			<div class="modal-body">
				<div class="content">
					<p>{{ t('text.reallyDeleteUser', { name: userName }) }}</p>
					<p>{{ t('text.cannotBeUndone') }}</p>
					<p>{{ t('text.selectUserForTransfer', { name: userName }) }}</p>
					<select v-model="transferUser" class="form-select">
						<option v-for="(user, key) in assignableUsers" :key="key" :value="key">
							{{ user.name }}
						</option>
					</select>
				</div>
			</div>
			<div class="modal-footer">
				<a class="btn btn-link btn-gray" href="#" aria-label="Cancel" @click.prevent="emit('closed')">
					{{ t('button.cancel') }}
				</a>
				<button class="btn btn-error ml-2" :class="{ disabled: !transferUser }" @click="deleteUser">{{ t('button.delete') }}</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, inject } from 'vue';
import { useI18n } from "vue-i18n";
const { t } = useI18n();
import { notify } from '@kyvg/vue3-notification';
import { throwError } from '@/utils.js';

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

// computed: list of users that can be an assignment target
const assignableUsers = computed(() => {
	let users = JSON.parse(JSON.stringify(props.users));
	delete users[props.userKey];
	return users;
});
// computed: total number of users
const numberOfUsers = computed(() => Object.keys(props.users).length);

// delete user if there are more than one
const deleteUser = () => {
	if (numberOfUsers.value > 1) {
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
		}).catch((error) => throwError(error));
	}
};
</script>
