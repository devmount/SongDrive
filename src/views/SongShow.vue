<template>
	<div
		class="song-show"
		ref="songshow"
		tabindex="0"
		@keydown.up.exact="chords ? tuning-- : null"
		@keydown.left.exact="chords ? tuning-- : null"
		@keydown.down.exact="chords ? tuning++ : null"
		@keydown.right.exact="chords ? tuning++ : null"
		@keydown.ctrl.k.prevent="chords = !chords"
		@keydown.ctrl.r.prevent="chords ? tuning=0 : null"
		@keydown.ctrl.p.prevent="modal.present=true"
		@keydown.esc.exact="modal.set=false; modal.delete=false; modal.present=false; songshow.focus()"
	>
		<div class="off-canvas off-canvas-secondary">
			<!-- secondary sidebar -->
			<div class="off-canvas-sidebar active">
				<div class="sidebar-wrapper">
					<button
						class="btn btn-secondary d-block stretch text-uppercase tooltip tooltip-right tooltip-lg mb-1"
						:data-tooltip="t('button.back')"
						@click="router.go(-1)"
					>
						<ion-icon :icon="arrowBackOutline" class="icon-left"></ion-icon>
						<span class="hide-lg">{{ t('button.back') }}</span>
					</button>
					<!-- sidebar: manage -->
					<template v-if="user && role > 2">
						<div class="divider text-center show-lg" :data-content="t('divider.manage').charAt(0)"></div>
						<div class="divider text-center hide-lg" :data-content="t('divider.manage')"></div>
						<button
							class="btn btn-secondary d-block stretch text-uppercase tooltip tooltip-right tooltip-lg mb-1"
							:data-tooltip="t('divider.manage') + ': ' + t('button.edit')"
							@click="existing=true; modal.set=true"
						>
							<ion-icon :icon="createOutline" class="icon-left"></ion-icon>
							<span class="hide-lg">{{ t('button.edit') }}</span>
						</button>
						<button
							class="btn btn-secondary d-block stretch text-uppercase tooltip tooltip-right tooltip-lg mb-1"
							:data-tooltip="t('divider.manage') + ': ' + t('button.duplicate')"
							@click="existing=false; modal.set=true"
						>
							<ion-icon :icon="copyOutline" class="icon-left"></ion-icon>
							<span class="hide-lg">{{ t('button.duplicate') }}</span>
						</button>
						<button
							class="btn btn-error-secondary d-block stretch text-uppercase tooltip tooltip-right tooltip-lg"
							:data-tooltip="t('divider.manage') + ': ' + t('button.delete')"
							@click="modal.delete = true"
						>
							<ion-icon :icon="trashOutline" class="icon-left"></ion-icon>
							<span class="hide-lg">{{ t('button.delete') }}</span>
						</button>
					</template>
					<!-- sidebar: language -->
					<div class="divider text-center show-lg" :data-content="t('divider.language').charAt(0)"></div>
					<div class="divider text-center hide-lg" :data-content="t('divider.language')"></div>
					<div class="d-flex" v-if="ready.songs">
						<div
							v-for="([id, lang], i) in showLanguages"
							:key="i"
							class=" tooltip tooltip-right tooltip-lg"
							:data-tooltip="t('divider.language') + ': ' + (languages[lang] ? languages[lang].label : '')"
						>
							<router-link
								:to="{ name: 'song-show', params: { id: id }}"
								class="btn btn-secondary d-block text-uppercase mb-1"
								:class="{ disabled: (!id || songId == id) }"
							>
								{{ lang }}
							</router-link>
						</div>
					</div>
					<!-- sidebar: view -->
					<div class="divider text-center show-lg" :data-content="t('divider.view').charAt(0)"></div>
					<div class="divider text-center hide-lg" :data-content="t('divider.view')"></div>
					<div class="form-group">
						<label
							class="form-switch switch-lg c-hand text-uppercase tooltip tooltip-right tooltip-lg"
							:data-tooltip="t('divider.view') + ': ' + t('switch.chords')"
						>
							<input type="checkbox" v-model="chords" @click="chords = !chords">
							<i class="form-icon"></i>
							<span class="hide-lg">{{ t('switch.chords') }}</span>
						</label>
					</div>
					<button
						class="btn btn-secondary d-block stretch text-uppercase tooltip tooltip-right tooltip-lg"
						:data-tooltip="t('divider.view') + ': ' + t('button.present')"
						@click="modal.present=true"
					>
						<ion-icon :icon="videocamOutline" class="icon-left"></ion-icon>
						<span class="hide-lg">{{ t('button.present') }}</span>
					</button>
					<!-- sidebar: tuning -->
					<div class="divider text-center show-lg" :data-content="t('divider.tuning').charAt(0)"></div>
					<div class="divider text-center hide-lg" :data-content="t('divider.tuning')"></div>
					<div class="d-flex mb-2">
						<span class="text-center text-pre text-gray text-large hide-lg">{{ showTuning.previous }}</span>
						<span class="label label-rounded text-center text-large text-pre text-bold">{{ showTuning.current }}</span>
						<span class="text-center text-pre text-gray text-large hide-lg">{{ showTuning.next }}</span>
					</div>
					<div class="d-flex">
						<button
							class="btn btn-secondary mb-1 hide-lg"
							:class="{ disabled: !chords }"
							@click="tuning--"
						>
							<ion-icon :icon="arrowBack"></ion-icon>
						</button>
						<button
							class="btn btn-secondary tooltip tooltip-right tooltip-lg mb-1 show-lg"
							:class="{ disabled: !chords }"
							:data-tooltip="t('tooltip.transposeUp')"
							@click="tuning++"
						>
							<ion-icon :icon="arrowUp"></ion-icon>
						</button>
						<button
							class="btn btn-secondary tooltip tooltip-right tooltip-lg mb-1"
							:class="{ disabled: !chords }"
							:data-tooltip="t('tooltip.keyReset')"
							@click="tuning = 0"
						>
							<ion-icon :icon="refresh"></ion-icon>
						</button>
						<button
							class="btn btn-secondary mb-1 hide-lg"
							:class="{ disabled: !chords }"
							@click="tuning++"
						>
							<ion-icon :icon="arrowForward"></ion-icon>
						</button>
						<button
							class="btn btn-secondary tooltip tooltip-right tooltip-lg mb-1 show-lg"
							:class="{ disabled: !chords }"
							:data-tooltip="t('tooltip.transposeDown')"
							@click="tuning--"
						>
							<ion-icon :icon="arrowDown"></ion-icon>
						</button>
					</div>
					<!-- sidebar: export -->
					<div class="divider text-center show-lg" :data-content="t('divider.export').charAt(0)"></div>
					<div class="divider text-center hide-lg" :data-content="t('divider.export')"></div>
					<button
						class="btn btn-secondary d-block stretch text-uppercase tooltip tooltip-right tooltip-lg mb-1"
						:data-tooltip="t('divider.export') + ': ' + t('button.filetypeTxt')"
						@click="exportTxt"
					>
						<ion-icon :icon="downloadOutline" class="icon-left"></ion-icon>
						<span class="hide-lg text-pre">{{ t('button.filetypeTxt') }}</span>
					</button>
					<button
						class="btn btn-secondary d-block stretch text-uppercase tooltip tooltip-right tooltip-lg mb-1"
						:data-tooltip="t('divider.export') + ': ' + t('button.filetypeSng')"
						@click="exportSng"
					>
						<ion-icon :icon="downloadOutline" class="icon-left"></ion-icon>
						<span class="hide-lg text-pre">{{ t('button.filetypeSng') }}</span>
					</button>
					<button
						class="btn btn-secondary d-block stretch text-uppercase tooltip tooltip-right tooltip-lg"
						:data-tooltip="t('divider.export') + ': ' + t('button.filetypePdf')"
						@click="exportPdf"
					>
						<ion-icon :icon="downloadOutline" class="icon-left"></ion-icon>
						<span class="hide-lg text-pre">{{ t('button.filetypePdf') }}</span>
					</button>
				</div>
			</div>

			<!-- content -->
			<div class="off-canvas-content">
				<div class="container">
					<!-- title and song content -->
					<div class="columns pb-4">
						<div v-if="ready.songs && song" class="column col-12">
							<h2>{{ song.title }} <span class="label text-pre ml-2 px-3">{{ showTuning.current }}</span></h2>
							<h3>{{ song.subtitle }}</h3>
							<SongContent
								:content="song.content"
								:chords="chords"
								:tuning="tuning"
								:presentation="false"
							/>
						</div>
					</div>
					<!-- song footer with info and data about the song -->
					<footer class="columns mt-4 pt-4">
						<div v-if="ready.songs && song && ready.tags" class="column col-6 col-md-12 text-small">
							<p>{{ song.authors }}</p>
							<p>
								<!-- youtube -->
								<a
									v-if="song.youtube"
									:href="'https://youtu.be/' + song.youtube"
									class="mr-2"
									target="_blank"
								>
									<span class="label px-2 py-1">
										<ion-icon :icon="logoYoutube" class="icon-sm mr-1"></ion-icon>
										{{ t('field.youtube') }}
										<ion-icon :icon="openOutline" class="icon-sm ml-1"></ion-icon>
									</span>
								</a>
								<!-- ccli -->
								<a
									v-if="song.ccli"
									:href="'https://songselect.ccli.com/Songs/' + song.ccli"
									class="mr-4"
									target="_blank"
								>
									<span class="label px-2 py-1">
										{{ t('field.ccli') }}
										<ion-icon :icon="openOutline" class="icon-sm ml-1"></ion-icon>
									</span>
								</a>
								<!-- tags -->
								<router-link
									v-for="tag in song.tags"
									:key="tag"
									:to="{ name: 'songs-tag', params: { tag: tag }}"
									class="mr-2"
								>
									<span class="label px-2 py-1">
										<ion-icon :icon="pricetagOutline" class="icon-sm mr-1"></ion-icon>
										{{ tags[tag][locale] ? tags[tag][locale] : tag }}
									</span>
								</router-link>
							</p>
							<p class="text-gray text-breaks">&copy; {{ song.year }} {{ song.publisher }}</p>
						</div>
						<div v-if="ready.songs && song && song.note" class="column col-6 col-md-12">
							<p v-html="song.note.replace(/\n/gi, '<br>')"></p>
						</div>
					</footer>
				</div>
			</div>
			<!-- modals -->
			<SongSet
				v-if="modal.set"
				:active="modal.set"
				:existing="existing"
				:initialSong="song"
				:id="songId"
				:songs="songs"
				:setlists="setlists"
				:tags="tags"
				:languages="languages"
				:ready="ready"
				@closed="modal.set = false"
			/>
			<SongDelete
				v-if="modal.delete"
				:active="modal.delete"
				:title="song ? song.title : ''"
				:id="songId"
				:songs="songs"
				@closed="modal.delete = false"
			/>
			<SongPresent
				v-if="modal.present"
				:active="modal.present"
				:song="song"
				:chords="chords"
				:tuning="tuning"
				@chords="chords = !chords"
				@closed="modal.present = false"
			/>
		</div>
	</div>
