<template>
	<div class="modal modal-sm" :class="{ active: active }">
		<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="$emit('closed')"></a>
		<div class="modal-container">
			<div class="modal-header">
				<a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="$emit('closed')"></a>
				<div class="modal-title h5">
					<span v-if="!existing">{{ $t('modal.addLanguage') }}</span>
					<span v-else>{{ $t('modal.editLanguage') }}</span>
				</div>
			</div>
			<div class="modal-body">
				<div class="content">
					<label class="form-label" for="isocode">{{ $t('field.isocode') }} <span class="text-error">*</span></label>
					<input
						id="isocode"
						type="text"
						v-model="isocode"
						class="form-input mb-1"
						:class="{ 'is-error': error.isocode }"
						:placeholder="$t('placeholder.exampleLanguageIsocode')"
						:disabled="existing"
					/>
					<p v-if="error.isocode" class="form-input-hint">{{ $t('error.requiredIsocode') }}</p>
					<label class="form-label" for="label">{{ $t('field.label') }} <span class="text-error">*</span></label>
					<input
						id="label"
						type="text"
						v-model="language.label"
						class="form-input mb-1"
						:class="{ 'is-error': error.label }"
						:placeholder="$t('placeholder.exampleLanguageLabel')"
					/>
					<p v-if="error.label" class="form-input-hint">{{ $t('error.requiredLabel') }}</p>
				</div>
			</div>
			<div class="modal-footer">
				<a class="btn btn-link btn-gray" href="#" aria-label="Cancel" @click.prevent="$emit('closed')">
					{{ $t('button.cancel') }}
				</a>
				<button class="btn btn-primary ml-2" @click="setLanguage">
					<span v-if="!existing">{{ $t('button.addLanguage') }}</span>
					<span v-else>{{ $t('button.updateLanguage') }}</span>
				</button>
			</div>
		</div>
	</div>
</template>

<script>
import { defineComponent } from 'vue';
import { throwError } from '@/utils.js';

export default defineComponent({
	name: 'language-set',
	props: {
		active: Boolean,
		initialLanguage: Object,
		existing: Boolean,
		languageKey: String,
	},
	data () {
		return {
			isocode: this.languageKey,
			language: JSON.parse(JSON.stringify(this.initialLanguage)),
			error: {
				label: false,
				isocode: false,
			}
		}
	},
	methods: {
		setLanguage() {
			// first check for form errors
			this.error.label = this.language.label == '';
			this.error.isocode = this.isocode == '';
			// no errors: send submitted language data and close modal
			if (!this.errors) {
				// language already exists
				if (this.existing) {
					this.$db.collection('languages').doc(this.isocode).update({
						label: this.language.label,
					}).then(() => {
						this.$emit('closed');
						// language updated successfully!
						this.$notify({
							title: this.$t('toast.languageUpdated'),
							text: this.$t('toast.languageSavedText'),
							type: 'primary'
						});
					}).catch((error) => throwError(error));
				}
				// language doesn't exist yet
				else {
					this.$db.collection('languages').doc(this.isocode).set({
						label: this.language.label,
					}).then(() => {
						this.$emit('closed');
						// language added successfully
						this.$notify({
							title: this.$t('toast.languageAdded'),
							text: this.$t('toast.languageSavedText'),
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
			return this.error.label || this.error.isocode;
		}
	}
});
</script>
