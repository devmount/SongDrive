<template>
	<div>
		<!-- main modal: set song -->
		<div class="modal modal-lg modal-wide" :class="{ active: active }">
			<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="emit('closed')"></a>
			<div v-if="song && ready.songs" class="modal-container">
				<div class="modal-header">
					<a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="emit('closed')"></a>
					<div v-if="!existing" class="modal-title h5">{{ t('modal.newSong') }}</div>
					<div v-else class="modal-title h5">
						{{ t('modal.editSong') }}
						«<span class="text-uppercase ls-1">{{ song.title }}</span>»
					</div>
				</div>
				<div class="modal-body">
					<div class="content">
						<div class="columns">
							<div class="column col-6 col-sm-12">
								<div class="columns">
									<div class="column col-12">
										<div class="form-group" :class="{ 'has-error': error.title || error.slug }">
											<label class="form-label" for="title">
												{{ t('field.title') }} <span class="text-error">*</span>
											</label>
											<input
												v-model="song.title"
												class="form-input"
												id="title"
												type="text"
												:placeholder="t('placeholder.exampleSongTitle')"
											>
											<p v-if="error.title" class="form-input-hint">{{ t('error.requiredTitle') }}</p>
											<p v-if="error.slug" class="form-input-hint">{{ t('error.songAlreadyExists') }}</p>
										</div>
									</div>
									<div class="column col-8 col-md-12">
										<div class="form-group">
											<label class="form-label" for="subtitle">{{ t('field.subtitle') }}</label>
											<input
												v-model="song.subtitle"
												class="form-input"
												id="subtitle"
												type="text"
												:placeholder="t('placeholder.exampleSongSubtitle')"
											>
										</div>
									</div>
									<div class="column col-4 col-md-12">
										<div v-if="ready.languages" class="form-group" :class="{ 'has-error': error.language }">
											<label class="form-label" for="language">
												{{ t('field.language') }} <span class="text-error">*</span>
											</label>
											<select v-model="song.language" class="form-select" id="language">
												<option value="">{{ t('placeholder.select') }}</option>
												<option v-for="(l, key) in languages" :value="key" :key="key">{{ l.label }}</option>
											</select>
											<p v-if="error.language" class="form-input-hint">{{ t('error.requiredLanguage') }}</p>
										</div>
									</div>
									<div class="column col-8 col-md-12">
										<div class="form-group">
											<label class="form-label" for="authors">{{ t('field.authors') }}</label>
											<input
												v-model="song.authors"
												class="form-input"
												id="authors"
												type="text"
												:placeholder="t('placeholder.exampleSongAuthors')"
											>
										</div>
									</div>
									<div class="column col-4 col-md-12">
										<div class="form-group">
											<label class="form-label" for="tuning">{{ t('field.tuning') }}</label>
											<select v-model="song.tuning" class="form-select" id="tuning">
												<option value="">{{ t('placeholder.select') }}</option>
												<option v-for="tune in keyScale" :key="tune">{{ tune }}</option>
											</select>
										</div>
									</div>
									<div class="column col-8 col-md-12">
										<div class="form-group">
											<label class="form-label" for="tags">{{ t('field.tags') }}</label>
											<div v-for="tag in song.tags" :key="tag" class="chip s-rounded">
												<ion-icon :icon="pricetagOutline" class="icon-sm mr-2"></ion-icon>
												{{ tags[tag][locale] ? tags[tag][locale] : tag }}
												<a
													href="#"
													class="btn btn-clear"
													aria-label="Close"
													role="button"
													@click="song.tags = song.tags.filter(k => k !== tag)"
												></a>
											</div>
											<button class="btn btn-secondary btn-sm" @click="modal.tags = true">
												<ion-icon :icon="add"></ion-icon>
											</button>
										</div>
									</div>
									<div class="column col-4 col-md-12">
										<div class="form-group">
											<label class="form-label" for="ccli">{{ t('field.ccli') }} #</label>
											<input
												v-model="song.ccli"
												class="form-input"
												id="ccli"
												type="number"
												:placeholder="t('placeholder.exampleSongCcli')"
											>
										</div>
									</div>
									<div class="column col-8 col-md-12">
										<div class="form-group">
											<label class="form-label" for="publisher">{{ t('field.publisher') }}</label>
											<textarea
												v-model="song.publisher"
												class="form-input"
												id="publisher"
												:placeholder="t('placeholder.exampleSongPublisher')"
												rows="2"
											></textarea>
										</div>
									</div>
									<div class="column col-4 col-md-12">
										<div class="form-group">
											<label class="form-label" for="year">{{ t('field.year') }}</label>
											<input
												v-model="song.year"
												class="form-input"
												id="year"
												type="number"
												:placeholder="t('placeholder.exampleSongYear')"
											>
										</div>
									</div>
									<div class="column col-8 col-md-12">
										<div class="form-group">
											<label class="form-label" for="note">{{ t('field.note') }}</label>
											<textarea
												v-model="song.note"
												class="form-input"
												id="note"
												type="text"
												:placeholder="t('placeholder.exampleSongNote')"
												rows="2"
											></textarea>
										</div>
									</div>
									<div class="column col-4 col-md-12">
										<div class="form-group">
											<label class="form-label" for="youtube">{{ t('field.youtubeId') }}</label>
											<input
												v-model="song.youtube"
												class="form-input"
												id="youtube"
												type="text"
												:placeholder="t('placeholder.exampleSongYoutubeId')"
											>
										</div>
									</div>
									<div class="column col-12">
										<label class="form-label">{{ t('field.translations') }}</label>
										<div v-if="song.translations && song.translations.length == 0" class="text-gray">
											<ion-icon :icon="informationCircleOutline"></ion-icon> {{ t('text.noTranslations') }}
										</div>
										<div v-else>
											<div v-for="tsong in song.translations" :key="tsong" class="tile tile-centered mb-1">
												<div class="tile-icon">
													<figure class="avatar s-rounded" :data-initial="songs[tsong].language"></figure>
												</div>
												<div class="tile-content">
													<div class="tile-title">{{ songs[tsong].title }}</div>
													<div class="tile-subtitle text-gray text-small">{{ songs[tsong].subtitle }}</div>
												</div>
												<div class="tile-action">
													<button
														class="btn btn-link btn-action"
														@click="song.translations = song.translations.filter(k => k !== tsong)"
													>
														<ion-icon :icon="close"></ion-icon>
													</button>
												</div>
											</div>
										</div>
										<button class="btn btn-secondary btn-sm mt-1" @click="modal.translations = true">
											<ion-icon :icon="add"></ion-icon>
										</button>
									</div>
								</div>
							</div>
							<div class="column col-6 col-sm-12">
								<div class="form-group" :class="{ 'has-error': error.content }">
									<label class="form-label" for="content">
										{{ t('field.content') }} <span class="text-error">*</span>
										<button
											class="btn btn-secondary btn-sm tooltip tooltip-left float-right"
											:data-tooltip="t('modal.songSyntaxCheatsheet')"
											@click="modal.infosongsyntax = true"
										>
											<ion-icon :icon="informationOutline"></ion-icon>
										</button>
									</label>
									<prism-editor
										id="content"
										class="form-input text-pre"
										v-model="song.content"
										:highlight="sdHighlight"
										:placeholder="t('placeholder.exampleSongContent')"
									></prism-editor>
									<p v-if="error.content" class="form-input-hint">{{ t('error.requiredContent') }}</p>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="modal-footer">
					<button class="btn btn-link btn-gray" aria-label="Cancel" @click.prevent="emit('closed')">
						{{ t('button.cancel') }}
					</button>
					<button class="btn btn-primary ml-2" @click="set">
						<span v-if="!existing">{{ t('button.createSong') }}</span>
						<span v-else>{{ t('button.updateSong') }}</span>
					</button>
				</div>
			</div>
		</div>
		<!-- additional modal: add tag -->
		<div v-if="song" class="modal modal-secondary" :class="{ active: modal.tags }">
			<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="modal.tags = false"></a>
			<div class="modal-container">
				<div class="modal-header">
					<a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="modal.tags = false"></a>
					<div class="modal-title h5">{{ t('modal.tags') }}</div>
				</div>
				<div class="modal-body">
					<div class="content">
						<div class="columns">
							<div class="column col-6">
								<div class="input-group filter">
									<span class="input-group-addon"><ion-icon :icon="searchOutline"></ion-icon></span>
									<input
										v-model="search.tags"
										type="search"
										class="form-input"
										:placeholder="t('placeholder.searchTagName')"
									/>
								</div>
								<div class="form-group max-column mt-2">
									<label v-for="tag in filteredTags" :key="tag.key" class="form-checkbox">
										<input v-model="song.tags" :value="tag.key" type="checkbox">
										<i class="form-icon"></i>
										{{ tag[locale] ? tag[locale] : tag.key }}
									</label>
								</div>
							</div>
							<div class="column col-6">
								<div v-if="song.tags && song.tags.length == 0" class="empty">
									<div class="empty-icon">
										<ion-icon :icon="pricetagsOutline" class="icon-4x"></ion-icon>
									</div>
									<p class="empty-title h5">{{ t('text.noTagsSelected') }}</p>
									<p class="empty-subtitle">{{ t('text.selectSomeTags') }}</p>
								</div>
								<div v-else>
									<h3 class="text-center">{{ t('text.selection') }}</h3>
									<div v-for="tag in song.tags" :key="tag" class="tile tile-centered">
										<div class="tile-content">
											<div class="tile-title">
												<ion-icon :icon="pricetagOutline" class="mr-2"></ion-icon>
												{{ tags[tag][locale] ? tags[tag][locale] : tag }}
											</div>
										</div>
										<div class="tile-action">
											<button
												class="btn btn-link btn-action"
												@click="song.tags = song.tags.filter(k => k !== tag)"
											>
												<ion-icon :icon="close"></ion-icon>
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="modal-footer">
					<button class="btn btn-primary" aria-label="Close" @click.prevent="modal.tags = false">
						{{ t('button.close') }}
					</button>
				</div>
			</div>
		</div>
		<!-- additional modal: add translation -->
		<div v-if="song && ready.songs" class="modal modal-secondary" :class="{ active: modal.translations }">
			<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="modal.translations = false"></a>
			<div class="modal-container">
				<div class="modal-header">
					<a
						href="#"
						class="btn btn-clear float-right"
						aria-label="Close"
						@click.prevent="modal.translations = false"
					></a>
					<div class="modal-title h5">{{ t('modal.translations') }}</div>
				</div>
				<div class="modal-body">
					<div class="content">
						<div class="columns">
							<div class="column col-6">
								<div class="input-group filter">
									<span class="input-group-addon"><ion-icon :icon="searchOutline"></ion-icon></span>
									<input
										v-model="search.translations"
										type="search"
										class="form-input"
										:placeholder="t('placeholder.searchSongTitle')"
									/>
								</div>
								<div class="form-group max-column mt-2">
									<label v-for="(fsong, key) in filteredSongs" :key="key" class="form-checkbox mt-2">
										<input v-model="song.translations" :value="key" type="checkbox">
										<i class="form-icon"></i> {{ fsong.title }}
										<div class="text-gray text-small">
											{{ fsong.subtitle }}
										</div>
									</label>
								</div>
							</div>
							<div class="column col-6">
								<div v-if="song.translations && song.translations.length == 0" class="empty">
									<div class="empty-icon">
										<ion-icon :icon="bookOutline" class="icon-4x"></ion-icon>
									</div>
									<p class="empty-title h5">{{ t('text.noSongsSelected') }}</p>
									<p class="empty-subtitle">{{ t('text.selectSomeTranslations') }}</p>
								</div>
								<div v-else>
									<h3 class="text-center">{{ t('text.selection') }}</h3>
									<div v-for="tsong in song.translations" :key="tsong" class="tile tile-centered mb-2">
										<div class="tile-icon">
											<figure class="avatar s-rounded" :data-initial="songs[tsong].language"></figure>
										</div>
										<div class="tile-content">
											<div class="tile-title">{{ songs[tsong].title }}</div>
											<div class="tile-subtitle text-gray text-small">{{ songs[tsong].subtitle }}</div>
										</div>
										<div class="tile-action">
											<button
												class="btn btn-link btn-action"
												@click="song.translations = song.translations.filter(k => k !== tsong)"
											>
												<ion-icon :icon="close"></ion-icon>
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="modal-footer">
					<button class="btn btn-primary" aria-label="Close" @click.prevent="modal.translations = false">
						{{ t('button.close') }}
					</button>
				</div>
			</div>
		</div>
		<!-- modal: info song syntax -->
		<InfoSongSyntax
			v-if="modal.infosongsyntax"
			:active="modal.infosongsyntax"
			@closed="modal.infosongsyntax = false"
		/>
	</div>
