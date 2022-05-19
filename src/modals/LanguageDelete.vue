<template>
	<div class="modal modal-sm" :class="{ active: active }">
		<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="$emit('closed')"></a>
		<div class="modal-container">
			<div class="modal-header">
				<a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="$emit('closed')"></a>
				<div class="modal-title h5">{{ $t('modal.deleteLanguage') }}</div>
			</div>
			<div class="modal-body">
				<div class="content">
					<p>{{ $t('text.reallyDeleteLanguage', { name: languageName }) }}</p>
					<p>{{ $t('text.cannotBeUndone') }}</p>
				</div>
			</div>
			<div class="modal-footer">
				<a class="btn btn-link btn-gray" href="#" aria-label="Cancel" @click.prevent="$emit('closed')">
					{{ $t('button.cancel') }}
				</a>
				<button class="btn btn-error ml-2" @click="deleteLanguage">{{ $t('button.delete') }}</button>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'language-delete',
	props: {
		active: Boolean,
		languageName: String,
		languageKey: String,
		songs: Object
	},
	methods: {
		deleteLanguage () {
			this.$db.collection('languages').doc(this.languageKey).delete().then(() => {
				this.$emit('closed');
				// toast success message
				this.$notify({
					title: this.$parent.$t('toast.languageDeleted'),
					text: this.$parent.$t('toast.languageDeletedText'),
					type: 'primary'
				});
			}).catch((error) => this.throwError(error));
		}
	},
	computed: {
		languageInUse () {
			for (const id in this.songs) {
				if (Object.hasOwnProperty.call(this.songs, id)) {
					const element = this.songs[id];
					
				}
			}
		}
	}
}
</script>
