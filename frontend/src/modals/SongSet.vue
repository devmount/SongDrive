<template>
	<modal
		:active="active"
		:title="!existing ? t('modal.newSong') : t('modal.editSong') + ' «' + song.title + '»'"
		size="xl6"
		@closed="emit('closed')"
	>
		<div class="flex flex-col lg:grid lg:grid-cols-2 gap-4 overflow-y-auto h-full">
			<div class="flex flex-col gap-2">
				<!-- title -->
				<label class="flex flex-col gap-1">
					<div>{{ t('field.title') }} <span class="text-rose-600">*</span></div>
					<input
						type="text"
						v-model="song.title"
						:class="{ '!border-rose-600': (error.title & !song.title) || error.slug }"
						:placeholder="t('placeholder.exampleSongTitle')"
						:disabled="existing"
					/>
					<div v-if="error.title & !song.title" class="text-rose-600">
						{{ t('error.requiredTitle') }}
					</div>
					<div v-if="error.slug" class="text-rose-600">
						{{ t('error.songAlreadyExists') }}
					</div>
				</label>
				<div class="grid grid-cols-2/1 gap-4">
					<!-- subtitle -->
					<label class="flex flex-col gap-1">
						<div>{{ t('field.subtitle') }}</div>
						<input
							type="text"
							v-model="song.subtitle"
							:placeholder="t('placeholder.exampleSongSubtitle')"
						>
					</label>
					<!-- language -->
					<label v-if="ready.languages" class="flex flex-col gap-1">
						<div>{{ t('field.language') }} <span class="text-rose-600">*</span></div>
						<select v-model="song.language" :class="{ '!border-rose-600': error.language & !song.language }">
							<option value="">{{ t('placeholder.select') }}</option>
							<option v-for="(l, key) in languages" :value="key" :key="key">
								{{ l.label }}
							</option>
						</select>
						<div v-if="error.language & !song.language" class="text-rose-600">
							{{ t('error.requiredLanguage') }}
						</div>
					</label>
				</div>
				<div class="grid grid-cols-2/1 gap-4">
					<!-- authors -->
					<label class="flex flex-col gap-1">
						<div>{{ t('field.authors') }}</div>
						<input
							type="text"
							v-model="song.authors"
							:placeholder="t('placeholder.exampleSongAuthors')"
						>
					</label>
					<!-- key -->
					<label class="flex flex-col gap-1">
						<div>{{ t('field.tuning') }}</div>
						<select v-model="song.tuning">
							<option value="">{{ t('placeholder.select') }}</option>
							<option v-for="key in keyScale" :key="key" :value="key">{{ key }}</option>
						</select>
					</label>
				</div>
				<div class="grid grid-cols-2/1 gap-4">
					<!-- tags -->
					<div class="flex flex-col gap-1">
						<div>{{ t('field.tags') }}</div>
						<div class="flex flex-wrap items-start gap-1">
							<tag
									v-for="tag in song.tags" :key="tag"
									:tag="tags[tag]"
									@close="song.tags = song.tags.filter(k => k !== tag)"
									closable
								/>
							<secondary-button class="!p-0.5" @click="showModal.tags = true">
								<icon-plus class="w-5 h-5 stroke-1.5" />
							</secondary-button>
						</div>
					</div>
					<!-- year -->
					<label class="flex flex-col gap-1">
						<div>{{ t('field.year') }}</div>
						<input
							type="number"
							v-model="song.year"
							:placeholder="t('placeholder.exampleSongYear')"
						>
					</label>
				</div>
				<div class="grid grid-cols-2/1 gap-4">
				<!-- youtube id -->
					<label class="flex flex-col gap-1">
						<div>{{ t('field.youtubeId') }}</div>
						<input
							type="text"
							v-model="song.youtube"
							:placeholder="t('placeholder.exampleSongYoutubeId')"
						>
					</label>
					<!-- ccli number -->
					<label class="flex flex-col gap-1">
						<div class="flex gap-2">
							{{ t('field.ccli') }}
							<icon-number class="w-5 h-5 stroke-1.5 mt-0.5" />
						</div>
						<input
							type="number"
							v-model="song.ccli"
							:placeholder="t('placeholder.exampleSongCcli')"
						>
					</label>
				</div>
				<div class="grid grid-cols-2/1 gap-4">
					<!-- publisher -->
					<label class="flex flex-col gap-1">
						<div>{{ t('field.publisher') }}</div>
						<textarea
							v-model="song.publisher"
							class="text-sm"
							:placeholder="t('placeholder.exampleSongPublisher')"
							rows="2"
						></textarea>
					</label>
					<!-- note -->
					<label class="flex flex-col gap-1">
						<div>{{ t('field.note') }}</div>
						<textarea
							v-model="song.note"
							class="text-sm"
							:placeholder="t('placeholder.exampleSongNote')"
							rows="2"
						></textarea>
					</label>
				</div>
				<!-- song translations -->
				<label class="flex flex-col gap-2">
					<div>{{ t('field.translations') }}</div>
					<div
						v-if="song.translations && song.translations.length == 0"
						class="flex gap-1 items-center text-blade-500"
					>
						<icon-info-circle class="w-5 h-5 stroke-1.5" />
						{{ t('text.noTranslations') }}
					</div>
					<div v-else class="flex flex-col gap-1">
						<div v-for="tsong in song.translations" :key="tsong" class="flex items-center gap-3">
							<figure class="shrink-0 flex justify-center items-center bg-blade-300 dark:bg-blade-700 font-semibold py-1 w-12">
								<div class="-mt-0.5 uppercase">{{ songs[tsong].language }}</div>
							</figure>
							<div class="flex flex-col overflow-hidden">
								<div class="-mt-1 truncate">{{ songs[tsong].title }}</div>
								<div class="text-sm text-blade-500 -mt-1 truncate">{{ songs[tsong].subtitle }}</div>
							</div>
							<button
								class="ml-auto"
								@click="song.translations = song.translations.filter(k => k !== tsong)"
							>
								<icon-x class="w-4 h-4 text-blade-500" />
							</button>
						</div>
					</div>
					<secondary-button class="!p-1 self-start" @click="showModal.translations = true">
						<icon-plus class="w-5 h-5 stroke-1.5" />
					</secondary-button>
				</label>
			</div>
			<div class="h-full flex flex-col gap-1">
				<!-- song content -->
				<label class="flex justify-between" for="song-content">
					<div>{{ t('field.content') }} <span class="text-rose-600">*</span></div>
					<secondary-button
						class="!p-1"
						:title="t('modal.songSyntaxCheatsheet')"
						@click="showModal.infosongsyntax = true"
					>
						<icon-book class="w-4 h-4 stroke-1.5" />
					</secondary-button>
				</label>
				<prism-editor
					id="song-content"
					class="font-mono text-sm leading-4 p-1.5"
					:class="{ '!border-rose-600': error.content & !song.content }"
					v-model="song.content"
					:highlight="sdHighlight"
					:placeholder="t('placeholder.exampleSongContent')"
				></prism-editor>
				<div v-if="error.content & !song.content" class="text-rose-600">
					{{ t('error.requiredContent') }}
				</div>
			</div>
		</div>
		<div class="flex flex-col justify-end items-center gap-4 2xs:flex-row">
			<button class="px-3 py-2 text-blade-500" aria-label="Cancel" @click.prevent="emit('closed')">
				{{ t('button.cancel') }}
			</button>
			<primary-button @click="setSong">
				<span v-if="!existing">{{ t('button.createSong') }}</span>
				<span v-else>{{ t('button.updateSong') }}</span>
				<icon-loader2 v-if="busy" class="w-6 h-6 stroke-1.5 animate-spin" />
				<template v-else>
					<icon-plus v-if="!existing" class="w-6 h-6 stroke-1.5" />
					<icon-device-floppy v-else class="w-6 h-6 stroke-1.5" />
				</template>
			</primary-button>
		</div>
	</modal>
	<!-- modal: info song syntax -->
	<info-song-syntax
		:active="showModal.infosongsyntax"
		@closed="showModal.infosongsyntax = false"
	/>
	<!-- modal: assign tag to song -->
	<tag-assign
		:active="showModal.tags"
		:tags="tags"
		:assigned-tags="song.tags"
		@assign="assignTags"
		@closed="showModal.tags = false"
	/>
	<!-- additional modal: add translation -->
	<song-assign
		:active="showModal.translations"
		:language="song.language"
		:id="id"
		:songs="songs"
		:assigned-songs="song.translations"
		@assign="assignTranslations"
		@closed="showModal.translations = false"
	/>
