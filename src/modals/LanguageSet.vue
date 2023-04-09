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
			<primary-button @click="setLanguage">
				<span v-if="!existing">{{ t('button.addLanguage') }}</span>
				<span v-else>{{ t('button.updateLanguage') }}</span>
				<icon-loader2 v-if="busy" class="w-6 h-6 stroke-1.5 animate-spin" />
				<template v-else>
					<icon-plus v-if="!existing" class="w-6 h-6 stroke-1.5" />
					<icon-device-floppy v-else class="w-6 h-6 stroke-1.5" />
				</template>
			</primary-button>
		</div>
	</modal>
</template>

<script setup>
import { notify } from '@kyvg/vue3-notification';
import { ref, reactive, computed, inject, onMounted, watch } from 'vue';
import { throwError } from '@/utils.js';
import { useI18n } from 'vue-i18n';
import Modal from '@/elements/Modal.vue';
import PrimaryButton from '@/elements/PrimaryButton.vue';

// icons
import {
	IconDeviceFloppy,
	IconLoader2,
	IconPlus,
} from '@tabler/icons-vue';

// component constants
const { t } = useI18n();

// global properties
const db = inject('db');

// component properties
const props = defineProps({
	active: Boolean,         // state of modal display, true to show modal
	initialLanguage: Object, // initial language object to fill with data
	existing: Boolean,       // language already exists
	languageKey: String,     // language code
});

// language input data
const isocode = ref('');
const language = ref({});
const initInput = () => {
	isocode.value = props.languageKey;
	language.value = {...props.initialLanguage};
};
onMounted(() => initInput());
watch(() => props.active, () => initInput());

// emits
const emit = defineEmits(['closed']);

// computed: calculate wether form errors occured
const error = reactive({
	label: false,
	isocode: false,
});
const errors = computed(() => (error.label || error.isocode));

// save changes
const busy = ref(false);
const setLanguage = () => {
	// first check for form errors
	error.label = language.value.label == '';
	error.isocode = isocode.value == '';
	// no errors: send submitted language data and close modal
	if (!errors.value) {
		busy.value = true;
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
				busy.value = false;
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
				busy.value = false;
			}).catch((error) => throwError(error));
		}
	}
};
</script>
