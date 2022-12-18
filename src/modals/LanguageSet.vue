<template>
	<div class="modal modal-sm" :class="{ active: active }">
		<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="emit('closed')"></a>
		<div class="modal-container">
			<div class="modal-header">
				<a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="emit('closed')"></a>
				<div class="modal-title h5">
					<span v-if="!existing">{{ t('modal.addLanguage') }}</span>
					<span v-else>{{ t('modal.editLanguage') }}</span>
				</div>
			</div>
			<div class="modal-body">
				<div class="content">
					<label class="form-label" for="isocode">{{ t('field.isocode') }} <span class="text-error">*</span></label>
					<input
						id="isocode"
						type="text"
						v-model="isocode"
						class="form-input mb-1"
						:class="{ 'is-error': error.isocode }"
						:placeholder="t('placeholder.exampleLanguageIsocode')"
						:disabled="existing"
					/>
					<p v-if="error.isocode" class="form-input-hint">{{ t('error.requiredIsocode') }}</p>
					<label class="form-label" for="label">{{ t('field.label') }} <span class="text-error">*</span></label>
					<input
						id="label"
						type="text"
						v-model="language.label"
						class="form-input mb-1"
						:class="{ 'is-error': error.label }"
						:placeholder="t('placeholder.exampleLanguageLabel')"
					/>
					<p v-if="error.label" class="form-input-hint">{{ t('error.requiredLabel') }}</p>
				</div>
			</div>
			<div class="modal-footer">
				<a class="btn btn-link btn-gray" href="#" aria-label="Cancel" @click.prevent="emit('closed')">
					{{ t('button.cancel') }}
				</a>
				<button class="btn btn-primary ml-2" @click="setLanguage">
					<span v-if="!existing">{{ t('button.addLanguage') }}</span>
					<span v-else>{{ t('button.updateLanguage') }}</span>
				</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, reactive, computed, inject } from 'vue';
import { useI18n } from "vue-i18n";
import { notify } from '@kyvg/vue3-notification';
import { throwError } from '@/utils.js';
const { t } = useI18n();

// global properties
const db = inject('db');

// inherited properties
const props = defineProps({
	active: Boolean,         // state of modal display, true to show modal
	initialLanguage: Object, // initial language object to fill with data
	existing: Boolean,       // language already exists
	languageKey: String,     // language code
});

// reactive data
const isocode = ref(props.languageKey);
const language = ref(JSON.parse(JSON.stringify(props.initialLanguage)));
const error = reactive({
	label: false,
	isocode: false,
});

// emits
const emit = defineEmits(['closed']);

// computed: calculate wether form errors occured
const errors = computed(() => (error.label || error.isocode));

const setLanguage = () => {
	// first check for form errors
	error.label = language.value.label == '';
	error.isocode = isocode.value == '';
	// no errors: send submitted language data and close modal
	if (!errors.value) {
		// language already exists
		if (props.existing) {
			db.collection('languages').doc(isocode.value).update({
				label: language.value.label,
			}).then(() => {
				emit('closed');
				// language updated successfully!
				notify({
					title: t('toast.languageUpdated'),
					text: t('toast.languageSavedText'),
					type: 'primary'
				});
			}).catch((error) => throwError(error));
		}
		// language doesn't exist yet
		else {
			db.collection('languages').doc(isocode.value).set({
				label: language.value.label,
			}).then(() => {
				emit('closed');
				// language added successfully
				notify({
					title: t('toast.languageAdded'),
					text: t('toast.languageSavedText'),
					type: 'primary'
				});
			}).catch((error) => throwError(error));
		}
	}
};
</script>
