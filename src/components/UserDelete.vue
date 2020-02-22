<template>
	<div class="modal modal-sm" :class="{ active: active }">
		<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="$emit('closed')"></a>
		<div class="modal-container">
			<div class="modal-header">
				<a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="$emit('closed')"></a>
				<div class="modal-title h5">{{ $t('modal.deleteUser') }}</div>
			</div>
			<div class="modal-body">
				<div class="content">
					<p>{{ $t('text.reallyDeleteUser', { name: userName }) }}</p>
					<p>{{ $t('text.cannotBeUndone') }}</p>
				</div>
			</div>
			<div class="modal-footer">
				<a class="btn btn-link btn-gray" href="#" aria-label="Cancel" @click.prevent="$emit('closed')">{{ $t('button.cancel') }}</a>
				<button class="btn btn-error ml-2" @click="deleteUser">{{ $t('button.delete') }}</button>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'user-delete',
	props: {
		db: Object,
		active: Boolean,
		userName: String,
		userKey: String
	},
	methods: {
		deleteUser () {
			var self = this
			this.db.collection('users').doc(this.userKey).delete().then(function() {
				self.$emit('closed')
				// toast success message
				self.$notify({ title: self.$parent.$t('toast.userDeleted'), text: self.$parent.$t('toast.userDeletedText'), type: 'primary' })
			}).catch(function(error) {
				self.$emit('closed')
				// toast error message
				self.$notify({ title: error.code, text: error.message, type: 'error' })
			})
		},
	}
}
</script>

<style lang="scss">

</style>