</template>

<script setup>
import 'vue-prism-editor/dist/prismeditor.min.css';
import { keyScale, sdHighlight, throwError, urlify } from '@/utils.js';
import { notify } from '@kyvg/vue3-notification';
import { PrismEditor } from 'vue-prism-editor';
import { ref, reactive, computed, inject, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { setDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import InfoSongSyntax from '@/modals/InfoSongSyntax.vue';
import Modal from '@/elements/Modal.vue';
import PrimaryButton from '@/elements/PrimaryButton.vue';
import SecondaryButton from '@/elements/SecondaryButton.vue';
import SongAssign from '@/modals/SongAssign.vue';
import Tag from '@/elements/Tag.vue';
import TagAssign from '@/modals/TagAssign.vue';

// icons
import {
	IconBook,
	IconDeviceFloppy,
	IconInfoCircle,
	IconLoader2,
	IconNumber,
	IconPlus,
	IconX,
} from '@tabler/icons-vue';

// component constants
const { t } = useI18n();
const router = useRouter();

// global properties
const db = inject('db');

// component properties
const props = defineProps({
	active:      Boolean, // state of modal display, true to show modal
	existing:    Boolean, // song already exists
	id:          String,  // song identifier
	initialSong: Object,  // song structure to fill with data
	languages:   Object,  // list of all available languages
	ready:       Object,  // object holding information about the retrieval state of collections
	setlists:    Object,  // list of all available setlists
	songs:       Object,  // list of all available songs
	tags:        Object,  // list of all available tags
});

// check if form errors occured
const error = reactive({
	title: false,
	language: false,
	content: false,
	slug: false,
});
const errors = computed(() => {
	return (error.title || error.language || error.content || error.slug);
});
const resetErrors = () => {
	for (const key in error) {
		if (Object.hasOwnProperty.call(error, key)) {
			error[key] = false;
		}
	}
};

// song input data
const song = ref({});
const initInput = () => {
	resetErrors();
	song.value = {...props.initialSong};
};
watch(() => props.active, () => initInput());

// active modals state
const showModal = reactive({
	tags: false,
	translations: false,
	infosongsyntax: false
});

// emits
const emit = defineEmits(['closed']);

// assign selected tags to song
const assignTags = (tags) => {
	song.value.tags = tags;
	showModal.tags = false;
};

// assign selected tags to song
const assignTranslations = (translations) => {
	song.value.translations = translations;
	showModal.translations = false;
};

// create a human readable record id of format YYYYMMDD-setlist-title to use in ursl
const createSlug = () => {
	return urlify(song.value.title) + '-' + song.value.language;
};

// add or save edits of song to db 
const busy = ref(false);
const setSong = () => {
	const slug = createSlug();
	// first check for form errors
	error.title = song.value.title == '';
	error.language = song.value.language == '';
	error.content = song.value.content == '';
	error.slug = props.existing && props.id == slug ? false : props.songs.hasOwnProperty(slug);
	// no errors: start saving song data
	if (!errors.value) {
		busy.value = true;
		let processedSong = song.value;
		processedSong.ccli = processedSong.ccli ? parseInt(processedSong.ccli) : '';
		processedSong.year = processedSong.year ? parseInt(processedSong.year) : '';
		processedSong.youtube = processedSong.youtube ? processedSong.youtube : '';
		// new song should be created
		if (!props.existing) {
			setDoc(doc(db, `songs/${slug}`), processedSong).then(() => {
				// persist translation references
				if (processedSong.translations.length > 0) {
					processedSong.translations.forEach(t => {
						if (t in props.songs) {
							let tsong = props.songs[t];
							if (!tsong.translations.includes(slug)) {
								updateDoc(doc(db, `songs/${t}`), { translations: tsong.translations.concat([slug]) });
							}
						}
					});
				}
				processedSong = {};
				router.push({ name: 'song-show', params: { id: slug }});
				// toast success creation message
				notify({
					title: t('toast.songAdded'),
					text: t('toast.songSavedText'),
					type: 'primary'
				});
				busy.value = false;
				emit('closed');
			}).catch((error) => throwError(error));
		}
		// existing song should be updated
		else {
			const initialSong = props.initialSong; // remember initial song data before update
			// check if key remained (no title or language changes)
			if (props.id == slug) {
				// just update the existing song
				updateDoc(doc(db, `songs/${slug}`), processedSong).then(() => {
					// persist translation references by removing and adding them
					let translationDiff = initialSong.translations.filter(t => !processedSong.translations.includes(t));
					if (translationDiff.length > 0) {
						translationDiff.forEach(s => {
							updateDoc(doc(db, `songs/${s}`), { translations: props.songs[s].translations.filter(t => t != slug) });
						});
					}
					if (processedSong.translations.length > 0) {
						processedSong.translations.forEach(t => {
							if (t in props.songs) {
								let tsong = props.songs[t];
								if (!tsong.translations.includes(slug)) {
									updateDoc(doc(db, `songs/${t}`), { translations: tsong.translations.concat([slug]) });
								}
							}
						});
					}
					processedSong = {};
					// toast success update message
					notify({
						title: t('toast.songUpdated'),
						text: t('toast.songSavedText'),
						type: 'primary'
					});
					busy.value = false;
					emit('closed');
				}).catch((error) => throwError(error));
			} else {
				// update key by adding a new song, removing the old one and update references in other fields
				setDoc(doc(db, `songs/${slug}`), processedSong).then(() => {
					deleteDoc(doc(db, `songs/${props.id}`));
					// check existing setlists for this song id and update to new slug
					for (const setlistId in props.setlists) {
						const setlist = props.setlists[setlistId];
						let existingSongKey = null;
						setlist.songs.forEach((ssong, key) => {
							if (ssong.id == props.id) existingSongKey = key;
						});
						if (existingSongKey !== null) {
							let updatedSongList = setlist.songs;
							updatedSongList[existingSongKey].id = slug;
							updateDoc(doc(db, `setlists/${setlistId}`), { songs: updatedSongList });
						}
					}
					// check existing song translations for this song id and update to new slug
					for (const songId in props.songs) {
						const esong = props.songs[songId];
						let existingSongKey = null;
						esong.translations.forEach((translation, key) => {
							if (translation == props.id) existingSongKey = key;
						});
						if (existingSongKey !== null) {
							let updatedTranslationsList = esong.translations;
							updatedTranslationsList[existingSongKey] = slug;
							updateDoc(doc(db, `songs/${songId}`), { translations: updatedTranslationsList });
						}
					}
					// persist translation references by removing and adding them
					let translationDiff = initialSong.translations.filter(t => !processedSong.translations.includes(t));
					if (translationDiff.length > 0) {
						translationDiff.forEach(s => {
							updateDoc(doc(db, `songs/${s}`), { translations: props.songs[s].translations.filter(t => t != slug) });
						});
					}
					if (processedSong.translations.length > 0) {
						processedSong.translations.forEach(t => {
							if (t in props.songs) {
								let tsong = props.songs[t];
								if (!tsong.translations.includes(slug)) {
									updateDoc(doc(db, `songs/${t}`), { translations: tsong.translations.concat([slug]) });
								}
							}
						});
					}
					processedSong = {};
					router.push({ name: 'song-show', params: { id: slug }});
					// toast success update message
					notify({
						title: t('toast.songUpdated'),
						text: t('toast.songSavedText'),
						type: 'primary'
					});
					busy.value = false;
					emit('closed');
				}).catch((error) => throwError(error));
			}
		}
	}
};
</script>
