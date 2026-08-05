<template>
	<div>
		<div v-if="setlist" class="flex flex-col gap-6 w-full focus:outline-hidden">
			<!-- page heading -->
			<div class="flex flex-col justify-between items-stretch gap-4">
				<!-- title and visible setlist count -->
				<div class="text-3xl uppercase font-thin tracking-wider flex flex-wrap gap-6">
					<span class="font-semibold">{{ setlist.entity.title }}</span>
					<span class="inline-block whitespace-nowrap">
						{{ t('object.song', songCount, { named: { n: songCount } }) }}
					</span>
				</div>
				<!-- setlist meta data -->
				<div class="flex flex-wrap gap-x-4 gap-y-2 -mt-2 -mb-2">
					<div
						v-if="!setlist.entity.isPublic"
						class="text-spring-600 flex items-center gap-2"
						:title="t('tooltip.setlistPrivate')"
					>
						<icon-lock class="w-5 h-5 stroke-1.5" />
						{{ t('option.private') }}
					</div>
					<div class="text-blade-500 flex items-center gap-2">
						<icon-calendar-event class="w-5 h-5 stroke-1.5" />
						{{ humanDate(setlist.entity.date, locale) }}
					</div>
					<div v-if="users[setlist.entity.createdBy]" class="text-blade-500 flex items-center gap-2">
						<icon-user class="w-5 h-5 stroke-1.5" />
						{{ users[setlist.entity.createdBy].name }}
					</div>
				</div>
			</div>
			<!-- toolbar -->
			<div class="flex justify-between align-center w-full bg-blade-200 dark:bg-blade-900 rounded-lg p-2 gap-1">
				<div class="flex align-center gap-1">
					<secondary-button :title="t('button.back')" @click="router.go(-1)">
						<icon-arrow-left class="w-5 h-5 stroke-1.5" />
						<span class="hidden xl:inline">{{ t('button.back') }}</span>
					</secondary-button>
				</div>
				<div class="flex items-center gap-1">
					<secondary-button
						v-if="canUpdateSetlist"
						:title="setlist.entity.active ? t('tooltip.syncOn') : t('tooltip.syncOff')"
						:disabled="noSongs"
						@click="updateActive"
					>
						<icon-refresh v-if="setlist.entity.active === true" class="w-5 h-5 stroke-1.5 stroke-spring-400" />
						<icon-refresh-off v-else class="w-5 h-5 stroke-1.5" />
						<span class="hidden xl:inline">{{ t('switch.sync') }}</span>
					</secondary-button>
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
						:disabled="noSongs"
						@click="modal.present=true"
					>
						<icon-presentation class="w-5 h-5 stroke-1.5" />
						<span class="hidden xl:inline">{{ t('button.present') }}</span>
					</secondary-button>
					<router-link
						:to="{ name: 'setlist-show', params: { id: setlistKey }}"
						target="_blank"
						:title="t('tooltip.openInNewTab')"
					>
						<secondary-button>
							<icon-external-link class="w-5 h-5 stroke-1.5" />
							<span class="hidden xl:inline">{{ t('button.open') }}</span>
						</secondary-button>
					</router-link>
				</div>
				<div class="flex align-center gap-1">
					<div class="hidden sm:block">
						<drop-down>
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
						</drop-down>
					</div>
					<div class="hidden sm:block">
						<drop-down>
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
								<button
									class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
									@click="exportOsz()"
								>
									<icon-file class="w-5 h-5 stroke-1.5" />
									{{ t('button.filetypeOsz') }}
								</button>
							</template>
						</drop-down>
					</div>
					<div class="h-full" :class="{ 'sm:hidden': !canUpdateSetlist }">
						<drop-down>
							<button
								v-if="canUpdateSetlist"
								class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
								@click.stop="emit('editSetlist', { data: setlist.entity, id: setlist.entity.slug, exists: true })"
							>
								<icon-edit class="w-5 h-5 stroke-1.5" />
								{{ t('button.edit') }}
							</button>
							<button
								v-if="can('createSetlists', user.roles)"
								class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
								@click.prevent="emit('editSetlist', { data: setlist.entity, id: setlist.entity.slug, exists: false })"
							>
								<icon-copy class="w-5 h-5 stroke-1.5" />
								{{ t('button.duplicate') }}
							</button>
							<button
								v-if="canUpdateSetlist"
								class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
								@click.prevent="openAddSlide()"
							>
								<icon-notes class="w-5 h-5 stroke-1.5" />
								{{ t('button.addSlide') }}
							</button>
							<button
								v-if="canDeleteSetlist"
								class="px-3 py-2 w-full flex items-center gap-3 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30"
								@click.prevent="deleteDialog()"
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
						</drop-down>
					</div>
				</div>
			</div>
			<!-- song list -->
			<table
				v-if="setlist.entity.entries.length > 0"
				class="w-full"
			>
				<thead>
					<tr>
						<th v-if="canUpdateSetlist" class="w-11"></th>
						<th class="uppercase p-2 font-normal">{{ t('field.title') }}</th>
						<th class="uppercase p-2 font-normal w-20 text-center">{{ t('field.key') }}</th>
						<th class="uppercase p-2 font-normal w-96 hidden 2xl:table-cell">{{ t('field.authors') }}</th>
						<th class="uppercase p-2 font-normal w-20 hidden xl:table-cell">{{ t('field.language') }}</th>
						<th class="uppercase p-2 font-normal w-20 hidden md:table-cell">{{ t('field.youtube') }}</th>
						<th class="uppercase p-2 font-normal w-20 hidden md:table-cell">{{ t('field.ccli') }}</th>
						<th class="w-11"></th>
					</tr>
				</thead>
				<draggable
					v-model="setlist.entity.entries"
					tag="tbody"
					:item-key="(el: SetlistEntry) => isSlide(el) ? `slide-${setlist!.entity.entries.indexOf(el)}` : el.id"
					handle=".handle"
					ghost-class="bg-blade-950!"
					@end="saveOrder"
				>
					<template #item="{ element, index }">
						<tr
							class="even:bg-blade-200/50 dark:even:bg-blade-900/50 hover:bg-blade-200 dark:hover:bg-blade-900 transition-all"
						>
							<td v-if="canUpdateSetlist" class="cursor-grab active:cursor-grabbing text-center text-blade-500">
								<icon-menu-order class="w-5 h-5 stroke-1.5 handle inline" />
							</td>
							<template v-if="isSlide(element)">
								<td class="px-3 py-2 max-w-0" colspan="2">
									<div class="truncate">
										<span>{{ element.title }}</span>
										<span class="text-blade-500 ml-3">{{ element.content }}</span>
									</div>
								</td>
								<td class="hidden 2xl:table-cell"></td>
								<td class="hidden xl:table-cell"></td>
								<td class="hidden md:table-cell"></td>
								<td class="hidden md:table-cell"></td>
							</template>
							<template v-else-if="findSong(element.id)">
								<td
									class="cursor-pointer px-3 py-2 max-w-0"
									@click="router.push({
										name: 'song-show',
										params: {
											id: element.id,
											key: element.key ? element.key : findSong(element.id)!.key,
											setlist: setlistKey,
										}
									})"
								>
									<div class="truncate">
										<span>{{ findSong(element.id)!.title }}</span>
										<span class="text-blade-500 ml-3">{{ findSong(element.id)!.subtitle }}</span>
									</div>
								</td>
								<td class="px-3 py-2">
									<div class="flex justify-center items-center gap-3">
										<secondary-button
											v-if="canUpdateSetlist"
											class="px-2!"
											@click.prevent="transposeDown(findSong(element.id)!, index)"
										>
											<icon-chevron-left class="w-5 h-5 stroke-1.5" />
										</secondary-button>
										<div class="font-mono font-semibold text-xl w-6 text-center">
											{{ element.key ? element.key : findSong(element.id)!.key }}
										</div>
										<secondary-button
											v-if="canUpdateSetlist"
											class="px-2!"
											@click.prevent="transposeUp(findSong(element.id)!, index)"
										>
											<icon-chevron-right class="w-5 h-5 stroke-1.5" />
										</secondary-button>
									</div>
								</td>
								<td
									class="cursor-pointer px-3 py-2 max-w-0 hidden 2xl:table-cell"
									@click="router.push({
										name: 'song-show',
										params: {
											id: element.id,
											key: element.key ? element.key : findSong(element.id)!.key,
											setlist: setlistKey,
										}
									})"
								>
									<div class="truncate">{{ findSong(element.id)!.authors?.join(' | ') ?? '' }}</div>
								</td>
								<td class="px-3 py-2 hidden xl:table-cell text-center">
									<div class="uppercase">{{ findSong(element.id)!.language }}</div>
								</td>
								<td class="px-3 py-2 hidden md:table-cell text-center">
									<a
										v-if="findSong(element.id)!.youtube"
										class="text-red-600 inline-flex align-middle"
										:href="'https://youtu.be/' + findSong(element.id)!.youtube"
										target="_blank"
									>
										<icon-brand-youtube class="w-6 h-6 stroke-1.5" />
									</a>
								</td>
								<td class="px-3 py-2 hidden md:table-cell">
									<a
										v-if="findSong(element.id)!.ccli"
										class="text-spring-600"
										:href="'https://songselect.ccli.com/Songs/' + findSong(element.id)!.ccli"
										target="_blank"
									>
										{{ findSong(element.id)!.ccli }}
									</a>
								</td>
							</template>
							<template v-else>
								<td colspan="6" class="px-3 py-2 max-w-0">
									<div class="truncate">
										<span class="text-rose-600">{{ t('toast.songDeleted') }}</span>
										<span class="text-blade-500 font-mono text-sm ml-3">{{ element.id }}</span>
									</div>
								</td>
							</template>
							<td class="px-1 py-2">
								<drop-down v-if="isSlide(element)">
									<button
										v-if="canUpdateSetlist"
										class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
										@click.prevent="openEditSlide(index, element)"
									>
										<icon-edit class="w-5 h-5 stroke-1.5" />
										{{ t('button.edit') }}
									</button>
								</drop-down>
								<drop-down v-else-if="findSong(element.id)">
									<router-link
										:to="{ name: 'song-show', params: { id: element.id }}"
										class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
									>
										<icon-eye class="w-5 h-5 stroke-1.5" />
										{{ t('button.show') }}
									</router-link>
									<button
										v-if="can('updateSongs', user.roles)"
										class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
										@click.prevent="emit('editSong', { data: findSong(element.id), id: element.id, exists: true })"
									>
										<icon-edit class="w-5 h-5 stroke-1.5" />
										{{ t('button.edit') }}
									</button>
									<button
										v-if="can('createSongs', user.roles)"
										class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
										@click.prevent="emit('editSong', { data: findSong(element.id), id: element.id, exists: false })"
									>
										<icon-copy class="w-5 h-5 stroke-1.5" />
										{{ t('button.duplicate') }}
									</button>
								</drop-down>
								<secondary-button
									v-else
									class="flex items-center"
									type="danger"
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
					v-if="canUpdateSetlist"
					@click="emit('editSetlist', { data: setlist.entity, id: setlist.entity.slug, exists: true })"
					class="mt-4"
				>
					{{ t('modal.editSetlist') }}
					<icon-edit class="w-6 h-6 stroke-1.5" />
				</primary-button>
			</div>
			<!-- stats -->
			<div
				v-if="setlist.entity.entries.length > 0"
				class="flex flex-col sm:flex-row justify-center sm:justify-start items-center gap-8 mt-4"
			>
				<div class="w-64 max-w-full">
					<div class="flex justify-center items-center gap-2 text-2xl">
						<icon-world class="w-6 h-6 stroke-1.5" />
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
						<icon-music class="w-6 h-6 stroke-1.5" />
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
		<div v-else class="flex flex-col items-center gap-8 mt-4">
			<icon-error-404 class="w-14 h-14 stroke-1 text-blade-500" />
			<div class="text-center">
				<div class="text-lg">{{ t('text.setlistNotFound') }}</div>
				<div class="text-blade-500">{{ t('text.setlistDeletedOrBrokenLink') }}</div>
			</div>
			<primary-button @click="router.push({ name: 'setlists' })" class="mt-4">
				{{ t('widget.showAllSetlists') }}
				<icon-playlist class="w-5 h-5 stroke-1.5" />
			</primary-button>
		</div>
		<!-- modals -->
		<setlist-delete
			:active="modal.delete"
			:title="setlist?.entity.title"
			:id="setlistKey"
			@closed="modal.delete = false"
		/>
		<slide-set
			:active="modal.slide"
			:initial-slide="slideEdit.data"
			@closed="modal.slide = false"
			@save="saveSlide"
		/>
		<setlist-present
			:active="modal.present"
			:songs="setlistSongs"
			:sync="setlist?.entity.active"
			:position="setlist?.entity.position"
			:chords="chords"
			:remote-hide="setlist?.entity.remoteHide"
			:remote-light="setlist?.entity.remoteLight"
			:remote-text="setlist?.entity.remoteText"
			@chords="chords = !chords"
			@closed="modal.present = false"
			@update-position="updatePosition"
			@update-hide="updateHide"
			@update-dark="updateDark"
			@update-chords="updateChords"
		/>
	</div>
