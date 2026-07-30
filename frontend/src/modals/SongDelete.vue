<template>
	<modal-dialog :active="active" :title="t('modal.deleteSong')" @closed="emit('closed')">
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
					<icon-loader2 v-if="busy" class="w-6 h-6 stroke-1.5 animate-spin" />
					<icon-trash v-else class="w-6 h-6 stroke-1.5" />
				</primary-button>
			</div>
		</div>
	</modal-dialog>
</template>

<script setup>
import { inject, ref } from 'vue';
import { notify } from '@kyvg/vue3-notification';
import { throwError, updateSongTranslations } from '@/utils.js';
import { useI18n } from 'vue-i18n';
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
const songs = inject('songs');
const songsCollection = inject('songsCollection');

// component properties
const props = defineProps({
	active: Boolean, // state of modal display, true to show modal
	title:  String,  // title of setlist to delete
	id:     String,  // id of setlist to delete
});

// user input properties
const agreed = ref(false);

// emits
const emit = defineEmits(['closed']);

// execute song deletion
const busy = ref(false);
const deleteSong = async () => {
	busy.value = true;
	try {
		await songsCollection.value.deleteDoc(props.id);
		emit('closed');

		// remove back-references from any song that lists this one as a translation
		const affected = songs.value.filter(s => s.entity.translations?.includes(props.id));
		await Promise.allSettled(
			affected.map(s =>
				updateSongTranslations(songsCollection.value, songs.value, s.id, (arr) => arr.filter(t => t !== props.id))
			)
		);

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
	} catch (err) {
		throwError(err);
	} finally {
		busy.value = false;
	}
};
</script>