</template>

<script setup>
import { ref, reactive, computed, watch, inject, onMounted } from 'vue';
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from 'vue-router';
import { notify } from '@kyvg/vue3-notification';
import { keyScale, isChordLine, parsedContent, download } from '@/utils.js';
import SongContent from '@/partials/SongContent';
import SongSet from '@/modals/SongSet';
import SongDelete from '@/modals/SongDelete';
import SongPresent from '@/modals/SongPresent';
import {
	arrowBack,
	arrowBackOutline,
	arrowDown,
	arrowForward,
	arrowUp,
	copyOutline,
	createOutline,
	downloadOutline,
	logoYoutube,
	openOutline,
	pricetagOutline,
	refresh,
	trashOutline,
	videocamOutline
} from 'ionicons/icons';
const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();

// pdf creation
const EOL = '\n';
var pdfMake = require('pdfmake/build/pdfmake');
pdfMake.fonts = {
	FiraMono: {
		normal: window.location.origin + '/fonts/FiraMono-Regular.ttf',
	},
	FiraSans: {
		normal: window.location.origin + '/fonts/FiraSans-Light.ttf',
	}
};

// global properties
const db = inject('db');

// inherited properties
const props = defineProps({
	songs:     Object,
	setlists:  Object,
	tags:      Object,
	languages: Object,
	user:      String,
	role:      Number,
	ready:     Object,
});

