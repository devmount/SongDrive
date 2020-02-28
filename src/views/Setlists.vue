<template>
	<div class="setlists">
		<div class="container no-sidebar">
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
			<div v-if="ready.setlists" class="columns mt-2 mb-3">
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
							v-show="pageCount < 6 || (p==1 || p==2 || (page==0 && p==3) || ((page==0||page==1) && p==4) || (p > page-1 && p < page+3) || ((page==pageCount-1||page==pageCount-2) && p==pageCount-3) || (page==pageCount-1 && p==pageCount-2) || p==pageCount-1 || p==pageCount)"
						>
							<span v-show="pageCount>=6 && page>2 && p==2">...</span>
							<a class="c-hand" v-show="pageCount < 6 || (p==1 || (page==0 && p==3) || ((page==0||page==1) && p==4) || (p > page-1 && p < page+3) || ((page==pageCount-1||page==pageCount-2) && p==pageCount-3) || (page==pageCount-1 && p==pageCount-2) || p==pageCount)" @click="page = p-1">
								{{ p }}
							</a>
							<span v-show="pageCount>=6 &&page<pageCount-3 && p==pageCount-1">...</span>
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
						<input type="search" v-model="search" class="form-input input-lg" :placeholder="$t('placeholder.searchSetlistTitle')" />
						<div class="dropdown dropdown-right">
							<div class="btn-group">
								<a class="btn input-group-btn btn-secondary btn-lg dropdown-toggle" :class="{ 'badge': filter!='' }" tabindex="0">
									<ion-icon name="filter-sharp"></ion-icon>
								</a>
								<ul class="menu text-left">
									<li class="menu-item">
										<!-- filter year -->
										<select v-model="filter" class="form-select select-lg filter" required>
											<option value="" disabled selected>{{ $t('placeholder.year') }}.</option>
											<option v-for="year in setlistYears" :key="year" :value="year">{{ year }}</option>
										</select>
									</li>
									<li class="menu-item">
										<!-- reset filter -->
										<button class="btn input-group-btn btn-lg btn-secondary btn-error stretch" @click="search=''; filter=''">
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
			<table v-if="ready.setlists" class="table table-striped table-hover">
				<thead>
					<tr>
						<th></th>
						<th class="c-hand hide-xl" :class="{ 'bg-primary-dark': order.field == 'date' }" @click="sortList('date')">
							{{ $t('field.date') }}
							<ion-icon v-if="order.field == 'date' && !order.ascending" class="icon-right" name="caret-down"></ion-icon>
							<ion-icon v-if="order.field == 'date' && order.ascending" class="icon-right" name="caret-up"></ion-icon>
						</th>
						<th class="c-hand" :class="{ 'bg-primary-dark': order.field == 'title' }" @click="sortList('title')">
							{{ $t('field.title') }}
							<ion-icon v-if="order.field == 'title' && !order.ascending" class="icon-right" name="caret-down"></ion-icon>
							<ion-icon v-if="order.field == 'title' && order.ascending" class="icon-right" name="caret-up"></ion-icon>
						</th>
						<th class="c-hand" :class="{ 'bg-primary-dark': order.field == 'creator' }" @click="sortList('creator')">
							{{ $t('field.creator') }}
							<ion-icon v-if="order.field == 'creator' && !order.ascending" class="icon-right" name="caret-down"></ion-icon>
							<ion-icon v-if="order.field == 'creator' && order.ascending" class="icon-right" name="caret-up"></ion-icon>
						</th>
						<th class="c-hand hide-xl" :class="{ 'bg-primary-dark': order.field == 'songs' }" @click="sortList('songs')">
							{{ $t('field.songs') }}
							<ion-icon v-if="order.field == 'songs' && !order.ascending" class="icon-right" name="caret-down"></ion-icon>
							<ion-icon v-if="order.field == 'songs' && order.ascending" class="icon-right" name="caret-up"></ion-icon>
						</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(setlist, i) in pagedSetlists" :key="i">
						<td class="c-hand" @click="$router.push({ name: 'setlist-show', params: { id: setlist.id }})">
							<div class="s-circle s-circle-state ml-3" :class="{ active: setlist.active }"></div>
						</td>
						<td class="hide-xl c-hand" @click="$router.push({ name: 'setlist-show', params: { id: setlist.id }})">
							{{ setlist.date | humanDate }}
						</td>
						<td class="c-hand" @click="$router.push({ name: 'setlist-show', params: { id: setlist.id }})">
							{{ setlist.title }}
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
											<a href="#" class="py-3 px-3" @click.prevent="active.title=setlist.title; active.setlist=setlist; active.key=setlist.id; active.existing=true; modal.set=true">
												<ion-icon name="create-outline" class="mr-2"></ion-icon> {{ $t('button.edit') }}
											</a>
										</li>
										<li v-if="user && role > 1" class="menu-item">
											<a href="#" class="py-3 px-3" @click.prevent="active.title=setlist.title; active.setlist=setlist; active.key=setlist.id; active.existing=false; modal.set=true">
												<ion-icon name="copy-outline" class="mr-2"></ion-icon> {{ $t('button.duplicate') }}
											</a>
										</li>
										<li v-if="user && role > 2" class="menu-item">
											<a href="#" class="py-3 px-3 text-error" @click.prevent="active.title=setlist.title; active.key=setlist.id; modal.delete=true">
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
				:db="db"
				:active="modal.set"
				:existing="active.existing"
				:initialSetlist="active.setlist"
				:setlistKey="active.key"
				:user="user"
				:songs="songs"
				:setlists="setlists"
				:tags="tags"
				:ready="ready"
				@closed="modal.set = false"
			/>
			<SetlistDelete
				v-if="modal.delete"
				:db="db"
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
import SetlistSet from '@/modals/SetlistSet'
import SetlistDelete from '@/modals/SetlistDelete'