</template>

<script setup>
import { ref, reactive, computed, inject } from 'vue';
import { useI18n } from "vue-i18n";
const { t, locale } = useI18n();
import { useRouter } from 'vue-router';
const router = useRouter();
import { notify } from '@kyvg/vue3-notification';
import { keyScale, sdHighlight, throwError, urlify } from '@/utils.js';

import InfoSongSyntax from '@/modals/InfoSongSyntax';
import { PrismEditor } from 'vue-prism-editor';
import 'vue-prism-editor/dist/prismeditor.min.css';

// get icons
import {
	add,
	bookOutline,
	close,
	informationCircleOutline,
	informationOutline,
	pricetagOutline,
	pricetagsOutline,
	searchOutline
} from 'ionicons/icons';

// global properties
const db = inject('db');

// inherited properties
const props = defineProps({
	active:      Boolean, // state of modal display, true to show modal
	existing:    Boolean, // song already exists
	initialSong: Object,  // song structure to fill with data
	id:          String,  // song identifier
	user:        String,  // user identifier
	songs:       Object,  // list of all available songs
	setlists:    Object,  // list of all available setlists
	tags:        Object,  // list of all available tags
	languages:   Object,  // list of all available languages
	ready:       Object,  // object holding information about the retrieval state of collections
});

