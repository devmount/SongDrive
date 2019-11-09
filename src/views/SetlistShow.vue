<template>
	<div class="profile">
		<div class="off-canvas off-canvas-secondary">
			<!-- secondary sidebar -->
			<div class="off-canvas-sidebar active">
				<button class="btn btn-primary tooltip tooltip-right d-block stretch mb-1" @click="$router.go(-1)" data-tooltip=" BACK ">
					<i class="icon ion-md-arrow-back float-left ml-1"></i><span class="hide-lg"> BACK</span>
				</button>
				<!-- sidebar: manage -->
				<div v-if="user && role > 1" class="divider text-center show-lg" data-content="M"></div>
				<div v-if="user && role > 1" class="divider text-center hide-lg" data-content="MANAGE"></div>
				<button v-if="user && role > 1" class="btn btn-secondary tooltip tooltip-right d-block stretch mb-1" @click="existing=true; modal.set=true" data-tooltip=" EDIT ">
					<i class="icon ion-md-create float-left ml-1"></i><span class="hide-lg"> EDIT</span>
				</button>
				<button v-if="user && role > 1" class="btn btn-secondary tooltip tooltip-right d-block stretch mb-1" @click="existing=false; modal.set=true" data-tooltip=" CLONE ">
					<i class="icon ion-md-copy float-left ml-1"></i><span class="hide-lg"> CLONE</span>
				</button>
				<button v-if="user && role > 2" class="btn btn-secondary tooltip tooltip-right btn-error d-block stretch" @click="modal.delete = true" data-tooltip=" DELETE ">
					<i class="icon ion-md-trash float-left ml-1"></i><span class="hide-lg"> DELETE</span>
				</button>
				<!-- sidebar: view -->
				<div class="divider text-center show-lg" data-content="V"></div>
				<div class="divider text-center hide-lg" data-content="VIEW"></div>
				<div v-if="user && role > 1" class="form-group tooltip tooltip-right" data-tooltip=" SYNC ">
					<label class="form-switch switch-lg c-hand">
						<input type="checkbox" v-model="setlist.active" @click.prevent="updateActive">
						<i class="form-icon"></i><span class="hide-lg"> SYNC</span>
					</label>
				</div>
				<div class="form-group tooltip tooltip-right" data-tooltip=" CHORDS ">
					<label class="form-switch switch-lg c-hand">
						<input type="checkbox" v-model="chords">
						<i class="form-icon"></i><span class="hide-lg"> CHORDS</span>
					</label>
				</div>
				<button class="btn btn-secondary tooltip tooltip-right d-block stretch" @click="modal.present=true" data-tooltip=" PRESENT ">
					<i class="icon ion-md-videocam float-left ml-1"></i><span class="hide-lg"> PRESENT</span>
				</button>
				<!-- sidebar: export -->
				<div class="divider text-center show-lg" data-content="C"></div>
				<div class="divider text-center hide-lg" data-content="COPY"></div>
				<button class="btn btn-secondary tooltip tooltip-right d-block stretch mb-1" @click="copyList('plain')" data-tooltip=" COPY LIST IN PLAIN TEXT ">
					<i class="icon ion-md-list float-left ml-1"></i><span class="hide-lg text-pre">PLAIN</span>
				</button>
				<button class="btn btn-secondary tooltip tooltip-right d-block stretch mb-1" @click="copyList('markdown')" data-tooltip=" COPY LIST IN MARKDOWN ">
					<i class="icon ion-logo-markdown float-left ml-1"></i><span class="hide-lg text-pre">MARKDOWN</span>
				</button>
				<button class="btn btn-secondary tooltip tooltip-right d-block stretch mb-1" @click="copyList('slack')" data-tooltip=" COPY LIST FOR SLACK ">
					<i class="icon ion-logo-slack float-left ml-1"></i><span class="hide-lg text-pre">SLACK</span>
				</button>
				<!-- sidebar: export -->
				<div class="divider text-center show-lg" data-content="E"></div>
				<div class="divider text-center hide-lg" data-content="EXPORT"></div>
				<button class="btn btn-secondary tooltip tooltip-right d-block stretch mb-1" @click="exportPdf('list')" data-tooltip=" EXPORT LIST AS PDF ">
					<i class="icon ion-md-download float-left ml-1"></i><span class="hide-lg text-pre"> LIST</span>
				</button>
				<button class="btn btn-secondary tooltip tooltip-right d-block stretch" @click="exportPdf('sheets')" data-tooltip=" EXPORT SHEETS AS PDF ">
					<i class="icon ion-md-download float-left ml-1"></i><span class="hide-lg text-pre"> SHEETS</span>
				</button>
				<!-- sidebar: language -->
				<!-- <div class="divider text-center show-lg" data-content="S"></div>
				<div class="divider text-center hide-lg" data-content="STATS"></div>
				TODO -->
			</div>
			<!-- content -->
			<div class="off-canvas-content">
				<div class="container">
					<div class="columns">
						<div v-if="ready.setlist" class="column col-12">
							<h2>{{ setlist.title }}</h2>
							<h3 v-if="ready.users">
								<i class="icon ion-md-list"></i> {{ setlist.songs.length }} songs
								<i class="icon ion-md-calendar ml-3"></i> {{ setlist.date }}
								<i class="icon ion-md-person ml-3"></i> {{ users[setlist.creator].name }}
							</h3>
						</div>
						<div v-if="ready.songs && ready.setlist" class="column col-12">
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
										<td v-if="user && role > 1" class="c-move text-center text-gray"><i class="icon ion-md-reorder px-2 handle"></i></td>
										<td>{{ songs[song.id].title }} <br class="show-xl hide-sm" /><span class="text-gray hide-sm">({{ songs[song.id].subtitle }})</span></td>
										<td class="hide-xl text-uppercase">{{ songs[song.id].language }}</td>
										<td class="tuning">
											<button v-if="user && role > 1" class="btn btn-secondary btn-sm btn-fw" @click.prevent="tuneDown(songs[song.id], i)">
												<i class="icon ion-md-arrow-back"></i>
											</button>
											<code>{{ song.tuning ? song.tuning : songs[song.id].tuning }}</code>
											<button v-if="user && role > 1" class="btn btn-secondary btn-sm btn-fw" @click.prevent="tuneUp(songs[song.id], i)">
												<i class="icon ion-md-arrow-forward"></i>
											</button>
										</td>
										<td class="hide-xl">
											<a :href="'https://songselect.ccli.com/Songs/' + songs[song.id].ccli" target="_blank">{{ songs[song.id].ccli }}</a>
										</td>
										<td class="text-right">
											<button class="btn btn-primary" @click.prevent="$router.push({ name: 'song-show', params: { id: song.id }})">
												<i class="icon ion-md-eye"></i>
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
				:active="modal.set"
				:existing="existing"
				:initialSetlist="setlist"
				@closed="modal.set = false"
			/>
			<SetlistDelete
				v-if="modal.delete"
				:active="modal.delete"
				:title="setlist.title"
				:id="setlist['.key']"
				@closed="modal.delete = false"
			/>
			<SetlistPresent
				v-if="modal.present"
				:active="modal.present"
				:songs="getSetlistSongs"
				:position="setlist.position"
				:chords="chords"
				:tunes="tunes"
				@chords="chords = !chords"
				@closed="modal.present = false"
				@updatePosition="updatePosition"
			/>
		</div>
	</div>
