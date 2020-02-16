<template>
	<div class="modal modal-sm" :class="{ active: active }">
		<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="$emit('closed')"></a>
		<div class="modal-container">
			<div class="modal-header">
				<a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="$emit('closed')"></a>
				<div class="modal-title h5">Delete User</div>
			</div>
			<div class="modal-body">
				<div class="content">
					<p>Do you really want to delete the User «<span class="text-uppercase ls-1">{{ userName }}</span>» ?</p>
					<p>This cannot be undone.</p>
				</div>
			</div>
			<div class="modal-footer">
				<a class="btn btn-link btn-gray" href="#" aria-label="Cancel" @click.prevent="$emit('closed')">Cancel</a>
				<button class="btn btn-error ml-2" @click="deleteUser">Delete!</button>
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
				self.$notify({
					title: '<button class="btn btn-clear float-right"></button>Success!',
					text: 'The user was removed.',
					type: 'toast-primary'
				});
			}).catch(function() {
				self.$emit('closed')
				// toast error message
				self.$notify({
					title: '<button class="btn btn-clear float-right"></button>Error!',
					text: 'The user could not be removed.',
					type: 'toast-error'
				});
			});
		},
	}
}
</script>

<style lang="scss">

</style>
