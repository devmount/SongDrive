<template>
	<div
		v-if="setlistAccess"
		class="setlist-show"
		ref="setlistshow"
		tabindex="0"
		@keydown.ctrl.s.prevent="!modal.present ? updateActive() : null"
		@keydown.ctrl.k.prevent="chords = !chords"
		@keydown.ctrl.p.prevent="modal.present=true"
		@keydown.esc.exact="modal.set=false; modal.delete=false; modal.present=false; setlistshow.focus()"
	>
		<div class="off-canvas off-canvas-secondary">
			<!-- content -->
			<div class="off-canvas-content">
				<div class="container">
					<!-- setlist data -->
					<div class="columns">
						<!-- title and information bar -->
						<div v-if="ready.setlists && setlist" class="column col-12">
							<h2>{{ setlist.title }}</h2>
							<div class="heading flex flex-wrap gx-5 gy-2 my-2">
								<span
									v-if="setlist.private"
									class="text-primary flex align-center g-2 tooltip tooltip-bottom"
									:data-tooltip="t('tooltip.setlistPrivate')"
								>
									<ion-icon :icon="lockClosedOutline" class="icon-sm"></ion-icon>
									{{ t('option.private') }}
								</span>
								<span class="flex align-center g-2">
									<ion-icon :icon="list" class="icon-sm"></ion-icon>
									{{ t('object.song', setlist.songs.length, { n: setlist.songs.length }) }}
								</span>
								<span class="flex align-center g-2">
									<ion-icon :icon="calendarOutline" class="icon-sm"></ion-icon>
									{{ humanDate(setlist.date, locale) }}
								</span>
								<span v-if="ready.users && users[setlist.creator]" class="flex align-center g-2">
									<ion-icon :icon="personOutline" class="icon-sm"></ion-icon>
									{{ users[setlist.creator].name }}
								</span>
							</div>
						</div>
						<!-- toolbar -->
						<div class="toolbar">
							<div class="flex align-center g-1">
								<label
									v-if="setlist && user && role > 1"
									class="form-switch switch-lg c-hand tooltip tooltip-bottom flex align-center mr-1"
									:data-tooltip="t('tooltip.sync')"
								>
									<input type="checkbox" v-model="setlist.active" @click.prevent="updateActive">
									<i class="form-icon"></i>
									<ion-icon :icon="sync" class="show-xl mt-1"></ion-icon>
									<span class="hide-xl">{{ t('switch.sync') }}</span>
								</label>
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
									:data-tooltip="t('tooltip.startPresentation')"
									@click="modal.present=true"
								>
									<ion-icon :icon="videocamOutline"></ion-icon>
									<span class="hide-xl ml-2">{{ t('button.present') }}</span>
								</button>
								<router-link
									:to="{ name: 'setlist-show', params: { id: setlistKey }}"
									target="_blank"
									class="btn btn-secondary flex align-center tooltip tooltip-bottom"
									:data-tooltip="t('tooltip.openInNewTab')"
								>
									<ion-icon :icon="openOutline"></ion-icon>
									<span class="hide-xl ml-2">{{ t('button.open') }}</span>
								</router-link>
							</div>
							<div class="flex align-center g-1">
								<div class="dropdown dropdown-right">
									<div class="btn-group">
										<a class="btn btn-secondary dropdown-toggle flex align-center tooltip tooltip-top" :data-tooltip="t('tooltip.copySetlist')" tabindex="0">
											<ion-icon :icon="clipboardOutline" class="mr-2"></ion-icon>
											<span class="hide-xl">{{ t('button.copy') }}</span>
											<ion-icon :icon="chevronDownOutline" class="ml-1"></ion-icon>
										</a>
										<ul class="menu text-left">
											<li class="menu-item">
												<a href="#" class="py-3 px-3" @click="copyList('plain')">
													<ion-icon :icon="list" class="mr-2"></ion-icon>
													{{ t('button.formatPlain') }}
												</a>
											</li>
											<li class="menu-item">
												<a href="#" class="py-3 px-3" @click="copyList('markdown')">
													<ion-icon :icon="logoMarkdown" class="mr-2"></ion-icon>
													{{ t('button.formatMarkdown') }}
												</a>
											</li>
											<li class="menu-item">
												<a href="#" class="py-3 px-3" @click="copyList('slack')">
													<ion-icon :icon="logoSlack" class="mr-2"></ion-icon>
													{{ t('button.formatSlack') }}
												</a>
											</li>
										</ul>
									</div>
								</div>
								<div class="dropdown dropdown-right">
									<div class="btn-group">
										<a class="btn btn-secondary dropdown-toggle flex align-center tooltip tooltip-top" :data-tooltip="t('tooltip.downloadSetlist')" tabindex="0">
											<ion-icon :icon="downloadOutline" class="mr-2"></ion-icon>
											<span class="hide-xl">{{ t('button.download') }}</span>
											<ion-icon :icon="chevronDownOutline" class="ml-1"></ion-icon>
										</a>
										<ul class="menu text-left">
											<li class="menu-item">
												<a href="#" class="py-3 px-3" @click="exportPdf('list')">
													<ion-icon :icon="documentTextOutline" class="mr-2"></ion-icon>
													{{ t('button.exportSetlistList') }}
												</a>
											</li>
											<li class="menu-item">
												<a href="#" class="py-3 px-3" @click="exportPdf('sheets')">
													<ion-icon :icon="documentsOutline" class="mr-2"></ion-icon>
													{{ t('button.exportSetlistSheets') }}
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
						<!-- song list -->
						<div v-if="ready.songs && ready.setlists && setlist && setlist.songs.length > 0" class="column col-12 mt-4">
							<table class="table table-striped table-hover">
								<thead>
									<tr>
										<th class="w-70" v-if="user && role > 1"></th>
										<th class="w-50p">{{ t('field.title') }}</th>
										<th class="w-40p hide-xl">{{ t('field.authors') }}</th>
										<th class="w-90 hide-xl">{{ t('field.language') }}</th>
										<th class="w-120">{{ t('field.tuning') }}</th>
										<th class="w-120 hide-md">{{ t('field.ccli') }}</th>
										<th class="w-50"></th>
									</tr>
								</thead>
								<tbody v-sortable="{ onEnd: reorder, handle: '.handle' }">
									<tr v-for="(song, i) in setlist.songs" :key="song.id">
										<td v-if="user && role > 1" class="c-move text-center text-gray">
											<ion-icon :icon="reorderFourOutline" class="icon-1-5x pl-2 handle"></ion-icon>
										</td>
										<template v-if="songs[song.id]">
											<td class="c-hand max-w-0" @click.prevent="router.push({ name: 'song-show', params: { id: song.id, key: song.tuning ? song.tuning : songs[song.id].tuning }})">
												<div class="o-ellipsis">{{ songs[song.id].title }}</div>
												<div class="text-gray o-ellipsis">{{ songs[song.id].subtitle }}</div>
											</td>
											<td class="hide-xl max-w-0 o-ellipsis">{{ songs[song.id].authors }}</td>
											<td class="hide-xl text-uppercase">{{ songs[song.id].language }}</td>
											<td class="tuning">
												<button
													v-if="user && role > 1"
													class="btn btn-secondary btn-sm btn-fw"
													@click.prevent="tuneDown(songs[song.id], i)"
												>
													<ion-icon :icon="arrowBack" class="icon-sm"></ion-icon>
												</button>
												<code>{{ song.tuning ? song.tuning : songs[song.id].tuning }}</code>
												<button
													v-if="user && role > 1"
													class="btn btn-secondary btn-sm btn-fw"
													@click.prevent="tuneUp(songs[song.id], i)"
												>
													<ion-icon :icon="arrowForward" class="icon-sm"></ion-icon>
												</button>
											</td>
											<td class="hide-md">
												<a :href="'https://songselect.ccli.com/Songs/' + songs[song.id].ccli" target="_blank">
													{{ songs[song.id].ccli }}
												</a>
											</td>
										</template>
										<template v-else>
											<td colspan="2"><span class="text-error mr-1">{{ t('toast.songDeleted') }}</span> <br class="show-xl hide-sm" />
												<span class="text-gray text-pre text-tiny hide-sm">{{ song.id }}</span>
											</td>
											<td class="hide-xl"></td>
											<td class="hide-xl"></td>
										</template>
										<td class="text-right">
											<button
												v-if="songs[song.id]"
												class="btn btn-primary"
												@click.prevent="router.push({ name: 'song-show', params: { id: song.id, key: song.tuning ? song.tuning : songs[song.id].tuning }})"
											>
												<ion-icon :icon="eyeOutline"></ion-icon>
											</button>
											<button
												v-else
												class="btn btn-error"
												@click.prevent="removeSong(song.id)"
											>
												<ion-icon :icon="trashOutline"></ion-icon>
											</button>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
						<div v-if="ready.songs && ready.setlists && setlist && setlist.songs.length == 0" class="column col-12 empty">
							<div class="empty-icon">
								<ion-icon :icon="musicalNotesOutline" class="icon-4x"></ion-icon>
							</div>
							<p class="empty-title h5">{{ t('text.emptySetlist') }}</p>
							<p class="empty-subtitle">{{ t('text.editSetlistAddSongs') }}</p>
						</div>
					</div>
					<!-- stats -->
					<div v-if="ready.setlists && setlist && setlist.songs.length > 0" class="columns mt-4">
						<div class="column col-4 col-lg-6 mt-4">
							<div class="panel pb-4">
								<div class="panel-header">
									<div class="panel-title h5 text-center">
										<ion-icon :icon="globeOutline"></ion-icon> {{ t('widget.languages', 2) }}
									</div>
								</div>
								<div class="panel-body">
									<DoughnutChart
										:info="{
											number: setlistLanguages.labels.length,
											label: t('widget.languages', setlistLanguages.labels.length)
										}"
										:datasets="setlistLanguages.datasets"
										:labels="setlistLanguages.labels"
									/>
								</div>
							</div>
						</div>
						<div class="column col-4 col-lg-6 mt-4">
							<div class="panel pb-4">
								<div class="panel-header">
									<div class="panel-title h5 text-center">
										<ion-icon :icon="musicalNote"></ion-icon> {{ t('widget.keys') }}
									</div>
								</div>
								<div class="panel-body">
									<DoughnutChart
										:info="{ number: setlistKeys.labels.length, label: t('widget.keys') }"
										:datasets="setlistKeys.datasets"
										:labels="setlistKeys.labels"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<!-- modals -->
			<SetlistSet
				v-if="modal.set"
				:active="modal.set"
				:existing="existing"
				:initialSetlist="setlist"
				:setlistKey="setlistKey"
				:user="user"
				:songs="songs"
				:setlists="setlists"
				:tags="tags"
				:languages="languages"
				:ready="ready"
				@closed="modal.set = false"
			/>
			<SetlistDelete
				v-if="modal.delete"
				:active="modal.delete"
				:title="setlist ? setlist.title : ''"
				:id="setlistKey"
				@closed="modal.delete = false"
			/>
			<SetlistPresent
				v-if="modal.present"
				:active="modal.present"
				:songs="setlistSongs"
				:sync="setlist.active"
				:position="setlist.position"
				:chords="chords"
				:remoteHide="setlist.remoteHide"
				:remoteLight="setlist.remoteLight"
				:remoteText="setlist.remoteText"
				@chords="chords = !chords"
				@closed="modal.present = false"
				@updatePosition="updatePosition"
				@updateHide="updateHide"
				@updateDark="updateDark"
				@updateChords="updateChords"
			/>
		</div>
	</div>
	<div v-else class="empty">
		<div class="empty-icon">
			<ion-icon :icon="lockClosedOutline" class="icon-4x"></ion-icon>
		</div>
		<p class="empty-title h5">{{ t('text.privateSetlist') }}</p>
		<p class="empty-subtitle">{{ t('text.setlistVisibleForCreator') }}</p>
	</div>
