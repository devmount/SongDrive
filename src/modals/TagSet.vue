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
			<primary-button class="grow" @click="setTag">
				<span v-if="!existing">{{ t('button.addTag') }}</span>
				<span v-else>{{ t('button.updateTag') }}</span>
				<ion-icon :icon="!existing ? addOutline : saveOutline" class="w-6 h-6" />
			</primary-button>
		</div>
	</modal>
</template>

<script setup>
import PrimaryButton from '@/elements/PrimaryButton';
import Modal from '@/elements/Modal';
import { ref, inject } from 'vue';
import { useI18n } from "vue-i18n";
import { notify } from '@kyvg/vue3-notification';
import { addOutline, saveOutline } from 'ionicons/icons';
import { throwError } from '@/utils.js';
const { t } = useI18n();

// global properties
const db = inject('db');

// inherited properties
const props = defineProps({
	active:      Boolean, // state of modal display, true to show modal
	existing:    Boolean, // tag already exists
	initialTag:  Object,  // tag structure to fill with data
	tagKey:      String,  // tag identifier
	uiLanguages: Object,  // list of all available languages
});

// reactive data
let langs = {};
for (const k in props.uiLanguages) {
	langs[k] = props.initialTag[k];
}
const key = ref(props.tagKey);
const languages = ref(langs);
const errorKey = ref(false);

// emits
const emit = defineEmits(['closed']);

// add or save edits of tag to db 
const setTag = () => {
	// first check for errors
	errorKey.value = key.value == '';
	// no errors: send submitted tag data and close modal
	if (!errorKey.value) {
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
			}).catch((error) => throwError(error));
		}
	}
};
</script>
