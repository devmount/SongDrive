<template>
	<div class="modal modal-sm" :class="{ active: active }">
		<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="emit('closed')"></a>
		<div class="modal-container">
			<div class="modal-header">
				<a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="emit('closed')"></a>
				<div class="modal-title h5">{{ t('modal.deleteSong') }}</div>
			</div>
			<div class="modal-body">
				<div class="content">
					<p>{{ t('text.reallyDeleteSong', { title: title }) }}</p>
					<p>{{ t('text.cannotBeUndone') }}</p>
				</div>
			</div>
			<div class="modal-footer">
				<a class="btn btn-link btn-gray" href="#" aria-label="Cancel" @click.prevent="emit('closed')">
					{{ t('button.cancel') }}
				</a>
				<button class="btn btn-error ml-2" @click="deleteSong">{{ t('button.delete') }}</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { inject } from 'vue';
import { useI18n } from "vue-i18n";
const { t } = useI18n();
import { notify } from '@kyvg/vue3-notification';
import { throwError } from '@/utils.js';
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()

// global properties
const db = inject('db');

// inherited properties
const props = defineProps({
	active: Boolean, // state of modal display, true to show modal
	title: String,   // title of setlist to delete
	id: String,      // id of setlist to delete
	songs: Object,   // list of songs assigned to this setlist
});

// emits
const emit = defineEmits(['closed']);

const deleteSong = () => {
	db.collection('songs').doc(props.id).delete().then(() => {
		emit('closed');
		// check existing song translations for this song id and delete corresponding references
		for (const songId in props.songs) {
			const song = props.songs[songId];
			let existingSongKey = null;
			song.translations.forEach((translation, key) => {
				if (translation == props.id) existingSongKey = key;
			});
			if (existingSongKey !== null) {
				let updatedTranslationsList = song.translations.filter(t => t != props.id);
				db.collection('songs').doc(songId).update({ translations: updatedTranslationsList });
			}
		}
		// go back to songs list if not already there
		if (route.name != 'songs') {
			router.push({ name: 'songs' });
		}
		// toast success message
		notify({
			title: t('toast.songDeleted'),
			text: t('toast.songDeletedText'),
			type: 'primary'
		});
	}).catch((error) => throwError(error));
};
</script>
