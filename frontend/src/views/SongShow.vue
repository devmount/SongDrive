<template>
	<div>
		<div v-if="songExists && song" class="flex flex-col gap-6 w-full">
			<!-- page heading -->
			<div class="flex flex-col justify-between items-stretch gap-4">
				<!-- title and song count -->
				<div class="text-3xl uppercase font-thin tracking-wider">
					<span class="font-semibold mr-4">{{ song.title }}</span>
					{{ showKey.current }}
				</div>
				<div class="text-blade-500 -mt-4">{{ song.subtitle }}</div>
			</div>
			<!-- toolbar -->
			<div class="flex justify-between align-center w-full bg-blade-200 dark:bg-blade-900 rounded-lg p-2 gap-1">
				<div class="flex align-center gap-1">
					<secondary-button :title="t('button.back')" @click="router.go(-1)">
						<icon-arrow-left class="w-5 h-5 stroke-1.5" />
						<span class="hidden xl:inline">{{ t('button.back') }}</span>
					</secondary-button>
					<secondary-button
						v-for="([id, lang], i) in showLanguages" :key="i"
						:title="t('divider.language') + ': ' + t('language.' + lang)"
						@click="router.push({ name: 'song-show', params: { id: id }})"
						class="uppercase hidden sm:inline"
						:disabled="!id || songId == id"
					>
						{{ lang }}
					</secondary-button>
				</div>
				<div class="flex items-stretch gap-1">
					<div class="group flex items-stretch relative key-preview">
						<secondary-button
							class="px-2! rounded-r-none"
							:disabled="!chords"
							:title="t('tooltip.transposeDown')"
							@click="transposeDown"
						>
							<icon-chevron-left class="w-5 h-5 stroke-1.5" />
						</secondary-button>
						<secondary-button
							class="px-2! border-x border-x-blade-500 dark:border-x-blade-800 rounded-none"
							:disabled="!chords"
							:title="t('tooltip.keyReset')"
							@click="transposeReset"
						>
							<icon-reload class="w-5 h-5 stroke-1.5" />
						</secondary-button>
						<secondary-button
							class="px-2! rounded-l-none"
							:disabled="!chords"
							:title="t('tooltip.transposeUp')"
							@click="transposeUp"
						>
							<icon-chevron-right class="w-5 h-5 stroke-1.5" />
						</secondary-button>
						<div class="absolute top-11 left-1/2 -translate-x-1/2 w-40 flex justify-between p-1 rounded-lg bg-blade-200 dark:bg-blade-900 invisible group-hover:visible">
							<div class="flex-auto basis-0 font-mono text-center text-xl text-blade-500 px-3">
								{{ showKey.previous }}
							</div>
							<div class="flex-auto basis-0 font-mono rounded-xl text-center text-xl font-semibold px-3">
								{{ showKey.current }}
							</div>
							<div class="flex-auto basis-0 font-mono text-center text-xl text-blade-500 px-3">
								{{ showKey.next }}
							</div>
						</div>
					</div>
					<secondary-button
						:title="chords ? t('tooltip.chordsHide') : t('tooltip.chordsShow')"
						@click="chords = !chords"
					>
						<icon-music v-if="chords" class="w-5 h-5 stroke-1.5 stroke-spring-400" />
						<icon-music-off v-else class="w-5 h-5 stroke-1.5" />
						<span class="hidden xl:inline">{{ t('switch.chords') }}</span>
					</secondary-button>
					<secondary-button
						:title="t('tooltip.startFullscreen')"
						@click="modal.present=true"
					>
						<icon-presentation class="w-5 h-5 stroke-1.5" />
						<span class="hidden xl:inline">{{ t('button.present') }}</span>
					</secondary-button>
				</div>
				<div class="flex align-center gap-1">
					<div class="hidden sm:block">
						<drop-down>
							<template #trigger>
								<secondary-button class="h-full">
									<icon-download class="w-5 h-5 stroke-1.5" />
									<span class="hidden xl:inline">{{ t('button.download') }}</span>
									<icon-chevron-down class="w-5 h-5 stroke-1.5" />
								</secondary-button>
							</template>
							<template #default>
								<button
									class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
									@click="exportTxt"
								>
									<icon-file-pencil class="w-5 h-5 stroke-1.5" />
									{{ t('button.filetypeTxt') }}
								</button>
								<button
									class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
									@click="exportXml"
								>
									<icon-file-code class="w-5 h-5 stroke-1.5" />
									{{ t('button.filetypeXml') }}
								</button>
								<button
									class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
									@click="exportSng"
								>
									<icon-file-music class="w-5 h-5 stroke-1.5" />
									{{ t('button.filetypeSng') }}
								</button>
								<button
									class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
									@click="exportPdf"
								>
									<icon-file-text class="w-5 h-5 stroke-1.5" />
									{{ t('button.filetypePdf') }}
								</button>
							</template>
						</drop-down>
					</div>
					<div class="h-full" :class="{ 'sm:hidden': !can('updateSongs', user.roles) }">
						<drop-down>
							<template #default>
								<button
									v-if="can('updateSongs', user.roles)"
									class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
									@click="emit('editSong', { data: song, id: songId, exists: true })"
								>
									<icon-edit class="w-5 h-5 stroke-1.5" />
									{{ t('button.edit') }}
								</button>
								<button
									v-if="can('createSongs', user.roles)"
									class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
									@click="emit('editSong', { data: song, id: songId, exists: false })"
								>
									<icon-copy class="w-5 h-5 stroke-1.5" />
									{{ t('button.duplicate') }}
								</button>
								<button
									v-if="can('deleteSongs', user.roles)"
									class="px-3 py-2 w-full flex items-center gap-3 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30"
									@click="deleteDialog()"
								>
									<icon-trash class="w-5 h-5 stroke-1.5" />
									{{ t('button.delete') }}
								</button>
								<div class="flex gap-1 sm:hidden">
									<secondary-button
										v-for="([id, lang], i) in showLanguages" :key="i"
										:title="t('divider.language') + ': ' + t('language.' + lang)"
										@click="router.push({ name: 'song-show', params: { id: id }})"
										class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750 uppercase"
										:disabled="!id || songId == id"
									>
										{{ lang }}
									</secondary-button>
								</div>
								<button
									class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750 sm:hidden"
									@click="exportTxt"
								>
									<icon-file-pencil class="w-5 h-5 stroke-1.5" />
									{{ t('button.filetypeTxt') }}
								</button>
								<button
									class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750 sm:hidden"
									@click="exportSng"
								>
									<icon-file-music class="w-5 h-5 stroke-1.5" />
									{{ t('button.filetypeSng') }}
								</button>
								<button
									class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750 sm:hidden"
									@click="exportPdf"
								>
									<icon-file-text class="w-5 h-5 stroke-1.5" />
									{{ t('button.filetypePdf') }}
								</button>
							</template>
						</drop-down>
					</div>
				</div>
			</div>
			<!-- setlist navigation -->
			<div v-if="setlistId && setlist && songInSetlist" class="flex justify-end">
				<zone-info @close="goToBasicSong" closable>
					<template #label>
						<router-link
							class="text-blade-600 dark:text-blade-400 mr-1"
							:to="{ name: 'setlist-show', params: { id: setlistId }}"
						>
							{{ t('page.setlists', 1) }}: {{ setlist.title }}
						</router-link>
						{{ t('page.songs', 1) }} #{{ (position ?? 0)+1 }}
					</template>
					<div class="flex justify-end items-center">
						<div class="flex gap-1">
							<!-- back navigation -->
							<secondary-button
								class="flex items-center gap-1"
								:disabled="(position ?? 0) == 0"
								title="Previous Song"
								@click="goToPreviousSong"
							>
								<icon-arrow-left class="w-5 h-5 stroke-1.5" />
								<div v-if="(position ?? 0) > 0" class="hidden sm:flex items-center gap-2">
									<div class="max-w-3xs truncate">
										{{ findSong(setlist.songs[(position ?? 0)-1]?.id)?.title }}
									</div>
									<div class="text-lg leading-4 font-mono font-bold text-spring-600 dark:text-spring-400">
										{{ setlist.songs[(position ?? 0)-1]?.key }}
									</div>
								</div>
							</secondary-button>
							<!-- forward navigation -->
							<secondary-button
								class="flex items-center gap-1"
								:disabled="(position ?? 0) == setlist.songs.length-1"
								title="Next Song"
								@click="goToNextSong"
							>
								<div v-if="(position ?? 0) < setlist.songs.length-1" class="hidden sm:flex items-center gap-2">
									<div class="max-w-3xs truncate">
										{{ findSong(setlist.songs[(position ?? 0)+1]?.id)?.title }}
									</div>
									<div class="text-lg leading-4 font-mono font-bold text-spring-600 dark:text-spring-400">
										{{ setlist.songs[(position ?? 0)+1]?.key }}
									</div>
								</div>
								<icon-arrow-right class="w-5 h-5 stroke-1.5" />
							</secondary-button>
						</div>
					</div>
				</zone-info>
			</div>
			<!-- song content -->
			<song-content :content="song.content" :chords="chords" :key-offset="key" :presentation="false" />
			<!-- song footer with info and data about the song -->
			<song-footer class="columns mt-4 pt-4" :song="song" />
		</div>
		<!-- access to non-existing song -->
		<div v-else class="flex flex-col items-center gap-8 mt-4">
			<icon-error-404 class="w-14 h-14 stroke-1 text-blade-500" />
			<div class="text-center">
				<div class="text-lg">{{ t('text.songNotFound') }}</div>
				<div class="text-blade-500">{{ t('text.songDeletedOrBrokenLink') }}</div>
			</div>
			<primary-button @click="router.push({ name: 'songs' })" class="mt-4">
				{{ t('widget.showAllSongs') }}
				<icon-music class="w-5 h-5 stroke-1.5" />
			</primary-button>
		</div>
		<!-- modals -->
		<song-delete
			:active="modal.delete"
			:title="song?.title"
			:id="songId"
			@closed="modal.delete = false"
		/>
		<song-present
			:active="modal.present"
			:song="song"
			:chords="chords"
			:key-offset="key"
			@chords="chords = !chords"
			@closed="modal.present = false"
		/>
	</div>
