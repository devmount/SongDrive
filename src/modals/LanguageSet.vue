<template>
	<modal
		:active="active"
		:title="!existing ? t('modal.addLanguage') : t('modal.editLanguage')"
		@closed="emit('closed')"
	>
		<div class="flex flex-col gap-2">
			<!-- isocode -->
			<label class="flex flex-col gap-1">
				<div>{{ t('field.isocode') }} <span class="text-rose-600">*</span></div>
				<input
					type="text"
					v-model="isocode"
					:class="{ 'text-rose-600': error.isocode }"
					:placeholder="t('placeholder.exampleLanguageIsocode')"
					:disabled="existing"
				/>
			</label>
			<div v-if="error.isocode" class="text-rose-600">{{ t('error.requiredIsocode') }}</div>
			<label class="flex flex-col gap-1">
				<div>{{ t('field.label') }} <span class="text-rose-600">*</span></div>
				<input
					type="text"
					v-model="language.label"
					:class="{ 'text-rose-600': error.label }"
					:placeholder="t('placeholder.exampleLanguageLabel')"
				/>
			</label>
			<div v-if="error.label" class="text-rose-600">{{ t('error.requiredLabel') }}</div>
		</div>
		<div class="flex flex-col justify-end items-center gap-4 mt-4 2xs:flex-row">
			<button class="px-3 py-2 text-blade-500" aria-label="Cancel" @click.prevent="emit('closed')">
				{{ t('button.cancel') }}
			</button>
			<primary-button class="grow" @click="setLanguage">
				<span v-if="!existing">{{ t('button.addLanguage') }}</span>
				<span v-else>{{ t('button.updateLanguage') }}</span>
				<ion-icon :icon="!existing ? addOutline : saveOutline" class="w-6 h-6" />
			</primary-button>
		</div>
	</modal>
</template>

<script setup>
import PrimaryButton from '@/elements/PrimaryButton';
import Modal from '@/elements/Modal';
import { ref, reactive, computed, inject } from 'vue';
import { useI18n } from "vue-i18n";
import { notify } from '@kyvg/vue3-notification';
import { addOutline, saveOutline } from 'ionicons/icons';
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
