<template>
	<div class="setlists">
		<div
			class="container no-sidebar"
			ref="container"
			tabindex="0"
			@keydown.left.exact="!isFirstPage && !noSetlists ? page-- : null"
			@keydown.right.exact="!isLastPage && !noSetlists ? page++ : null"
			@keydown.ctrl.f.prevent="!noSetlists ? searchInput.focus() : null"
			@keydown.esc.exact="search=''; filter='';"
		>
			<div class="columns">
				<!-- heading -->
				<div class="column col-12">
					<h2 class="view-title">
						<span v-if="ready.setlists" class="text-bold">{{ Object.keys(filteredSetlists).length }}</span>
						<div v-else class="loading loading-lg d-inline-block mr-3 px-3"></div>
						{{ t('page.setlists') }}
					</h2>
				</div>
			</div>

			<div v-if="noSetlists" class="columns mt-2">
				<!-- heading -->
				<div class="column col-12">
					<span v-if="user && role">{{ t('text.noSetlistsAvailableSignedIn') }}</span>
					<span v-else>{{ t('text.noSetlistsAvailableSignedOut') }}</span>
				</div>
			</div>

			<div v-if="ready.setlists && !noSetlists" class="columns mt-2 mb-3">
				<!-- pagination -->
				<div class="column col-3 col-xl-6 col-md-9 col-sm-12 col-mx-auto">
					<ul class="pagination">
						<li class="page-item" :class="{ disabled: isFirstPage }">
							<a class="btn btn-secondary" @click="!isFirstPage ? page-- : null">
								<ion-icon :icon="arrowBack" />
							</a>
						</li>
						<li
							class="page-item"
							:class="{ active: (p-1) == page }"
							v-for="(p, i) in pageCount"
							:key="i"
							v-show="showPageItem(p)"
						>
							<span v-show="showFirstEllipsis(p)">...</span>
							<a
								class="c-hand"
								v-show="showPageItemLink(p)"
								@click="page = p-1"
							>
								{{ p }}
							</a>
							<span v-show="showLastEllipsis(p)">...</span>
						</li>
						<li class="page-item" :class="{ disabled: isLastPage }">
							<a class="btn btn-secondary" @click="!isLastPage ? page++ : null">
								<ion-icon :icon="arrowForward" />
							</a>
						</li>
					</ul>
				</div>
				<div class="column col-1 hide-xl"></div>
				<!-- search and filter -->
				<div class="column col-8 col-xl-12">
					<div class="input-group filter">
						<!-- search title, subtitles -->
						<span class="input-group-addon addon-lg"><ion-icon :icon="searchIcon" /></span>
						<input
							type="search"
							ref="searchInput"
							v-model="search"
							class="form-input input-lg"
							:placeholder="t('placeholder.searchSetlistTitle')"
						/>
						<div class="dropdown dropdown-right">
							<div class="btn-group">
								<a
									class="btn input-group-btn btn-secondary btn-lg dropdown-toggle"
									:class="{ 'badge': filter!='' }"
									tabindex="0"
								>
									<ion-icon :icon="filterSharp" />
								</a>
								<ul class="menu text-left">
									<li class="menu-item">
										<!-- filter year -->
										<select v-model="filter" class="form-select select-lg filter">
											<option value="" disabled selected>{{ t('placeholder.year') }}.</option>
											<option v-for="year in setlistYears" :key="year" :value="year">{{ year }}</option>
										</select>
									</li>
									<li class="menu-item">
										<!-- reset filter -->
										<button
											class="btn input-group-btn btn-lg btn-error-secondary stretch"
											@click="search=''; filter=''"
										>
											<ion-icon :icon="close" />
											{{ t('button.reset') }}
										</button>
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- setlist list -->
			<table v-if="ready.setlists && !noSetlists" class="table table-striped table-hover">
				<thead>
					<tr>
						<th></th>
						<th
							v-for="col in ['date', 'title', 'creator', 'songs']"
							:key="col"
							class="c-hand"
							:class="{
								'bg-primary-dark': order.field == col,
								'hide-xl': col == 'date' || col == 'songs'
							}"
							@click="sortList(col)"
						>
							{{ t('field.' + col) }}
							<ion-icon :icon="caretDown" v-if="order.field == col && !order.ascending" class="icon-right" />
							<ion-icon :icon="caretUp" v-if="order.field == col && order.ascending" class="icon-right" />
						</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(setlist, i) in pagedSetlists" :key="i">
						<td>
							<div
								class="s-circle s-circle-state ml-2 tooltip-right"
								:data-tooltip="t('tooltip.syncActive')"
								:class="{ active: setlist.active, tooltip: setlist.active }"
							></div>
						</td>
						<td class="hide-xl c-hand" @click="router.push({ name: 'setlist-show', params: { id: setlist.id }})">
							{{ humanDate(setlist.date, locale) }}
						</td>
						<td class="c-hand" @click="router.push({ name: 'setlist-show', params: { id: setlist.id }})">
							{{ setlist.title }}
							<div
								v-if="setlist.private"
								class="text-primary d-inline-block ml-2 tooltip tooltip-bottom"
								:data-tooltip="t('tooltip.setlistPrivate')"
							>
								<ion-icon :icon="lockClosedOutline" />
							</div>
						</td>
						<td class="c-hand" @click="router.push({ name: 'setlist-show', params: { id: setlist.id }})">
							{{ users[setlist.creator] ? users[setlist.creator].name : '' }}
						</td>
						<td class="hide-xl c-hand" @click="router.push({ name: 'setlist-show', params: { id: setlist.id }})">
							{{ setlist.songs.length }}
						</td>
						<td class="text-right">
							<div class="dropdown dropdown-right">
								<div class="btn-group">
									<a class="btn btn-primary dropdown-toggle" tabindex="0">
										<ion-icon :icon="ellipsisHorizontalOutline" />
									</a>
									<ul class="menu text-left">
										<li class="menu-item">
											<router-link :to="{ name: 'setlist-show', params: { id: setlist.id }}" class="py-3 px-3">
												<ion-icon :icon="eyeOutline" class="mr-2" /> {{ t('button.show') }}
											</router-link>
										</li>
										<li v-if="user && role > 1" class="menu-item">
											<a
												href="#"
												class="py-3 px-3"
												@click.prevent="editDialog(setlist, true)"
											>
												<ion-icon :icon="createOutline" class="mr-2" /> {{ t('button.edit') }}
											</a>
										</li>
										<li v-if="user && role > 1" class="menu-item">
											<a
												href="#"
												class="py-3 px-3"
												@click.prevent="editDialog(setlist, false)"
											>
												<ion-icon :icon="copyOutline" class="mr-2" /> {{ t('button.duplicate') }}
											</a>
										</li>
										<li v-if="user && role > 2" class="menu-item">
											<a
												href="#"
												class="py-3 px-3 text-error"
												@click.prevent="deleteDialog(setlist)"
											>
												<ion-icon :icon="trashOutline" class="mr-2" /> {{ t('button.delete') }}
											</a>
										</li>
									</ul>
								</div>
							</div>
						</td>
					</tr>
				</tbody>
			</table>

			<!-- modals -->
			<SetlistSet
				v-if="modal.set"
				:active="modal.set"
				:existing="active.existing"
				:initialSetlist="active.setlist"
				:setlistKey="active.key"
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
				:title="active.title"
				:id="active.key"
				@closed="modal.delete = false"
			/>

		</div>
	</div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from "vue-i18n";