</template>

<script setup lang="ts">
import { injectStrict, hkChordsKey, hkPresentKey, hkSyncKey, noActiveModalKey, setlistCollectionKey, setlistsKey, songsKey, userKey, usersKey, versionKey } from '@/keys';
import { keyScale, parsedContent, humanDate, throwError, download, openLyricsXML, firstParam, isSlide } from '@/utils.js';
import type { ThrowableError, SetlistSongPresentation } from '@/definitions';
import { logicAnd } from '@vueuse/math';
import { notify } from '@kyvg/vue3-notification';
import { ref, reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { whenever } from '@vueuse/core';
import { can } from '@backend/definitions';
import type { SongEntity, SetlistEntry, SetlistSlide, SetlistSong } from '@backend/models';
import DoughnutChart from '@/charts/DoughnutChart.vue';
import draggable from 'vuedraggable';
import DropDown from '@/elements/DropDown.vue';
import { BlobWriter, ZipWriter, TextReader } from '@zip.js/zip.js';
import pdfMake from 'pdfmake/build/pdfmake';
import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import PrimaryButton from '@/elements/PrimaryButton.vue';
import SecondaryButton from '@/elements/SecondaryButton.vue';
import SetlistDelete from '@/modals/SetlistDelete.vue';
import SetlistPresent from '@/modals/SetlistPresent.vue';
import SlideSet from '@/modals/SlideSet.vue';

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
	IconFile,
	IconFileText,
	IconLock,
	IconMarkdown,
	IconMenuOrder,
	IconMusic,
	IconMusicOff,
	IconNotes,
	IconPlaylist,
	IconPresentation,
	IconRefresh,
	IconRefreshOff,
	IconTrash,
	IconTxt,
	IconUser,
	IconWorld,
	IconBrandYoutube,
} from '@tabler/icons-vue';

