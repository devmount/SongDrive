<template>
	<div>
		<div v-if="ready.songs && song" class="flex flex-col gap-6 w-full">
			<!-- page heading -->
			<div class="flex flex-col justify-between items-stretch gap-4">
				<!-- title and song count -->
				<div class="text-3xl uppercase font-thin tracking-wider">
					<span class="font-semibold mr-4">{{ song.title }}</span>
					{{ showTuning.current }}
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
						:title="t('divider.language') + ': ' + (languages[lang] ? languages[lang].label : '')"
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
								{{ showTuning.previous }}
							</div>
							<div class="flex-auto basis-0 font-mono rounded-xl text-center text-xl font-semibold px-3">
								{{ showTuning.current }}
							</div>
							<div class="flex-auto basis-0 font-mono text-center text-xl text-blade-500 px-3">
								{{ showTuning.next }}
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
						<dropdown>
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
						</dropdown>
					</div>
					<div class="h-full" :class="{ 'sm:hidden': user && role <= 2 }">
						<dropdown>
							<template #default>
								<button
									v-if="user && role > 2"
									class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
									@click="emit('editSong', { data: song, id: song.id, exists: true })"
								>
									<icon-edit class="w-5 h-5 stroke-1.5" />
									{{ t('button.edit') }}
								</button>
								<button
									v-if="user && role > 2"
									class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
									@click="emit('editSong', { data: song, id: song.id, exists: false })"
								>
									<icon-copy class="w-5 h-5 stroke-1.5" />
									{{ t('button.duplicate') }}
								</button>
								<button
									v-if="user && role > 2"
									class="px-3 py-2 w-full flex items-center gap-3 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30"
									@click="deleteDialog(song)"
								>
									<icon-trash class="w-5 h-5 stroke-1.5" />
									{{ t('button.delete') }}
								</button>
								<div class="flex gap-1 sm:hidden">
									<secondary-button
										v-for="([id, lang], i) in showLanguages" :key="i"
										:title="t('divider.language') + ': ' + (languages[lang] ? languages[lang].label : '')"
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
						</dropdown>
					</div>
				</div>
			</div>
			<!-- setlist navigation -->
			<div v-if="urlSetlist && ready.setlists && ready.songs && songInUrlSetlist" class="flex justify-end">
				<zone-info @close="goToBasicSong" closable>
					<template #label>
						<router-link
							class="text-blade-600 dark:text-blade-400 mr-1"
							:to="{ name: 'setlist-show', params: { id: urlSetlist }}"
						>
							{{ t('page.setlists', 1) }}: {{ setlists[urlSetlist].title }}
						</router-link>
						{{ t('page.songs', 1) }} #{{ position+1 }}
					</template>
					<div class="flex justify-end items-center">
						<div class="flex gap-1">
							<!-- back navigation -->
							<secondary-button
								class="flex items-center gap-1"
								:disabled="position == 0"
								title="Previous Song"
								@click="goToPreviousSong"
							>
								<icon-arrow-left class="w-5 h-5 stroke-1.5" />
								<div v-if="position > 0" class="hidden sm:flex items-center gap-2">
									<div class="max-w-3xs truncate">
										{{ songs[setlists[urlSetlist]?.songs[position-1]?.id]?.title }}
									</div>
									<div class="text-lg leading-4 font-mono font-bold text-spring-600 dark:text-spring-400">
										{{ setlists[urlSetlist]?.songs[position-1]?.tuning }}
									</div>
								</div>
							</secondary-button>
							<!-- forward navigation -->
							<secondary-button
								class="flex items-center gap-1"
								:disabled="position == setlists[urlSetlist].songs.length-1"
								title="Next Song"
								@click="goToNextSong"
							>
								<div v-if="position < setlists[urlSetlist].songs.length-1" class="hidden sm:flex items-center gap-2">
									<div class="max-w-3xs truncate">
										{{ songs[setlists[urlSetlist]?.songs[position+1]?.id]?.title }}
									</div>
									<div class="text-lg leading-4 font-mono font-bold text-spring-600 dark:text-spring-400">
										{{ setlists[urlSetlist]?.songs[position+1]?.tuning }}
									</div>
								</div>
								<icon-arrow-right class="w-5 h-5 stroke-1.5" />
							</secondary-button>
						</div>
					</div>
				</zone-info>
			</div>
			<!-- song content -->
			<song-content
				:content="song.content"
				:chords="chords"
				:tuning="tuning"
				:presentation="false"
			/>
			<!-- song footer with info and data about the song -->
			<song-footer
				v-if="ready.tags"
				class="columns mt-4 pt-4"
				:song="song"
				:tags="tags"
			/>
		</div>
		<!-- access to non-existing song -->
		<div v-if="songNotFound" class="flex flex-col items-center gap-8 mt-4">
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
			:songs="songs"
			@closed="modal.delete = false"
		/>
		<song-present
			:active="modal.present"
			:song="song"
			:chords="chords"
			:tuning="tuning"
			@chords="chords = !chords"
			@closed="modal.present = false"
		/>
	</div>