import { useRoute } from 'vue-router'
import { humanDate } from '@/utils.js';
import SetlistSet from '@/modals/SetlistSet';
import SetlistDelete from '@/modals/SetlistDelete';
import { 
	arrowBack,
	arrowForward,
	caretDown,
	caretUp,
	close,
	copyOutline,
	createOutline,
	ellipsisHorizontalOutline,
	eyeOutline,
	filterSharp,
	lockClosedOutline,
	search as searchIcon,
	trashOutline
} from 'ionicons/icons';
const { t, locale } = useI18n();
const router = useRouter();
const route = useRoute()

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

// reactive data
const search     = ref('');
const filter     = ref(route.params.year ? route.params.year : '');
const page       = ref(0);
const listLength = ref(12);
const order = reactive({ 
	field: 'date',
	ascending: false
});
const modal = reactive({
	set: false,
	delete: false,
});
const active = reactive({
	title: '',
	key: '',
	setlist: {},
	existing: true
});

// mounted
onMounted(() => {
	container.value.focus();
});

// computed
const setlistsArray = computed(() => {
	let setlists = Object.keys(props.setlists).map((key) => {
		let setlist = props.setlists[key];
		setlist['id'] = key;
		return setlist;
	});
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
	var setlists = setlistsArray.value.filter(s => !s.private || s.private && s.creator==props.user);
	if (search.value != '') {
		setlists = setlists.filter(s => {
			// filter fields: title, date
			var key = search.value;
			return s.title.toLowerCase().indexOf(key) !== -1 || s.date.toLowerCase().indexOf(key) !== -1;
		})
	}
	if (filter.value != '') {
		setlists = setlists.filter(s => {
			// filter field: date(Y)
			return s.date.substring(0,4).indexOf(filter.value) !== -1;
		})
	}
	return setlists;
});
const noSetlists = computed(() => {
	return props.ready.setlists && setlistsArray.value.length == 0;
});
const setlistYears = computed(() => {
	if (props.ready.setlists && !noSetlists.value) {
		let start = parseInt(Object.keys(props.setlists).sort()[0].substring(0, 4));
		let end = parseInt(Object.keys(props.setlists).sort().slice(-1)[0].substring(0, 4));
		return Array.from(Array(end-start+1).keys(), x => x + start).reverse();
	} else {
		return [];
	}
});
const pagedSetlists = computed(() => {
	return filteredSetlists.value.slice(page.value*listLength.value, (page.value+1)*listLength.value);
});
const isFirstPage = computed(() => {
	return page.value == 0;
});
const isLastPage = computed(() => {
	return page.value == pageCount.value-1;
});
const pageCount = computed(() => {
	return Math.ceil(filteredSetlists.value.length/listLength.value);
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
const editDialog = (setlist, existing) => {
	active.title = setlist.title;
	active.setlist = setlist;
	active.key = setlist.id;
	active.existing = existing;
	modal.set = true;
};
const deleteDialog = (setlist) => {
	active.title = setlist.title;
	active.key = setlist.id;
	modal.delete = true;
};

// watcher
watch ([search, filter], () => { page.value = 0 });
</script>
