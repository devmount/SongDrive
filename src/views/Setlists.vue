<template>
	<div class="flex flex-col gap-6 w-full">
		<!-- page heading -->
		<div class="flex flex-col sm:flex-row justify-between items-stretch gap-4">
			<!-- title and search trigger -->
			<div
				v-if="ready.setlists"
				class="flex gap-4 sm:gap-6 text-3xl uppercase font-thin tracking-wider"
			>
				<div>
					<span class="font-semibold">{{ Object.keys(filteredSetlists).length }}</span>
					{{ t('page.setlists', Object.keys(filteredSetlists).length) }}
				</div>
				<div
					class="px-1 pt-0.5 flex items-center cursor-pointer text-blade-500"
					@click="searchInput.focus()"
					:title="t('placeholder.searchSetlistTitle')"
				>
					<icon-search class="w-7 h-7 stroke-1.5" />
				</div>
			</div>
			<!-- pagination -->
			<div class="flex items-center flex-nowrap gap-2 mr-16 lg:mr-0">
				<secondary-button @click="!isFirstPage ? page-- : null" :disabled="isFirstPage">
					<icon-chevron-left class="w-5 h-5 stroke-1.5" />
				</secondary-button>
				<div
					v-for="(p, i) in pageCount" :key="i"
					v-show="showPageItem(p)"
				>
					<div v-show="showFirstEllipsis(p)">&hellip;</div>
					<div
						class="transition-colors cursor-pointer rounded-sm px-2 py-1 hover:bg-blade-300 dark:hover:bg-blade-750"
						:class="{ 'bg-spring-400 dark:bg-spring-700': (p-1) == page }"
						v-show="showPageItemLink(p)"
						@click="page = p-1"
					>
						{{ p }}
					</div>
					<div v-show="showLastEllipsis(p)">&hellip;</div>
				</div>
				<secondary-button @click="!isLastPage ? page++ : null" :disabled="isLastPage">
					<icon-chevron-right class="w-5 h-5 stroke-1.5" />
				</secondary-button>
			</div>
		</div>	

		<!-- empty setlists collection -->
		<div v-if="noSetlists" class="text-blade-500">
			{{ t('text.noSetlistsAvailable') }}
		</div>

		<!-- setlist list -->
		<table v-if="ready.setlists && !noSetlists" class="w-full">
			<thead>
				<!-- column titles -->
				<tr>
					<th></th>
					<th
						v-for="col in ['date', 'private', 'title', 'creator', 'songs']"
						:key="col"
						class="cursor-pointer uppercase p-2 font-normal"
						:class="{
							'hidden xs:table-cell': col === 'private',
							'hidden xl:table-cell': col === 'creator',
							'hidden sm:table-cell': col === 'songs',
						}"
						@click="sortList(col)"
					>
						<div v-if="col !== 'private'" class="flex items-center gap-2" :class="{ 'justify-center': col === 'songs' }">
							<span :class="{ 'md:hidden': col === 'date' }">{{ t('field.' + col) }}</span>
							<span v-if="col === 'date'" class="hidden md:inline">{{ t('field.dateOfEvent') }}</span>
							<icon-sort-ascending
								v-if="order.field == col && !order.ascending"
								class="w-5 h-5 stroke-1.5 stroke-spring-600"
							/>
							<icon-sort-descending
								v-if="order.field == col && order.ascending"
								class="w-5 h-5 stroke-1.5 stroke-spring-600"
							/>
						</div>
					</th>
					<th></th>
				</tr>
				<!-- column filters -->
				<tr>
					<td class="w-11">
						<div
							class="cursor-pointer py-1.5 border border-blade-400 dark:border-black dark:bg-blade-900 dark:text-blade-100 hover:border-spring-600"
							@click="toggleFilter('active')"
						>
							<icon-filter v-if="filter.active === null" class="w-5 h-5 stroke-1.5 text-blade-500 mx-auto my-0.5" />
							<icon-circle-dot v-if="filter.active === true" class="w-6 h-6 stroke-1.5 text-spring-600 mx-auto" />
							<icon-circle-dotted v-if="filter.active === false" class="w-6 h-6 stroke-1.5 mx-auto" />
						</div>
					</td>
					<td class="w-24 md:w-auto">
						<label class="relative">
							<icon-filter class="absolute top-0 left-2 w-5 h-5 stroke-1.5 text-blade-500" />
							<input
								type="search"
								v-model="filter.date"
								@input="e => filter.date = e.target.value"
								class="w-full pl-8"
							/>
						</label>
					</td>
					<td class="w-11 hidden xs:table-cell">
						<div
							class="cursor-pointer py-1.5 border border-blade-400 dark:border-black dark:bg-blade-900 dark:text-blade-100 hover:border-spring-600"
							@click="toggleFilter('private')"
						>
							<icon-filter v-if="filter.private === null" class="w-5 h-5 stroke-1.5 text-blade-500 mx-auto my-0.5" />
							<icon-lock v-if="filter.private === true" class="w-6 h-6 stroke-1.5 text-spring-600 mx-auto" />
							<icon-lock-open v-if="filter.private === false" class="w-6 h-6 stroke-1.5 mx-auto" />
						</div>
					</td>
					<td>
						<label class="relative">
							<icon-filter class="absolute top-0 left-2 w-5 h-5 stroke-1.5 text-blade-500" />
							<input
								type="search"
								ref="searchInput"
								v-model="filter.title"
								@input="e => filter.title = e.target.value"
								class="w-full pl-8"
							/>
						</label>
					</td>
					<td class="hidden xl:table-cell">
						<label class="relative">
							<icon-filter class="absolute top-0 left-2 w-5 h-5 stroke-1.5 text-blade-500" />
							<select v-model="filter.creator" class="w-full pl-8">
								<option v-for="(name, id) in creators" :key="id" :value="id">
									{{ name }}
								</option>
							</select>
						</label>
					</td>
					<td class="hidden sm:table-cell w-24">
						<label class="relative">
							<icon-filter class="absolute top-0 left-2 w-5 h-5 stroke-1.5 text-blade-500" />
							<input
								type="search"
								v-model="filter.songs"
								class="w-full pl-8"
							/>
						</label>
					</td>
					<td class="w-11">
						<secondary-button @click="resetFilter" :disabled="!isFiltered">
							<icon-filter-off class="w-5 h-5 stroke-1.5" />
						</secondary-button>
					</td>
				</tr>
			</thead>
			<tbody v-if="ready.setlists">
				<tr
					v-for="(setlist, i) in pagedSetlists" :key="i"
					class="even:bg-blade-200/50 even:dark:bg-blade-900/50 hover:bg-blade-200 hover:dark:bg-blade-900"
				>
					<td>
						<icon-circle-dot v-if="setlist.active" class="w-6 h-6 stroke-1.5 text-spring-600 mx-auto" :title="t('tooltip.syncActive')" />
						<icon-circle-dotted v-else class="w-6 h-6 stroke-1.5 mx-auto" />
					</td>
					<td
						class="cursor-pointer p-3 max-w-0"
						@click="router.push({ name: 'setlist-show', params: { id: setlist.id }})"
					>
						<div class="truncate hidden md:block">{{ humanDate(setlist.date, locale) }}</div>
						<div class="truncate md:hidden">{{ humanDate(setlist.date, locale, false, true) }}</div>
					</td>
					<td class="hidden xs:table-cell">
						<icon-lock v-if="setlist.private" class="w-6 h-6 stroke-1.5 text-spring-600 mx-auto" :title="t('tooltip.setlistPrivate')" />
						<icon-lock-open v-else class="w-6 h-6 stroke-1.5 stroke-blade-500 mx-auto" />
					</td>
					<td
						class="cursor-pointer p-3 max-w-0"
						@click="router.push({ name: 'setlist-show', params: { id: setlist.id }})"
					>
						<div class="truncate">{{ setlist.title }}</div>
					</td>
					<td
						class="cursor-pointer p-3 hidden xl:table-cell"
						@click="router.push({ name: 'setlist-show', params: { id: setlist.id }})"
					>
						{{ users[setlist.creator] ? users[setlist.creator].name : '' }}
					</td>
					<td
						class="cursor-pointer p-3 hidden sm:table-cell text-center"
						@click="router.push({ name: 'setlist-show', params: { id: setlist.id }})"
					>
						{{ setlist.songs.length }}
					</td>
					<td>
						<dropdown>
							<template #default>
								<router-link
									:to="{ name: 'setlist-show', params: { id: setlist.id }}"
									class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
								>
									<icon-eye class="w-5 h-5 stroke-1.5" />
									{{ t('button.show') }}
								</router-link>
								<button
									v-if="user && role > 1"
									class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
									@click.prevent="emit('editSetlist', { data: setlist, id: setlist.id, exists: true })"
								>
									<icon-edit class="w-5 h-5 stroke-1.5" />
									{{ t('button.edit') }}
								</button>
								<button
									v-if="user && role > 1"
									class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
									@click.prevent="emit('editSetlist', { data: setlist, id: setlist.id, exists: false })"
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
							</template>
						</dropdown>
					</td>
				</tr>
			</tbody>
		</table>
		<!-- modals -->
		<setlist-delete
			:active="showModal.delete"
			:title="setlistDeleteModalData.title"
			:id="setlistDeleteModalData.key"
			@closed="showModal.delete = false"
		/>
	</div>
