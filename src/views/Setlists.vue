<template>
	<div class="setlists">
		<div class="container no-sidebar">
			<div class="columns">
				<!-- heading -->
				<div class="column col-4 col-xl-12">
					<h2 class="view-title">
						<span v-if="ready.setlists" class="label text-bold mr-2 px-2">{{ Object.keys(filteredSetlists).length }}</span>
						<div v-else class="loading loading-lg d-inline-block mr-3 px-3"></div>
						Setlists
					</h2>
				</div>
				<!-- search title, subtitles -->
				<div class="column col-5 col-xl-6 col-sm-12 mb-1">
					<div class="input-group filter">
						<span class="input-group-addon addon-lg"><i class="form-icon icon ion-md-search"></i></span>
						<input type="search" v-model="search" class="form-input input-lg" placeholder="Search in titles ..." />
						<button class="btn input-group-btn btn-lg btn-link" @click="search = ''"><i class="form-icon icon ion-md-close"></i></button>
					</div>
				</div>
				<!-- filter tags -->
				<div class="column col-3 col-xl-6 col-sm-12 mb-1">
					<div class="input-group filter">
						<span class="input-group-addon addon-lg"><i class="form-icon icon ion-md-calendar"></i></span>
						<select v-model="filter" class="form-select select-lg filter" required>
							<option value="" disabled selected>Filter for years ...</option>
							<option v-for="year in setlistYears" :key="year" :value="year">{{ year }}</option>
						</select>
						<button class="btn input-group-btn btn-lg btn-link" @click="filter = ''"><i class="form-icon icon ion-md-close"></i></button>
					</div>
				</div>
			</div>

			<table v-if="ready.setlists" class="table table-striped table-hover">
				<thead>
					<tr>
						<th></th>
						<th class="hide-xl">Date</th>
						<th class="">Title</th>
						<th class="hide-xl"># Songs</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(setlist, i) in filteredSetlists" :key="i">
						<td class="c-hand" @click="$router.push({ name: 'setlist-show', params: { id: i }})">
							<div class="s-circle s-circle-state ml-3" :class="{ active: setlist.active }"></div>
						</td>
						<td class="hide-xl c-hand" @click="$router.push({ name: 'setlist-show', params: { id: i }})">
              {{ setlist.date }}
            </td>
						<td class="c-hand" @click="$router.push({ name: 'setlist-show', params: { id: i }})">
              {{ setlist.title }}
            </td>
						<td class="hide-xl c-hand" @click="$router.push({ name: 'setlist-show', params: { id: i }})">
              {{ setlist.songs.length }}
            </td>
						<td class="text-right">
							<div class="dropdown dropdown-right">
								<div class="btn-group">
									<a class="btn btn-primary dropdown-toggle" tabindex="0">
										Action
										<i class="icon ion-md-arrow-dropdown"></i>
									</a>
									<ul class="menu text-left">
										<li class="menu-item">
											<router-link :to="{ name: 'setlist-show', params: { id: i }}" class="py-3 px-3">
												<i class="icon ion-md-eye mr-2"></i> Show
											</router-link>
										</li>
										<li v-if="user && role > 1" class="menu-item">
											<a href="#" class="py-3 px-3" @click.prevent="active.title=setlist.title; active.setlist=setlist; active.key=i; active.existing=true; modal.set=true">
												<i class="icon ion-md-create mr-2"></i> Edit
											</a>
										</li>
										<li v-if="user && role > 1" class="menu-item">
											<a href="#" class="py-3 px-3" @click.prevent="active.title=setlist.title; active.setlist=setlist; active.key=i; active.existing=false; modal.set=true">
												<i class="icon ion-md-copy mr-2"></i> Duplicate
											</a>
										</li>
										<li v-if="user && role > 2" class="menu-item">
											<a href="#" class="py-3 px-3 text-error" @click.prevent="active.title=setlist.title; active.key=i; modal.delete=true">
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
			<SetlistSet
				v-if="modal.set"
				:active="modal.set"
				:existing="active.existing"
				:initialSetlist="active.setlist"
				:setlistKey="active.key"
				:songs="songs"
				:tags="tags"
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
import SetlistSet from '@/components/SetlistSet.vue'
import SetlistDelete from '@/components/SetlistDelete.vue'

export default {
	name: 'setlists',
	props: ['songs', 'setlists', 'tags', 'user', 'role', 'ready'],
	components: {
		SetlistSet,
		SetlistDelete,
	},
	data () {
		return {
			search: '',
			filter: this.$route.params.year ? this.$route.params.year : '',
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
				setlists = Object.filter(setlists, function(setlist) {
					// filter fields: title, date
					var key = self.search.toLowerCase()
					return setlist.title.toLowerCase().indexOf(key) !== -1 || setlist.date.toLowerCase().indexOf(key) !== -1
				})
			}
			if (this.filter != '') {
				setlists = Object.filter(setlists, function(setlist) {
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
