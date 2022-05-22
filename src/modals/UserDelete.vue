<template>
	<div class="modal modal-sm" :class="{ active: active }">
		<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="$emit('closed')"></a>
		<div class="modal-container">
			<div class="modal-header">
				<a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="$emit('closed')"></a>
				<div class="modal-title h5">{{ $t(approved ? 'modal.deleteUser' : 'modal.deleteRegistration') }}</div>
			</div>
			<div class="modal-body">
				<div class="content">
					<p>{{ $t('text.reallyDeleteUser', { name: userName }) }}</p>
					<p>{{ $t('text.cannotBeUndone') }}</p>
					<p>{{ $t('text.selectUserForTransfer', { name: userName }) }}</p>
					<select v-model="transferUser" class="form-select">
						<option v-for="(user, key) in assignableUsers" :value="key">
							{{ user.name }}
						</option>
					</select>
				</div>
			</div>
			<div class="modal-footer">
				<a class="btn btn-link btn-gray" href="#" aria-label="Cancel" @click.prevent="$emit('closed')">
					{{ $t('button.cancel') }}
				</a>
				<button class="btn btn-error ml-2" :class="{ disabled: !transferUser }" @click="deleteUser">{{ $t('button.delete') }}</button>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'user-delete',
	props: {
		active: Boolean,
		userName: String,
		userKey: String,
		approved: Boolean,
		users: Object,
		setlists: Object,
	},
	data () {
		return {
			transferUser: null
		}
	},
	methods: {
		deleteUser () {
			// delete approved user (living in users table) or unapproved user (living in registrations table)
			this.$db.collection(this.approved ? 'users' : 'registrations').doc(this.userKey).delete().then(() => {
				if (this.approved) {
					this.$db.collection('permissions').doc(this.userKey).delete();
				}
				// transfer content to selected user
				for (const setlistKey in this.setlists) {
					if (Object.hasOwnProperty.call(this.setlists, setlistKey)) {
						const setlist = this.setlists[setlistKey];
						if (setlist.creator == this.userKey) {
							this.$db.collection('setlists').doc(setlistKey).update({ creator: this.transferUser });
						}
					}
				}
				this.$emit('closed');
				// toast success message
				this.$notify({
					title: this.$parent.$t('toast.userDeleted'),
					text: this.$parent.$t('toast.userDeletedText'),
					type: 'primary'
				});
			}).catch((error) => this.throwError(error));
		}
	},
	computed: {
		assignableUsers () {
			let users = JSON.parse(JSON.stringify(this.users));
			delete users[this.userKey];
			return users;
		}
	}
}
</script>
