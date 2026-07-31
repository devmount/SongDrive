<template>
	<modal-dialog :active="active" :title="t('modal.deleteSetlist')" @closed="emit('closed')">
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
	</modal-dialog>
</template>

<script setup lang="ts">
import { injectStrict, setlistCollectionKey, setlistsKey } from '@/keys';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { notify } from '@kyvg/vue3-notification';
import { throwError, type ThrowableError } from '@/utils.js';
import { useRoute, useRouter } from 'vue-router'
import ModalDialog from '@/elements/ModalDialog.vue';
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
const setlists = injectStrict(setlistsKey);
const setlistCollection = injectStrict(setlistCollectionKey);

// component properties
const props = defineProps({
	active: Boolean, // state of modal display, true to show modal
	title: String,   // title of setlist to delete
	id: String,      // slug of setlist to delete
});

// emits
const emit = defineEmits(['closed']);

// execute setlist deletion
const busy = ref(false);
const deleteSetlist = async () => {
	if (!setlistCollection.value) return;
	busy.value = true;
	try {
		const current = setlists.value.find(s => s.entity.slug === props.id);
		if (!current) return;
		await setlistCollection.value.deleteDoc(current.id);
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
	} catch (err) {
		throwError(err as ThrowableError);
	} finally {
		busy.value = false;
	}
};
</script>
