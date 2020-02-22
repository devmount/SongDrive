<template>
	<div class="modal modal-sm" :class="{ active: active }">
		<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="$emit('closed')"></a>
		<div class="modal-container">
			<div class="modal-header">
				<a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="$emit('closed')"></a>
				<div class="modal-title h5">{{ $t('modal.deleteSetlist') }}</div>
			</div>
			<div class="modal-body">
				<div class="content">
					<p>{{ $t('text.reallyDeleteSetlist', { title: title }) }}</p>
					<p>{{ $t('text.cannotBeUndone') }}</p>
				</div>
			</div>
			<div class="modal-footer">
				<a class="btn btn-link btn-gray" href="#" aria-label="Cancel" @click.prevent="$emit('closed')">{{ $t('button.cancel') }}</a>
				<button class="btn btn-error ml-2" @click="deleteSetlist">{{ $t('button.delete') }}</button>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'setlist-delete',
	props: {
		db: Object,
		active: Boolean,
		title: String,
		id: String
	},
	methods: {
		deleteSetlist () {
			var self = this
			this.db.collection('setlists').doc(this.id).delete().then(function() {
				self.$emit('closed')
				if (self.$route.name != 'setlists') {
					self.$router.push({ name: 'setlists' })
				}
				// toast success message
				self.$notify({ title: self.$parent.$t('toast.setlistDeleted'), text: self.$parent.$t('toast.setlistDeletedText'), type: 'primary' })
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
