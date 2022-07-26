<template>
	<div class="songs">
		<div
			class="container no-sidebar"
			ref="container"
			tabindex="0"
			@keydown.left.exact="!isFirstPage && !noSongs ? page-- : null"
			@keydown.right.exact="!isLastPage && !noSongs ? page++ : null"
			@keydown.ctrl.70.prevent="!noSongs ? $refs.search.focus() : null"
			@keydown.esc.exact="search=''; filter=''; tuning=''"
		>
			<div class="columns">
				<!-- heading -->
				<div class="column col-12">
					<h2 class="view-title">
						<span v-if="ready.songs" class="text-bold">{{ Object.keys(filteredSongs).length }}</span>
						<div v-else class="loading loading-lg d-inline-block mr-3 px-3"></div>
						{{ $t('page.songs') }}
					</h2>
				</div>
			</div>

			<div v-if="noSongs" class="columns mt-2">
				<!-- heading -->
				<div class="column col-12">
					<span v-if="user && role">{{ $t('text.noSongsAvailableSignedIn') }}</span>
					<span v-else>{{ $t('text.noSongsAvailableSignedOut') }}</span>
				</div>
			</div>

			<div v-if="ready.songs && !noSongs" class="columns mt-2 mb-3">
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
							:placeholder="$t('placeholder.searchSongTitle')"
						/>
						<div class="dropdown dropdown-right">
							<div class="btn-group">
								<a
									class="btn input-group-btn btn-secondary btn-lg dropdown-toggle"
									:class="{ 'badge': filter!=''||tuning!=''||language!=''}"
									tabindex="0"
								>
									<ion-icon name="filter-sharp"></ion-icon>
								</a>
								<ul class="menu text-left">
									<li class="menu-item">
										<!-- filter tag -->
										<select v-model="filter" class="form-select select-lg filter">
											<option value="" disabled selected>{{ $t('placeholder.tag') }}</option>
											<option v-for="tag in tags" :key="tag.key" :value="tag.key">
												{{ tag[$i18n.locale] ? tag[$i18n.locale] : tag.key }}
											</option>
										</select>
									</li>
									<li class="menu-item">
										<!-- filter key -->
										<select v-model="tuning" class="form-select select-lg filter">
											<option value="" disabled selected>{{ $t('placeholder.tuning') }}</option>
											<option v-for="t in keyScale()" :key="t" :value="t">{{ t }}</option>
										</select>
									</li>
									<li class="menu-item">
										<!-- filter language -->
										<select v-model="language" class="form-select select-lg filter">
											<option value="" disabled selected>{{ $t('placeholder.language') }}</option>
											<option v-for="(l, k) in languages" :key="k" :value="k">{{ l.label }}</option>
										</select>
									</li>
									<li class="menu-item">
										<!-- reset filter -->
										<button
											class="btn input-group-btn btn-lg btn-error-secondary stretch"
											@click="search=''; filter=''; tuning=''; language=''"
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
		
			<!-- song list -->
			<table v-if="ready.songs && !noSongs" class="table table-striped table-hover">
				<thead>
					<tr>
						<th
							v-for="col in ['title', 'subtitle', 'authors', 'year', 'tuning']"
							class="c-hand"
							:class="{
								'bg-primary-dark': order.field == col,
								'hide-md': col == 'authors',
								'hide-xl': col == 'subtitle' || col == 'year'
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
					<tr v-for="(song, i) in pagedSongs" :key="i">
						<td class="c-hand" @click="$router.push({ name: 'song-show', params: { id: song.id }})">
							{{ song.title }} <div class="show-xl text-gray">{{ song.subtitle }}</div>
						</td>
						<td class="hide-xl c-hand" @click="$router.push({ name: 'song-show', params: { id: song.id }})">
							{{ song.subtitle }}
						</td>
						<td class="hide-md c-hand" @click="$router.push({ name: 'song-show', params: { id: song.id }})">
							{{ song.authors }}
						</td>
						<td class="hide-xl c-hand" @click="$router.push({ name: 'song-show', params: { id: song.id }})">
							{{ song.year }}
						</td>
						<td class="text-center c-hand" @click="$router.push({ name: 'song-show', params: { id: song.id }})">
							{{ song.tuning }}
						</td>
						<td class="text-right">
							<div class="dropdown dropdown-right">
								<div class="btn-group">
									<a class="btn btn-primary dropdown-toggle" tabindex="0">
										<ion-icon name="ellipsis-horizontal-outline"></ion-icon>
									</a>
									<ul class="menu text-left">
										<li class="menu-item">
											<router-link :to="{ name: 'song-show', params: { id: song.id }}" class="py-3 px-3">
												<ion-icon name="eye-outline" class="mr-2"></ion-icon> {{ $t('button.show') }}
											</router-link>
										</li>
										<li v-if="user && role > 1" class="menu-item">
											<a
												href="#"
												class="py-3 px-3"
												@click.prevent="editDialog(song, true)"
											>
												<ion-icon name="create-outline" class="mr-2"></ion-icon> {{ $t('button.edit') }}
											</a>
										</li>
										<li v-if="user && role > 1" class="menu-item">
											<a
												href="#"
												class="py-3 px-3"
												@click.prevent="editDialog(song, false)"
											>
												<ion-icon name="copy-outline" class="mr-2"></ion-icon> {{ $t('button.duplicate') }}
											</a>
										</li>
										<li v-if="user && role > 2" class="menu-item">
											<a
												href="#"
												class="py-3 px-3 text-error"
												@click.prevent="deleteDialog(song)"
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
			<SongSet
				v-if="modal.set"
				:active="modal.set"
				:existing="active.existing"
				:initialSong="active.song"
				:songKey="active.key"
				:songs="songs"
				:setlists="setlists"
				:tags="tags"
				:languages="languages"
				:ready="ready"
				@closed="modal.set = false"
			/>
			<SongDelete
				v-if="modal.delete"
				:active="modal.delete"
				:title="active.title"
				:id="active.key"
				:songs="songs"
				@closed="modal.delete = false"
			/>
		</div>
	</div>
