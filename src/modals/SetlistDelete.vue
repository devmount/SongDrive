<template>
	<div class="modal modal-sm" :class="{ active: active }">
		<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="emit('closed')"></a>
		<div class="modal-container">
			<div class="modal-header">
				<a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="emit('closed')"></a>
				<div class="modal-title h5">{{ t('modal.deleteSetlist') }}</div>
			</div>
			<div class="modal-body">
				<div class="content">
					<p>{{ t('text.reallyDeleteSetlist', { title: title }) }}</p>
					<p>{{ t('text.cannotBeUndone') }}</p>
				</div>
			</div>
			<div class="modal-footer">
				<a class="btn btn-link btn-gray" href="#" aria-label="Cancel" @click.prevent="emit('closed')">
					{{ t('button.cancel') }}
				</a>
				<button class="btn btn-error ml-2" @click="deleteSetlist">{{ t('button.delete') }}</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { inject } from 'vue';
import { useI18n } from "vue-i18n";
import { notify } from '@kyvg/vue3-notification';
import { throwError } from '@/utils.js';
import { useRoute, useRouter } from 'vue-router'
const { t } = useI18n();
const route = useRoute()
const router = useRouter()

// global properties
const db = inject('db');

// inherited properties
const props = defineProps({
	active: Boolean, // state of modal display, true to show modal
	title: String,   // title of setlist to delete
	id: String,      // id of setlist to delete
});

// emits
const emit = defineEmits(['closed']);

const deleteSetlist = () => {
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
	}).catch((error) => throwError(error));
};
</script>
