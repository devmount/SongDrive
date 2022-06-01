<template>
	<div class="setlists">
		<div
			class="container no-sidebar"
			ref="container"
			tabindex="0"
			@keydown.left.exact="!isFirstPage && !noSetlists ? page-- : null"
			@keydown.right.exact="!isLastPage && !noSetlists ? page++ : null"
			@keydown.ctrl.70.prevent="!noSetlists ? $refs.search.focus() : null"
			@keydown.esc.exact="search=''; filter='';"
		>
			<div class="columns">
				<!-- heading -->
				<div class="column col-12">
					<h2 class="view-title">
						<span v-if="ready.setlists" class="text-bold">{{ Object.keys(filteredSetlists).length }}</span>
						<div v-else class="loading loading-lg d-inline-block mr-3 px-3"></div>
						{{ $t('page.setlists') }}
					</h2>
				</div>
			</div>

			<div v-if="noSetlists" class="columns mt-2">
				<!-- heading -->
				<div class="column col-12">
					<span v-if="user && role">{{ $t('text.noSetlistsAvailableSignedIn') }}</span>
					<span v-else>{{ $t('text.noSetlistsAvailableSignedOut') }}</span>
				</div>
			</div>

			<div v-if="ready.setlists && !noSetlists" class="columns mt-2 mb-3">
				<!-- pagination -->
				<div class="column col-3 col-xl-6 col-md-9 col-sm-12 col-mx-auto">
					<ul class="pagination">
						<li class="page-item" :class="{ disabled: isFirstPage }">
							<a class="btn btn-secondary" @click="!isFirstPage ? page-- : null">
								<ion-icon name="arrow-back"></ion-icon>
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
								<ion-icon name="arrow-forward"></ion-icon>
							</a>
						</li>
					</ul>
				</div>
				<div class="column col-1 hide-xl"></div>
				<!-- search and filter -->
				<div class="column col-8 col-xl-12">
					<div class="input-group filter">
						<!-- search title, subtitles -->
						<span class="input-group-addon addon-lg"><ion-icon name="search"></ion-icon></span>
						<input
							type="search"
							ref="search"
							v-model="search"
							class="form-input input-lg"
							:placeholder="$t('placeholder.searchSetlistTitle')"
						/>
						<div class="dropdown dropdown-right">
							<div class="btn-group">
								<a
									class="btn input-group-btn btn-secondary btn-lg dropdown-toggle"
									:class="{ 'badge': filter!='' }"
									tabindex="0"
								>
									<ion-icon name="filter-sharp"></ion-icon>
								</a>
								<ul class="menu text-left">
									<li class="menu-item">
										<!-- filter year -->
										<select v-model="filter" class="form-select select-lg filter">
											<option value="" disabled selected>{{ $t('placeholder.year') }}.</option>
											<option v-for="year in setlistYears" :key="year" :value="year">{{ year }}</option>
										</select>
									</li>
									<li class="menu-item">
										<!-- reset filter -->
										<button
											class="btn input-group-btn btn-lg btn-error-secondary stretch"
											@click="search=''; filter=''"
										>
											<ion-icon name="close"></ion-icon>
											{{ $t('button.reset') }}
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
							class="c-hand"
							:class="{
								'bg-primary-dark': order.field == col,
								'hide-xl': col == 'date' || col == 'songs'
							}"
							@click="sortList(col)"
						>
							{{ $t('field.' + col) }}
							<ion-icon v-if="order.field == col && !order.ascending" class="icon-right" name="caret-down"></ion-icon>
							<ion-icon v-if="order.field == col && order.ascending" class="icon-right" name="caret-up"></ion-icon>
						</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(setlist, i) in pagedSetlists" :key="i">
						<td>
							<div
								class="s-circle s-circle-state ml-2 tooltip-right"
								:data-tooltip="$t('tooltip.syncActive')"
								:class="{ active: setlist.active, tooltip: setlist.active }"
							></div>
						</td>
						<td class="hide-xl c-hand" @click="$router.push({ name: 'setlist-show', params: { id: setlist.id }})">
							{{ humanDate(setlist.date, $i18n.locale) }}
						</td>
						<td class="c-hand" @click="$router.push({ name: 'setlist-show', params: { id: setlist.id }})">
							{{ setlist.title }}
							<div
								v-if="setlist.private"
								class="text-primary d-inline-block ml-2 tooltip tooltip-bottom"
								:data-tooltip="$t('tooltip.setlistPrivate')"
							>
								<ion-icon name="lock-closed-outline"></ion-icon>
							</div>
						</td>
						<td class="c-hand" @click="$router.push({ name: 'setlist-show', params: { id: setlist.id }})">
							{{ users[setlist.creator] ? users[setlist.creator].name : '' }}
						</td>
						<td class="hide-xl c-hand" @click="$router.push({ name: 'setlist-show', params: { id: setlist.id }})">
							{{ setlist.songs.length }}
						</td>
						<td class="text-right">
							<div class="dropdown dropdown-right">
								<div class="btn-group">
									<a class="btn btn-primary dropdown-toggle" tabindex="0">
										<ion-icon name="ellipsis-horizontal-outline"></ion-icon>
									</a>
									<ul class="menu text-left">
										<li class="menu-item">
											<router-link :to="{ name: 'setlist-show', params: { id: setlist.id }}" class="py-3 px-3">
												<ion-icon name="eye-outline" class="mr-2"></ion-icon> {{ $t('button.show') }}
											</router-link>
										</li>
										<li v-if="user && role > 1" class="menu-item">
											<a
												href="#"
												class="py-3 px-3"
												@click.prevent="editDialog(setlist, true)"
											>
												<ion-icon name="create-outline" class="mr-2"></ion-icon> {{ $t('button.edit') }}
											</a>
										</li>
										<li v-if="user && role > 1" class="menu-item">
											<a
												href="#"
												class="py-3 px-3"
												@click.prevent="editDialog(setlist, false)"
											>
												<ion-icon name="copy-outline" class="mr-2"></ion-icon> {{ $t('button.duplicate') }}
											</a>
										</li>
										<li v-if="user && role > 2" class="menu-item">
											<a
												href="#"
												class="py-3 px-3 text-error"
												@click.prevent="deleteDialog(setlist)"
											>
												<ion-icon name="trash-outline" class="mr-2"></ion-icon> {{ $t('button.delete') }}
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