</template>

<script>
import { defineComponent } from 'vue';

// get components
import SongSet from '@/modals/SongSet';
import SongDelete from '@/modals/SongDelete';

export default defineComponent({
	name: 'songs',
	props: ['songs', 'setlists', 'tags', 'languages', 'user', 'role', 'ready'],
	components: {
		SongSet,
		SongDelete,
	},
	data () {
		return {
			search: '',
			filter: this.$route.params.tag ? this.$route.params.tag : '',
			tuning: '',
			language: '',
			page: 0,
			listLength: 12,
			order: { 
				field: 'title',
				ascending: true
			},
			modal: {
				set: false,
				delete: false,
			},
			active: {
				title: '',
				key: '',
				song: {},
				existing: true
			}
		}
	},
	mounted () {
		this.$refs.container.focus();
	},
	computed: {
		songsArray () {
			let songs = Object.keys(this.songs).map((key) => {
				let song = this.songs[key];
				song['id'] = key;
				return song;
			})
			songs.sort((a, b) => {
				var propA = String(a[this.order.field]).toLowerCase().trim();
				var propB = String(b[this.order.field]).toLowerCase().trim();
				if (this.order.ascending) {
					if (propA < propB) { return -1 };
					if (propA > propB) { return 1 };
				} else {
					if (propA < propB) { return 1 };
					if (propA > propB) { return -1 };
				}
				return 0;
			})
			return songs;
		},
		filteredSongs () {
			var songs = this.songsArray;
			if (this.search != '') {
				songs = songs.filter(song => {
					// filter fields: title, subtitle
					var key = this.search.toLowerCase();
					return song.title.toLowerCase().indexOf(key) !== -1
						|| song.subtitle.toLowerCase().indexOf(key) !== -1
						|| song.content.toLowerCase().indexOf(key) !== -1
				});
			}
			if (this.filter != '') {
				songs = songs.filter(song => {
					// filter field: tags
					return song.tags.indexOf(this.filter) !== -1;
				});
			}
			if (this.tuning != '') {
				songs = songs.filter(song => {
					// filter field: tuning
					return song.tuning.indexOf(this.tuning) !== -1;
				});
			}
			if (this.language != '') {
				songs = songs.filter(song => {
					// filter field: language
					return song.language.indexOf(this.language) !== -1;
				});
			}
			return songs
		},
		noSongs () {
			return this.ready.songs && this.songsArray.length == 0;
		},
		pagedSongs () {
			return this.filteredSongs.slice(this.page*this.listLength, (this.page+1)*this.listLength);
		},
		isFirstPage () {
			return this.page == 0;
		},
		isLastPage () {
			return this.page == this.pageCount-1;
		},
		pageCount () {
			return Math.ceil(this.filteredSongs.length/this.listLength);
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
		editDialog (song, existing) {
			this.active.title = song.title;
			this.active.song = song;
			this.active.key = song.id;
			this.active.existing = existing;
			this.modal.set = true;
		},
		deleteDialog (song) {
			this.active.title = song.title;
			this.active.key = song.id;
			this.modal.delete = true;
		}
	},
	watch: {
		search () {
			this.page = 0;
		},
		filter () {
			this.page = 0;
		},
		tuning () {
			this.page = 0;
		},
		language () {
			this.page = 0;
		},
	}
});
</script>
