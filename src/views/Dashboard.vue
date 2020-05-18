<template>
	<div class="dashboard">
		<div class="container no-sidebar">
			<!-- heading -->
			<div class="columns">
				<div class="column">
					<h2 class="view-title">
						{{ $t('page.dashboard')}}
					</h2>
				</div>
			</div>
				<!-- loader -->
			<div class="columns col-12 py-4 my-4" v-if="!ready.songs || !ready.setlists">
				<div class="column">
					<div class="loading loading-xl"></div>
				</div>
			</div>
			<!-- stored songs count -->
			<div class="columns" v-if="ready.songs && ready.setlists">
				<div class="column col-3 col-xl-6 col-sm-12 mt-4">
					<div class="panel">
						<div class="panel-body text-center pb-3">
							<div class="text-huge">{{ Object.keys(songs).length }}</div>
							<div class="panel-title h5"><ion-icon name="musical-notes" class="mr-2"></ion-icon> {{ $t('widget.songsStored') }}</div>
						</div>
					</div>
				</div>
				<!-- stored setlists count -->
				<div class="column col-3 col-xl-6 col-sm-12 mt-4">
					<div class="panel">
						<div class="panel-body text-center pb-3">
							<div class="text-huge">{{ Object.keys(setlists).length }}</div>
							<div class="panel-title h5"><ion-icon name="list" class="mr-2"></ion-icon> {{ $t('widget.setlistsStored') }}</div>
						</div>
					</div>
				</div>
				<!-- performed songs count -->
				<div class="column col-3 col-xl-6 col-sm-12 mt-4">
					<div class="panel">
						<div class="panel-body text-center pb-3">
							<div class="text-huge"><span class="text-gray">~</span>{{ songsPerformed }}</div>
							<div class="panel-title h5"><ion-icon name="mic-outline" class="mr-2"></ion-icon> {{ $t('widget.songsPerformed') }}</div>
						</div>
					</div>
				</div>
				<!-- languages count -->
				<div class="column col-3 col-xl-6 col-sm-12 mt-4">
					<div class="panel">
						<div class="panel-body text-center pb-3">
							<div class="text-huge">{{ Object.keys(songLanguages()).length }}</div>
							<div class="panel-title h5"><ion-icon name="globe-outline"></ion-icon> {{ $t('widget.languages') }}</div>
						</div>
					</div>
				</div>
			</div>
			<!-- song list -->
			<div class="columns" v-if="ready.songs && ready.setlists">
				<div class="column col-4 col-xl-6 col-md-12 mt-4">
					<div class="panel">
						<div class="panel-header">
							<div class="panel-title h5">
								{{ $t('widget.' + songsProperty) }} {{ $t('page.songs') }}
								<div class="btn-group float-right">
									<button class="btn btn-secondary px-3" :class="{ disabled: isFirstSongPage }" @click="!isFirstSongPage ? songsPage-- : null">
										<ion-icon name="arrow-back"></ion-icon>
									</button>
									<button class="btn btn-secondary px-3" :class="{ disabled: isLastSongPage }" @click="!isLastSongPage ? songsPage++ : null">
										<ion-icon name="arrow-forward"></ion-icon>
									</button>
								</div>
							</div>
						</div>
						<div class="panel-body">
							<div
								v-for="(song, i) in songlist"
								:key="i"
								class="tile tile-centered tile-hover c-hand p-2"
								@click="$router.push({ name: 'song-show', params: { id: song.id }})"
							>
								<div class="tile-icon">
									<figure class="avatar s-rounded" :data-initial="song.tuning" :title="$t('title.songTuning')"></figure>
									<figure
										v-if="songsProperty == 'popular'"
										class="avatar avatar-secondary s-rounded float-right ml-1"
										:data-initial="song.popularity + 'x'"
										:title="$t('title.songOccuredOn', { num: song.popularity })"
									></figure>
									<figure
										v-if="songsProperty == 'newest' || songsProperty == 'oldest'"
										class="avatar avatar-secondary s-rounded float-right ml-1"
										:data-initial="song.year ? song.year : '—'"
										:title="song.year ? $t('title.songPublishedIn', { year: song.year }) : $t('title.noYear')"
									></figure>
								</div>
								<div class="tile-content">
									<div class="tile-title">{{ song.title }}</div>
									<div class="tile-subtitle text-gray text-small">{{ song.subtitle }}</div>
								</div>
							</div>
						</div>
						<div class="panel-footer">
							<div class="btn-group">
								<button class="btn btn-secondary" @click="shuffleSongs"><ion-icon name="shuffle" class="mr-2"></ion-icon>{{ $t('button.shuffle') }}</button>
								<button v-if="songsProperty != 'newest'" class="btn btn-secondary" @click="newestSongs"><ion-icon name="arrow-up" class="mr-2"></ion-icon>{{ $t('widget.newest') }}</button>
								<button v-if="songsProperty == 'newest'" class="btn btn-secondary" @click="oldestSongs"><ion-icon name="arrow-down" class="mr-2"></ion-icon>{{ $t('widget.oldest') }}</button>
								<button class="btn btn-secondary" @click="popularSongs"><ion-icon name="trending-up" class="mr-2"></ion-icon>{{ $t('widget.popular') }}</button>
							</div>
						</div>
						<div class="panel-link">
							<router-link to="/songs" class="btn btn-link btn-block">{{ $t('widget.goToSongs') }} <ion-icon name="arrow-forward" class="ml-1"></ion-icon></router-link>
						</div>
					</div>
				</div>
				<!-- setlist list -->
				<div class="column col-4 col-xl-6 col-md-12 mt-4">
					<div class="panel">
						<div class="panel-header">
							<div class="panel-title h5">
								{{ $t('widget.' + setlistsProperty) }} {{ $t('page.setlists') }}
								<div class="btn-group float-right">
									<button class="btn btn-secondary float-right px-3" :class="{ disabled: isFirstSetlistPage }" @click="!isFirstSetlistPage ? setlistsPage-- : null">
										<ion-icon name="arrow-back"></ion-icon>
									</button>
									<button class="btn btn-secondary float-right px-3" :class="{ disabled: isLastSetlistPage }" @click="!isLastSetlistPage ? setlistsPage++ : null">
										<ion-icon name="arrow-forward"></ion-icon>
									</button>
								</div>
							</div>
						</div>
						<div class="panel-body">
							<div
								v-for="(setlist, i) in setlistlist"
								:key="i"
								class="tile tile-centered tile-hover c-hand p-2"
								@click="$router.push({ name: 'setlist-show', params: { id: setlist.id }})"
							>
								<div class="tile-icon">
									<figure
										class="avatar avatar-secondary s-rounded"
										:data-initial="setlist.songs.length"
										:title="$t('title.setlistContains', { num: setlist.songs.length})"
									></figure>
								</div>
								<div class="tile-content">
									<div class="tile-title">{{ setlist.title }}</div>
									<div class="tile-subtitle text-gray text-small">{{ setlist.date }}</div>
								</div>
							</div>
						</div>
						<div class="panel-footer">
							<div class="btn-group">
								<button v-if="setlistsProperty != 'newest'" class="btn btn-secondary" @click="newestSetlists"><ion-icon name="arrow-up" class="mr-2"></ion-icon>{{ $t('widget.newest') }}</button>
								<button v-if="setlistsProperty == 'newest'" class="btn btn-secondary" @click="oldestSetlists"><ion-icon name="arrow-down" class="mr-2"></ion-icon>{{ $t('widget.oldest') }}</button>
							</div>
						</div>
						<div class="panel-link">
							<router-link to="/setlists" class="btn btn-link btn-block">{{ $t('widget.goToSetlists') }} <ion-icon name="arrow-forward" class="ml-1"></ion-icon></router-link>
						</div>
					</div>
				</div>
				<!-- song of the year -->
				<div class="column col-4 col-xl-6 col-md-12 mt-4">
					<div class="panel">
						<div class="panel-header">
							<div class="panel-title h5">
								{{ $t('widget.songOfYear') }}
							</div>
						</div>
						<div class="panel-body">
							<div
								v-for="(song, year) in songOfYear"
								:key="year"
								class="tile tile-centered tile-hover c-hand p-2"
								@click="$router.push({ name: 'song-show', params: { id: song.id}})"
							>
								<div class="tile-icon">
									<figure class="avatar avatar-secondary bg-primary s-rounded" :data-initial="year"></figure>
									<figure class="avatar avatar-secondary s-rounded ml-1" :data-initial="song.count + 'x'" :title="$t('title.songOccuredOn', { num: song.count })"></figure>
								</div>
								<div class="tile-content">
									<div class="tile-title">{{ songs[song.id].title }}</div>
									<div class="tile-subtitle text-gray text-small">{{ songs[song.id].subtitle }}</div>
								</div>
							</div>
						</div>
						<div class="panel-link">
							<router-link to="/songs" class="btn btn-link btn-block">{{ $t('widget.goToSongs') }} <ion-icon name="arrow-forward" class="ml-1"></ion-icon></router-link>
						</div>
					</div>
				</div>
			</div>
			<div class="columns" v-if="ready.songs && ready.setlists">
				<div class="column col-4 col-xl-6 col-md-12 mt-4">
					<div class="panel">
						<div class="panel-header">
							<div class="panel-title h5">
								{{ $t('widget.setlistsCreatedPerYear') }}
							</div>
						</div>
						<div class="panel-body">
							<LineChart
								:datasets="setlistsPerYear.datasets"
								:labels="setlistsPerYear.labels"
							/>
						</div>
					</div>
				</div>
				<div class="column col-4 col-xl-6 col-md-12 mt-4">
					<div class="panel">
						<div class="panel-header">
							<div class="panel-title h5">
								{{ $t('widget.songsPerformedPerYear') }}
							</div>
						</div>
						<div class="panel-body">
							<LineChart
								:datasets="songsPerYear.datasets"
								:labels="songsPerYear.labels"
							/>
						</div>
					</div>
				</div>
				<div class="column col-4 col-xl-6 col-md-12 mt-4">
					<div class="panel">
						<div class="panel-header">
							<div class="panel-title h5">
								{{ $t('widget.setlistsPerWeekday') }}
							</div>
						</div>
						<div class="panel-body">
							<BarChart
								:datasets="setlistsPerWeekday.datasets"
								:labels="setlistsPerWeekday.labels"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