// component constants
const { t, locale } = useI18n();
const loc = locale.value.substring(0, 2);
const route = useRoute();
const router = useRouter();
const setlistKey = firstParam(route.params.id) ?? ''; // slug from the url, for lookup only

// handle hotkeys for this component
const hkChords = injectStrict(hkChordsKey);
const hkSync = injectStrict(hkSyncKey);
const hkPresent = injectStrict(hkPresentKey);
const noActiveModal = injectStrict(noActiveModalKey);
const version = injectStrict(versionKey);

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
const setlists = injectStrict(setlistsKey);
const songs = injectStrict(songsKey);
const user = injectStrict(userKey);
const users = injectStrict(usersKey);
const setlistCollection = injectStrict(setlistCollectionKey);
const emit = defineEmits(['editSong', 'editSetlist']);

// reactive data
const chords = ref(true);
const modal = reactive({
	set: false,
	delete: false,
	present: false,
	slide: false,
});

// currently edited slide: index -1 means a new slide is being added
const slideEdit = ref<{ index: number; data: SetlistSlide | null }>({ index: -1, data: null });

// retrieve setlist object to show (the wrapper, since writes need .id/.changeNumber)
const setlist = computed(() => setlists.value.find(s => s.entity.slug === setlistKey));

// find a song's entity by id
const findSong = (id?: string) => songs.value.find(s => s.id === id)?.entity;

