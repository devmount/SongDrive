<template>
	<div class="modal modal-sm" :class="{ active: active }">
		<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="emit('closed')"></a>
		<div class="modal-container">
			<div class="modal-header">
				<a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="emit('closed')"></a>
				<div class="modal-title h5">
					<span v-if="!existing">{{ t('modal.addTag') }}</span>
					<span v-else>{{ t('modal.editTag') }}</span>
				</div>
			</div>
			<div class="modal-body">
				<div class="content">
					<label class="form-label" for="key">{{ t('field.key') }} <span class="text-error">*</span></label>
					<input
						id="key"
						type="text"
						v-model="key"
						class="form-input mb-1"
						:class="{ 'is-error': errorKey }"
						:placeholder="t('placeholder.exampleTagKey')"
						:disabled="existing"
					/>
					<p v-if="errorKey" class="form-input-hint">{{ t('error.requiredTagKey') }}</p>
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
				<a class="btn btn-link btn-gray" href="#" aria-label="Cancel" @click.prevent="emit('closed')">
					{{ t('button.cancel') }}
				</a>
				<button class="btn btn-primary ml-2" @click="setTag">
					<span v-if="!existing">{{ t('button.addTag') }}</span>
					<span v-else>{{ t('button.updateTag') }}</span>
				</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, inject } from 'vue';
import { useI18n } from "vue-i18n";
const { t } = useI18n();
import { notify } from '@kyvg/vue3-notification';
import { throwError } from '@/utils.js';

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