</template>

<script setup>
import firebase from 'firebase/compat/app';
import { ref, reactive, computed, watch, inject, onMounted } from 'vue';
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from 'vue-router';
import { notify } from '@kyvg/vue3-notification';
import { keyScale, parsedContent, humanDate, throwError } from '@/utils.js';
import SetlistSet from '@/modals/SetlistSet';
import SetlistDelete from '@/modals/SetlistDelete';
import SetlistPresent from '@/modals/SetlistPresent';
import DoughnutChart from '@/charts/DoughnutChart';
import {
	arrowBack,
	arrowBackOutline,
	arrowForward,
	calendarOutline,
	chevronDownOutline,
	clipboardOutline,
	copyOutline,
	createOutline,
	documentsOutline,
	documentTextOutline,
	downloadOutline,
	eyeOutline,
	globeOutline,
	list,
	lockClosedOutline,
	logoMarkdown,
	logoSlack,
	menuOutline,
	musicalNote,
	musicalNotesOutline,
	openOutline,
	personOutline,
	reorderFourOutline,
	sync,
	trashOutline,
	videocamOutline
} from 'ionicons/icons';
const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();

// pdf creation
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
  users:     Object,
  tags:      Object,
  languages: Object,
  user:      String,
  role:      Number,
  ready:     Object,
});