// current user's permissions on this setlist, mirroring the backend's ownership/visibility rules
const canUpdateSetlist = computed(() => !!setlist.value && can('updateSetlists', user.value.roles, {
	userId: user.value.id,
	ownerId: setlist.value.entity.createdBy,
	isPublic: setlist.value.entity.isPublic,
}));
const canDeleteSetlist = computed(() => !!setlist.value && can('deleteSetlists', user.value.roles, {
	userId: user.value.id,
	ownerId: setlist.value.entity.createdBy,
}));

// retrieve setlist song entities (only existing ones) with custom key overrides applied
const setlistSongs = computed<SetlistSongPresentation[]>(() => {
	const result: SetlistSongPresentation[] = [];
	for (const setlistSong of setlist.value?.entity.entries ?? []) {
		if (isSlide(setlistSong)) continue;
		const song = findSong(setlistSong.id);
		if (!song) continue; // song was deleted
		const setlistTuning = setlistSong.key;
		// '' is the "no custom tuning" sentinel (see SetlistSet.vue's addSong);
		// no other value stored here ever numerically coerces to 0
		const customTuningDelta = setlistTuning !== ''
			? keyScale.indexOf(setlistTuning) - keyScale.indexOf(song.key ?? '')
			: 0;
		const customTuning = setlistTuning !== '' ? setlistTuning : (song.key ?? '');
		result.push({ ...song, customTuningDelta, customTuning });
	}
	return result;
});

