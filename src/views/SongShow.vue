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
			<!-- content -->
			<div class="off-canvas-content">
				<div class="container">
					<!-- title and song content -->
					<div class="columns pb-4">
						<div v-if="ready.songs && song" class="column col-12">
							<h2>
								{{ song.title }}
								<span class="label text-pre ml-2 px-2 py-1 text-small text-bottom">{{ showTuning.current }}</span>
							</h2>
							<div class="heading text-gray text-uppercase mb-2">{{ song.subtitle }}</div>
							<!-- toolbar -->
							<div class="toolbar">
								<div v-if="ready.songs" class="flex align-center g-1">
									<button
										class="btn btn-secondary flex align-center"
										:data-tooltip="t('button.back')"
										@click="router.go(-1)"
									>
										<ion-icon :icon="arrowBackOutline"></ion-icon>
										<span class="hide-xl ml-2">{{ t('button.back') }}</span>
									</button>
									<div
										v-for="([id, lang], i) in showLanguages"
										:key="i"
										class=" tooltip tooltip-bottom"
										:data-tooltip="t('divider.language') + ': ' + (languages[lang] ? languages[lang].label : '')"
									>
										<router-link
											:to="{ name: 'song-show', params: { id: id }}"
											class="btn btn-secondary text-uppercase"
											:class="{ disabled: (!id || songId == id) }"
										>
											{{ lang }}
										</router-link>
									</div>
								</div>
								<div class="flex align-center g-1">
									<div class="flex align-center g-1 ml-1 p-relative key-preview">
										<button
											class="btn btn-secondary tooltip tooltip-top"
											:class="{ disabled: !chords }"
											:data-tooltip="t('tooltip.transposeDown')"
											@click="tuning--"
										>
											<ion-icon :icon="arrowBack"></ion-icon>
										</button>
										<button
											class="btn btn-secondary tooltip tooltip-top"
											:class="{ disabled: !chords }"
											:data-tooltip="t('tooltip.keyReset')"
											@click="tuning = 0"
										>
											<ion-icon :icon="refresh"></ion-icon>
										</button>
										<button
											class="btn btn-secondary tooltip tooltip-top"
											:class="{ disabled: !chords }"
											:data-tooltip="t('tooltip.transposeUp')"
											@click="tuning++"
										>
											<ion-icon :icon="arrowForward"></ion-icon>
										</button>
										<div class="p-absolute preview-pane flex justify-between p-1">
											<span class="text-center text-pre text-gray text-large px-3">{{ showTuning.previous }}</span>
											<span class="label label-rounded text-center text-large text-pre text-bold px-3">{{ showTuning.current }}</span>
											<span class="text-center text-pre text-gray text-large px-3">{{ showTuning.next }}</span>
										</div>
									</div>
									<label
										class="form-switch switch-lg c-hand tooltip tooltip-bottom flex align-center"
										:data-tooltip="t('tooltip.chordsShow')"
									>
										<input type="checkbox" v-model="chords">
										<i class="form-icon"></i>
										<ion-icon :icon="musicalNotesOutline" class="show-xl mt-1"></ion-icon>
										<span class="hide-xl">{{ t('switch.chords') }}</span>
									</label>
									<button
										class="btn btn-secondary flex align-center tooltip tooltip-bottom"
										:data-tooltip="t('tooltip.startFullscreen')"
										@click="modal.present=true"
									>
										<ion-icon :icon="videocamOutline"></ion-icon>
										<span class="hide-xl ml-2">{{ t('button.present') }}</span>
									</button>
								</div>
								<div class="flex align-center g-1">
									<div class="dropdown dropdown-right">
										<div class="btn-group">
											<a
												class="btn btn-secondary dropdown-toggle flex align-center tooltip tooltip-top"
												:data-tooltip="t('tooltip.downloadSong')"
												tabindex="0"
											>
												<ion-icon :icon="downloadOutline" class="mr-2"></ion-icon>
												<span class="hide-xl">{{ t('button.download') }}</span>
												<ion-icon :icon="chevronDownOutline" class="ml-1"></ion-icon>
											</a>
											<ul class="menu text-left">
												<li class="menu-item">
													<a href="#" class="py-3 px-3" @click="exportTxt">
														<ion-icon :icon="documentTextOutline" class="mr-2"></ion-icon>
														{{ t('button.filetypeTxt') }}
													</a>
												</li>
												<li class="menu-item">
													<a href="#" class="py-3 px-3" @click="exportSng">
														<ion-icon :icon="documentOutline" class="mr-2"></ion-icon>
														{{ t('button.filetypeSng') }}
													</a>
												</li>
												<li class="menu-item">
													<a href="#" class="py-3 px-3" @click="exportPdf">
														<ion-icon :icon="documentOutline" class="mr-2"></ion-icon>
														{{ t('button.filetypePdf') }}
													</a>
												</li>
											</ul>
										</div>
									</div>
									<div v-if="user && role > 1" class="dropdown dropdown-right">
										<div class="btn-group">
											<a class="btn btn-secondary dropdown-toggle flex align-center" tabindex="0">
												<ion-icon :icon="menuOutline"></ion-icon>
												<ion-icon :icon="chevronDownOutline" class="ml-1"></ion-icon>
											</a>
											<ul class="menu text-left">
												<li class="menu-item">
													<a href="#" class="py-3 px-3" @click="existing=true; modal.set=true">
														<ion-icon :icon="createOutline" class="mr-2"></ion-icon>
														{{ t('button.edit') }}
													</a>
												</li>
												<li class="menu-item">
													<a href="#" class="py-3 px-3" @click="existing=false; modal.set=true">
														<ion-icon :icon="copyOutline" class="mr-2"></ion-icon>
														{{ t('button.duplicate') }}
													</a>
												</li>
												<li v-if="role > 2" class="menu-item">
													<a href="#" class="py-3 px-3 text-error" @click="modal.delete = true">
														<ion-icon :icon="trashOutline" class="mr-2"></ion-icon>
														{{ t('button.delete') }}
													</a>
												</li>
											</ul>
										</div>
									</div>
								</div>
							</div>
							<SongContent
								:content="song.content"
								:chords="chords"
								:tuning="tuning"
								:presentation="false"
							/>
						</div>
					</div>
					<!-- song footer with info and data about the song -->
					<SongFooter
						v-if="ready.songs && song && ready.tags"
						class="columns mt-4 pt-4"
						:song="song"
						:tags="tags"
					/>
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
import SongFooter from '../partials/SongFooter.vue';
import SongSet from '@/modals/SongSet';
import SongDelete from '@/modals/SongDelete';
import SongPresent from '@/modals/SongPresent';
import {
	arrowBack,
	arrowBackOutline,
	arrowDown,
	arrowForward,
	arrowUp,
	chevronDownOutline,
	documentOutline,
	documentTextOutline,
	menuOutline,
	copyOutline,
	createOutline,
	downloadOutline,
	musicalNotesOutline,
	refresh,
	trashOutline,
	videocamOutline
} from 'ionicons/icons';
const { t } = useI18n();
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
