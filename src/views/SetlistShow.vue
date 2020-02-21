<template>
	<div class="setlist-show">
		<div class="off-canvas off-canvas-secondary">
			<!-- secondary sidebar -->
			<div class="off-canvas-sidebar active">
				<div class="sidebar-wrapper">
					<button class="btn btn-secondary d-block stretch mb-1" @click="$router.go(-1)">
						<ion-icon name="arrow-back-outline" class="icon-left"></ion-icon><span class="hide-lg"> BACK</span>
					</button>
					<!-- sidebar: manage -->
					<div v-if="user && role > 1" class="divider text-center show-lg" data-content="M"></div>
					<div v-if="user && role > 1" class="divider text-center hide-lg" data-content="MANAGE"></div>
					<button v-if="user && role > 1" class="btn btn-secondary d-block stretch mb-1" @click="existing=true; modal.set=true">
						<ion-icon name="create-outline" class="icon-left"></ion-icon><span class="hide-lg"> EDIT</span>
					</button>
					<button v-if="user && role > 1" class="btn btn-secondary d-block stretch mb-1" @click="existing=false; modal.set=true">
						<ion-icon name="copy-outline" class="icon-left"></ion-icon><span class="hide-lg"> CLONE</span>
					</button>
					<button v-if="user && role > 2" class="btn btn-secondary btn-error d-block stretch" @click="modal.delete = true">
						<ion-icon name="trash-outline" class="icon-left"></ion-icon><span class="hide-lg"> DELETE</span>
					</button>
					<!-- sidebar: view -->
					<div class="divider text-center show-lg" data-content="V"></div>
					<div class="divider text-center hide-lg" data-content="VIEW"></div>
					<div v-if="setlist && user && role > 1" class="form-group">
						<label class="form-switch switch-lg c-hand">
							<input type="checkbox" v-model="setlist.active" @click.prevent="updateActive">
							<i class="form-icon"></i><span class="hide-lg"> SYNC</span>
						</label>
					</div>
					<div class="form-group">
						<label class="form-switch switch-lg c-hand">
							<input type="checkbox" v-model="chords">
							<i class="form-icon"></i><span class="hide-lg"> CHORDS</span>
						</label>
					</div>
					<button class="btn btn-secondary d-block stretch mb-1" @click="modal.present=true">
						<ion-icon name="videocam-outline" class="icon-left"></ion-icon><span class="hide-lg"> PRESENT</span>
					</button>
					<router-link :to="{ name: 'setlist-show', params: { id: setlistKey }}" target="_blank" class="btn btn-secondary d-block stretch">
						<ion-icon name="open-outline" class="icon-left"></ion-icon><span class="hide-lg"> LAUNCH</span>
					</router-link>
					<!-- sidebar: export -->
					<div class="divider text-center show-lg" data-content="C"></div>
					<div class="divider text-center hide-lg" data-content="COPY"></div>
					<button class="btn btn-secondary d-block stretch mb-1" @click="copyList('plain')">
						<ion-icon name="list" class="icon-left"></ion-icon><span class="hide-lg text-pre">PLAIN</span>
					</button>
					<button class="btn btn-secondary d-block stretch mb-1" @click="copyList('markdown')">
						<ion-icon name="logo-markdown" class="icon-left"></ion-icon><span class="hide-lg text-pre">MARKDOWN</span>
					</button>
					<button class="btn btn-secondary d-block stretch mb-1" @click="copyList('slack')">
						<ion-icon name="logo-slack" class="icon-left"></ion-icon><span class="hide-lg text-pre">SLACK</span>
					</button>
					<!-- sidebar: export -->
					<div class="divider text-center show-lg" data-content="E"></div>
					<div class="divider text-center hide-lg" data-content="EXPORT"></div>
					<button class="btn btn-secondary d-block stretch mb-1" @click="exportPdf('list')">
						<ion-icon name="download-outline" class="icon-left"></ion-icon><span class="hide-lg text-pre"> LIST</span>
					</button>
					<button class="btn btn-secondary d-block stretch" @click="exportPdf('sheets')">
						<ion-icon name="download-outline" class="icon-left"></ion-icon><span class="hide-lg text-pre"> SHEETS</span>
					</button>
					<!-- sidebar: language -->
					<!-- <div class="divider text-center show-lg" data-content="S"></div>
					<div class="divider text-center hide-lg" data-content="STATS"></div>
					TODO -->
				</div>
			</div>
			<!-- content -->
			<div class="off-canvas-content">
				<div class="container">
					<div class="columns">
						<div v-if="ready.setlists && setlist" class="column col-12">
							<h2>{{ setlist.title }}</h2>
							<h3>
								<ion-icon name="list" class="icon-sm"></ion-icon> {{ setlist.songs.length }} songs
								<ion-icon name="calendar-outline" class="icon-sm ml-3"></ion-icon> {{ setlist.date }}
								<span v-if="ready.users && users[setlist.creator]"><ion-icon name="person-outline" class="icon-sm ml-3"></ion-icon> {{ users[setlist.creator].name }}</span>
							</h3>
						</div>
						<div v-if="ready.songs && ready.setlists && setlist" class="column col-12">
							<table class="table table-striped table-hover">
								<thead>
									<tr>
										<th v-if="user && role > 1"></th>
										<th>Title</th>
										<th class="hide-xl">Language</th>
										<th class="hide-lg">Tuning</th>
										<th class="hide-xl">CCLI</th>
										<th></th>
									</tr>
								</thead>
								<tbody v-sortable="{ onEnd: reorder, handle: '.handle' }">
									<tr v-for="(song, i) in setlist.songs" :key="song.id">
										<td v-if="user && role > 1" class="c-move text-center text-gray"><ion-icon name="reorder-four-outline" class="icon-1-5x pl-2 handle"></ion-icon></td>
										<td class="c-hand" @click.prevent="$router.push({ name: 'song-show', params: { id: song.id }})">
											{{ songs[song.id].title }} <br class="show-xl hide-sm" /><span class="text-gray hide-sm">({{ songs[song.id].subtitle }})</span>
										</td>
										<td class="hide-xl text-uppercase">{{ songs[song.id].language }}</td>
										<td class="tuning">
											<button v-if="user && role > 1" class="btn btn-secondary btn-sm btn-fw" @click.prevent="tuneDown(songs[song.id], i)">
												<ion-icon name="arrow-back" class="icon-sm"></ion-icon>
											</button>
											<code>{{ song.tuning ? song.tuning : songs[song.id].tuning }}</code>
											<button v-if="user && role > 1" class="btn btn-secondary btn-sm btn-fw" @click.prevent="tuneUp(songs[song.id], i)">
												<ion-icon name="arrow-forward" class="icon-sm"></ion-icon>
											</button>
										</td>
										<td class="hide-xl">
											<a :href="'https://songselect.ccli.com/Songs/' + songs[song.id].ccli" target="_blank">{{ songs[song.id].ccli }}</a>
										</td>
										<td class="text-right">
											<button class="btn btn-primary" @click.prevent="$router.push({ name: 'song-show', params: { id: song.id }})">
												<ion-icon name="eye-outline"></ion-icon>
												<span class="hide-sm ml-2">Show</span>
											</button>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
			<!-- modals -->
			<SetlistSet
				v-if="modal.set"
				:db="db"
				:active="modal.set"
				:existing="existing"
				:initialSetlist="setlist"
				:setlistKey="setlistKey"
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
				:title="setlist ? setlist.title : ''"
				:id="setlistKey"
				@closed="modal.delete = false"
			/>
			<SetlistPresent
				v-if="modal.present"
				:active="modal.present"
				:songs="getSetlistSongs"
				:position="setlist.position"
				:chords="chords"
				@chords="chords = !chords"
				@closed="modal.present = false"
				@updatePosition="updatePosition"
			/>
		</div>
	</div>