// build data object for song languages doughnut chart
const setlistLanguages = computed(() => {
	let languages: Record<string, number> = {};
	for (let i = 0; i < setlistSongs.value.length; i++) {
		const song = setlistSongs.value[i];
		if (!languages.hasOwnProperty(song.language)) {
			languages[song.language] = 0;
		}
		languages[song.language]++;
	}
	return {
		datasets: [
			{ label: t('page.songs', 2), data: Object.values(languages), borderColor: '#88b544' },
		],
		labels: Object.keys(languages).map(e => t('language.' + e))
	};
});

// build data object for song keys doughnut chart
const setlistKeys = computed(() => {
	let keys: Record<string, number> = {};
	for (let i = 0; i < setlistSongs.value.length; i++) {
		const song = setlistSongs.value[i];
		if (!keys.hasOwnProperty(song.customTuning)) {
			keys[song.customTuning] = 0;
		}
		keys[song.customTuning]++;
	}
	return {
		datasets: [
			{ label: t('page.songs', 2), data: Object.values(keys), borderColor: '#88b544' },
		],
		labels: Object.keys(keys)
	};
});

// true if this setlist has no songs
const noSongs = computed(() => {
	return !!setlist.value && setlist.value.entity.entries.length == 0;
});

// number of actual songs in this setlist, excluding slides
const songCount = computed(() => {
	return setlist.value?.entity.entries.filter(s => !isSlide(s)).length ?? 0;
});

// save new song order for setlist
const saveOrder = async () => {
	const sl = setlist.value;
	if (!sl || !setlistCollection.value) return;
	try {
		await setlistCollection.value.updateDoc(sl.id, sl.changeNumber ?? 0, { ...sl.entity });
		notify({
			title: t('toast.songOrderUpdated'),
			text: t('toast.setlistSavedText'),
			type: 'primary'
		});
	} catch (err) {
		throwError(err as ThrowableError);
	}
};

// transpose key of given song up and save new key for setlist (only ever called for song rows, never slides)
const transposeUp = async (song: SongEntity, songPosition: number) => {
	const sl = setlist.value;
	if (!sl || !setlistCollection.value) return;
	const setlistSongList = sl.entity.entries as SetlistSong[];
	// update tuning
	let tone = setlistSongList[songPosition].key ? setlistSongList[songPosition].key : (song.key ?? '');
	let i = keyScale.indexOf(tone);
	if (i>=keyScale.length-1) {
		tone = keyScale[0];
	} else {
		tone = keyScale[++i];
	}
	// save tuning in setlist
	setlistSongList[songPosition].key = tone;
	try {
		await setlistCollection.value.updateDoc(sl.id, sl.changeNumber ?? 0, { ...sl.entity });
	} catch (err) {
		throwError(err as ThrowableError);
	}
};

