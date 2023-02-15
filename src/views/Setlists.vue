<template>
	<div
		class="flex flex-col gap-6 w-full focus:outline-none"
		ref="container"
		tabindex="0"
		@keydown.left.exact="!isFirstPage && !noSetlists ? page-- : null"
		@keydown.right.exact="!isLastPage && !noSetlists ? page++ : null"
		@keydown.ctrl.f.prevent="!noSetlists ? searchInput.focus() : null"
		@keydown.esc.exact="resetFilter"
	>
		<!-- page heading -->
		<div class="flex flex-col sm:flex-row justify-between items-stretch gap-4">
			<!-- title -->
			<div v-if="ready.setlists" class="text-3xl uppercase font-thin tracking-wider">
				<span class="font-semibold">{{ Object.keys(filteredSetlists).length }}</span>
				{{ t('page.setlists', Object.keys(filteredSetlists).length) }}
			</div>
			<!-- pagination -->
			<div class="flex items-center flex-nowrap gap-2 mr-16 lg:mr-0">
				<secondary-button @click="!isFirstPage ? page-- : null" :disabled="isFirstPage">
					<chevron-left-icon class="w-5 h-5 stroke-1.5" />
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
					<chevron-right-icon class="w-5 h-5 stroke-1.5" />
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
							<sort-ascending-icon
								v-if="order.field == col && !order.ascending"
								class="w-5 h-5 stroke-1.5 stroke-spring-600"
							/>
							<sort-descending-icon
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
							<filter-icon v-if="filter.active === null" class="w-5 h-5 stroke-1.5 text-blade-500 mx-auto my-0.5" />
							<circle-dot-icon v-if="filter.active === true" class="w-6 h-6 stroke-1.5 text-spring-600 mx-auto" />
							<circle-dotted-icon v-if="filter.active === false" class="w-6 h-6 stroke-1.5 mx-auto" />
						</div>
					</td>
					<td class="w-24 md:w-auto">
						<label class="relative">
							<filter-icon class="absolute top-0 left-2 w-5 h-5 stroke-1.5 text-blade-500" />
							<input
								type="search"
								v-model="filter.date"
								class="w-full pl-8"
							/>
						</label>
					</td>
					<td class="w-11 hidden xs:table-cell">
						<div
							class="cursor-pointer py-1.5 border border-blade-400 dark:border-black dark:bg-blade-900 dark:text-blade-100 hover:border-spring-600"
							@click="toggleFilter('private')"
						>
							<filter-icon v-if="filter.private === null" class="w-5 h-5 stroke-1.5 text-blade-500 mx-auto my-0.5" />
							<lock-icon v-if="filter.private === true" class="w-6 h-6 stroke-1.5 text-spring-600 mx-auto" />
							<lock-open-icon v-if="filter.private === false" class="w-6 h-6 stroke-1.5 mx-auto" />
						</div>
					</td>
					<td>
						<label class="relative">
							<filter-icon class="absolute top-0 left-2 w-5 h-5 stroke-1.5 text-blade-500" />
							<input
								type="search"
								ref="searchInput"
								v-model="filter.title"
								class="w-full pl-8"
							/>
						</label>
					</td>
					<td class="hidden xl:table-cell">
						<label class="relative">
							<filter-icon class="absolute top-0 left-2 w-5 h-5 stroke-1.5 text-blade-500" />
							<select v-model="filter.creator" class="w-full pl-8">
								<option v-for="(name, id) in creators" :key="id" :value="id">
									{{ name }}
								</option>
							</select>
						</label>
					</td>
					<td class="hidden sm:table-cell w-24">
						<label class="relative">
							<filter-icon class="absolute top-0 left-2 w-5 h-5 stroke-1.5 text-blade-500" />
							<input
								type="search"
								v-model="filter.songs"
								class="w-full pl-8"
							/>
						</label>
					</td>
					<td class="w-11">
						<secondary-button @click="resetFilter" :disabled="!isFiltered">
							<filter-off-icon class="w-5 h-5 stroke-1.5" />
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
						<circle-dot-icon v-if="setlist.active" class="w-6 h-6 stroke-1.5 text-spring-600 mx-auto" :title="t('tooltip.syncActive')" />
						<circle-dotted-icon v-else class="w-6 h-6 stroke-1.5 mx-auto" />
					</td>
					<td
						class="cursor-pointer p-3 max-w-0"
						@click="router.push({ name: 'setlist-show', params: { id: setlist.id }})"
					>
						<div class="truncate hidden md:block">{{ humanDate(setlist.date, locale) }}</div>
						<div class="truncate md:hidden">{{ humanDate(setlist.date, locale, false, true) }}</div>
					</td>
					<td class="hidden xs:table-cell">
						<lock-icon v-if="setlist.private" class="w-6 h-6 stroke-1.5 text-spring-600 mx-auto" :title="t('tooltip.setlistPrivate')" />
						<lock-open-icon v-else class="w-6 h-6 stroke-1.5 stroke-blade-500 mx-auto" />
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
									<eye-icon class="w-5 h-5 stroke-1.5" />
									{{ t('button.show') }}
								</router-link>
								<button
									v-if="user && role > 1"
									class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
									@click.prevent="emit('editSetlist', { data: setlist, id: setlist.id, exists: true })"
								>
									<edit-icon class="w-5 h-5 stroke-1.5" />
									{{ t('button.edit') }}
								</button>
								<button
									v-if="user && role > 1"
									class="px-3 py-2 w-full flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
									@click.prevent="emit('editSetlist', { data: setlist, id: setlist.id, exists: false })"
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
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import Dropdown from '@/elements/Dropdown';
import SecondaryButton from '@/elements/SecondaryButton';
import SetlistDelete from '@/modals/SetlistDelete';

// icons
import { 
	ChevronLeftIcon,
	ChevronRightIcon,
	CircleDotIcon,
	CircleDottedIcon,
	CopyIcon,
	EditIcon,
	EyeIcon,
	FilterIcon,
	FilterOffIcon,
	LockIcon,
	LockOpenIcon,
	SortAscendingIcon,
	SortDescendingIcon,
	TrashIcon,
} from 'vue-tabler-icons';

// component constants
const { t, locale } = useI18n();
const router = useRouter();

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
const container   = ref(null);
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

// focus container on mount
onMounted(() => {
	container.value.focus();
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
		// filter fields: date
		setlists = setlists.filter(s => {
			return s.active === filter.active;
		})
	}
	if (filter.private !== null) {
		// filter fields: date
		setlists = setlists.filter(s => {
			return s.private === filter.private || (!filter.private && !s.private);
		})
	}
	if (filter.date) {
		// filter fields: date
		setlists = setlists.filter(s => {
			return s.date.indexOf(filter.date) !== -1
				|| humanDate(s.date, locale.value).toLowerCase().indexOf(filter.date) !== -1;
		})
	}
	if (filter.title) {
		// filter fields: title
		setlists = setlists.filter(s => {
			return s.title.toLowerCase().indexOf(filter.title) !== -1;
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

// watcher
watch (filter, () => { page.value = 0 });
</script>