</template>

<script setup lang="ts">
import { injectStrict, hkBackKey, hkChordsKey, hkDownKey, hkForwardKey, hkPresentKey, hkResetKey, hkUpKey, noActiveModalKey, setlistsKey, songsKey, userKey, versionKey } from '@/keys';
import { keyScale, isChordLine, parsedContent, download, openLyricsXML, firstParam } from '@/utils.js';
import { logicAnd, logicOr } from '@vueuse/math';
import { notify } from '@kyvg/vue3-notification';
import { ref, reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { whenever } from '@vueuse/core';
import { can } from "@backend/definitions";
import DropDown from '@/elements/DropDown.vue';
import pdfMake from "pdfmake/build/pdfmake";
import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import PrimaryButton from '@/elements/PrimaryButton.vue';
import SecondaryButton from '@/elements/SecondaryButton.vue';
import SongContent from '@/partials/SongContent.vue';
import SongDelete from '@/modals/SongDelete.vue';
import SongFooter from '@/partials/SongFooter.vue';
import SongPresent from '@/modals/SongPresent.vue';
import ZoneInfo from '@/elements/ZoneInfo.vue';

// icons
import {
	IconArrowLeft,
	IconArrowRight,
	IconChevronDown,
	IconChevronLeft,
	IconChevronRight,
	IconCopy,
	IconDownload,
	IconEdit,
	IconError404,
	IconFileCode,
	IconFileMusic,
	IconFilePencil,
	IconFileText,
	IconMusic,
	IconMusicOff,
	IconPresentation,
	IconReload,
	IconTrash,
} from '@tabler/icons-vue';

// component constants
const { t, locale } = useI18n();

const route = useRoute();
const router = useRouter();
const songId = firstParam(route.params.id) ?? '';
const setlistId = firstParam(route.params.setlist);
const version = injectStrict(versionKey);
const songs = injectStrict(songsKey);
const setlists = injectStrict(setlistsKey);
const user = injectStrict(userKey);

// Song and setlist entities from db
const song = computed(() => songs.value.find(s => s.entity.slug === songId)?.entity);
const setlist = computed(() => setlists.value.find(s => setlistId && s.entity.slug === setlistId)?.entity);

// find a song's entity by id, for setlist navigation display
const findSong = (id?: string) => songs.value.find(s => s.id === id)?.entity;

// handle hotkeys for this component
const hkChords      = injectStrict(hkChordsKey);
const hkBack        = injectStrict(hkBackKey);
const hkForward     = injectStrict(hkForwardKey);
const hkDown        = injectStrict(hkDownKey);
const hkUp          = injectStrict(hkUpKey);
const hkReset       = injectStrict(hkResetKey);
const hkPresent     = injectStrict(hkPresentKey);
const noActiveModal = injectStrict(noActiveModalKey);

// pdf creation
const EOL = '\n';
pdfMake.fonts = {
	FiraMono: {
		normal: window.location.origin + '/fonts/FiraMono-Regular.ttf',
	},
	FiraSans: {
		normal: window.location.origin + '/fonts/FiraSans-Light.ttf',
	}
};

// emits
const emit = defineEmits(['editSong']);

// Flag to show or hide chords
const chords = ref(true);
const modal = reactive({
	song: {},
	delete: false,
	present: false,
});

// The current key the song chords should transpose to
const key = ref(0);

onMounted(() => {
	key.value = route.params.key ? keyDiff.value : 0;
});

const position = computed<number | null>(() => setlistId && route.params.key
	? (setlist.value?.songs.findIndex(s => s.id === songId ) ?? null)
	: null
);
// array of tuples (song id, language) for all existing translations of this song
const showLanguages = computed<[string, string | undefined][]>(() => {
	if (song.value?.translations && song.value.translations.length > 0) {
		const languages: [string, string | undefined][] = [[songId, song.value.language]];
		song.value.translations.forEach((translatedSongId) => {
			languages.push([translatedSongId, songs.value?.find(s => s.entity.slug === translatedSongId)?.entity.language]);
		});
		return languages.sort((a, b) => {
			return (a[1] ?? '') > (b[1] ?? '') ? 1 : -1;
		})
	} else {
		return [[songId, song.value?.language]];
	}
});

// show current key as well as previous and next key for transposing keys
const keyIndexOnScale = (index: number) => {
	return keyScale[(12 + keyScale.indexOf(song.value?.key ?? '') + (index % 12)) % 12]
};
const showKey = computed(() => {
	if (song.value) {
		return {
			previous: keyIndexOnScale(key.value-1),
			current: keyIndexOnScale(key.value),
			next: keyIndexOnScale(key.value+1),
		};
	} else {
		return {}
	}
});

// handle transposition
const transposeDown = () => {
	key.value--;
};
const transposeUp = () => {
	key.value++;
};
const transposeReset = () => {
	key.value = 0;
};

// calculates difference between song key and url key parameter and returns new key scale index
const keyDiff = computed(() => {
	return (12 + keyScale.indexOf(firstParam(route.params.key) ?? '') - keyScale.indexOf(song.value?.key ?? '')) % 12;
});

// Check if song actually exists in the collection
const songExists = computed(() => {
	return songs.value.findIndex(s => s.entity.slug === songId) > -1;
});

// export song in text format
const exportTxt = () => {
	const s = song.value;
	if (!s) return;
	// add header
	var content = s.title
		+ ' [' + keyScale[(12 + keyScale.indexOf(s.key ?? '') + (key.value % 12)) % 12] + ']'
		+ '\n\n';
	var lines = s.content.split(EOL);
	// process lines
	for (var i = 0; i < lines.length; i++) {
		var line = lines[i];
		// handle chord line
		if (!chords.value && isChordLine(line)) continue;
		// handle verse marker indentation
		if (line.trim().toLowerCase().indexOf('--v') >= 0 && !isNaN(parseInt(line.trim().charAt(3)))) {
			// if next line is chord line, prepend number to the line after
			if (isChordLine(lines[i+1])) {
				lines[i+2] = line.trim().charAt(3) + '. ' + lines[i+2];
				// add 3 spaces to next line to sync chords with text again
				lines[i+1] = '   ' + lines[i+1];
			} else {
				lines[i+1] = line.trim().charAt(3) + '. ' + lines[i+1];
			}
		}
		// handle marker
		if (line.trim().indexOf('--') >= 0) continue;
		// keep line for export
		content += line + EOL;
	}
	content += EOL + s.authors?.join(', ') + EOL + EOL
		+ '© ' + (s.year ? s.year + ' ' : '') + s.publisher.replace(/(?:\r\n|\r|\n)/g, '; ');
	// start download
	download(content, songId + '.txt');
	// toast success message
	notify({
		title: t('toast.exportedText'),
		text: t('toast.exportedSongTextText'),
		type: 'primary'
	});
};
// export song in SongBeamer or OpenLP format
const exportSng = () => {
	const s = song.value;
	if (!s) return;
	// add header
	var content =
		'#LangCount=1' + EOL
		+ '#Title=' + s.title + EOL
		+ '#Author=' + s.authors?.join(', ') + EOL
		+ '#Melody=' + s.authors?.join(', ') + EOL
		+ '#(c)=' + (s.year ? s.year + ' ' : '') + s.publisher.replace(/(?:\r\n|\r|\n)/g, '; ') + EOL
		+ '#Key=' + keyScale[(12 + keyScale.indexOf(s.key ?? '') + (key.value % 12)) % 12] + EOL
		+ '#CCLI=' + s.ccli + EOL
		+ '---' + EOL
	var lines = s.content.split(EOL);
	// remove chord lines
	for (var i = 0; i < lines.length; i++) {
		var line = lines[i];
		if (isChordLine(line)) continue;
		else content += line + EOL;
	}
	// replace marker
	content = content
		.replace(/--v/g, "verse")
		.replace(/--p/g, "pre-chorus")
		.replace(/--c/g, "chorus")
		.replace(/--b/g, "bridge")
		.replace(/--i/g, "intro")
		.replace(/--m/g, "mitro")
		.replace(/--o/g, "outro");
	// start download
	download(content, songId + '.sng');
	// toast success message
	notify({
		title: t('toast.exportedSng'),
		text: t('toast.exportedSongSngText'),
		type: 'primary'
	});
};
// export song in OpenLyrics XML format
const exportXml = () => {
	const s = song.value;
	if (!s) return;
	// check for translations
	const lang = !('lang' in localStorage) ? locale.value : localStorage.getItem('lang');
	let tSong = null;
	if (lang !== s.language && s.translations?.length > 0) {
		const tKey = s.translations.find((t) => t.endsWith(`-${lang}`));
		tSong = songs.value.find(song => song.id === tKey);
	}
	// start download
	download(openLyricsXML(s, version, tSong?.entity ?? null), songId + '.xml');
	// toast success message
	notify({
		title: t('toast.exportedXml'),
		text: t('toast.exportedSongXmlText'),
		type: 'primary'
	});
};
// export song sheet as PDF
const exportPdf = () => {
	var content = getPdfSongContent();
	var doc = {
		pageSize: 'A4',
		pageMargins: [ 50, 50, 40, 30 ],
		content: content,
		styles: {
			header: {
				font: 'FiraSans',
				fontSize: 22
			},
			partnumber: {
				font: 'FiraSans',
				fontSize: 24,
				margin: [ 0, 17, 0, 0 ]
			},
			code: {
				font: chords.value ? 'FiraMono' : 'FiraSans',
				fontSize: chords.value ? 11 : 16,
				margin: [ 0, 15, 0, 0 ]
			},
			copyright: {
				font: 'FiraSans',
				fontSize: 8,
				margin: [ 0, 20, 0, 0 ]
			},
			qr: {
				font: 'FiraMono',
				fontSize: 8,
				alignment: 'right'
			}
		}
	} as TDocumentDefinitions;
	pdfMake.createPdf(doc).download(songId + '.pdf');
	// toast success message
	notify({
		title: t('toast.exportedPdf'),
		text: t('toast.exportedSongPdfText'),
		type: 'primary'
	});
};
// prepare song content for PDF export
const getPdfSongContent = (): Content[] => {
	const s = song.value;
	if (!s) return [];
	// handle all song parts
	let content: Content[] = [];
	let parts = parsedContent(s.content, key.value, chords.value, false);
	parts.forEach((part) => {
		if (part.type == 'v' && part.number != '0') {
			content.push({
				columnGap: 8,
				columns: [
					{
						style: 'partnumber',
						width: 'auto',
						text: String(part.number)
					},
					{
						style: 'code',
						width: '*',
						// song content with respect to leading whitespaces
						text: '\u200B' + part.content.replace(/\n/g, "\n" + '\u200B')
					}
				]
			} as Content);
		} else {
			content.push({
				style: 'code',
				// song content with respect to leading whitespaces
				text: '\u200B' + part.content.replace(/\n/g, "\n" + '\u200B')
			});
		}
	});
	// create footer
	let footer: Content[] = [{
		// imprint with ccli#, author names and (c) year publisher
		width: '*',
		style: 'copyright',
		text: [
			s.ccli ? 'CCLI Song Nr.: ' + s.ccli + '\n' : '',
			s.authors?.length ? s.authors.join(', ') + '\n' : '',
			'\u00A9 ' + (s.year ? s.year + ' ' : '') + s.publisher
		]
	} as Content];
	if (s.youtube) {
		footer.push({
			// QR code for YouTube link
			width: '140',
			margin: [ 0, 20, 0, 0 ],
			stack: [
				{ text: 'https://youtu.be/' + s.youtube, style: 'qr' },
				{ qr: 'https://youtu.be/' + s.youtube, fit: 90, style: 'qr', margin: [ 0, 5, 0, 0 ] }
			]
		} as Content);
	}
	// return array with song data ready for pdfMake
	return [
		// song title [key] with a line beneath
		{ text: s.title.toUpperCase() + (key.value ? '  [' + keyScale[(12 + keyScale.indexOf(s.key ?? '') + (key.value % 12)) % 12] + ']' : ''), style: 'header' },
		{ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 505, y2: 0, lineWidth: .5 }] },
		content,
		{ columnGap: 8, columns: footer }
	];
};