// transpose key of given song down and save new key for setlist (only ever called for song rows, never slides)
const transposeDown = async (song: SongEntity, songPosition: number) => {
	const sl = setlist.value;
	if (!sl || !setlistCollection.value) return;
	const setlistSongList = sl.entity.entries as SetlistSong[];
	// update tuning
	let tone = setlistSongList[songPosition].key ? setlistSongList[songPosition].key : (song.key ?? '');
	let i = keyScale.indexOf(tone);
	if (i<=0) {
		tone = keyScale[keyScale.length-1];
	} else {
		tone = keyScale[--i];
	}
	// save tuning in setlist
	setlistSongList[songPosition].key = tone;
	try {
		await setlistCollection.value.updateDoc(sl.id, sl.changeNumber ?? 0, { ...sl.entity });
	} catch (err) {
		throwError(err as ThrowableError);
	}
};

// remove a song from setlist, currently used only for deleted songs
const removeSong = async (songId: string) => {
	const sl = setlist.value;
	if (!sl || !setlistCollection.value) return;
	sl.entity.entries = sl.entity.entries.filter(s => isSlide(s) || s.id != songId);
	try {
		await setlistCollection.value.updateDoc(sl.id, sl.changeNumber ?? 0, { ...sl.entity });
		// toast success update message
		notify({
			title: t('toast.setlistUpdated'),
			text: t('toast.songDeletedFromSetlist'),
			type: 'primary'
		});
	} catch (err) {
		throwError(err as ThrowableError);
	}
};

// toggle and save setlist's active flag to enable or disable sync
const updateActive = async () => {
	const sl = setlist.value;
	if (!sl || !setlistCollection.value) return;
	sl.entity.active = !sl.entity.active;
	const sync = sl.entity.active;
	// clear ephemeral remote props when sync is disabled
	if (!sync) {
		delete sl.entity.remoteText;
		delete sl.entity.remoteLight;
		delete sl.entity.remoteHide;
	}
	try {
		await setlistCollection.value.updateDoc(sl.id, sl.changeNumber ?? 0, { ...sl.entity });
		notify({
			title: t('toast.sync' + (sync ? 'Activated' : 'Deactivated')),
			text: t('toast.setlistStatusSavedText'),
			type: 'primary'
		});
	} catch (err) {
		throwError(err as ThrowableError);
	}
};

// save setlist presentation slide position when sync is enabled
const updatePosition = async (val: number) => {
	const sl = setlist.value;
	if (!sl || !sl.entity.active || !setlistCollection.value) return;
	sl.entity.position = val;
	try {
		await setlistCollection.value.updateDoc(sl.id, sl.changeNumber ?? 0, { ...sl.entity });
	} catch (err) {
		throwError(err as ThrowableError);
	}
};

// save setlist chords visibility when sync is enabled
const updateChords = async (val: boolean) => {
	const sl = setlist.value;
	if (!sl || !sl.entity.active || !setlistCollection.value) return;
	sl.entity.remoteText = val;
	try {
		await setlistCollection.value.updateDoc(sl.id, sl.changeNumber ?? 0, { ...sl.entity });
	} catch (err) {
		throwError(err as ThrowableError);
	}
};

// save setlist theme mode when sync enabled
const updateDark = async (val: boolean) => {
	const sl = setlist.value;
	if (!sl || !sl.entity.active || !setlistCollection.value) return;
	sl.entity.remoteLight = val;
	try {
		await setlistCollection.value.updateDoc(sl.id, sl.changeNumber ?? 0, { ...sl.entity });
	} catch (err) {
		throwError(err as ThrowableError);
	}
};

// save setlist content visibility when sync enabled
const updateHide = async (val: boolean) => {
	const sl = setlist.value;
	if (!sl || !sl.entity.active || !setlistCollection.value) return;
	sl.entity.remoteHide = val;
	try {
		await setlistCollection.value.updateDoc(sl.id, sl.changeNumber ?? 0, { ...sl.entity });
	} catch (err) {
		throwError(err as ThrowableError);
	}
};

// handle dialog modals
const deleteDialog = () => {
	modal.delete = true;
};

// open the slide modal to add a new slide
const openAddSlide = () => {
	slideEdit.value = { index: -1, data: null };
	modal.slide = true;
};

// open the slide modal to edit an existing slide
const openEditSlide = (index: number, data: SetlistSlide) => {
	slideEdit.value = { index, data };
	modal.slide = true;
};