// non reactive data
const setlistKey = route.params.id;

// reactive data
const existing = ref(true);
const chords   = ref(true);
const modal = reactive({
	set: false,
	delete: false,
	present: false,
});

// template references
const setlistshow = ref(null);

// mounted
onMounted(() => {
	// focus component area for shortcuts
	setlistshow.value.focus();
});

// computed
const setlist = computed(() => {
	if (props.ready.setlists) {
		return props.setlists[setlistKey];
	}
	return false;
});
const setlistSongs = computed(() => {
	if (props.ready.songs && props.ready.setlists && setlist.value?.songs?.length > 0) {
		let songs = [];
		for (const key in setlist.value.songs) {
			if (setlist.value.songs.hasOwnProperty(key) && props.songs.hasOwnProperty(setlist.value.songs[key].id)) {
				// only if song exists (not deleted), retrieve it from db and handle tuning
				let song = props.songs[setlist.value.songs[key].id];
				let setlistTuning = setlist.value.songs[key].tuning;
				song['customTuningDelta'] = setlistTuning != 0
					? keyScale.indexOf(setlistTuning) - keyScale.indexOf(song.tuning)
					: 0;
				song['customTuning'] = setlistTuning != 0 ? setlistTuning : song.tuning;
				songs.push(song);
			}
		}
		return songs;
	}
	return [];
});
const setlistLanguages = computed(() => {
	let languages = {};
	for (let i = 0; i < setlistSongs.value.length; i++) {
		const song = setlistSongs.value[i];
		if (!languages.hasOwnProperty(song.language)) {
			languages[song.language] = 0;
		}
		languages[song.language]++;
	}
	return {
		datasets: [
			{ label: t('page.songs'), data: Object.values(languages), color: '#88b544' },
		],
		labels: Object.keys(languages).map(e => props.languages[e]?.label)
	};
});
const setlistKeys = computed(() => {
	let keys = {};
	for (let i = 0; i < setlistSongs.value.length; i++) {
		const song = setlistSongs.value[i];
		if (!keys.hasOwnProperty(song.customTuning)) {
			keys[song.customTuning] = 0;
		}
		keys[song.customTuning]++;
	}
	return {
		datasets: [
			{ label: t('page.songs'), data: Object.values(keys), color: '#88b544' },
		],
		labels: Object.keys(keys)
	};
});
// Bool indicating if this setlist is accessible for current user or not
const setlistAccess = computed(() => {
	return setlist.value && (!setlist.value.private || setlist.value.private && setlist.value.creator==props.user);
});

