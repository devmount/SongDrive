<template>
	<modal
		:active="active"
		:title="!existing ? t('modal.addTag') : t('modal.editTag')"
		@closed="emit('closed')"
	>
		<div class="flex flex-col gap-2">
			<!-- tag key -->
			<label class="flex flex-col gap-1">
				<div>{{ t('field.key') }} <span class="text-rose-600">*</span></div>
				<input
					type="text"
					v-model="key"
					:class="{ 'border-rose-600': errorKey }"
					:placeholder="t('placeholder.exampleTagKey')"
					:disabled="existing"
				/>
			</label>
			<div v-if="errorKey" class="text-rose-600">{{ t('error.requiredTagKey') }}</div>
			<!-- tag labels for each language -->
			<template v-for="(label, key) in uiLanguages" :key="key">
				<label class="flex flex-col gap-1">
					<div>{{ label }}</div>
					<input type="text" v-model="languages[key]" />
				</label>
			</template>
		</div>
		<div class="flex flex-col justify-end items-center gap-4 mt-4 2xs:flex-row">
			<button class="px-3 py-2 text-blade-500" aria-label="Cancel" @click.prevent="emit('closed')">
				{{ t('button.cancel') }}
			</button>
			<primary-button @click="setTag">
				<span v-if="!existing">{{ t('button.addTag') }}</span>
				<span v-else>{{ t('button.updateTag') }}</span>
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
import { ref, inject, onMounted, watch } from 'vue';
import { throwError } from '@/utils.js';
import { useI18n } from 'vue-i18n';
import Modal from '@/elements/Modal';
import PrimaryButton from '@/elements/PrimaryButton';

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
	active:      Boolean, // state of modal display, true to show modal
	existing:    Boolean, // tag already exists
	initialTag:  Object,  // tag structure to fill with data
	tagKey:      String,  // tag identifier
	uiLanguages: Object,  // list of all available languages
});

// input data
const key = ref('');
const languages = ref([]);
const initInput = () => {
	// init tag key
	key.value = props.tagKey;
	// init tag translations
	let langs = {};
	for (const k in props.uiLanguages) {
		langs[k] = props.initialTag[k];
	}
	languages.value = langs;
};
onMounted(() => initInput());
watch(() => props.active, () => initInput());

// posssible form errors
const errorKey = ref(false);

// emits
const emit = defineEmits(['closed']);

// add or save edits of tag to db 
const busy = ref(false);
const setTag = () => {
	// first check for errors
	errorKey.value = key.value == '';
	// no errors: send submitted tag data and close modal
	if (!errorKey.value) {
		busy.value = true;
		// tag already exists
		if (props.existing) {
			db.collection('tags').doc(key.value).update({
				key: key.value,
				...languages.value
			}).then(() => {
				emit('closed');
				// tag updated successfully!
				notify({
					title: t('toast.tagUpdated'),
					text: t('toast.tagSavedText'),
					type: 'primary'
				});
				busy.value = false;
			}).catch((error) => throwError(error));
		}
		// tag doesn't exist yet
		else {
			db.collection('tags').doc(key.value).set({
				key: key.value,
				...languages.value
			}).then(() => {
				emit('closed');
				// tag added successfully
				notify({
					title: t('toast.tagAdded'),
					text: t('toast.tagSavedText'),
					type: 'primary'
				});
				busy.value = false;
			}).catch((error) => throwError(error));
		}
	}
};
</script>
