<template>
	<modal :active="active" :title="t('modal.deleteSong')" @closed="emit('closed')">
		<div class="flex flex-col gap-2">
			<div>{{ t('text.reallyDeleteSong', { title: title }) }}</div>
			<div class="text-rose-600">{{ t('text.cannotBeUndone') }}</div>
			<label class="flex items-center gap-3 mt-4">
				<input v-model="agreed" :value="true" type="checkbox" class="w-6 h-6" />
				{{ t('text.yesIUnderstand') }}
			</label>
			<div class="flex flex-col justify-end items-center gap-4 mt-4 2xs:flex-row">
				<button class="px-3 py-2 text-blade-500" aria-label="Cancel" @click.prevent="emit('closed')">
					{{ t('button.cancel') }}
				</button>
				<primary-button
					type="danger"
					:disabled="!agreed"
					@click="agreed ? deleteSong() : null"
				>
					{{ t('button.delete') }}
					<trash-icon class="w-6 h-6 stroke-1.5" />
				</primary-button>
			</div>
		</div>
	</modal>
</template>

<script setup>
import { inject, ref } from 'vue';
import { notify } from '@kyvg/vue3-notification';
import { throwError } from '@/utils.js';
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from 'vue-router'
import Modal from '@/elements/Modal';
import PrimaryButton from '@/elements/PrimaryButton';

// icons
import { TrashIcon } from "vue-tabler-icons";

// component constants
const { t } = useI18n();
const route = useRoute()
const router = useRouter()

// global properties
const db = inject('db');

// component properties
const props = defineProps({
	active: Boolean, // state of modal display, true to show modal
	title:  String,  // title of setlist to delete
	id:     String,  // id of setlist to delete
	songs:  Object,  // list of songs assigned to this setlist
});

// user input properties
const agreed = ref(false);

// emits
const emit = defineEmits(['closed']);

// execute song deletion
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