<script>
// get components
import SetlistSet from '@/modals/SetlistSet';
import SetlistDelete from '@/modals/SetlistDelete';

export default {
	name: 'setlists',
	props: ['songs', 'setlists', 'tags', 'languages', 'users', 'user', 'role', 'ready'],
	components: {
		SetlistSet,
		SetlistDelete,
	},
	data () {
		return {
			search: '',
			filter: this.$route.params.year ? this.$route.params.year : '',
			page: 0,
			listLength: 12,
			order: { 
				field: 'date',
				ascending: false
			},
			modal: {
				set: false,
				delete: false,
			},
			active: {
				title: '',
				key: '',
				setlist: {},
				existing: true
			}
		}
	},
	mounted () {
		this.$refs.container.focus();
	},
	computed: {
		setlistsArray () {
			let setlists = Object.keys(this.setlists).map((key) => {
				let setlist = this.setlists[key];
				setlist['id'] = key;
				return setlist;
			});
			setlists.sort((a, b) => {
				let propA, propB;
				if (this.order.field == 'songs') {
					propA = a.songs.length;
					propB = b.songs.length;
				} else if (this.order.field == 'creator') {
					propA = this.users[a.creator]?.name ?? '';
					propB = this.users[b.creator]?.name ?? '';
				} else {
					propA = String(a[this.order.field]).toLowerCase().trim();
					propB = String(b[this.order.field]).toLowerCase().trim();
				}
				if (this.order.ascending) {
					if (propA < propB) { return -1 };
					if (propA > propB) { return 1 };
				} else {
					if (propA < propB) { return 1 };
					if (propA > propB) { return -1 };
				}
				return 0;
			})
			return setlists;
		},
		filteredSetlists() {
			var setlists = this.setlistsArray;
			if (this.search != '') {
				setlists = setlists.filter(setlist => {
					// filter fields: title, date
					var key = this.search.toLowerCase();
					return setlist.title.toLowerCase().indexOf(key) !== -1 || setlist.date.toLowerCase().indexOf(key) !== -1;
				})
			}
			if (this.filter != '') {
				setlists = setlists.filter(setlist => {
					// filter field: date(Y)
					return setlist.date.substring(0,4).indexOf(this.filter) !== -1;
				})
			}
			return setlists;
		},
		noSetlists () {
			return this.ready.setlists && this.setlistsArray.length == 0;
		},
		setlistYears() {
			if (this.ready.setlists && !this.noSetlists) {
				let start = parseInt(Object.keys(this.setlists).sort()[0].substring(0, 4));
				let end = parseInt(Object.keys(this.setlists).sort().slice(-1)[0].substring(0, 4));
				return Array.from(Array(end-start+1).keys(), x => x + start).reverse();
			} else {
				return [];
			}
		},
		pagedSetlists () {
			return this.filteredSetlists.slice(this.page*this.listLength, (this.page+1)*this.listLength);
		},
		isFirstPage () {
			return this.page == 0;
		},
		isLastPage () {
			return this.page == this.pageCount-1;
		},
		pageCount () {
			return Math.ceil(this.filteredSetlists.length/this.listLength);
		}
	},
	methods: {
		sortList (field) {
			if (this.order.field == field) {
				this.order.ascending = !this.order.ascending;
			} else {
				this.order.ascending = true;
			}
			this.order.field = field;
		},
		showPageItem (p) {
			return this.pageCount < 6 || (
				p == 1 || p == 2
				|| (this.page == 0 && p == 3)
				|| ((this.page == 0 || this.page == 1) && p == 4)
				|| (p > this.page-1 && p < this.page+3)
				|| ((this.page == this.pageCount-1||this.page == this.pageCount-2) && p == this.pageCount-3)
				|| (this.page == this.pageCount-1 && p == this.pageCount-2)
				|| p == this.pageCount-1 || p == this.pageCount
			);
		},
		showFirstEllipsis (p) {
			return this.pageCount >= 6 && this.page > 2 && p == 2;
		},
		showPageItemLink (p) {
			return this.pageCount < 6 || (
				p == 1
				|| (this.page == 0 && p == 3)
				|| ((this.page == 0 || this.page == 1) && p == 4)
				|| (p > this.page-1 && p < this.page+3)
				|| ((this.page == this.pageCount-1 || this.page == this.pageCount-2) && p == this.pageCount-3)
				|| (this.page == this.pageCount-1 && p == this.pageCount-2)
				|| p == this.pageCount
			);
		},
		showLastEllipsis (p) {
			return this.pageCount >= 6 && this.page < this.pageCount-3 && p == this.pageCount-1;
		},
		editDialog (setlist, existing) {
			this.active.title = setlist.title;
			this.active.setlist = setlist;
			this.active.key = setlist.id;
			this.active.existing = existing;
			this.modal.set = true;
		},
		deleteDialog (setlist) {
			this.active.title = setlist.title;
			this.active.key = setlist.id;
			this.modal.delete = true;
		}
	},
	watch: {
		search () {
			this.page = 0;
		},
		filter () {
			this.page = 0;
		}
	}
}
</script>