// non reactive data
const songId = route.params.id;
const songKey = route.params.key;

// reactive data
const existing = ref(true);
const chords   = ref(true);
const tuning   = ref(0);
const modal = reactive({
	song: {},
	set: false,
	delete: false,
	present: false,
});

// template references
const songshow = ref(null);

// mounted
onMounted(() => {
	// focus component area for shortcuts
	songshow.value.focus();
	// set custom tuning when loading this component and songKey is given
	tuning.value = props.song && songKey ? urlKeyDiff() : 0;
});

// computed
// get song object from db as soon as songs have finished loading
const song = computed(() => {
	if (props.ready.songs) {
		return props.songs[songId];
	}
	return null;
});
// array of tuples (song id, language) for all existing translations of this song
const showLanguages = computed(() => {
	if (props.ready.songs && song.value?.translations?.length > 0) {
		var languages = [[route.params.id, song.value.language]];
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
const showTuning = computed(() => {
	if (song.value) {
		return {
			previous: keyScale[(12 + keyScale.indexOf(song.value.tuning) + (tuning.value-1 % 12)) % 12],
			current: keyScale[(12 + keyScale.indexOf(song.value.tuning) + (tuning.value % 12)) % 12],
			next: keyScale[(12 + keyScale.indexOf(song.value.tuning) + (tuning.value+1 % 12)) % 12],
		};
	} else {
		return {}
	}
});

// methods
// calculates difference between song key and url key parameter and returns new key scale index
const urlKeyDiff = () => {
	return (12 + keyScale.indexOf(songKey) - keyScale.indexOf(song.value.tuning)) % 12;
};
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
		+ '#Author=' + song.value.authors
		+ '#Melody=' + song.value.authors
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
// export song sheet as PDF
const exportPdf = () => {
	var content = getPdfSongContent();
	// return page configuration with computed content
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
	pdfMake.createPdf(doc).download(route.params.id + '.pdf');
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

// watcher
watch (
	() => modal.present,
	(newValue) => {
		// remove scroll bar when in presentation moden
		if (newValue) {
			document.body.classList.add('o-hidden');
		} else {
			document.body.classList.remove('o-hidden');
		}
	}
);
watch (
	song,
	() => {
		// adjust song key if it's set by url parameter and song was loaded
		if (songKey && song.value) {
			tuning.value = urlKeyDiff();
		}
	}
);
</script>