export default {
	name: 'setlists',
	props: ['db', 'songs', 'setlists', 'tags', 'users', 'user', 'role', 'ready'],
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
	computed: {
		setlistsArray () {
			let self = this
			let setlists = Object.keys(this.setlists).map(function (key) {
				let setlist = self.setlists[key]
				setlist['id'] = key
				return setlist
			})
			setlists.sort(function(a, b) {
				let propA, propB
				if (self.order.field == 'songs') {
					propA = a.songs.length
					propB = b.songs.length
				} else if (self.order.field == 'creator') {
					propA = self.users[a.creator] ? self.users[a.creator].name : ''
					propB = self.users[b.creator] ? self.users[b.creator].name : ''
				} else {
					propA = String(a[self.order.field]).toLowerCase().trim()
					propB = String(b[self.order.field]).toLowerCase().trim()
				}
				if (self.order.ascending) {
					if (propA < propB) { return -1 }
					if (propA > propB) { return 1 }
				} else {
					if (propA < propB) { return 1 }
					if (propA > propB) { return -1 }
				}
				return 0
			})
			return setlists
		},
		filteredSetlists() {
			var setlists = this.setlistsArray, self = this
			if (this.search != '') {
				setlists = setlists.filter(setlist => {
					// filter fields: title, date
					var key = self.search.toLowerCase()
					return setlist.title.toLowerCase().indexOf(key) !== -1 || setlist.date.toLowerCase().indexOf(key) !== -1
				})
			}
			if (this.filter != '') {
				setlists = setlists.filter(setlist => {
					// filter field: date(Y)
					return setlist.date.substring(0,4).indexOf(self.filter) !== -1
				})
			}
			return setlists
		},
		setlistYears() {
			if (this.ready.setlists) {
				let start = parseInt(Object.keys(this.setlists).slice(-1)[0].substring(0, 4))
				let end = parseInt((new Date()).getFullYear())
				return Array.from(Array(end-start+1).keys(), x => x + start).reverse()
			} else {
				return []
			}
		},
		pagedSetlists () {
			return this.filteredSetlists.slice(this.page*this.listLength, (this.page+1)*this.listLength)
		},
		isFirstPage () {
			return this.page == 0
		},
		isLastPage () {
			return this.pagedSetlists.length < this.listLength
		},
		pageCount () {
			return Math.ceil(this.filteredSetlists.length/this.listLength)
		}
	},
	methods: {
		sortList (field) {
			if (this.order.field == field) {
				this.order.ascending = !this.order.ascending
			} else {
				this.order.ascending = true
			}
			this.order.field = field
		}
	},
	filters: {
		humanDate (d) {
			if (!d) return ''
			let options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }
			return (new Date(d)).toLocaleDateString(navigator.language, options)
		}
	},
	watch: {
		search () {
			this.page = 0
		},
		filter () {
			this.page = 0
		},
	}
}
</script>

<style lang="scss">

</style>