// add or update a slide in the setlist and save
const saveSlide = async (slide: SetlistSlide) => {
	const sl = setlist.value;
	if (!sl || !setlistCollection.value) return;
	if (slideEdit.value.index === -1) {
		sl.entity.entries.push(slide);
	} else {
		sl.entity.entries[slideEdit.value.index] = slide;
	}
	try {
		await setlistCollection.value.updateDoc(sl.id, sl.changeNumber ?? 0, { ...sl.entity });
		notify({
			title: t('toast.setlistUpdated'),
			text: t('toast.setlistSavedText'),
			type: 'primary'
		});
	} catch (err) {
		throwError(err as ThrowableError);
	} finally {
		modal.slide = false;
	}
};

// copy list to clipboard in given format (plain|markdown|slack)
const copyList = (format: 'plain' | 'markdown' | 'slack') => {
	const list = setlistSongs.value.map((song, i) => {
		const title = song.title;
		const subtitle = song.subtitle;
		const key = song.customTuning;
		let link = song.youtube ? ` ([YouTube](https://youtu.be/${song.youtube}))` : '';
		switch (format) {
			case 'plain':
			default:
				link = song.youtube ? ` https://youtu.be/${song.youtube}` : '';
				return `${i+1}. ${title} (${subtitle}) [${key}]${link}`;
			case 'markdown':
				return `${i+1}. **${title}**  – _${subtitle}_ **\`${key}\`**${link}`;
			case 'slack':
				return `${i+1}. *${title}* – _${subtitle}_ \`${key}\`${link}`;
		}
	});
	// Add link to list
	list.push(...['', format === 'markdown' ? `<${window.location.href}>` : window.location.href]);

	// Copy to clipboard
	navigator.clipboard.writeText(list.join('\n'));
	notify({
		title: t('toast.copiedToClipboard'),
		text: t('toast.setlistFormatCopiedText', { format: format }),
		type: 'primary'
	});
};

// download pdf in given mode (sheets|list)
const exportPdf = (mode: 'sheets' | 'list') => {
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
			link: {
				font: 'FiraSans',
				fontSize: 11,
				lineHeight: 1.4,
				color: '#759B3B',
				margin: [ 0, 20, 0, 0 ],
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
	} as TDocumentDefinitions;

	// Trigger download
	const type = (mode == 'sheets' ? t('text.songsheets') : t('text.list')).toLowerCase();
	pdfMake.createPdf(doc).download(`${setlistKey}-${type}.pdf`);

	// toast success message
	notify({
		title: t('toast.exportedPdf'),
		text: t('toast.exportedSetlistPdfText'),
		type: 'primary'
	});
};

// create pdfMake object for list
const getPdfSetlist = (): Content[] => {
	const sl = setlist.value;
	if (!sl) return [];
	const songLines = setlistSongs.value.map(song => ' ‒ ' + song.title + ' [' + song.customTuning + ']');
	return [
		{ text: sl.entity.title.toUpperCase(), style: 'header' },
		{ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 505, y2: 0, lineWidth: .5 }] },
		{
			text: (new Date(sl.entity.date)).toLocaleDateString(
				locale.value,
				{ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
			),
			style: 'subtitle',
			margin: [ 0, 6, 0, 0 ]
		} as Content,
		{ ol: songLines, style: 'list'} as Content,
		{ text: window.location.href, link: window.location.href, style: 'link' },
	];
};

