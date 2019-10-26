<template>
	<div class="profile">
		<div class="off-canvas off-canvas-secondary">
			<!-- secondary sidebar -->
			<div class="off-canvas-sidebar active">
				<button class="btn btn-primary tooltip tooltip-right d-block stretch mb-1" @click="$router.go(-1)" data-tooltip=" BACK ">
					<i class="icon ion-md-arrow-back float-left ml-1"></i><span class="hide-lg"> BACK</span>
				</button>
				<!-- sidebar: manage -->
				<div class="divider text-center show-lg" data-content="M"></div>
				<div class="divider text-center hide-lg" data-content="MANAGE"></div>
				<button class="btn btn-secondary tooltip tooltip-right d-block stretch mb-1" @click="modal.song=song; existing=true; modal.set=true" data-tooltip=" EDIT ">
					<i class="icon ion-md-create float-left ml-1"></i><span class="hide-lg"> EDIT</span>
				</button>
				<button class="btn btn-secondary tooltip tooltip-right d-block stretch mb-1" @click="modal.song=song; existing=false; modal.set=true" data-tooltip=" CLONE ">
					<i class="icon ion-md-copy float-left ml-1"></i><span class="hide-lg"> CLONE</span>
				</button>
				<button class="btn btn-secondary tooltip tooltip-right btn-error d-block stretch" @click="modal.delete = true" data-tooltip=" DELETE ">
					<i class="icon ion-md-trash float-left ml-1"></i><span class="hide-lg"> DELETE</span>
				</button>
				<!-- sidebar: language -->
				<div class="divider text-center show-lg" data-content="L"></div>
				<div class="divider text-center hide-lg" data-content="LANGUAGE"></div>
				<div class="d-flex" v-if="ready.songs">
					<router-link
						v-for="(tsong, i) in showLanguages"
						:key="i"
						:to="{ name: 'song-show', params: { id: tsong[0] }}"
						class="btn btn-secondary text-uppercase mb-1"
						:class="{ disabled: (song['.key'] == tsong[0]) }"
					>
						{{ tsong[1] }}
					</router-link>
				</div>
				<!-- sidebar: view -->
				<div class="divider text-center show-lg" data-content="V"></div>
				<div class="divider text-center hide-lg" data-content="VIEW"></div>
				<div class="form-group tooltip tooltip-right" data-tooltip=" CHORDS ">
					<label class="form-switch switch-lg">
						<input type="checkbox" v-model="chords" @click="chords = !chords">
						<i class="form-icon"></i><span class="hide-lg"> CHORDS</span>
					</label>
				</div>
				<button class="btn btn-secondary tooltip tooltip-right d-block stretch" @click="modal.present=true" data-tooltip=" PRESENT ">
					<i class="icon ion-md-videocam float-left ml-1"></i><span class="hide-lg"> PRESENT</span>
				</button>
				<!-- sidebar: tuning -->
				<div class="divider text-center show-lg" data-content="T"></div>
				<div class="divider text-center hide-lg" data-content="TUNING"></div>
				<div class="d-flex mb-2">
					<span class="text-center text-pre text-gray text-large hide-lg">{{ showTuning.previous }}</span>
					<span class="label label-rounded text-center text-large text-pre text-bold">{{ showTuning.current }}</span>
					<span class="text-center text-pre text-gray text-large hide-lg">{{ showTuning.next }}</span>
				</div>
				<div class="d-flex">
					<button class="btn btn-secondary mb-1 hide-lg" :class="{ disabled: !chords }" @click="tuning--"><i class="icon ion-md-arrow-back"></i></button>
					<button class="btn btn-secondary tooltip tooltip-right mb-1 show-lg" :class="{ disabled: !chords }" @click="tuning++" data-tooltip=" TUNE UP "><i class="icon ion-md-arrow-up"></i></button>
					<button class="btn btn-secondary tooltip tooltip-right mb-1" :class="{ disabled: !chords }" @click="tuning = 0" data-tooltip=" RESET TUNING "><i class="icon ion-md-refresh"></i></button>
					<button class="btn btn-secondary mb-1 hide-lg" :class="{ disabled: !chords }" @click="tuning++"><i class="icon ion-md-arrow-forward"></i></button>
					<button class="btn btn-secondary tooltip tooltip-right mb-1 show-lg" :class="{ disabled: !chords }" @click="tuning--" data-tooltip=" TUNE DOWN "><i class="icon ion-md-arrow-down"></i></button>
				</div>
				<!-- sidebar: export -->
				<div class="divider text-center show-lg" data-content="E"></div>
				<div class="divider text-center hide-lg" data-content="EXPORT"></div>
				<button class="btn btn-secondary tooltip tooltip-right d-block stretch mb-1" @click="exportTxt" data-tooltip=" EXPORT TXT ">
					<i class="icon ion-md-download float-left ml-1"></i><span class="hide-lg text-pre"> .TXT</span>
				</button>
				<button class="btn btn-secondary tooltip tooltip-right d-block stretch mb-1" @click="exportSng" data-tooltip=" EXPORT SNG ">
					<i class="icon ion-md-download float-left ml-1"></i><span class="hide-lg text-pre"> .SNG</span>
				</button>
				<button class="btn btn-secondary tooltip tooltip-right d-block stretch" @click="exportPdf" data-tooltip=" EXPORT PDF ">
					<i class="icon ion-md-download float-left ml-1"></i><span class="hide-lg text-pre"> .PDF</span>
				</button>
			</div>
			<!-- content -->
			<div class="off-canvas-content">
				<div class="container">
					<div class="columns">
						<div v-if="ready.song" class="column col-12">
							<h2>{{ song.title }} <span class="label text-pre ml-2 px-3">{{ showTuning.current }}</span></h2>
							<h3>{{ song.subtitle }}</h3>
							<SongContent
								:content="song.content"
								:chords="chords"
								:tuning="tuning"
								:tunes="tunes"
								:presentation="false"
							/>
							<footer>
								<p>{{ song.authors }}</p>
								<p>
									<router-link v-for="tag in song.tags" :key="tag" :to="{ name: 'songs-tag', params: { tag: tag }}" class="mr-2">
										<span class="label label-primary px-2 py-1">
											<i class="icon ion-md-pricetag mr-1"></i>
											{{ tag }}
										</span>
									</router-link>
								</p>
								<p class="text-gray">CCLI Song Number: <a :href="'https://songselect.ccli.com/Songs/' + song.ccli" target="_blank">{{ song.ccli }}</a></p>
								<p class="text-gray text-breaks">&copy; {{ song.year }} {{ song.publisher }}</p>
							</footer>
						</div>
					</div>
				</div>
			</div>
			<!-- modals -->
			<SongSet
				:active="modal.set"
				:existing="existing"
				:song="modal.song"
				@closed="modal.set = false"
			/>
			<SongDelete
				:active="modal.delete"
				:title="song.title"
				:id="song['.key']"
				@closed="modal.delete = false"
			/>
			<SongPresent
				:active="modal.present"
				:title="song.title"
				:subtitle="song.subtitle"
				:content="song.content"
				:chords="chords"
				:tuning="tuning"
				:tunes="tunes"
				@chords="chords = !chords"
				@closed="modal.present = false"
			/>
		</div>
	</div>