// get components
import LineChart from '@/charts/LineChart'
import BarChart from '@/charts/BarChart'

export default {
	name: 'dashboard',
	props: ['songs', 'setlists', 'ready'],
	components: {
		LineChart,
		BarChart,
	},
	data () {
		return {
			songsProperty: 'newest',
			reorderedSongs: [],
			songsPage: 0,
			setlistsProperty: 'newest',
			reorderedSetlists: [],
			setlistsPage: 0,
			listLength: 6,
		}
	},
	methods: {
		shuffleSongs () {
			this.songsPage = 0
			this.songsProperty = 'random'
			let songs = this.songsArray
			for (let i = songs.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[songs[i], songs[j]] = [songs[j], songs[i]]
			}
			this.reorderedSongs = [...songs]
		},
		newestSongs () {
			this.songsPage = 0
			this.songsProperty = 'newest'
			this.reorderedSongs = this.songsArray.filter(s => s.year > 0).sort((a, b) => (a.year < b.year) ? 1 : ((b.year < a.year) ? -1 : 0))
		},
		oldestSongs () {
			this.songsPage = 0
			this.songsProperty = 'oldest'
			this.reorderedSongs = this.songsArray.filter(s => s.year > 0).sort((a, b) => (a.year > b.year) ? 1 : ((b.year > a.year) ? -1 : 0))
		},
		popularSongs () {
			this.songsPage = 0
			this.songsProperty = 'popular'
			let popularSongs = {}
			this.setlistsArray.forEach(setlist => {
				if (setlist.songs) {
					setlist.songs.forEach(song => {
						if (!popularSongs.hasOwnProperty(song.id)) {
							popularSongs[song.id] = 1
						} else {
							popularSongs[song.id]++
						}
					})
				}
			})
			var idList = []
			for (var id in popularSongs) {
				idList.push([id, popularSongs[id]])
			}
			let orderedSongIds = idList.sort((a, b) => b[1] - a[1]).reduce((a, c) => a.concat(c[0]), [])
			this.reorderedSongs = this.songsArray
				.filter(s => orderedSongIds.includes(s.id))
				.map(s => Object.assign({popularity: popularSongs[s.id]}, s))
				.sort((a, b) => (a.popularity < b.popularity) ? 1 : ((b.popularity < a.popularity) ? -1 : 0))
		},
		newestSetlists () {
			this.setlistsPage = 0
			this.setlistsProperty = 'newest'
			this.reorderedSetlists = this.setlistsArray.filter(s => s.date != '').sort((a,b) => (new Date(a.date) < new Date(b.date)) ? 1 : ((new Date(b.date) < new Date(a.date)) ? -1 : 0))
		},
		oldestSetlists () {
			this.setlistsPage = 0
			this.setlistsProperty = 'oldest'
			this.reorderedSetlists = this.setlistsArray.filter(s => s.date != '').sort((a,b) => (new Date(a.date) > new Date(b.date)) ? 1 : ((new Date(b.date) > new Date(a.date)) ? -1 : 0))
		},
	},
	computed: {
		songsPerformed () {
			return this.setlistsArray.reduce((a, c) => a + c.songs.length, 0)
		},
		songsArray () {
			let self = this
			let songs = Object.keys(this.songs).map(function (key) {
				let song = self.songs[key]
				song['id'] = key
				return song
			})
			return songs.filter(s => s.year > 0).sort((a, b) => (a.year < b.year) ? 1 : ((b.year < a.year) ? -1 : 0))
		},
		songlist () {
			if (this.reorderedSongs.length === 0) {
				return this.songsArray.slice(this.songsPage*this.listLength, (this.songsPage+1)*this.listLength)
			} else {
				return this.reorderedSongs.slice(this.songsPage*this.listLength, (this.songsPage+1)*this.listLength)
			}
		},
		setlistsArray () {
			let self = this
			return Object.keys(this.setlists).map(function (key) {
				let setlist = self.setlists[key]
				setlist['id'] = key
				return setlist
			})
		},
		setlistlist () {
			if (this.reorderedSetlists.length === 0) {
				return this.setlistsArray.slice(this.setlistsPage*this.listLength, (this.setlistsPage+1)*this.listLength)
			} else {
				return this.reorderedSetlists.slice(this.setlistsPage*this.listLength, (this.setlistsPage+1)*this.listLength)
			}
		},
		songOfYear () {
			let popularSongs = {}
			this.setlistsArray.forEach(setlist => {
				let year = setlist.date.slice(0, 4)
				if (year && setlist.songs) {
					if (!popularSongs.hasOwnProperty(year)) {
						popularSongs[year] = {}
					}
					setlist.songs.forEach(song => {
						if (!popularSongs[year].hasOwnProperty(song.id)) {
							popularSongs[year][song.id] = 1
						} else {
							popularSongs[year][song.id]++
						}
					})
				}
			})
			let songsToYear = {}
			for (let year in popularSongs) {
				let maxId = '', maxCount = 0
				for (let id in popularSongs[year]) {
					if (popularSongs[year][id] > maxCount) {
						maxId = id
						maxCount = popularSongs[year][id]
					}
				}
				songsToYear[year] = { id: maxId, count: maxCount }
			}
			return songsToYear
		},
		setlistsPerYear () {
			let years = {}
			this.setlistsArray.forEach(setlist => {
				let year = setlist.date.slice(0, 4)
				if (year) {
					if (!years.hasOwnProperty(year)) {
						years[year] = 1
					} else {
						years[year]++
					}
				}
			})
			return {
				datasets: [
					{ label: ' ' + this.$t('page.setlists'), data: Object.values(years), color: 'rgb(136, 181, 68)', bcolor: 'rgb(136, 181, 68, .1)'  },
				],
				labels: Object.keys(years)
			}
		},
		songsPerYear () {
			let years = {}
			this.setlistsArray.forEach(setlist => {
				let year = setlist.date.slice(0, 4)
				if (year) {
					if (!years.hasOwnProperty(year)) {
						years[year] = 0
					}
					years[year] += setlist.songs.length
				}
			})
			return {
				datasets: [
					{ label: ' ' + this.$t('page.songs'), data: Object.values(years), color: 'rgb(136, 181, 68)', bcolor: 'rgb(136, 181, 68, .1)'  },
				],
				labels: Object.keys(years)
			}
		},
		setlistsPerWeekday () {
			let weekday = {}
			for (let i = 0; i < this.getWeekDays.length; i++) {
				weekday[this.getWeekDays[i]] = 0
			}
			this.setlistsArray.forEach(setlist => {
				let w = (new Date(setlist.date)).toLocaleDateString(this.$i18n.locale, { weekday: 'long' })
				weekday[w]++
			})
			return {
				datasets: [
					{ label: ' ' + this.$t('page.setlists'), data: Object.values(weekday), color: 'rgb(136, 181, 68)', bcolor: 'rgb(136, 181, 68, .1)'  },
				],
				labels: Object.keys(weekday).map(d => d.slice(0,2))
			}
		},
		getWeekDays () {
			var d = new Date(Date.UTC(2017, 0, 2)); // start with a Monday
			var names = [];
			for(let i = 0; i < 7; i++) {
				names.push(d.toLocaleDateString(this.$i18n.locale, { weekday: 'long' }));
				d.setDate(d.getDate() + 1);
			}
			return names;
		},
		isFirstSongPage () {
			return this.songsPage == 0
		},
		isLastSongPage () {
			return this.songlist.length < this.listLength
		},
		isFirstSetlistPage () {
			return this.setlistsPage == 0
		},
		isLastSetlistPage () {
			return this.setlistlist.length < this.listLength
		}
	}
}
</script>

<style lang="scss">
.dashboard {
	.avatar-secondary {
		width: 2rem;
		font-size: 0.7rem;

		&::before {
			text-transform: unset;
		}
	}
}
</style>
