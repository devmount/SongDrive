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
				</div>
			</div>
			<div class="modal-footer">
				<a class="btn btn-link btn-gray" href="#" aria-label="Cancel" @click.prevent="$emit('closed')">
					{{ $t('button.cancel') }}
				</a>
				<button class="btn btn-error ml-2" @click="deleteUser">{{ $t('button.delete') }}</button>
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
		approved: Boolean
	},
	methods: {
		deleteUser () {
			// delete approved user (living in users table) or unapproved user (living in registrations table)
			this.$db.collection(this.approved ? 'users' : 'registrations').doc(this.userKey).delete().then(() => {
				this.$emit('closed');
				// toast success message
				this.$notify({
					title: this.$parent.$t('toast.userDeleted'),
					text: this.$parent.$t('toast.userDeletedText'),
					type: 'primary'
				});
			}).catch((error) => {
				this.$emit('closed');
				// toast error message
				this.$notify({
					title: error.code,
					text: error.message,
					type: 'error'
				});
			});
		}
	}
}
</script>