// create pdfMake object for songsheets
const getPdfSongsheets = (): Content[] => {
	let sheets: Content[] = [];
	setlistSongs.value.forEach((song, index) => {
		// handle song content parts
		let content: Content[] = [];
		let parts = parsedContent(
			song.content,
			song.customTuningDelta,
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
							text: String(part.number),
							style: 'partnumber',
						},
						{
							width: '*',
							// song content with respect to leading whitespaces
							text: '​' + part.content.replace(/\n/g, "\n" + '​'),
							style: 'code',
						}
					]
				} as Content);
			} else {
				content.push({
					// song content with respect to leading whitespaces
					text: '​' + part.content.replace(/\n/g, "\n" + '​'),
					style: 'code',
				});
			}
		});
		// create footer
		let footer: Content[] = [{
			// imprint with ccli#, author names and (c) year publisher
			width: '*',
			style: 'footer',
			text: [
				song.ccli ? 'CCLI Song Nr.: ' + song.ccli + '\n' : '',
				song.authors?.length ? song.authors.join(' | ') + '\n' : '',
				'© ' + (song.year ? song.year + ' ' : '') + song.publisher
			]
		} as Content];
		if (song.youtube) {
			footer.push({
				// QR code for YouTube link
				width: '140',
				margin: [ 0, 20, 0, 0 ],
				stack: [
					{ text: 'https://youtu.be/' + song.youtube, style: 'qr' },
					{ qr: 'https://youtu.be/' + song.youtube, fit: 90, style: 'qr', margin: [ 0, 5, 0, 0 ] }
				]
			} as Content);
		}
		// put songsheet together
		let songsheet: Content[] = [
			// song title [tuning] with a line beneath
			{ text: song.title.toUpperCase(), style: 'header' },
			{ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 505, y2: 0, lineWidth: .5 }] },
			{
				text: chords.value ? 'Tuning: ' + song.customTuning : '',
				style: 'subtitle',
				alignment: 'right',
				margin: [ 0, 4, 0, 0 ]
			} as Content,
			content,
			{ columnGap: 8, columns: footer }
		];
		// add page break after every song exept for the last
		if (index < setlistSongs.value.length-1) {
			songsheet.push({ text: '', pageBreak: 'after', style: 'code' } as Content);
		}
		sheets = sheets.concat(songsheet);
	});
	return sheets;
};

const exportOsz = async () => {
	// initialize file content of service data osj file for OpenLP
	// (OpenLP's .osj format has no published types anywhere)
	// oxlint-disable-next-line typescript/no-explicit-any
	const content: any[] = [{
    'openlp_core': {
      'lite-service': false,
      'service-theme': null,
      'openlp-servicefile-version': 3
    }
	}];

	// add service items, one per song
	setlistSongs.value.forEach(song => {
		// check for translations
		const lang = !('lang' in localStorage) ? loc : localStorage.getItem('lang');
		let tSong = null;
		if (lang !== song.language && song.translations.length > 0) {
			const tKey = song.translations.find((tr) => tr.endsWith(`-${lang}`));
			tSong = findSong(tKey) ?? null;
		}
		// handle song content parts
		// oxlint-disable-next-line typescript/no-explicit-any
		const itemData: any[] = [];
		const parts = parsedContent(song.content, 0, false, false);
		const tParts = tSong ? parsedContent(tSong.content, 0, false, false) : [];
		parts.forEach((part, i) => {
			itemData.push({
				'raw_slide': (i in tParts) ? `${part.content}\n\n{it}{gr}{fd}${tParts[i].content}{/fd}{/it}{/gr}` : part.content,
				'verseTag': (part.type ? part.type.toUpperCase() : 'V') + (Number(part.number) > 0 ? part.number.toString() : '1'),
			});
		});
		content.push({
			'serviceitem': {
				'header': {
					'name': 'songs',
					'plugin': 'songs',
					'theme': null,
					'title': song.title,
					'footer': [
						song.title,
						`${t('field.authors')}: ${song.authors?.join(', ') ?? ''}`
					],
					'type': 1,
					'audit': [song.title, song.authors ?? [], song.publisher, (song.ccli ?? '').toString()],
					'notes': '',
					'from_plugin': false,
					'capabilities': [2, 1, 5, 8, 9, 13, 22],
					'search': '',
					'data': {
						'title': `${song.title.toLowerCase()}@${(song.subtitle ?? '').toLowerCase()}`,
						'alternate_title': song.subtitle,
						'authors': song.authors?.join(', ') ?? '',
						'ccli_number': song.ccli,
						'copyright': song.publisher
					},
					'xml_version': openLyricsXML(song, version, tSong),
					'auto_play_slides_once': false,
					'auto_play_slides_loop': false,
					'timed_slide_interval': 0,
					'start_time': 0,
					'end_time': 0,
					'media_length': 0,
					'background_audio': [],
					'theme_overwritten': false,
					'will_auto_start': false,
					'processor': null,
					'metadata': [],
					'sha256_file_hash': null,
					'stored_filename': null
				},
				'data': itemData
			}
		});
	});

	// do export
	const blobWriter = new BlobWriter('application/zip');
	const writer = new ZipWriter(blobWriter);
	await writer.add('service_data.osj', new TextReader(JSON.stringify(content)));
	await writer.close();
	const blob = await blobWriter.getData();
	download(blob, `${setlistKey}.osz`, true)
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
