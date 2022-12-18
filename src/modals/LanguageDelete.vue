<template>
	<div class="modal modal-sm" :class="{ active: active }">
		<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="emit('closed')"></a>
		<div class="modal-container">
			<div class="modal-header">
				<a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="emit('closed')"></a>
				<div class="modal-title h5">{{ t('modal.deleteLanguage') }}</div>
			</div>
			<div class="modal-body">
				<div v-if="!languageInUse" class="content">
					<p>{{ t('text.reallyDeleteLanguage', { name: languageName }) }}</p>
					<p>{{ t('text.cannotBeUndone') }}</p>
				</div>
				<div v-else class="content">
					<p>{{ t('text.languageInUse') }}</p>
				</div>
			</div>
			<div class="modal-footer">
				<a class="btn btn-link btn-gray" href="#" aria-label="Cancel" @click.prevent="emit('closed')">
					{{ t('button.cancel') }}
				</a>
				<button class="btn btn-error ml-2" :class="{ disabled: languageInUse }" @click="deleteLanguage">
					{{ t('button.delete') }}
				</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, inject } from 'vue';
import { useI18n } from "vue-i18n";
import { notify } from '@kyvg/vue3-notification';
import { throwError } from '@/utils.js';
const { t } = useI18n();

// global properties
const db = inject('db');

// inherited properties
const props = defineProps({
	active: Boolean,      // state of modal display, true to show modal
	languageName: String, // name of language to delete
	languageKey: String,  // language code of language to delete
	songs: Object         // songs collection
});

// emits
const emit = defineEmits(['closed']);

// computed
const languageInUse = computed(() => {
	for (const id in props.songs) {
		if (Object.hasOwnProperty.call(props.songs, id)) {
			if (props.songs[id].language == props.languageKey) {
				return true;
			};
		}
	}
	return false;
});

// methods
const deleteLanguage = () => {
	if (!languageInUse.value) {
		db.collection('languages').doc(props.languageKey).delete().then(() => {
			emit('closed');
			// toast success message
			notify({
				title: t('toast.languageDeleted'),
				text: t('toast.languageDeletedText'),
				type: 'primary'
			});
		}).catch((error) => throwError(error));
	} else {
		throwError({
			code: t('toast.languageInUse'),
			message: t('text.languageInUse')
		});
	}
}
</script>
