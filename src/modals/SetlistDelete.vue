<template>
	<modal :active="active" :title="t('modal.deleteSetlist')" @closed="emit('closed')">
		<div class="flex flex-col gap-2">
			<div>{{ t('text.reallyDeleteSetlist', { title: title }) }}</div>
			<div class="text-rose-600">{{ t('text.cannotBeUndone') }}</div>
			<div class="flex flex-col justify-end items-center gap-4 mt-4 2xs:flex-row">
				<button class="px-3 py-2 text-blade-500" aria-label="Cancel" @click.prevent="emit('closed')">
					{{ t('button.cancel') }}
				</button>
				<primary-button type="danger" @click="deleteSetlist">
					{{ t('button.delete') }}
					<icon-loader2 v-if="busy" class="w-6 h-6 stroke-1.5 animate-spin" />
					<icon-trash v-else class="w-6 h-6 stroke-1.5" />
				</primary-button>
			</div>
		</div>
	</modal>
</template>

<script setup>
import { inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { notify } from '@kyvg/vue3-notification';
import { throwError } from '@/utils.js';
import { useRoute, useRouter } from 'vue-router'
import Modal from '@/elements/Modal.vue';
import PrimaryButton from '@/elements/PrimaryButton.vue';

// icons
import {
	IconLoader2,
	IconTrash,
} from '@tabler/icons-vue';

// component constants
const { t } = useI18n();
const route = useRoute()
const router = useRouter()

// global properties
const db = inject('db');

// component properties
const props = defineProps({
	active: Boolean, // state of modal display, true to show modal
	title: String,   // title of setlist to delete
	id: String,      // id of setlist to delete
});

// emits
const emit = defineEmits(['closed']);

// execute setlist deletion
const busy = ref(false);
const deleteSetlist = () => {
	busy.value = true;
	db.collection('setlists').doc(props.id).delete().then(() => {
		emit('closed');
		if (route.name != 'setlists') {
			router.push({ name: 'setlists' });
		}
		// toast success message
		notify({
			title: t('toast.setlistDeleted'),
			text: t('toast.setlistDeletedText'),
			type: 'primary'
		});
		busy.value = false;
	}).catch((error) => throwError(error));
};
</script>