// methods
const reorder = ({oldIndex, newIndex}) => {
	const movedItem = setlist.value.songs.splice(oldIndex, 1)[0];
	setlist.value.songs.splice(newIndex, 0, movedItem);
	db.collection('setlists').doc(route.params.id).set(
		{ songs: setlist.value.songs },
		{ merge: true }
	).then(() => {
		notify({
			title: t('toast.songOrderUpdated'),
			text: t('toast.setlistSavedText'),
			type: 'primary'
		});
	}).catch((error) => throwError(error));
};
const tuneUp = (song, songPosition) => {
	let songs = setlist.value.songs;
	// update tuning
	let tone = songs[songPosition].tuning ? songs[songPosition].tuning : song.tuning;
	let i = keyScale.indexOf(tone);
	if (i>=keyScale.length-1) {
		tone = keyScale[0];
	} else {
		tone = keyScale[++i];
	}
	// save tuning in setlist
	songs[songPosition].tuning = tone;
	db.collection('setlists').doc(route.params.id).set({ songs: songs }, { merge: true });
};
const tuneDown = (song, songPosition) => {
	let songs = setlist.value.songs;
	// update tuning
	let tone = songs[songPosition].tuning ? songs[songPosition].tuning : song.tuning;
	let i = keyScale.indexOf(tone);
	if (i<=0) {
		tone = keyScale[keyScale.length-1];
	} else {
		tone = keyScale[--i];
	}
	// save tuning in setlist
	songs[songPosition].tuning = tone;
	db.collection('setlists').doc(route.params.id).set({ songs: songs }, { merge: true });
};
const removeSong = (songId) => {
	let songs = setlist.value.songs.filter(s => s.id != songId);
	db.collection('setlists').doc(route.params.id).update({ songs: songs }).then(() => {
		// toast success update message
		notify({
			title: t('toast.setlistUpdated'),
			text: t('toast.songDeletedFromSetlist'),
			type: 'primary'
		});
	});
};
const updateActive = () => {
	// update setlist's active flag to enable or disable sync
	var sync = !setlist.value.active;
	db.collection('setlists').doc(route.params.id).set({ active: sync }, { merge: true }).then(() => {
		notify({
			title: t('toast.sync' + (sync ? 'Activated' : 'Deactivated')),
			text: t('toast.setlistStatusSavedText'),
			type: 'primary'
		});
	}).catch((error) => throwError(error));
	// remove remote props when sync is disabled
	if (!sync) {
		if (setlist.value.hasOwnProperty('remoteText')) {
			db.collection('setlists').doc(route.params.id).update({ remoteText: firebase.firestore.FieldValue.delete() });
		}
		if (setlist.value.hasOwnProperty('remoteLight')) {
			db.collection('setlists').doc(route.params.id).update({ remoteLight: firebase.firestore.FieldValue.delete() });
		}
		if (setlist.value.hasOwnProperty('remoteHide')) {
			db.collection('setlists').doc(route.params.id).update({ remoteHide: firebase.firestore.FieldValue.delete() });
		}
	}
};
const updatePosition = (val) => {
	// update setlist's position if sync enabled
	if (setlist.value.active) {
		db.collection('setlists').doc(route.params.id).set({ position: val }, { merge: true });
	}
};
const updateChords = (val) => {
	// update setlist's display of chords if sync enabled
	if (setlist.value.active) {
		db.collection('setlists').doc(route.params.id).set({ remoteText: val }, { merge: true });
	}
};
const updateDark = (val) => {
	// update setlist's theme mode if sync enabled
	if (setlist.value.active) {
		db.collection('setlists').doc(route.params.id).set({ remoteLight: val }, { merge: true });
	}
};
const updateHide = (val) => {
	// update setlist's display of content if sync enabled
	if (setlist.value.active) {
		db.collection('setlists').doc(route.params.id).set({ remoteHide: val }, { merge: true });
	}
};
const copyList = (format) => {
	// build text list
	let list = [], label = '';
	// only export existing songs
	let songs = setlist.value.songs.filter(s => s.id in props.songs);
	switch (format) {
		case 'plain':
			list = songs.map(
				(s, i) => (i+1) + '. ' + props.songs[s.id].title + ' (' + props.songs[s.id].subtitle + ')'
				+ ' [' + (props.songs[s.id].customTuning ? props.songs[s.id].customTuning : props.songs[s.id].tuning) + ']'
			);
			label = 'plain text';
			break;
		case 'markdown':
			list = songs.map(
				(s, i) => (i+1) + '. **' + props.songs[s.id].title + '** – _' + props.songs[s.id].subtitle + '_'
				+ ' [**`' + (props.songs[s.id].customTuning ? props.songs[s.id].customTuning : props.songs[s.id].tuning) + '`**]'
			);
			label = 'markdown';
			break;
		case 'slack':
			list = songs.map(
				(s, i) => (i+1) + '. *' + props.songs[s.id].title + '* – _' + props.songs[s.id].subtitle + '_'
				+ ' `' + (props.songs[s.id].customTuning ? props.songs[s.id].customTuning : props.songs[s.id].tuning) + '`'
			);
			label = 'slack';
			break;
		default:
			break;
	}
	navigator.clipboard.writeText(list.join('\n'));
	notify({
		title: t('toast.copiedToClipboard'),
		text: t('toast.setlistFormatCopiedText', { format: label }),
		type: 'primary'
	});
};
const exportPdf = (mode) => {
	var content = mode == 'sheets' ? getPdfSongsheets() : getPdfSetlist();
	// return page configuration with computed content
	var doc = {
		pageSize: 'A4',
		pageMargins: [ 50, 35, 40, 20 ],
		content: content,
		styles: {
			header: {
				font: 'FiraSans',
				fontSize: 22,
				alignment: 'center',
				margin: [ 0, 0, 0, 5 ]
			},
			subtitle: {
				font: 'FiraSans',
				fontSize: 11,
				alignment: 'center',
			},
			list: {
				font: 'FiraSans',
				fontSize: 14,
				lineHeight: 1.4,
				margin: [ 0, 30, 0, 5 ]
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
			footer: {
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
	pdfMake.createPdf(doc).download(
		route.params.id
		+ '-'
		+ (mode == 'sheets' ? t('button.exportSetlistSheets') : t('button.exportSetlistList')).toLowerCase()
		+ '.pdf'
	);
	// toast success message
	notify({
		title: t('toast.exportedPdf'),
		text: t('toast.exportedSetlistPdfText'),
		type: 'primary'
	});
};
const getPdfSetlist = () => {
	let songs = [];
	for (const key in setlist.value.songs) {
		if (setlist.value.songs.hasOwnProperty(key) && setlist.value.songs[key].id in props.songs) {
			const song = props.songs[setlist.value.songs[key].id];
			songs.push(' ‒ ' + song.title + ' [' + (song.customTuning ? song.customTuning : song.tuning) + ']');
		}
	}
	return [
		{ text: setlist.value.title.toUpperCase(), style: 'header' },
		{ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 505, y2: 0, lineWidth: .5 }] },
		{
			text: (new Date(setlist.value.date)).toLocaleDateString("de-DE",
			{ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
			style: 'subtitle',
			margin: [ 0, 6, 0, 0 ]
		},
		{ ol: songs, style: 'list'}
	];
};
const getPdfSongsheets = () => {
	let sheets = [];
	for (const key in setlist.value.songs) {
		if (setlist.value.songs.hasOwnProperty(key) && setlist.value.songs[key].id in props.songs) {
			const song = props.songs[setlist.value.songs[key].id];
			// handle song content parts
			let content = [];
			let parts = parsedContent(
				song.content,
				song.customTuning ? song.customTuningDelta : 0,
				chords.value,
				false
			);
			parts.forEach((part) => {
				if (part.type == 'v' && part.number != '0') {
					content.push({
						columnGap: 8,
						columns: [
							{
								width: 'auto',
								text: part.number,
								style: 'partnumber',
							},
							{
								width: '*',
								// song content with respect to leading whitespaces
								text: '\u200B' + part.content.replace(/\n/g, "\n" + '\u200B'),
								style: 'code',
							}
						]
					});
				} else {
					content.push({
						// song content with respect to leading whitespaces
						text: '\u200B' + part.content.replace(/\n/g, "\n" + '\u200B'),
						style: 'code',
					});
				}
			});
			// create footer
			let footer = [{
				// imprint with ccli#, author names and (c) year publisher
				width: '*',
				style: 'footer',
				text: [
					song.note ? t('field.note') + ':\n' + song.note + '\n\n' : '',
					song.ccli ? 'CCLI Song Nr.: ' + song.ccli + '\n' : '',
					song.authors ? song.authors + '\n' : '',
					'\u00A9 ' + (song.year ? song.year + ' ' : '') + song.publisher
				]
			}];
			if (song.youtube) {
				footer.push({
					// QR code for YouTube link
					width: '140',
					margin: [ 0, 20, 0, 0 ],
					stack: [
						{ text: 'https://youtu.be/' + song.youtube, style: 'qr' },
						{ qr: 'https://youtu.be/' + song.youtube, fit: '90', style: 'qr', margin: [ 0, 5, 0, 0 ] }
					]
				});
			}
			// put songsheet together
			let songsheet = [
				// song title [tuning] with a line beneath
				{ text: song.title.toUpperCase(), style: 'header' },
				{ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 505, y2: 0, lineWidth: .5 }] },
				{
					text: chords.value ? 'Tuning: ' + (song.customTuning ? song.customTuning : song.tuning) : '',
					style: 'subtitle',
					alignment: 'right',
					margin: [ 0, 4, 0, 0 ]
				},
				content,
				{ columnGap: 8, columns: footer }
			];
			// add page break after every song exept for the last
			if (setlist.value.songs.length > 0 && key < setlist.value.songs.length-1) {
				songsheet.push({ text: '', pageBreak: 'after', style: 'code' });
			}
			sheets = sheets.concat(songsheet);
		}
	}
	return sheets;
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
</script>

<style lang="scss">
.tuning {
	min-width: 100px;

	code {
		width: 2em;
		display: inline-block;
		text-align: center;
		background: transparent;
	}
}
</style>
