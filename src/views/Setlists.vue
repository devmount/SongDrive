<template>
	<div class="setlists">
		<div class="container no-sidebar">
			<div class="columns">
				<!-- heading -->
				<div class="column col-4 col-xl-12">
					<h2 class="view-title">
						<span v-if="ready" class="label text-bold mr-2 px-2">{{ filteredSetlists.length }}</span>
						<div v-else class="loading loading-lg d-inline-block mr-3 px-3"></div>
						Setlists
					</h2>
				</div>
				<!-- search title, subtitles -->
				<div class="column col-5 col-xl-6 col-sm-12">
					<div class="input-group">
						<span class="input-group-addon addon-lg"><i class="form-icon icon ion-md-search"></i></span>
						<input type="search" v-model="search" class="form-input input-lg" placeholder="Search in titles ..." />
						<button class="btn input-group-btn btn-lg btn-link" @click="search = ''"><i class="form-icon icon ion-md-close"></i></button>
					</div>
				</div>
				<!-- filter tags -->
				<div class="column col-3 col-xl-6 col-sm-12">
					<div class="input-group">
						<span class="input-group-addon addon-lg"><i class="form-icon icon ion-md-calendar"></i></span>
						<select v-model="filter" class="form-select select-lg filter" required>
							<option value="" disabled selected>Filter for years ...</option>
							<option v-for="year in setlistYears" :key="year" :value="year">{{ year }}</option>
						</select>
						<button class="btn input-group-btn btn-lg btn-link" @click="filter = ''"><i class="form-icon icon ion-md-close"></i></button>
					</div>
				</div>
			</div>

			<table v-if="ready" class="table table-striped table-hover">
				<thead>
					<tr>
						<th></th>
						<th class="hide-xl">Date</th>
						<th class="hide-md">Title</th>
						<th class="hide-xl"># Songs</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(setlist, i) in filteredSetlists" :key="i">
						<td class="c-hand" @click="$router.push({ name: 'setlist-show', params: { id: setlist['.key'] }})">
							<div class="s-circle ml-2" :class="{ active: setlist.active }"></div>
						</td>
						<td class="hide-xl c-hand" @click="$router.push({ name: 'setlist-show', params: { id: setlist['.key'] }})">{{ setlist.date }}</td>
						<td class="hide-md c-hand" @click="$router.push({ name: 'setlist-show', params: { id: setlist['.key'] }})">{{ setlist.title }}</td>
						<td class="hide-xl c-hand" @click="$router.push({ name: 'setlist-show', params: { id: setlist['.key'] }})">{{ setlist.songs.length }}</td>
						<td class="text-right">
							<div class="dropdown dropdown-right">
								<div class="btn-group">
									<a class="btn btn-primary dropdown-toggle" tabindex="0">
										Action
										<i class="icon ion-md-arrow-dropdown"></i>
									</a>
									<ul class="menu text-left">
										<li class="menu-item">
											<router-link :to="{ name: 'setlist-show', params: { id: setlist['.key'] }}" class="py-3 px-3">
												<i class="icon ion-md-eye mr-2"></i> Show
											</router-link>
										</li>
										<li class="menu-item">
											<a href="#" class="py-3 px-3" @click.prevent="active.title=setlist.title; active.setlist=setlist; active.existing=true; modal.set=true">
												<i class="icon ion-md-create mr-2"></i> Edit
											</a>
										</li>
										<li class="menu-item">
											<a href="#" class="py-3 px-3" @click.prevent="active.title=setlist.title; active.setlist=setlist; active.existing=false; modal.set=true">
												<i class="icon ion-md-copy mr-2"></i> Duplicate
											</a>
										</li>
										<li class="menu-item">
											<a href="#" class="py-3 px-3 text-error" @click.prevent="active.title=setlist.title; active.key=setlist['.key']; modal.delete=true">
												<i class="icon ion-md-trash mr-2"></i> Delete
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
			<SetlistSet :active="modal.set" :existing="active.existing" :setlist="active.setlist" @closed="modal.set = false" />
			<SetlistDelete :active="modal.delete" :title="active.title" :id="active.key" @closed="modal.delete = false" />

		</div>
	</div>
</template>

<script>
// get components
import SetlistSet from '@/components/SetlistSet.vue'
import SetlistDelete from '@/components/SetlistDelete.vue'
// get database object authorized in config.js
import { db } from '@/firebase'

export default {
	name: 'setlists',
	components: {
		SetlistSet,
		SetlistDelete,
	},
	firestore () {
		return {
			setlists: {
				ref: db.collection('setlists').orderBy('date', 'desc'),
				resolve: () => { this.ready = true },
				reject: () => { this.ready = true }
			},
			tags: db.collection('tags'),
		}
	},
	data () {
		return {
			search: '',
			filter: this.$route.params.year ? this.$route.params.year : '',
			ready: false,
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
		filteredSetlists() {
			var setlists = this.setlists, self = this
			if (this.search != '') {
				setlists = setlists.filter(function(setlist) {
					// filter fields: title, date
					var key = self.search.toLowerCase()
					return setlist.title.toLowerCase().indexOf(key) !== -1 || setlist.date.toLowerCase().indexOf(key) !== -1
				})
			}
			if (this.filter != '') {
				setlists = setlists.filter(function(setlist) {
					// filter field: date(Y)
					return setlist.date.substring(0,4).indexOf(self.filter) !== -1
				})
			}
			return setlists
		},
		setlistYears() {
			if (this.ready) {
				let start = parseInt(this.setlists.slice(-1)[0].date.substring(0, 4))
				let end = parseInt((new Date()).getFullYear())
				return Array.from(Array(end-start+1).keys(), x => x + start)
			} else {
				return []
			}
		}
	}
}
</script>

<style lang="scss">

</style>