// reactive data
const song = ref(JSON.parse(JSON.stringify(props.initialSong)));
const modal = reactive({
	tags: false,
	translations: false,
	infosongsyntax: false
});
const search = reactive({
	tags: '',
	translations: '',
});
const error = reactive({
	title: false,
	language: false,
	content: false,
	slug: false,
});

// emits
const emit = defineEmits(['closed', 'reset']);

// computed: filter song list by search query
const filteredTags = computed(() => {
	let tags = {};
	if (search.tags != '') {
		for (const key in props.tags) {
			if (props.tags.hasOwnProperty(key)) {
				const tag = props.tags[key];
				let search = search.tags.toLowerCase();
				// search in tag labels
				let label = tag[locale.value] ? tag[locale.value] : key;
				if (label.toLowerCase().indexOf(search) !== -1) {
					tags[key] = tag;
				}
			}
		}
		return tags;
	} else {
		return props.tags;
	}
});
// computed: filter song list by search query
const filteredSongs = computed(() => {
	let songs = {};
	if (search.translations != '') {
		for (const key in props.songs) {
			if (props.songs.hasOwnProperty(key)) {
				// exclude self assignment
				if (props.existing && props.id == key) continue;
				// search in title and subtitle
				const song = props.songs[key];
				let search = search.translations.toLowerCase();
				if (
					song.title.toLowerCase().indexOf(search) !== -1 ||
					song.subtitle.toLowerCase().indexOf(search) !== -1 ||
					song.content.toLowerCase().indexOf(search) !== -1
				) {
					songs[key] = song;
				}
			}
		}
		return songs;
	} else {
		let songs = JSON.parse(JSON.stringify(props.songs));
		if (props.existing) delete songs[props.id];
		return songs;
	}
});
// computed: calculate wether form errors occured
const errors = computed(() => {
	return (error.title || error.language || error.content || error.slug);
});

