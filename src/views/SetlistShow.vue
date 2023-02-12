<template>
	<div
		v-if="setlistAccess"
		class="flex flex-col gap-6 w-full focus:outline-none"
		ref="container"
		tabindex="0"
		@keydown.ctrl.s.prevent="!modal.present ? updateActive() : null"
		@keydown.ctrl.k.prevent="chords = !chords"
		@keydown.ctrl.p.prevent="modal.present=true"
		@keydown.esc.exact="modal.set=false; modal.delete=false; modal.present=false; container?.focus();"
	>
		<!-- page heading -->
		<div class="flex flex-col justify-between items-stretch gap-4">
			<!-- title and visible setlist count -->
			<div
				v-if="ready.setlists && setlist"
				class="flex flex-col xs:flex-row gap-x-6 gap-y-0 text-3xl uppercase font-thin tracking-wider"
			>
				<span class="font-semibold">{{ setlist.title }}</span>
				{{ t('object.song', setlist.songs.length, { n: setlist.songs.length }) }}
			</div>
			<div class="flex flex-wrap gap-x-4 gap-y-2 -mt-2 -mb-2">
				<div
					v-if="setlist.private"
					class="text-spring-600 flex items-center gap-2"
					:title="t('tooltip.setlistPrivate')"
				>
					<lock-icon />
					{{ t('option.private') }}
				</div>
				<div class="text-blade-500 flex items-center gap-2">
					<calendar-event-icon />
					{{ humanDate(setlist.date, locale) }}
				</div>
				<div v-if="ready.users && users[setlist.creator]" class="text-blade-500 flex items-center gap-2">
					<user-icon />
					{{ users[setlist.creator].name }}
				</div>
			</div>
		</div>
		<!-- toolbar -->
		<div class="flex justify-between align-center w-full bg-blade-200 dark:bg-blade-900 rounded-lg p-2 gap-1">
			<div class="flex align-center gap-1">
				<secondary-button :title="t('button.back')" @click="router.go(-1)">
					<arrow-left-icon />
					<span class="hidden xl:inline">{{ t('button.back') }}</span>
				</secondary-button>
			</div>
			<div class="flex items-center gap-1">
				<secondary-button
					v-if="setlist && user && role > 1"
					:title="setlist.active ? t('tooltip.syncOn') : t('tooltip.syncOff')"
					@click="updateActive"
				>
					<refresh-icon v-if="setlist.active === true" class="stroke-spring-400" />
					<refresh-off-icon v-else />
					<span class="hidden xl:inline">{{ t('switch.sync') }}</span>
				</secondary-button>
				<secondary-button
					:title="chords ? t('tooltip.chordsHide') : t('tooltip.chordsShow')"
					@click="chords = !chords"
				>
					<music-icon v-if="chords" class="stroke-spring-400" />
					<music-off-icon v-else />
					<span class="hidden xl:inline">{{ t('switch.chords') }}</span>
				</secondary-button>
				<secondary-button
					:title="t('tooltip.startFullscreen')"
					@click="modal.present=true"
				>
					<presentation-icon />
					<span class="hidden xl:inline">{{ t('button.present') }}</span>
				</secondary-button>
				<router-link
					:to="{ name: 'setlist-show', params: { id: setlistKey }}"
					target="_blank"
					:title="t('tooltip.openInNewTab')"
				>
					<secondary-button>
						<external-link-icon />
						<span class="hidden xl:inline">{{ t('button.open') }}</span>
					</secondary-button>
				</router-link>
			</div>
			<div class="flex align-center gap-1">
				<div class="hidden sm:block">
					<dropdown>
						<template #trigger>
							<secondary-button class="h-full" :title="t('tooltip.copySetlist')">
								<clipboard-icon class="w-5 h-5 stroke-1.5" />
								<span class="hidden xl:inline">{{ t('button.copy') }}</span>
								<chevron-down-icon class="w-5 h-5 stroke-1.5" />
							</secondary-button>
						</template>
						<template #default>
							<button
								class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
								@click="copyList('plain')"
							>
								<txt-icon class="w-5 h-5 stroke-1.5" />
								{{ t('button.formatPlain') }}
							</button>
							<button
								class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
								@click="copyList('markdown')"
							>
								<markdown-icon class="w-5 h-5 stroke-1.5" />
								{{ t('button.formatMarkdown') }}
							</button>
							<button
								class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
								@click="copyList('slack')"
							>
								<brand-slack-icon class="w-5 h-5 stroke-1.5" />
								{{ t('button.formatSlack') }}
							</button>
						</template>
					</dropdown>
				</div>
				<div class="hidden sm:block">
					<dropdown>
						<template #trigger>
							<secondary-button class="h-full" :title="t('tooltip.downloadSetlist')">
								<download-icon class="w-5 h-5 stroke-1.5" />
								<span class="hidden xl:inline">{{ t('button.download') }}</span>
								<chevron-down-icon class="w-5 h-5 stroke-1.5" />
							</secondary-button>
						</template>
						<template #default>
							<button
								class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
								@click="exportPdf('list')"
							>
								<file-text-icon class="w-5 h-5 stroke-1.5" />
								{{ t('button.exportSetlistList') }}
							</button>
							<button
								class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
								@click="exportPdf('sheets')"
							>
								<files-icon class="w-5 h-5 stroke-1.5" />
								{{ t('button.exportSetlistSheets') }}
							</button>
						</template>
					</dropdown>
				</div>
				<div class="h-full">
					<dropdown>
						<button
							v-if="user && role > 1"
							class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
							@click.stop="emit('editSetlist', setlist, setlist.id, true)"
						>
							<edit-icon class="w-5 h-5 stroke-1.5" />
							{{ t('button.edit') }}
						</button>
						<button
							v-if="user && role > 1"
							class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
							@click.prevent="emit('editSetlist', setlist, setlist.id, false)"
						>
							<copy-icon class="w-5 h-5 stroke-1.5" />
							{{ t('button.duplicate') }}
						</button>
						<button
							v-if="user && role > 2"
							class="px-3 py-2 w-full flex items-center gap-3 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30"
							@click.prevent="deleteDialog(setlist)"
						>
							<trash-icon class="w-5 h-5 stroke-1.5" />
							{{ t('button.delete') }}
						</button>
						<button
							class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750 sm:hidden"
							@click="copyList('plain')"
						>
							<txt-icon class="w-5 h-5 stroke-1.5" />
							{{ t('button.formatPlain') }}
						</button>
						<button
							class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750 sm:hidden"
							@click="copyList('markdown')"
						>
							<markdown-icon class="w-5 h-5 stroke-1.5" />
							{{ t('button.formatMarkdown') }}
						</button>
						<button
							class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750 sm:hidden"
							@click="copyList('slack')"
						>
							<brand-slack-icon class="w-5 h-5 stroke-1.5" />
							{{ t('button.formatSlack') }}
						</button>
						<button
							class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750 sm:hidden"
							@click="exportPdf('list')"
						>
							<file-text-icon class="w-5 h-5 stroke-1.5" />
							{{ t('button.exportSetlistList') }}
						</button>
						<button
							class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750 sm:hidden"
							@click="exportPdf('sheets')"
						>
							<files-icon class="w-5 h-5 stroke-1.5" />
							{{ t('button.exportSetlistSheets') }}
						</button>
					</dropdown>
				</div>
			</div>
		</div>
		<!-- song list -->
		<table
			v-if="ready.songs && ready.setlists && setlist && setlist.songs.length > 0"
			class="w-full"
		>
			<thead>
				<tr>
					<th v-if="user && role > 1" class="w-11"></th>
					<th class="uppercase p-2 font-normal">{{ t('field.title') }}</th>
					<th class="uppercase p-2 font-normal w-96 hidden 2xl:table-cell">{{ t('field.authors') }}</th>
					<th class="uppercase p-2 font-normal w-20 text-center">{{ t('field.tuning') }}</th>
					<th class="uppercase p-2 font-normal w-20 hidden xl:table-cell">{{ t('field.language') }}</th>
					<th class="uppercase p-2 font-normal w-20 hidden md:table-cell">{{ t('field.ccli') }}</th>
					<th class="w-11"></th>
				</tr>
			</thead>
			<tbody v-sortable="{ onEnd: reorder, handle: '.handle' }">
				<tr
					v-for="(song, i) in setlist.songs" :key="song.id"
					class="even:bg-blade-200/50 even:dark:bg-blade-900/50 hover:bg-blade-200 hover:dark:bg-blade-900 transition-all"
				>
					<td v-if="user && role > 1" class="cursor-grab active:cursor-grabbing text-center text-blade-500">
						<menu-order-icon class="handle inline" />
					</td>
					<template v-if="songs[song.id]">
						<td
							class="cursor-pointer px-3 py-2 max-w-0"
							@click="router.push({ name: 'song-show', params: { id: song.id, key: song.tuning ? song.tuning : songs[song.id].tuning }})"
						>
							<div class="truncate">
								<span>{{ songs[song.id].title }}</span>
								<span class="text-blade-500 ml-3">{{ songs[song.id].subtitle }}</span>
							</div>
						</td>
						<td
							class="cursor-pointer px-3 py-2 max-w-0 hidden 2xl:table-cell"
							@click="router.push({ name: 'song-show', params: { id: song.id, key: song.tuning ? song.tuning : songs[song.id].tuning }})"
						>
							<div class="truncate">{{ songs[song.id].authors }}</div>
						</td>
						<td class="px-3 py-2">
							<div class="flex justify-center items-center gap-3">
								<secondary-button
									v-if="user && role > 1"
									class="!px-2"
									@click.prevent="transposeDown(songs[song.id], i)"
								>
									<arrow-left-icon class="w-5 h-5" />
								</secondary-button>
								<div class="font-mono font-semibold text-xl w-6 text-center">
									{{ song.tuning ? song.tuning : songs[song.id].tuning }}
								</div>
								<secondary-button
									v-if="user && role > 1"
									class="!px-2"
									@click.prevent="transposeUp(songs[song.id], i)"
								>
									<arrow-right-icon class="w-5 h-5" />
								</secondary-button>
							</div>
						</td>
						<td class="px-3 py-2 hidden xl:table-cell text-center">
							<div class="uppercase">{{ songs[song.id].language }}</div>
						</td>
						<td class="px-3 py-2 hidden md:table-cell">
							<a
								class="text-spring-600"
								:href="'https://songselect.ccli.com/Songs/' + songs[song.id].ccli"
								target="_blank"
							>
								{{ songs[song.id].ccli }}
							</a>
						</td>
					</template>
					<template v-else>
						<td colspan="2" class="px-3 py-2 max-w-0">
							<div class="truncate">
								<span class="text-rose-600">{{ t('toast.songDeleted') }}</span>
								<span class="text-blade-500 font-mono text-sm ml-3">{{ song.id }}</span>
							</div>
						</td>
						<td class="hidden 2xl:table-cell"></td>
						<td class="hidden xl:table-cell"></td>
						<td class="hidden md:table-cell"></td>
					</template>
					<td class="px-1 py-2">
						<dropdown v-if="songs[song.id]">
							<router-link
								:to="{ name: 'song-show', params: { id: song.id }}"
								class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
							>
								<eye-icon class="w-5 h-5 stroke-1.5" />
								{{ t('button.show') }}
							</router-link>
							<button
								v-if="user && role > 1"
								class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
								@click.prevent="emit('editSong', songs[song.id], song.id, true)"
							>
								<edit-icon class="w-5 h-5 stroke-1.5" />
								{{ t('button.edit') }}
							</button>
							<button
								v-if="user && role > 1"
								class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
								@click.prevent="emit('editSong', songs[song.id], song.id, false)"
							>
								<copy-icon class="w-5 h-5 stroke-1.5" />
								{{ t('button.duplicate') }}
							</button>
						</dropdown>
						<secondary-button
							v-else
							class="flex items-center text-rose-600 hover:bg-opacity-80"
							@click.prevent="removeSong(song.id)"
						>
							<trash-icon class="w-5 h-5" />
						</secondary-button>
					</td>
				</tr>
			</tbody>
		</table>
		<!-- setlist without songs -->
		<div
			v-if="ready.songs && ready.setlists && setlist && setlist.songs.length == 0"
			class="flex flex-col items-center gap-8 mt-4"
		>
			<playlist-icon class="w-12 h-12 stroke-1 text-blade-500" />
			<div class="text-center">
				<div class="text-lg">{{ t('text.emptySetlist') }}</div>
				<div class="text-blade-500">{{ t('text.editSetlistAddSongs') }}</div>
			</div>
			<primary-button
				v-if="user && role > 1"
				@click="emit('editSetlist', setlist, setlist.id, true)"
				class="mt-4"
			>
				{{ t('modal.editSetlist') }}
				<edit-icon class="w-6 h-6 stroke-1.5" />
			</primary-button>
		</div>
		<!-- stats -->
		<div
			v-if="ready.setlists && setlist && setlist.songs.length > 0"
			class="flex flex-col sm:flex-row justify-center sm:justify-start items-center gap-8 mt-4"
		>
			<div class="w-64 max-w-full">
				<div class="flex justify-center items-center gap-2 text-2xl">
					<world-icon />
					{{ t('widget.languages', 2) }}
				</div>
				<doughnut-chart
					:info="{
						number: setlistLanguages.labels.length,
						label: t('widget.languages', setlistLanguages.labels.length),
					}"
					:datasets="setlistLanguages.datasets"
					:labels="setlistLanguages.labels"
				/>
			</div>
			<div class="w-64 max-w-full">
				<div class="flex justify-center items-center gap-2 text-2xl">
					<music-icon />
					{{ t('widget.keys') }}
				</div>
				<doughnut-chart
					:info="{
						number: setlistKeys.labels.length,
						label: t('widget.keys'),
					}"
					:datasets="setlistKeys.datasets"
					:labels="setlistKeys.labels"
				/>
			</div>
		</div>
	</div>
	<!-- access to non-existing setlist -->
	<div v-if="setlistNotFound" class="flex flex-col items-center gap-8 mt-4">
		<error404-icon class="w-12 h-12 stroke-1 text-blade-500" />
		<div class="text-center">
			<div class="text-lg">{{ t('text.setlistNotFound') }}</div>
			<div class="text-blade-500">{{ t('text.setlistDeletedOrBrokenLink') }}</div>
		</div>
		<primary-button @click="router.push({ name: 'setlists' })" class="mt-4">
			{{ t('widget.showAllSetlists') }}
			<playlist-icon class="stroke-1.5" />
		</primary-button>
	</div>
	<!-- unauthorized access -->
	<div v-else-if="!setlistAccess" class="flex flex-col items-center gap-8 mt-4">
		<lock-icon class="w-12 h-12 stroke-1 text-blade-500" />
		<div class="text-center">
			<div class="text-lg">{{ t('text.privateSetlist') }}</div>
			<div class="text-blade-500">{{ t('text.setlistVisibleForCreator') }}</div>
		</div>
		<primary-button @click="router.push({ name: 'setlists' })" class="mt-4">
			{{ t('widget.showAllSetlists') }}
			<playlist-icon class="stroke-1.5" />
		</primary-button>
	</div>
	<!-- modals -->
	<setlist-delete
		:active="modal.delete"
		:title="setlist ? setlist.title : ''"
		:id="setlistKey"
		@closed="modal.delete = false"
	/>
	<setlist-present
		:active="modal.present"
		:songs="setlistSongs"
		:sync="setlist.active"
		:position="setlist.position"
		:chords="chords"
		:remote-hide="setlist.remoteHide"
		:remote-light="setlist.remoteLight"
		:remote-text="setlist.remoteText"
		@chords="chords = !chords"
		@closed="modal.present = false"
		@update-position="updatePosition"
		@update-hide="updateHide"
		@update-dark="updateDark"
		@update-chords="updateChords"
	/>
