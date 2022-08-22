<template>
	<div class="modal modal-sm" :class="{ active: active }">
		<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="$emit('closed')"></a>
		<div class="modal-container">
			<div class="modal-header">
				<a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="$emit('closed')"></a>
				<div class="modal-title h5">
					<span v-if="!existing">{{ $t('modal.addTag') }}</span>
					<span v-else>{{ $t('modal.editTag') }}</span>
				</div>
			</div>
			<div class="modal-body">
				<div class="content">
					<label class="form-label" for="key">{{ $t('field.key') }} <span class="text-error">*</span></label>
					<input
						id="key"
						type="text"
						v-model="key"
						class="form-input mb-1"
						:class="{ 'is-error': error.key }"
						:placeholder="$t('placeholder.exampleTagKey')"
						:disabled="existing"
					/>
					<p v-if="error.key" class="form-input-hint">{{ $t('error.requiredTagKey') }}</p>
					<template v-for="(label, key) in uiLanguages" :key="key">
						<label class="form-label" for="key">{{ label }}</label>
						<input
							:id="key"
							type="text"
							v-model="languages[key]"
							class="form-input mb-1"
						/>
					</template>
				</div>
			</div>
			<div class="modal-footer">
				<a class="btn btn-link btn-gray" href="#" aria-label="Cancel" @click.prevent="$emit('closed')">
					{{ $t('button.cancel') }}
				</a>
				<button class="btn btn-primary ml-2" @click="setTag">
					<span v-if="!existing">{{ $t('button.addTag') }}</span>
					<span v-else>{{ $t('button.updateTag') }}</span>
				</button>
			</div>
		</div>
	</div>
</template>

<script>
import { defineComponent } from 'vue';
import { throwError } from '@/utils.js';

export default defineComponent({
	name: 'tag-set',
	props: {
		active: Boolean,
		initialTag: Object,
		existing: Boolean,
		tagKey: String,
		uiLanguages: Object
	},
	data () {
		let languages = {};
		for (const key in this.uiLanguages) {
			languages[key] = this.initialTag[key];
		}
		return {
			key: this.tagKey,
			languages: languages,
			error: {
				key: false,
			}
		}
	},
	methods: {
		setTag() {
			// first check for form errors
			this.error.key = this.key == '';
			// no errors: send submitted tag data and close modal
			if (!this.errors) {
				// tag already exists
				if (this.existing) {
					this.$db.collection('tags').doc(this.key).update({
						key: this.key,
						...this.languages
					}).then(() => {
						this.$emit('closed');
						// tag updated successfully!
						this.$notify({
							title: this.$t('toast.tagUpdated'),
							text: this.$t('toast.tagSavedText'),
							type: 'primary'
						});
					}).catch((error) => throwError(error));
				}
				// tag doesn't exist yet
				else {
					this.$db.collection('tags').doc(this.key).set({
						key: this.key,
						...this.languages
					}).then(() => {
						this.$emit('closed');
						// tag added successfully
						this.$notify({
							title: this.$t('toast.tagAdded'),
							text: this.$t('toast.tagSavedText'),
							type: 'primary'
						});
					}).catch((error) => throwError(error));
				}
			}
		}
	},
	computed: {
		// calculate wether form errors occured
		errors () {
			return this.error.key == true;
		}
	}
});
</script>