</template>

<script>
// get components
import SongContent from '@/components/SongContent.vue'
import SongSet from '@/components/SongSet.vue'
import SongDelete from '@/components/SongDelete.vue'
import SongPresent from '@/components/SongPresent.vue'
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
	name: 'song-show',
	components: {
		SongContent,
		SongSet,
		SongDelete,
		SongPresent,
	},
	firestore () {
		return {
			song: {
				ref: db.collection('songs').doc(this.$route.params.id),
				resolve: () => { this.ready.song = true },
				reject: () => { this.ready.song = true }
			},
			songs: {
				ref: db.collection('songs'),
				objects: true,
				resolve: () => { this.ready.songs = true },
				reject: () => { this.ready.songs = true }
			},
		}
	},
	data () {
		return {
			chords: true,
			tuning: 0,
			ready: {
				song: false,
				songs: false,
			},
			modal: {
				song: {},
				set: false,
				delete: false,
				present: false,
			},
			existing: true,
			tunes: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'B', 'H']
		}
	},
	methods: {
		isChordLine(line) {
			if (line == '') return false
			return line.slice(-2) === '  ';
		},
		exportTxt: function() {
			// add header
			var content = this.song.title + ' [' + this.song.tuning + ']' + '\n\n'
			var lines = this.song.content.split('\n')
			// process lines
			for (var i = 0; i < lines.length; i++) {
				var line = lines[i]
				// handle chord line
				if (this.isChordLine(line)) continue
				// handle verse marker
				if (line.trim().toLowerCase().indexOf('--v') >= 0 && !isNaN(parseInt(line.trim().charAt(3)))) {
					// if next line is chord line, prepend number to the line after
					if (this.isChordLine(lines[i+1])) {
						lines[i+2] = line.trim().charAt(3) + '. ' + lines[i+2]
						// add 3 spaces to next line to sync chords with text again
						lines[i+1] = '   ' + lines[i+1]
					} else {
						lines[i+1] = line.trim().charAt(3) + '. ' + lines[i+1]
					}
				}
				// handle marker
				if (line.trim().indexOf('--') >= 0) continue
				// keep line for export
				content += line + '\n'
			}
			content += '\n' + this.song.authors +
				'© ' + (this.song.year ? this.song.year + ' ' : '') + this.song.publisher.replace(/(?:\r\n|\r|\n)/g, '; ')
			// start download
			this.download(content, this.song['.key'] + '.txt')
			// toast success message
			this.$notify({
				title: '<button class="btn btn-clear float-right"></button>Success!',
				text: 'The song was exported as text file.',
				type: 'toast-primary'
			});
		},
		exportSng: function() {
			// add header
			var content =
				'#LangCount=1' + '\n' +
				'#Title=' + this.song.title + '\n' +
				'#Author=' + this.song.authors +
				'#Melody=' + this.song.authors +
				'#(c)=' + (this.song.year ? this.song.year + ' ' : '') + this.song.publisher.replace(/(?:\r\n|\r|\n)/g, '; ') + '\n' +
				'#Key=' + this.song.tuning + '\n' +
				'#CCLI=' + this.song.ccli + '\n' +
				'---' + '\n'
			var lines = this.song.content.split('\n')
			// remove chord lines
			for (var i = 0; i < lines.length; i++) {
				var line = lines[i]
				if (this.isChordLine(line)) continue
				else content += line + '\n'
			}
			// replace marker
			content = content
				.replace(/--v/g, "verse")
				.replace(/--p/g, "pre-chorus")
				.replace(/--c/g, "chorus")
				.replace(/--b/g, "bridge")
				.replace(/--i/g, "intro")
				.replace(/--m/g, "mitro")
				.replace(/--o/g, "outro")
			// start download
			this.download(content, this.song['.key'] + '.sng')
			// toast success message
			this.$notify({
				title: '<button class="btn btn-clear float-right"></button>Success!',
				text: 'The song was exported as SNG file.',
				type: 'toast-primary'
			});

		},
		exportPdf: function() {
			var content = this.getPdfSongContent()
			// return page configuration with computed content
			var doc = {
				pageSize: 'A4',
				pageMargins: [ 50, 50, 40, 30 ],
				content: content,
				styles: {
					header: {
						font: 'FiraSans',
						fontSize: 22
					},
					partnumber: {
						font: 'FiraSans',
						fontSize: 24,
						margin: [ 0, 17, 0, 0 ]
					},
					code: {
						font: 'FiraMono',
						fontSize: 11,
						margin: [ 0, 15, 0, 0 ]
					},
					copyright: {
						font: 'FiraSans',
						fontSize: 8,
						margin: [ 0, 20, 0, 0 ]
					}
				}
			}
			pdfMake.createPdf(doc).open()
			// toast success message
			this.$notify({
				title: '<button class="btn btn-clear float-right"></button>Success!',
				text: 'The song was exported as PDF file.',
				type: 'toast-primary'
			});

		},
		getPdfSongContent () {
			// handle song content parts
			var content = [], parts = this.parsedContent(this.song.content)
			parts.forEach(function(part) {
				if (part.type == 'v' && part.number != '0') {
					content.push({
						columnGap: 8,
						columns: [
							{
								style: 'partnumber',
								width: 'auto',
								text: part.number
							},
							{
								style: 'code',
								width: '*',
								// song content with respect to leading whitespaces
								text: '\u200B' + part.content.replace(/\n/g, "\n" + '\u200B')
							}
						]
					})
				} else {
					content.push({
						style: 'code',
						// song content with respect to leading whitespaces
						text: '\u200B' + part.content.replace(/\n/g, "\n" + '\u200B')
					})
				}
			}, this)
			// return array with song data
			return [
				// song title [tuning] with a line beneath
				{ text: this.song.title.toUpperCase() + (this.song.tuning ? '  [' + this.song.tuning + ']' : ''), style: 'header' },
				{ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 505, y2: 0, lineWidth: .5 }] },
				content,
				// imprint with ccli#, author names and (c) year publisher
				{
					style: 'copyright',
					text: [
						this.song.ccli ? 'CCLI Song Nr.: ' + this.song.ccli + '\n' : '',
						this.song.authors ? this.song.authors + '\n' : '',
						'\u00A9 ' + (this.song.year ? this.song.year + ' ' : '') + this.song.publisher
					]
				}
			]
		},
		parsedContent () {
			// initialize arrays for parsed linex, classes of parts, type abbr., numbers of type and part index
			var parsed = [], classes = [], types = [], numbers = [], part = 0
			var lines = this.song.content.split('\n')
			// check every single line of song content
			for (var i = 0; i < lines.length; i++) {
				var line = lines[i]
				// handle display chord lines
				if (this.isChordLine(line) && !this.chords) {
					// skip chord line if no chords shall be displayed
					continue
				}
				// handle chord tuning
				if (this.isChordLine(line) && this.tuning != 0) {
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
							var nextTune = this.tunes[(12 + this.tunes.indexOf(c) + (this.tuning % 12)) % 12]
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
		}
	},
	computed: {
		showLanguages () {
			if (this.ready.song && this.ready.songs) {
				var languages = [[this.$route.params.id, this.song.language]]
				for (const key in this.song.translations) {
					if (this.song.translations.hasOwnProperty(key)) {
						const songKey = this.song.translations[key];
						languages.push([songKey, this.songs[songKey].language])
					}
				}
				return languages.sort(function(a, b) { 
					return a[1] > b[1] ? 1 : -1
				})
			} else {
				return []
			}
		},
		showTuning () {
			return {
				previous: this.tunes[(12 + this.tunes.indexOf(this.song.tuning) + (this.tuning-1 % 12)) % 12],
				current: this.tunes[(12 + this.tunes.indexOf(this.song.tuning) + (this.tuning % 12)) % 12],
				next: this.tunes[(12 + this.tunes.indexOf(this.song.tuning) + (this.tuning+1 % 12)) % 12],
			}
		}
	}
}
</script>

<style lang="scss">
	footer {
		padding-top: 2.5em;
		padding-bottom: 2em;
		font-size: .8em;
	}
</style>