</template>

<script setup>
import { keyScale, parsedContent, humanDate, throwError } from '@/utils.js';
import { notify } from '@kyvg/vue3-notification';
import { ref, reactive, computed, inject, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import DoughnutChart from '@/charts/DoughnutChart';
import Dropdown from '@/elements/Dropdown';
import firebase from 'firebase/compat/app';
import PrimaryButton from '@/elements/PrimaryButton';
import SecondaryButton from '@/elements/SecondaryButton';
import SetlistDelete from '@/modals/SetlistDelete';
import SetlistPresent from '@/modals/SetlistPresent';

// icons
import {
	ArrowLeftIcon,
	ArrowRightIcon,
	BrandSlackIcon,
	CalendarEventIcon,
	ChevronDownIcon,
	ClipboardIcon,
	CopyIcon,
	DownloadIcon,
	EditIcon,
	Error404Icon,
	ExternalLinkIcon,
	EyeIcon,
	FilesIcon,
	FileTextIcon,
	LockIcon,
	MarkdownIcon,
	MenuOrderIcon,
	MusicIcon,
	MusicOffIcon,
	PlaylistIcon,
	PresentationIcon,
	RefreshIcon,
	RefreshOffIcon,
	TrashIcon,
	TxtIcon,
	UserIcon,
	WorldIcon,
} from 'vue-tabler-icons';

// component constants
const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();
const setlistKey = route.params.id;

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
const emit = defineEmits(['started', 'editSong', 'editSetlist']);

// component properties
const props = defineProps({
  config:        Object,
  languages:     Object,
  permissions:   Object,
  ready:         Object,
  registrations: Object,
  role:          Number,
  roleName:      String,
  setlists:      Object,
  songs:         Object,
  tags:          Object,
  user:          String,
  userObject:    Object,
  users:         Object,
});

// reactive data
const existing = ref(true);
const chords   = ref(true);
const modal = reactive({
	set: false,
	delete: false,
	present: false,
});

// template references
const container = ref(null);

// focus container on mount to target shortcuts
onMounted(() => {
	// focus component area for shortcuts
	container.value?.focus();
});

// retrieve setlist object to show
const setlist = computed(() => {
	if (props.ready.setlists) {
		return props.setlists[setlistKey];
	}
	return null;
});

// retrieve setlist song objects and apply custom song keys
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

// build data object for song languages doughnut chart
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
			{ label: t('page.songs', 2), data: Object.values(languages), color: '#88b544' },
		],
		labels: Object.keys(languages).map(e => props.languages[e]?.label)
	};
});