</template>

<script setup>
import { keyScale, isChordLine, parsedContent, download, openLyricsXML } from '@/utils.js';
import { logicAnd, logicOr } from '@vueuse/math';
import { notify } from '@kyvg/vue3-notification';
import { ref, reactive, computed, inject, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { whenever } from '@vueuse/core';
import Dropdown from '@/elements/Dropdown.vue';
import pdfMake, { log } from "pdfmake/build/pdfmake";
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
const { t, availableLocales } = useI18n();

const route      = useRoute();
const router     = useRouter();
const songId     = route.params.id;
const urlKey     = route.params.key;
const urlSetlist = route.params.setlist;
const version    = inject('version');

// handle hotkeys for this component
const hkChords      = inject('hkChords');
const hkBack        = inject('hkBack');
const hkForward     = inject('hkForward');
const hkDown        = inject('hkDown');
const hkUp          = inject('hkUp');
const hkReset       = inject('hkReset');
const hkPresent     = inject('hkPresent');
const noActiveModal = inject('noActiveModal');

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

// component properties
const props = defineProps({
  languages:     Object,
  ready:         Object,
  role:          Number,
  setlists:      Object,
  songs:         Object,
  tags:          Object,
  user:          String,
});

// emits
const emit = defineEmits(['editSong']);

// reactive data
const chords = ref(true);
const modal = reactive({
	song: {},
	delete: false,
	present: false,
});

const tuning = ref(0);
onMounted(() => { tuning.value = urlKey ? urlKeyDiff.value : 0; });
const position = computed(() => props.ready.setlists && urlSetlist && urlKey
	? props.setlists[urlSetlist]?.songs.findIndex(s => s.id === songId )
	: null);

// get song object from db as soon as songs have finished loading
const song = computed(() => {
	if (songId && props.ready.songs) {
		return { ...props.songs[songId], id: songId };
	}
	return null;
});

// array of tuples (song id, language) for all existing translations of this song
const showLanguages = computed(() => {
	if (props.ready.songs && song.value?.translations?.length > 0) {
		var languages = [[songId, song.value.language]];
		for (const id in song.value.translations) {
			if (song.value.translations.hasOwnProperty(id)) {
				const sId = song.value.translations[id];
				languages.push([sId, props.songs[sId].language]);
			}
		}
		return languages.sort((a, b) => {
			return a[1] > b[1] ? 1 : -1;
		})
	} else {
		return [[songId, song.value?.language]];
	}
});

// show current key as well as previous and next key for transposing keys
const keyIndexOnScale = (index) => {
	return keyScale[(12 + keyScale.indexOf(song.value.tuning) + (index % 12)) % 12]
};
const showTuning = computed(() => {
	if (song.value) {
		return {
			previous: keyIndexOnScale(tuning.value-1),
			current: keyIndexOnScale(tuning.value),
			next: keyIndexOnScale(tuning.value+1),
		};
	} else {
		return {}
	}
});

// handle transposition
const transposeDown = () => {
	tuning.value--;
};
const transposeUp = () => {
	tuning.value++;
};
const transposeReset = () => {
	tuning.value = 0;
};

// calculates difference between song key and url key parameter and returns new key scale index
const urlKeyDiff = computed(() => {
	return (12 + keyScale.indexOf(urlKey) - keyScale.indexOf(song.value.tuning)) % 12;
});

// true if this setlist is not part in collection
const songNotFound = computed(() => {
	return props.ready.songs && !(songId in props.songs);
});

// export song in text format
const exportTxt = () => {
	// add header
	var content = song.value.title
		+ ' [' + keyScale[(12 + keyScale.indexOf(song.value.tuning) + (tuning.value % 12)) % 12] + ']'
		+ '\n\n';
	var lines = song.value.content.split(EOL);
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
	content += EOL + song.value.authors + EOL + EOL
		+ '© ' + (song.value.year ? song.value.year + ' ' : '') + song.value.publisher.replace(/(?:\r\n|\r|\n)/g, '; ');
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
	// add header
	var content =
		'#LangCount=1' + EOL
		+ '#Title=' + song.value.title + EOL
		+ '#Author=' + song.value.authors + EOL
		+ '#Melody=' + song.value.authors + EOL
		+ '#(c)=' + (song.value.year ? song.value.year + ' ' : '') + song.value.publisher.replace(/(?:\r\n|\r|\n)/g, '; ') + EOL
		+ '#Key=' + keyScale[(12 + keyScale.indexOf(song.value.tuning) + (tuning.value % 12)) % 12] + EOL
		+ '#CCLI=' + song.value.ccli + EOL
		+ '---' + EOL
	var lines = song.value.content.split(EOL);
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
	// check for translations
	const lang = !('lang' in localStorage) ? locale.value : localStorage.getItem('lang');
	let tSong = null;
	if (lang !== song.value.language && song.value.translations.length > 0) {
		const tKey = song.value.translations.find((t) => t.endsWith(`-${lang}`));
		tSong = props.songs[tKey];
	}
	// start download
	download(openLyricsXML(song.value, version, tSong, availableLocales, props.tags), songId + '.xml');
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
	};
	pdfMake.createPdf(doc).download(songId + '.pdf');
	// toast success message
	notify({
		title: t('toast.exportedPdf'),
		text: t('toast.exportedSongPdfText'),
		type: 'primary'
	});
};
// prepare song content for PDF export
const getPdfSongContent = () => {
	// handle all song parts
	let content = [];
	let parts = parsedContent(song.value.content, tuning.value, chords.value, false);
	parts.forEach((part) => {
		if (part.type == 'v' && part.number != '0') {
			content.push({
				columnGap: 8,
				columns: [
					{
						style: 'partnumber',
						width: 'auto',
						text: part.number
					},
					{
						style: 'code',
						width: '*',
						// song content with respect to leading whitespaces
						text: '\u200B' + part.content.replace(/\n/g, "\n" + '\u200B')
					}
				]
			});
		} else {
			content.push({
				style: 'code',
				// song content with respect to leading whitespaces
				text: '\u200B' + part.content.replace(/\n/g, "\n" + '\u200B')
			});
		}
	});
	// create footer
	let footer = [{
		// imprint with ccli#, author names and (c) year publisher
		width: '*',
		style: 'copyright',
		text: [
			song.value.note ? t('field.note') + ':\n' + song.value.note + '\n\n' : '',
			song.value.ccli ? 'CCLI Song Nr.: ' + song.value.ccli + '\n' : '',
			song.value.authors ? song.value.authors + '\n' : '',
			'\u00A9 ' + (song.value.year ? song.value.year + ' ' : '') + song.value.publisher
		]
	}];
	if (song.value.youtube) {
		footer.push({
			// QR code for YouTube link
			width: '140',
			margin: [ 0, 20, 0, 0 ],
			stack: [
				{ text: 'https://youtu.be/' + song.value.youtube, style: 'qr' },
				{ qr: 'https://youtu.be/' + song.value.youtube, fit: '90', style: 'qr', margin: [ 0, 5, 0, 0 ] }
			]
		});
	}
	// return array with song data ready for pdfMake
	return [
		// song title [tuning] with a line beneath
		{ text: song.value.title.toUpperCase() + (tuning.value ? '  [' + keyScale[(12 + keyScale.indexOf(song.value.tuning) + (tuning.value % 12)) % 12] + ']' : ''), style: 'header' },
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
const songInUrlSetlist = computed(() => {
	return position.value !== null && props.setlists[urlSetlist]?.songs.map(s => s.id).includes(songId);
});

// navigation to previous setlist song (if setlist is set)
const goToPreviousSong = () => {
	if (position.value > 0) {
		const previousSongId  = props.setlists[urlSetlist].songs[position.value-1].id;
		const previousSongKey = props.setlists[urlSetlist].songs[position.value-1].tuning;
		router.push({
			name: 'song-show',
			params: {
				id: previousSongId,
				key: previousSongKey ? previousSongKey : props.songs[previousSongId].tuning,
				setlist: urlSetlist,
			}
		});
	}
};

// navigation to next setlist song (if setlist is set)
const goToNextSong = () => {
	if (position.value < props.setlists[urlSetlist].songs.length) {
		const nextSongId  = props.setlists[urlSetlist].songs[position.value+1].id;
		const nextSongKey = props.setlists[urlSetlist].songs[position.value+1].tuning;
		router.push({
			name: 'song-show',
			params: {
				id: nextSongId,
				key: nextSongKey ? nextSongKey : props.songs[nextSongId].tuning,
				setlist: urlSetlist,
			}
		});
	}
};

// navigation to song without setlist information
const goToBasicSong = () => {
	router.push({
		name: 'song-show',
		params: { id: songId, key: showTuning.value.current }
	});
};

// component shortcuts
whenever(
	logicAnd(logicOr(hkUp, hkForward), noActiveModal),
	() => chords.value ? tuning.value++ : null
);
whenever(
	logicAnd(logicOr(hkDown, hkBack), noActiveModal),
	() => chords.value ? tuning.value-- : null
);
whenever(
	logicAnd(hkChords, noActiveModal),
	() => chords.value = !chords.value
);
whenever(
	logicAnd(hkReset, noActiveModal),
	() => chords.value ? tuning.value = 0 : null
);
whenever(
	logicAnd(hkPresent, noActiveModal),
	() => modal.present = true
);
</script>