</template>

<script setup>
import { humanDate } from '@/utils.js';
import { logicAnd } from '@vueuse/math';
import { ref, reactive, computed, watch, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { whenever } from '@vueuse/core';
import Dropdown from '@/elements/Dropdown.vue';
import SecondaryButton from '@/elements/SecondaryButton.vue';
import SetlistDelete from '@/modals/SetlistDelete.vue';

// icons
import { 
	IconChevronLeft,
	IconChevronRight,
	IconCircleDot,
	IconCircleDotted,
	IconCopy,
	IconEdit,
	IconEye,
	IconFilter,
	IconFilterOff,
	IconLock,
	IconLockOpen,
	IconSearch,
	IconSortAscending,
	IconSortDescending,
	IconTrash,
} from '@tabler/icons-vue';

// component constants
const { t, locale } = useI18n();
const router = useRouter();

// handle hotkeys for this component
const hkSearch = inject('hkSearch');
const hkBack = inject('hkBack');
const hkForward = inject('hkForward');
const hkCancel = inject('hkCancel');
const noActiveInput = inject('noActiveInput');
const noActiveModal = inject('noActiveModal');

// inherited properties
const props = defineProps({
  songs:     Object,
  setlists:  Object,
  tags:      Object,
  languages: Object,
  users:     Object,
  user:      String,
  role:      Number,
  ready:     Object,
});

// template references
const searchInput = ref(null);

// injects and emits
const emit = defineEmits(['started', 'editSong', 'editSetlist']);

// table filter
const filter = reactive({
	active:  null,
	private: null,
	date:    null,
	title:   null,
	creator: null,
	songs:   null,
});
const resetFilter = () => {
	for (const field in filter) {
		if (Object.hasOwnProperty.call(filter, field)) {
			filter[field] = null;
		}
	}
};
const isFiltered = computed(() => {
	return filter.active !== null
		|| filter.private !== null
		|| filter.date
		|| filter.title
		|| filter.creator
		|| filter.songs;
});

// pagination
const page       = ref(0);
const listLength = 16;
const order = reactive({ 
	field: 'date',
	ascending: false
});

// computed
const setlistsArray = computed(() => {
	const setlists = [];
	for (const key in props.setlists) {
		if (Object.hasOwnProperty.call(props.setlists, key)) {
			const element = props.setlists[key];
			element['id'] = key;
			setlists.push(element);
		}
	}
	setlists.sort((a, b) => {
		let propA, propB;
		if (order.field == 'songs') {
			propA = a.songs.length;
			propB = b.songs.length;
		} else if (order.field == 'creator') {
			propA = props.users[a.creator]?.name ?? '';
			propB = props.users[b.creator]?.name ?? '';
		} else {
			propA = String(a[order.field]).toLowerCase().trim();
			propB = String(b[order.field]).toLowerCase().trim();
		}
		if (order.ascending) {
			if (propA < propB) { return -1 };
			if (propA > propB) { return 1 };
		} else {
			if (propA < propB) { return 1 };
			if (propA > propB) { return -1 };
		}
		return 0;
	})
	return setlists;
});
const filteredSetlists = computed(() => {
	let setlists = setlistsArray.value.filter(s => !s.private || s.private && s.creator==props.user);
	if (filter.active !== null) {
		// filter fields: sync
		setlists = setlists.filter(s => {
			return s.active === filter.active;
		})
	}
	if (filter.private !== null) {
		// filter fields: private
		setlists = setlists.filter(s => {
			return s.private === filter.private || (!filter.private && !s.private);
		})
	}
	if (filter.date) {
		// filter fields: date
		setlists = setlists.filter(s => {
			const key = filter.date.toLowerCase();
			return s.date.indexOf(key) !== -1
				|| humanDate(s.date, locale.value).toLowerCase().indexOf(key) !== -1;
		})
	}
	if (filter.title) {
		// filter fields: title
		const key = filter.title.toLowerCase();
		setlists = setlists.filter(s => {
			return s.title.toLowerCase().indexOf(key) !== -1;
		})
	}
	if (filter.creator) {
		// filter fields: creator
		setlists = setlists.filter(s => {
			return s.creator === filter.creator;
		})
	}
	if (filter.songs) {
		// filter fields: songs
		setlists = setlists.filter(s => {
			return s.songs.length.toString().indexOf(filter.songs) !== -1;
		})
	}
	return setlists;
});
const noSetlists = computed(() => {
	return props.ready.setlists && setlistsArray.value.length == 0;
});
const pagedSetlists = computed(() => {
	return filteredSetlists.value.slice(page.value*listLength, (page.value+1)*listLength);
});
const isFirstPage = computed(() => {
	return page.value == 0;
});
const isLastPage = computed(() => {
	return page.value == pageCount.value-1;
});
const pageCount = computed(() => {
	return Math.ceil(filteredSetlists.value.length/listLength);
});
const creators = computed(() => {
	const creators = {};
	setlistsArray.value.forEach(s => {
		const name = props.users[s.creator]?.name;
		if (name && !creators.hasOwnProperty(s.creator)) {
			creators[s.creator] = name;
		}
	});
	return creators;
});

// methods
const sortList = (field) => {
	if (order.field == field) {
		order.ascending = !order.ascending;
	} else {
		order.ascending = true;
	}
	order.field = field;
};
const toggleFilter = (prop) => {
	switch (filter[prop]) {
		case null:
			filter[prop] = true;
			break;
		case true:
			filter[prop] = false;
			break;
		case false:
		default:
			filter[prop] = null;
			break;
	}
};
const showPageItem = (p) => {
	return pageCount.value < 6 || (
		p == 1 || p == 2
		|| (page.value == 0 && p == 3)
		|| ((page.value == 0 || page.value == 1) && p == 4)
		|| (p > page.value-1 && p < page.value+3)
		|| ((page.value == pageCount.value-1||page.value == pageCount.value-2) && p == pageCount.value-3)
		|| (page.value == pageCount.value-1 && p == pageCount.value-2)
		|| p == pageCount.value-1 || p == pageCount.value
	);
};
const showFirstEllipsis = (p) => {
	return pageCount.value >= 6 && page.value > 2 && p == 2;
};
const showPageItemLink = (p) => {
	return pageCount.value < 6 || (
		p == 1
		|| (page.value == 0 && p == 3)
		|| ((page.value == 0 || page.value == 1) && p == 4)
		|| (p > page.value-1 && p < page.value+3)
		|| ((page.value == pageCount.value-1 || page.value == pageCount.value-2) && p == pageCount.value-3)
		|| (page.value == pageCount.value-1 && p == pageCount.value-2)
		|| p == pageCount.value
	);
};
const showLastEllipsis = (p) => {
	return pageCount.value >= 6 && page.value < pageCount.value-3 && p == pageCount.value-1;
};

// handle modals
const showModal = reactive({
	delete: false,
});

// delete setlist
const setlistDeleteModalData = reactive({
	title: '',
	key: '',
});
const deleteDialog = (setlist) => {
	setlistDeleteModalData.title = setlist.title;
	setlistDeleteModalData.key = setlist.id;
	showModal.delete = true;
};

// reset page when filter changes
watch (filter, () => { page.value = 0 });

// component shortcuts
whenever(
	logicAnd(hkSearch, noActiveModal),
	() => !noSetlists.value ? searchInput.value.focus() : null
);
whenever(
	logicAnd(hkCancel, noActiveModal),
	() => resetFilter()
);
whenever(
	logicAnd(hkBack, noActiveInput, noActiveModal),
	() => !isFirstPage.value && !noSetlists.value ? page.value-- : null
);
whenever(
	logicAnd(hkForward, noActiveInput, noActiveModal),
	() => !isLastPage.value && !noSetlists.value ? page.value++ : null
);
</script>