// build data object for song keys doughnut chart
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
			{ label: t('page.songs', 2), data: Object.values(keys), color: '#88b544' },
		],
		labels: Object.keys(keys)
	};
});

// true if this setlist is accessible for current user
const setlistAccess = computed(() => {
	return props.ready.setlists
		&& (setlistKey in props.setlists)
		&& setlist.value
		&& (!setlist.value.private || setlist.value.private && setlist.value.creator == props.user);
});

// true if this setlist is not part in collection
const setlistNotFound = computed(() => {
	return props.ready.setlists && !(setlistKey in props.setlists);
});

// handle drag and drop reorder event and save new order for setlist
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

// transpose key of given song up and save new key for setlist
const transposeUp = (song, songPosition) => {
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

// transpose key of given song down and save new key for setlist
const transposeDown = (song, songPosition) => {
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

// remove a song from setlist, currently used only for deleted songs
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

// toggle and save setlist's active flag to enable or disable sync
const updateActive = () => {
	setlist.value.active = !setlist.value.active;
	const sync = setlist.value.active;
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

// save setlist presentation slide position when sync is enabled
const updatePosition = (val) => {
	if (setlist.value.active) {
		db.collection('setlists').doc(route.params.id).set({ position: val }, { merge: true });
	}
};

// save setlist chords visibility when sync is enabled
const updateChords = (val) => {
	if (setlist.value.active) {
		db.collection('setlists').doc(route.params.id).set({ remoteText: val }, { merge: true });
	}
};

// save setlist theme mode when sync enabled
const updateDark = (val) => {
	if (setlist.value.active) {
		db.collection('setlists').doc(route.params.id).set({ remoteLight: val }, { merge: true });
	}
};

// save setlist content visibility when sync enabled
const updateHide = (val) => {
	if (setlist.value.active) {
		db.collection('setlists').doc(route.params.id).set({ remoteHide: val }, { merge: true });
	}
};

// handle dialog modals
const deleteDialog = () => {
	modal.delete = true;
};

// copy list to clipboard in given format (plain|markdown|slack)
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

// download pdf in given mode (sheets|list)
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
		+ (mode == 'sheets' ? t('text.songsheets') : t('text.list')).toLowerCase()
		+ '.pdf'
	);
	// toast success message
	notify({
		title: t('toast.exportedPdf'),
		text: t('toast.exportedSetlistPdfText'),
		type: 'primary'
	});
};

// create pdfMake object for list
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

// create pdfMake object for songsheets
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
</script>
