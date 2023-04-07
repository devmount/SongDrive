<template>
	<modal :active="active" :title="t('modal.deleteLanguage')" @closed="emit('closed')">
		<div class="flex flex-col gap-2">
			<template v-if="!languageInUse">
				<div>{{ t('text.reallyDeleteLanguage', { name: languageName }) }}</div>
				<div class="text-rose-600">{{ t('text.cannotBeUndone') }}</div>
			</template>
			<template v-else>
				<div>{{ t('text.languageInUse') }}</div>
			</template>
		</div>
		<div class="flex flex-col justify-end items-center gap-4 mt-4 2xs:flex-row">
			<button class="px-3 py-2 text-blade-500" aria-label="Cancel" @click.prevent="emit('closed')">
				{{ t('button.cancel') }}
			</button>
			<primary-button type="danger" :disabled="languageInUse" @click="deleteLanguage">
				{{ t('button.delete') }}
				<icon-loader2 v-if="busy" class="w-6 h-6 stroke-1.5 animate-spin" />
				<icon-trash v-else class="w-6 h-6 stroke-1.5" />
			</primary-button>
		</div>
	</modal>
</template>

<script setup>
import { computed, inject, ref } from 'vue';
import { notify } from '@kyvg/vue3-notification';
import { throwError } from '@/utils.js';
import { useI18n } from 'vue-i18n';
import Modal from '@/elements/Modal';
import PrimaryButton from '@/elements/PrimaryButton';

// icons
import {
	IconLoader2,
	IconTrash,
} from '@tabler/icons-vue';

// component constants
const { t } = useI18n();

// global properties
const db = inject('db');

// component properties
const props = defineProps({
	active: Boolean,      // state of modal display, true to show modal
	languageName: String, // name of language to delete
	languageKey: String,  // language code of language to delete
	songs: Object         // songs collection
});

// emits
const emit = defineEmits(['closed']);

// true if there are still songs assigned to this language
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

// remove language from collection
const busy = ref(false);
const deleteLanguage = () => {
	if (!languageInUse.value) {
		busy.value = true;
		db.collection('languages').doc(props.languageKey).delete().then(() => {
			emit('closed');
			// toast success message
			notify({
				title: t('toast.languageDeleted'),
				text: t('toast.languageDeletedText'),
				type: 'primary'
			});
			busy.value = false;
		}).catch((error) => throwError(error));
	} else {
		throwError({
			code: t('toast.languageInUse'),
			message: t('text.languageInUse')
		});
	}
}
</script>