</template>

<script>
// get components
import SetlistSet from '@/components/SetlistSet.vue'
import SetlistDelete from '@/components/SetlistDelete.vue'
import SetlistPresent from '@/components/SetlistPresent.vue'
// get database object authorized in config.js
import { db } from '@/firebase'
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
	props: ['user', 'role'],
	components: {
		SetlistSet,
		SetlistDelete,
		SetlistPresent,
	},
	firestore () {
		return {
			setlist: {
				ref: db.collection('setlists').doc(this.$route.params.id),
				resolve: () => { this.ready.setlist = true },
				reject: () => { this.ready.setlist = true }
			},
			songs: {
				ref: db.collection('songs'),
				objects: true,
				resolve: () => { this.ready.songs = true },
				reject: () => { this.ready.songs = true }
			},
			users: {
				ref: db.collection('users'),
				objects: true,
				resolve: () => { this.ready.users = true },
				reject: () => { this.ready.users = true }
			},
		}
	},
	data () {
		return {
			ready: {
				setlist: false,
				songs: false,
				users: false,
			},
			modal: {
				set: false,
				delete: false,
				present: false,
			},
			existing: true,
			chords: true,
			tunes: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'B', 'H']
		}
	},
	computed: {
		getSetlistSongs() {
			if (this.ready.songs && this.ready.setlist) {
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
			db.collection('setlists').doc(this.$route.params.id).set({songs: this.setlist.songs}, { merge: true }).then(function() {
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
			db.collection('setlists').doc(this.$route.params.id).set({songs: songs}, { merge: true })
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
			db.collection('setlists').doc(this.$route.params.id).set({songs: songs}, { merge: true })
		},
		updateActive () {
			// update setlist's active flag to enable sync
			var self = this, sync = !this.setlist.active
			db.collection('setlists').doc(this.$route.params.id).set({active: sync}, { merge: true }).then(function() {
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
				db.collection('setlists').doc(this.$route.params.id).set({position: position}, { merge: true })
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
						(s, i) => (i+1) + '. *' + this.songs[s.id].title + '* – _' + this.songs[s.id].subtitle + '_ *` ' + (this.songs[s.id].customTuning ? this.songs[s.id].customTuning : this.songs[s.id].tuning) + ' `*'
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
					var content = [], parts = this.parsedContent(song.content, song.customTuning ? song.customTuningDelta : 0)
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
		isChordLine(line) {
			if (line == '') return false
			return line.slice(-2) === '  '
		},
		parsedContent (content, tuning) {
			// initialize arrays for parsed lines, classes of parts, type abbr., numbers of type and part index
			var parsed = [], classes = [], types = [], numbers = [], part = 0
			var lines = content.split('\n')
			// check every single line of song content
			for (var i = 0; i < lines.length; i++) {
				var line = lines[i]
				// handle display chord lines
				if (this.isChordLine(line) && !this.chords) {
					// skip chord line if no chords shall be displayed
					continue
				}
				// handle chord tuning
				if (this.isChordLine(line) && tuning != 0) {
					// init the new line to build and the current over- or underflow of spaces due to different chord string lenghts
					var newLine = '', spaces = 0, j = 0
					while (j < line.length) {
						// get single character in line
						var c = line[j]
						// handle over- or underflow of spaces to keep chords on their original position
						if (spaces > 0 && c == ' ') {
							// to few spaces: double next existing space and decrease space count
							c = '  '
							spaces--
						}
						if (spaces < 0 && c == ' ' && line[j+1] == ' ') {
							// to many spaces: skip one of two consecutive spaces and increase space count
							spaces++
							j++
							continue
						}
						// on '#': skip to next character as it will be handled together with tune
						if (c == '#') {
							j++
							continue
						}
						var isHalf = line[j+1] == '#'
						// check if character is a tune with '#'
						if (isHalf) {
							c = c + '#'
						}
						// check if character is a transposable character
						if (this.tunes.indexOf(c) > -1) {
							// replace character by next tune character
							var nextTune = this.tunes[(12 + this.tunes.indexOf(c) + (tuning % 12)) % 12]
							newLine += nextTune
							// update over- or underflow of spaces
							spaces += c.length - nextTune.length
						} else {
							newLine += c
						}
						j++
					}
					// make sure that last two characters stay spaces for chord line identification (rtrim and add 2 spaces)
					newLine = newLine.replace(/\s+$/, '') + '  '
					// add lines to new content
					if (!parsed[part]) {
						parsed[part] = []
					}
					parsed[part].push(newLine)
					continue
				}
				// handle normal song line
				if (line.trim().indexOf('--') < 0) {
					// only consider line if not empty
					if (line.trim() != '') {
						if (!parsed[part]) {
							parsed[part] = []
						}
						// add line to current part
						parsed[part].push(line)
					}
				}
				// handle song part marker (e.g. --V1)
				else {
					// add class to part
					switch (line.charAt(2).toLowerCase()) {
						case 'v':
							types.push('v')
							classes.push('verse ' + ((!isNaN(parseInt(line.trim().charAt(3)))) ? 'part' + line.trim().charAt(3) : ''))
							numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0'); break
						case 'p':
							types.push('p')
							classes.push('prechorus')
							numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0'); break
						case 'c':
							types.push('c')
							classes.push('chorus')
							numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0'); break
						case 'b':
							types.push('b')
							classes.push('bridge')
							numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0'); break
						case 'i':
							types.push('i')
							classes.push('intro')
							numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0'); break
						case 'm':
							types.push('m')
							classes.push('mitro')
							numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0'); break
						case 'o':
							types.push('o')
							classes.push('outro')
							numbers.push((!isNaN(parseInt(line.trim().charAt(3)))) ? line.trim().charAt(3) : '0'); break
						default:
							// a non existent part tag was found
					}
					// consider next part
					part++
				}
			}
			var newContent = []
			// if multiple parts: rejoin lines of every part
			if (parsed.length > 1) {
				for (var p = 1; p < parsed.length; p++) {
					newContent.push({
						type: types[p-1],
						number: numbers[p-1],
						class: classes[p-1],
						content: parsed[p].join('\n')
					})
				}
			}
			// if no parts (no markers set): take whole content as one unclassified part
			else {
				newContent.push({
					type: '',
					number: 0,
					class: '',
					content: this.content
				})
			}
			return newContent
		},
		download (data, filename) {
			var a = document.createElement('a')
			var file = new Blob([data], { type:'text/plain;charset=UTF-8' })
			// IE10+
			if (window.navigator.msSaveOrOpenBlob) {
				window.navigator.msSaveOrOpenBlob(file, filename)
			}
			// other browsers
			else {
				var url = URL.createObjectURL(file)
				a.href = url
				a.download = filename
				document.body.appendChild(a)
				a.click()
				setTimeout(function() {
					document.body.removeChild(a)
					window.URL.revokeObjectURL(url)
				}, 0)
			}
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