// handle dialog modals
const deleteDialog = () => {
	modal.delete = true;
};

// check if song is part of setlist given via url
const songInSetlist = computed(() => {
	return position.value !== null && setlist.value?.songs.find(s => s.id === songId);
});

// navigation to previous setlist song (if setlist is set)
const goToPreviousSong = () => {
	if (position.value !== null && position.value > 0) {
		const previousSongId  = setlist.value?.songs[position.value-1].id;
		const previousSongKey = setlist.value?.songs[position.value-1].key;
		router.push({
			name: 'song-show',
			params: {
				id: previousSongId,
				key: previousSongKey ?? songs.value.find(s => s.entity.slug === previousSongId)?.entity.key,
				setlist: setlistId,
			}
		});
	}
};

// navigation to next setlist song (if setlist is set)
const goToNextSong = () => {
	if (position.value !== null && setlist.value && position.value < setlist.value.songs.length) {
		const nextSongId  = setlist.value?.songs[position.value+1].id;
		const nextSongKey = setlist.value?.songs[position.value+1].key;
		router.push({
			name: 'song-show',
			params: {
				id: nextSongId,
				key: nextSongKey ?? songs.value.find(s => s.entity.slug === nextSongId)?.entity.key,
				setlist: setlistId,
			}
		});
	}
};

// navigation to song without setlist information
const goToBasicSong = () => {
	router.push({
		name: 'song-show',
		params: { id: songId, key: showKey.value.current }
	});
};

// component shortcuts
whenever(
	logicAnd(logicOr(hkUp, hkForward), noActiveModal),
	() => chords.value ? key.value++ : null
);
whenever(
	logicAnd(logicOr(hkDown, hkBack), noActiveModal),
	() => chords.value ? key.value-- : null
);
whenever(
	logicAnd(hkChords, noActiveModal),
	() => chords.value = !chords.value
);
whenever(
	logicAnd(hkReset, noActiveModal),
	() => chords.value ? key.value = 0 : null
);
whenever(
	logicAnd(hkPresent, noActiveModal),
	() => modal.present = true
);
</script>