</template>

<script>
// get basic program parameters
import basics from '@/basics.js'
// get components
import SetlistSet from '@/components/SetlistSet.vue'
import SetlistDelete from '@/components/SetlistDelete.vue'
import SetlistPresent from '@/components/SetlistPresent.vue'
// pdf creation
var pdfMake = require('pdfmake/build/pdfmake.js')
var pdfFonts = require('@/assets/vfs_fonts.js')
pdfMake.vfs = pdfFonts.pdfMake.vfs
pdfMake.fonts = {
	FiraMono: {
		normal: 'FiraMono-Regular.ttf',
	},
	FiraSans: {
		normal: 'FiraSans-Light.ttf',
	}
}

export default {
	name: 'setlist-show',
	props: ['db', 'songs', 'setlists', 'users', 'tags', 'user', 'role', 'ready'],
	components: {
		SetlistSet,
		SetlistDelete,
		SetlistPresent,
	},
	data () {
		return {
			modal: {
				set: false,
				delete: false,
				present: false,
			},
			existing: true,
			chords: true,
			tunes: basics.tunes
		}
	},
	computed: {
		setlistKey () {
			return this.$route.params.id
		},
		setlist () {
			if (this.ready.setlists) {
				return this.setlists[this.setlistKey]
			}
			return false
		},
		getSetlistSongs () {
			if (this.ready.songs && this.ready.setlists) {
				let songs = []
				for (const key in this.setlist.songs) {
					if (this.setlist.songs.hasOwnProperty(key)) {
						let song = this.songs[this.setlist.songs[key].id], setlistTuning = this.setlist.songs[key].tuning
						song['customTuningDelta'] = setlistTuning != 0 ? this.tunes.indexOf(setlistTuning) - this.tunes.indexOf(song.tuning) : 0
						song['customTuning'] = setlistTuning != 0 ? setlistTuning : song.tuning
						songs.push(song)
					}
				}
				return songs
			}
			return []
		}
	},
	methods: {
		reorder ({oldIndex, newIndex}) {
			const movedItem = this.setlist.songs.splice(oldIndex, 1)[0]
			this.setlist.songs.splice(newIndex, 0, movedItem)
			var self = this
			this.db.collection('setlists').doc(this.$route.params.id).set({songs: this.setlist.songs}, { merge: true }).then(function() {
				self.$notify({
					title: '<button class="btn btn-clear float-right"></button>Setlist saved!',
					text: 'Song order was successfully updated.',
					type: 'toast-primary'
				})
			})
		},
		tuneUp (song, songPosition) {
			let songs = this.setlist.songs
			// update tuning
			let tone = songs[songPosition].tuning ? songs[songPosition].tuning : song.tuning
			let i = this.tunes.indexOf(tone)
			if (i>=this.tunes.length-1) {
				tone = this.tunes[0]
			} else {
				tone = this.tunes[++i]
			}
			// save tuning in setlist
			songs[songPosition].tuning = tone
			this.db.collection('setlists').doc(this.$route.params.id).set({songs: songs}, { merge: true })
		},
		tuneDown (song, songPosition) {
			let songs = this.setlist.songs
			// update tuning
			let tone = songs[songPosition].tuning ? songs[songPosition].tuning : song.tuning
			let i = this.tunes.indexOf(tone)
			if (i<=0) {
				tone = this.tunes[this.tunes.length-1]
			} else {
				tone = this.tunes[--i]
			}
			// save tuning in setlist
			songs[songPosition].tuning = tone
			this.db.collection('setlists').doc(this.$route.params.id).set({songs: songs}, { merge: true })
		},
		updateActive () {
			// update setlist's active flag to enable sync
			var self = this, sync = !this.setlist.active
			this.db.collection('setlists').doc(this.$route.params.id).set({active: sync}, { merge: true }).then(function() {
				self.$notify({
					title: '<button class="btn btn-clear float-right"></button>Setlist saved!',
					text: sync ? 'Setlist was successfully activated.' : 'Setlist was successfully deactivated.',
					type: 'toast-primary'
				})
			})
		},
		updatePosition (position) {
			// update setlist's position if sync enabled
			if (this.setlist.active) {
				this.db.collection('setlists').doc(this.$route.params.id).set({position: position}, { merge: true })
			}
		},
		copyList (format) {
			// build text list
			let list = [], label = ''
			switch (format) {
				case 'plain':
					list = this.setlist.songs.map(
						(s, i) => (i+1) + '. ' + this.songs[s.id].title + ' (' + this.songs[s.id].subtitle + ') [' + (this.songs[s.id].customTuning ? this.songs[s.id].customTuning : this.songs[s.id].tuning) + ']'
					)
					label = 'plain text'
					break
				case 'markdown':
					list = this.setlist.songs.map(
						(s, i) => (i+1) + '. **' + this.songs[s.id].title + '** – _' + this.songs[s.id].subtitle + '_ [**`' + (this.songs[s.id].customTuning ? this.songs[s.id].customTuning : this.songs[s.id].tuning) + '`**]'
					)
					label = 'markdown'
					break
				case 'slack':
					list = this.setlist.songs.map(
						(s, i) => (i+1) + '. *' + this.songs[s.id].title + '* – _' + this.songs[s.id].subtitle + '_ `' + (this.songs[s.id].customTuning ? this.songs[s.id].customTuning : this.songs[s.id].tuning) + '`'
					)
					label = 'slack'
					break
				default:
					break;
			}
			var self = this
			this.$copyText(list.join('\n')).then(function () {
				self.$notify({
					title: '<button class="btn btn-clear float-right"></button>Copied to clipboard!',
					text: 'Setlist was successfully copied to clipboard in ' + label + ' format.',
					type: 'toast-primary'
				})
			}, function (e) {
				self.$notify({
					title: '<button class="btn btn-clear float-right"></button>Failed to copy!',
					text: 'Error: ' + e,
					type: 'toast-primary'
				})
			})
		},
		exportPdf (mode) {
			var content = mode == 'sheets' ? this.getPdfSongsheets() : this.getPdfSetlist()
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
					partnumber: {
						font: 'FiraSans',
						fontSize: 24,
						margin: [ 0, 17, 0, 0 ]
					},
					code: {
						font: 'FiraMono',
						fontSize: 12,
						margin: [ 0, 15, 0, 0 ]
					},
					footer: {
						font: 'FiraSans',
						fontSize: 8,
						margin: [ 0, 30, 0, 0 ]
					},
				}
			}
			pdfMake.createPdf(doc).open()
			// toast success message
			this.$notify({
				title: '<button class="btn btn-clear float-right"></button>Success!',
				text: 'The setlist was exported as PDF file.',
				type: 'toast-primary'
			});

		},
		getPdfSetlist () {
			let songs = []
			for (const key in this.setlist.songs) {
				if (this.setlist.songs.hasOwnProperty(key)) {
					const song = this.songs[this.setlist.songs[key].id];
					songs.push(' ‒ ' + song.title + ' [' + (song.customTuning ? song.customTuning : song.tuning) + ']')
				}
			}
			return [
				{ text: this.setlist.title.toUpperCase(), style: 'header' },
				{ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 505, y2: 0, lineWidth: .5 }] },
				{ text: (new Date(this.setlist.date)).toLocaleDateString("de-DE", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), style: 'subtitle', margin: [ 0, 6, 0, 0 ] },
				{ ol: songs, style: 'list'}
			]
		},
		getPdfSongsheets () {
			var sheets = []
			for (const key in this.setlist.songs) {
				if (this.setlist.songs.hasOwnProperty(key)) {
					const song = this.songs[this.setlist.songs[key].id]
					// handle song content parts
					var content = [], parts = basics.parsedContent(song.content, song.customTuning ? song.customTuningDelta : 0, this.chords, false)
					parts.forEach(function(part) {
						if (part.type == 'v' && part.number != '0') {
							content.push({
								columnGap: 8,
								columns: [
									{
										width: 'auto',
										text: part.number,
										style: 'partnumber',
									},
									{
										width: '*',
										// song content with respect to leading whitespaces
										text: '\u200B' + part.content.replace(/\n/g, "\n" + '\u200B'),
										style: 'code',
									}
								]
							})
						} else {
							content.push({
								// song content with respect to leading whitespaces
								text: '\u200B' + part.content.replace(/\n/g, "\n" + '\u200B'),
								style: 'code',
							})
						}
					}, this)
					var meta = [
						// song title [tuning] with a line beneath
						{ text: song.title.toUpperCase(), style: 'header' },
						{ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 505, y2: 0, lineWidth: .5 }] },
						{ text: 'Tuning: ' + (song.customTuning ? song.customTuning : song.tuning), style: 'subtitle', alignment: 'right', margin: [ 0, 4, 0, 0 ] },
						content,
						// footer with ccli#, author names and (c) year publisher
						{
							text: [
								song.ccli ? 'CCLI Song Nr.: ' + song.ccli + '\n' : '',
								song.authors ? song.authors + '\n' : '',
								'\u00A9 ' + (song.year ? song.year + ' ' : '') + song.publisher
							],
							style: 'footer'
						}
					]
					// add page break after every song exept for the last
					if (this.setlist.songs.length > 0 && key < this.setlist.songs.length-1) {
						meta.push({ text: '', pageBreak: 'after', style: 'code' })
					}
					sheets = sheets.concat(meta)
				}
			}
			return sheets
		},
	}
}
</script>

<style lang="scss">
.tuning {
	min-width: 100px;

	code {
		width: 2em;
		display: inline-block;
		text-align: center;
		background: transparent;
	}
}
</style>