// create a human readable record key of format YYYYMMDD-the-setlist-title
const createSlug = () => {
	return urlify(song.value.title) + '-' + song.value.language;
};
// add or save edits of song to db 
const set = () => {
	// first check for form errors
	error.title = song.value.title == '';
	error.language = song.value.language == '';
	error.content = song.value.content == '';
	let slug = createSlug();
	error.slug = props.existing && props.id == slug ? false : props.songs.hasOwnProperty(slug);
	// no errors: start saving song data
	if (!errors.value) {
		let processedSong = {
			authors: song.value.authors,
			ccli: song.value.ccli ? parseInt(song.value.ccli) : '',
			content: song.value.content,
			language: song.value.language,
			note: song.value.note,
			publisher: song.value.publisher,
			subtitle: song.value.subtitle,
			tags: song.value.tags,
			title: song.value.title,
			translations: song.value.translations,
			tuning: song.value.tuning,
			year: song.value.year ? parseInt(song.value.year) : '',
			youtube: song.value.youtube ? song.value.youtube : '',
		};
		// new song should be created
		if (!props.existing) {
			db.collection('songs').doc(slug).set(processedSong).then(() => {
				// persist translation references
				if (processedSong.translations.length > 0) {
					processedSong.translations.forEach(t => {
						if (t in props.songs) {
							let tsong = props.songs[t];
							if (!tsong.translations.includes(slug)) {
								db.collection('songs').doc(t).update({ translations: tsong.translations.concat([slug]) });
							}
						}
					});
				}
				emit('closed');
				emit('reset');
				processedSong = {};
				router.push({ name: 'song-show', params: { id: slug }});
				// toast success creation message
				notify({
					title: t('toast.songAdded'),
					text: t('toast.songSavedText'),
					type: 'primary'
				});
			}).catch((error) => throwError(error));
		}
		// existing song should be updated
		else {
			let initialSong = props.initialSong; // remember initial song data before update
			// check if key remained (no title or language changes)
			if (props.id == slug) {
				// just update the existing song
				db.collection('songs').doc(slug).update(processedSong).then(() => {
					// persist translation references by removing and adding them
					let translationDiff = initialSong.translations.filter(t => !processedSong.translations.includes(t));
					if (translationDiff.length > 0) {
						translationDiff.forEach(s => {
							db.collection('songs').doc(s).update({ translations: props.songs[s].translations.filter(t => t != slug) });
						});
					}
					if (processedSong.translations.length > 0) {
						processedSong.translations.forEach(t => {
							if (t in props.songs) {
								let tsong = props.songs[t];
								if (!tsong.translations.includes(slug)) {
									db.collection('songs').doc(t).update({ translations: tsong.translations.concat([slug]) });
								}
							}
						});
					}
					emit('closed');
					emit('reset');
					processedSong = {};
					// toast success update message
					notify({
						title: t('toast.songUpdated'),
						text: t('toast.songSavedText'),
						type: 'primary'
					});
				}).catch((error) => throwError(error));
			} else {
				// update key by adding a new song, removing the old one and update references in other fields
				db.collection('songs').doc(slug).set(processedSong).then(() => {
					db.collection('songs').doc(props.id).delete();
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
							db.collection('setlists').doc(setlistId).update({ songs: updatedSongList });
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
							db.collection('songs').doc(songId).update({ translations: updatedTranslationsList });
						}
					}
					// persist translation references by removing and adding them
					let translationDiff = initialSong.translations.filter(t => !processedSong.translations.includes(t));
					if (translationDiff.length > 0) {
						translationDiff.forEach(s => {
							db.collection('songs').doc(s).update({ translations: props.songs[s].translations.filter(t => t != slug) });
						});
					}
					if (processedSong.translations.length > 0) {
						processedSong.translations.forEach(t => {
							if (t in props.songs) {
								let tsong = props.songs[t];
								if (!tsong.translations.includes(slug)) {
									db.collection('songs').doc(t).update({ translations: tsong.translations.concat([slug]) });
								}
							}
						});
					}
					emit('closed');
					emit('reset');
					processedSong = {};
					router.push({ name: 'song-show', params: { id: slug }});
					// toast success update message
					notify({
						title: t('toast.songUpdated'),
						text: t('toast.songSavedText'),
						type: 'primary'
					});
				}).catch((error) => throwError(error));
			}
		}
	}
};
</script>

<style lang="scss">
#content {
	height: 55vh;
	font-size: .9em;
	line-height: 1.3em;
}
.prism-editor__container {
	min-height: 100%;
}
.prism-editor__textarea:focus {
	outline: none;
}
.modal-secondary {
	.max-column {
		height: 42vh;
		overflow-y: scroll;
	}
}
</style>
