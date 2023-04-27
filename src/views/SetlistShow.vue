<template>
	<div
		v-if="setlistAccess"
		class="flex flex-col gap-6 w-full focus:outline-none"
	>
		<!-- page heading -->
		<div class="flex flex-col justify-between items-stretch gap-4">
			<!-- title and visible setlist count -->
			<div
				v-if="ready.setlists && setlist"
				class="text-3xl uppercase font-thin tracking-wider"
			>
				<span class="font-semibold mr-4">{{ setlist.title }}</span>
				<span class="inline-block whitespace-nowrap">
					{{ t('object.song', setlist.songs.length, { n: setlist.songs.length }) }}
				</span>
			</div>
			<!-- setlist meta data -->
			<div class="flex flex-wrap gap-x-4 gap-y-2 -mt-2 -mb-2">
				<div
					v-if="setlist.private"
					class="text-spring-600 flex items-center gap-2"
					:title="t('tooltip.setlistPrivate')"
				>
					<icon-lock />
					{{ t('option.private') }}
				</div>
				<div class="text-blade-500 flex items-center gap-2">
					<icon-calendar-event />
					{{ humanDate(setlist.date, locale) }}
				</div>
				<div v-if="ready.users && users[setlist.creator]" class="text-blade-500 flex items-center gap-2">
					<icon-user />
					{{ users[setlist.creator].name }}
				</div>
			</div>
		</div>
		<!-- toolbar -->
		<div class="flex justify-between align-center w-full bg-blade-200 dark:bg-blade-900 rounded-lg p-2 gap-1">
			<div class="flex align-center gap-1">
				<secondary-button :title="t('button.back')" @click="router.go(-1)">
					<icon-arrow-left />
					<span class="hidden xl:inline">{{ t('button.back') }}</span>
				</secondary-button>
			</div>
			<div class="flex items-center gap-1">
				<secondary-button
					v-if="setlist && user && role > 1"
					:title="setlist?.active ? t('tooltip.syncOn') : t('tooltip.syncOff')"
					:disabled="noSongs"
					@click="updateActive"
				>
					<icon-refresh v-if="setlist?.active === true" class="stroke-spring-400" />
					<icon-refresh-off v-else />
					<span class="hidden xl:inline">{{ t('switch.sync') }}</span>
				</secondary-button>
				<secondary-button
					:title="chords ? t('tooltip.chordsHide') : t('tooltip.chordsShow')"
					@click="chords = !chords"
				>
					<icon-music v-if="chords" class="stroke-spring-400" />
					<icon-music-off v-else />
					<span class="hidden xl:inline">{{ t('switch.chords') }}</span>
				</secondary-button>
				<secondary-button
					:title="t('tooltip.startFullscreen')"
					:disabled="noSongs"
					@click="modal.present=true"
				>
					<icon-presentation />
					<span class="hidden xl:inline">{{ t('button.present') }}</span>
				</secondary-button>
				<router-link
					:to="{ name: 'setlist-show', params: { id: setlistKey }}"
					target="_blank"
					:title="t('tooltip.openInNewTab')"
				>
					<secondary-button>
						<icon-external-link />
						<span class="hidden xl:inline">{{ t('button.open') }}</span>
					</secondary-button>
				</router-link>
			</div>
			<div class="flex align-center gap-1">
				<div class="hidden sm:block">
					<dropdown>
						<template #trigger>
							<secondary-button class="h-full" :title="t('tooltip.copySetlist')">
								<icon-clipboard class="w-5 h-5 stroke-1.5" />
								<span class="hidden xl:inline">{{ t('button.copy') }}</span>
								<icon-chevron-down class="w-5 h-5 stroke-1.5" />
							</secondary-button>
						</template>
						<template #default>
							<button
								class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
								@click="copyList('plain')"
							>
								<icon-txt class="w-5 h-5 stroke-1.5" />
								{{ t('button.formatPlain') }}
							</button>
							<button
								class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
								@click="copyList('markdown')"
							>
								<icon-markdown class="w-5 h-5 stroke-1.5" />
								{{ t('button.formatMarkdown') }}
							</button>
							<button
								class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
								@click="copyList('slack')"
							>
								<icon-brand-slack class="w-5 h-5 stroke-1.5" />
								{{ t('button.formatSlack') }}
							</button>
						</template>
					</dropdown>
				</div>
				<div class="hidden sm:block">
					<dropdown>
						<template #trigger>
							<secondary-button class="h-full" :title="t('tooltip.downloadSetlist')">
								<icon-download class="w-5 h-5 stroke-1.5" />
								<span class="hidden xl:inline">{{ t('button.download') }}</span>
								<icon-chevron-down class="w-5 h-5 stroke-1.5" />
							</secondary-button>
						</template>
						<template #default>
							<button
								class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
								@click="exportPdf('list')"
							>
								<icon-file-text class="w-5 h-5 stroke-1.5" />
								{{ t('button.exportSetlistList') }}
							</button>
							<button
								class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
								@click="exportPdf('sheets')"
							>
								<icon-files class="w-5 h-5 stroke-1.5" />
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
							@click.stop="emit('editSetlist', { data: setlist, id: setlistKey, exists: true })"
						>
							<icon-edit class="w-5 h-5 stroke-1.5" />
							{{ t('button.edit') }}
						</button>
						<button
							v-if="user && role > 1"
							class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
							@click.prevent="emit('editSetlist', { data: setlist, id: setlistKey, exists: false })"
						>
							<icon-copy class="w-5 h-5 stroke-1.5" />
							{{ t('button.duplicate') }}
						</button>
						<button
							v-if="user && role > 2"
							class="px-3 py-2 w-full flex items-center gap-3 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30"
							@click.prevent="deleteDialog(setlist)"
						>
							<icon-trash class="w-5 h-5 stroke-1.5" />
							{{ t('button.delete') }}
						</button>
						<button
							class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750 sm:hidden"
							@click="copyList('plain')"
						>
							<icon-txt class="w-5 h-5 stroke-1.5" />
							{{ t('button.formatPlain') }}
						</button>
						<button
							class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750 sm:hidden"
							@click="copyList('markdown')"
						>
							<icon-markdown class="w-5 h-5 stroke-1.5" />
							{{ t('button.formatMarkdown') }}
						</button>
						<button
							class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750 sm:hidden"
							@click="copyList('slack')"
						>
							<icon-brand-slack class="w-5 h-5 stroke-1.5" />
							{{ t('button.formatSlack') }}
						</button>
						<button
							class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750 sm:hidden"
							@click="exportPdf('list')"
						>
							<icon-file-text class="w-5 h-5 stroke-1.5" />
							{{ t('button.exportSetlistList') }}
						</button>
						<button
							class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750 sm:hidden"
							@click="exportPdf('sheets')"
						>
							<icon-files class="w-5 h-5 stroke-1.5" />
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
			<draggable
				v-model="setlist.songs"
				tag="tbody"
				item-key="id"
				handle=".handle"
				ghost-class="!bg-blade-950"
				@end="saveOrder"
			>
				<template #item="{ element, index }">
					<tr
						class="even:bg-blade-200/50 even:dark:bg-blade-900/50 hover:bg-blade-200 hover:dark:bg-blade-900 transition-all"
					>
						<td v-if="user && role > 1" class="cursor-grab active:cursor-grabbing text-center text-blade-500">
							<icon-menu-order class="handle inline" />
						</td>
						<template v-if="songs[element.id]">
							<td
								class="cursor-pointer px-3 py-2 max-w-0"
								@click="router.push({
									name: 'song-show',
									params: {
										id: element.id,
										key: element.tuning ? element.tuning : songs[element.id].tuning,
										setlist: setlistKey,
									}
								})"
							>
								<div class="truncate">
									<span>{{ songs[element.id].title }}</span>
									<span class="text-blade-500 ml-3">{{ songs[element.id].subtitle }}</span>
								</div>
							</td>
							<td
								class="cursor-pointer px-3 py-2 max-w-0 hidden 2xl:table-cell"
								@click="router.push({ name: 'song-show', params: { id: element.id, key: element.tuning ? element.tuning : songs[element.id].tuning }})"
							>
								<div class="truncate">{{ songs[element.id].authors }}</div>
							</td>
							<td class="px-3 py-2">
								<div class="flex justify-center items-center gap-3">
									<secondary-button
										v-if="user && role > 1"
										class="!px-2"
										@click.prevent="transposeDown(songs[element.id], index)"
									>
										<icon-chevron-left class="w-5 h-5" />
									</secondary-button>
									<div class="font-mono font-semibold text-xl w-6 text-center">
										{{ element.tuning ? element.tuning : songs[element.id].tuning }}
									</div>
									<secondary-button
										v-if="user && role > 1"
										class="!px-2"
										@click.prevent="transposeUp(songs[element.id], index)"
									>
										<icon-chevron-right class="w-5 h-5" />
									</secondary-button>
								</div>
							</td>
							<td class="px-3 py-2 hidden xl:table-cell text-center">
								<div class="uppercase">{{ songs[element.id].language }}</div>
							</td>
							<td class="px-3 py-2 hidden md:table-cell">
								<a
									class="text-spring-600"
									:href="'https://songselect.ccli.com/Songs/' + songs[element.id].ccli"
									target="_blank"
								>
									{{ songs[element.id].ccli }}
								</a>
							</td>
						</template>
						<template v-else>
							<td colspan="2" class="px-3 py-2 max-w-0">
								<div class="truncate">
									<span class="text-rose-600">{{ t('toast.songDeleted') }}</span>
									<span class="text-blade-500 font-mono text-sm ml-3">{{ element.id }}</span>
								</div>
							</td>
							<td class="hidden 2xl:table-cell"></td>
							<td class="hidden xl:table-cell"></td>
							<td class="hidden md:table-cell"></td>
						</template>
						<td class="px-1 py-2">
							<dropdown v-if="songs[element.id]">
								<router-link
									:to="{ name: 'song-show', params: { id: element.id }}"
									class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
								>
									<icon-eye class="w-5 h-5 stroke-1.5" />
									{{ t('button.show') }}
								</router-link>
								<button
									v-if="user && role > 1"
									class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
									@click.prevent="emit('editSong', { data: songs[element.id], id: element.id, exists: true })"
								>
									<icon-edit class="w-5 h-5 stroke-1.5" />
									{{ t('button.edit') }}
								</button>
								<button
									v-if="user && role > 1"
									class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
									@click.prevent="emit('editSong', { data: songs[element.id], id: element.id, exists: false })"
								>
									<icon-copy class="w-5 h-5 stroke-1.5" />
									{{ t('button.duplicate') }}
								</button>
							</dropdown>
							<secondary-button
								v-else
								class="flex items-center !text-rose-600 hover:bg-opacity-80"
								@click.prevent="removeSong(element.id)"
							>
								<icon-trash class="w-5 h-5" />
							</secondary-button>
						</td>
					</tr>
				</template>
			</draggable>
		</table>
		<!-- setlist without songs -->
		<div
			v-if="noSongs"
			class="flex flex-col items-center gap-8 mt-4"
		>
			<icon-playlist class="w-12 h-12 stroke-1 text-blade-500" />
			<div class="text-center">
				<div class="text-lg">{{ t('text.emptySetlist') }}</div>
				<div class="text-blade-500">{{ t('text.editSetlistAddSongs') }}</div>
			</div>
			<primary-button
				v-if="user && role > 1"
				@click="emit('editSetlist', { data: setlist, id: setlistKey, exists: true })"
				class="mt-4"
			>
				{{ t('modal.editSetlist') }}
				<icon-edit class="w-6 h-6 stroke-1.5" />
			</primary-button>
		</div>
		<!-- stats -->
		<div
			v-if="ready.setlists && setlist && setlist.songs.length > 0"
			class="flex flex-col sm:flex-row justify-center sm:justify-start items-center gap-8 mt-4"
		>
			<div class="w-64 max-w-full">
				<div class="flex justify-center items-center gap-2 text-2xl">
					<icon-world />
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
					<icon-music />
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
		<icon-error-404 class="w-14 h-14 stroke-1 text-blade-500" />
		<div class="text-center">
			<div class="text-lg">{{ t('text.setlistNotFound') }}</div>
			<div class="text-blade-500">{{ t('text.setlistDeletedOrBrokenLink') }}</div>
		</div>
		<primary-button @click="router.push({ name: 'setlists' })" class="mt-4">
			{{ t('widget.showAllSetlists') }}
			<icon-playlist class="stroke-1.5" />
		</primary-button>
	</div>
	<!-- unauthorized access -->
	<div v-else-if="!setlistAccess" class="flex flex-col items-center gap-8 mt-4">
		<icon-lock class="w-12 h-12 stroke-1 text-blade-500" />
		<div class="text-center">
			<div class="text-lg">{{ t('text.privateSetlist') }}</div>
			<div class="text-blade-500">{{ t('text.setlistVisibleForCreator') }}</div>
		</div>
		<primary-button @click="router.push({ name: 'setlists' })" class="mt-4">
			{{ t('widget.showAllSetlists') }}
			<icon-playlist class="stroke-1.5" />
		</primary-button>
	</div>
	<!-- modals -->
	<setlist-delete
		:active="modal.delete"
		:title="setlist?.title"
		:id="setlistKey"
		@closed="modal.delete = false"
	/>
	<setlist-present
		:active="modal.present"
		:songs="setlistSongs"
		:sync="setlist?.active"
		:position="setlist?.position"
		:chords="chords"
		:remote-hide="setlist?.remoteHide"
		:remote-light="setlist?.remoteLight"
		:remote-text="setlist?.remoteText"
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
import { logicAnd } from '@vueuse/math';
import { notify } from '@kyvg/vue3-notification';
import { ref, reactive, computed, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { whenever } from '@vueuse/core';
import DoughnutChart from '@/charts/DoughnutChart.vue';
import draggable from 'vuedraggable';
import Dropdown from '@/elements/Dropdown.vue';
import firebase from 'firebase/compat/app';
import pdfMake from "pdfmake/build/pdfmake";
import PrimaryButton from '@/elements/PrimaryButton.vue';
import SecondaryButton from '@/elements/SecondaryButton.vue';
import SetlistDelete from '@/modals/SetlistDelete.vue';
import SetlistPresent from '@/modals/SetlistPresent.vue';

// icons
import {
	IconArrowLeft,
	IconBrandSlack,
	IconCalendarEvent,
	IconChevronDown,
	IconChevronLeft,
	IconChevronRight,
	IconClipboard,
	IconCopy,
	IconDownload,
	IconEdit,
	IconError404,
	IconExternalLink,
	IconEye,
	IconFiles,
	IconFileText,
	IconLock,
	IconMarkdown,
	IconMenuOrder,
	IconMusic,
	IconMusicOff,
	IconPlaylist,
	IconPresentation,
	IconRefresh,
	IconRefreshOff,
	IconTrash,
	IconTxt,
	IconUser,
	IconWorld,
} from '@tabler/icons-vue';

// component constants
const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();
const setlistKey = route.params.id;

// handle hotkeys for this component
const hkChords = inject('hkChords');
const hkSync = inject('hkSync');
const hkPresent = inject('hkPresent');
const noActiveModal = inject('noActiveModal');

// pdf creation
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
const chords = ref(true);
const modal = reactive({
	set: false,
	delete: false,
	present: false,
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

// true if this setlist is not part in collection
const noSongs = computed(() => {
	return props.ready.songs && props.ready.setlists && setlist.value && setlist.value.songs.length == 0;
});

// save new song order for setlist
const saveOrder = () => {
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
			text: (new Date(setlist.value.date)).toLocaleDateString(
				locale.value,
				{ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
			),
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

// component shortcuts
whenever(
	logicAnd(hkChords, noActiveModal),
	() => chords.value = !chords.value
);
whenever(
	logicAnd(hkSync, noActiveModal),
	() => !modal.present ? updateActive() : null
);
whenever(
	logicAnd(hkPresent, noActiveModal),
	() => modal.present = true
);
</script>
