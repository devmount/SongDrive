<template>
	<div class="profile">
		<div class="off-canvas off-canvas-secondary">
			<!-- secondary sidebar -->
			<div class="off-canvas-sidebar active">
				<div class="sidebar-wrapper">
					<button class="btn btn-secondary tooltip tooltip-right d-block stretch mb-1" @click="$router.go(-1)" data-tooltip=" BACK ">
						<i class="icon ion-md-arrow-back float-left ml-1"></i><span class="hide-lg"> BACK</span>
					</button>
					<!-- sidebar: manage -->
					<div v-if="user && role > 2" class="divider text-center show-lg" data-content="M"></div>
					<div v-if="user && role > 2" class="divider text-center hide-lg" data-content="MANAGE"></div>
					<button v-if="user && role > 2" class="btn btn-secondary tooltip tooltip-right d-block stretch mb-1" @click="existing=true; modal.set=true" data-tooltip=" EDIT ">
						<i class="icon ion-md-create float-left ml-1"></i><span class="hide-lg"> EDIT</span>
					</button>
					<button v-if="user && role > 2" class="btn btn-secondary tooltip tooltip-right d-block stretch mb-1" @click="existing=false; modal.set=true" data-tooltip=" CLONE ">
						<i class="icon ion-md-copy float-left ml-1"></i><span class="hide-lg"> CLONE</span>
					</button>
					<button v-if="user && role > 2" class="btn btn-secondary tooltip tooltip-right btn-error d-block stretch" @click="modal.delete = true" data-tooltip=" DELETE ">
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
							:class="{ disabled: (songKey == tsong[0]) }"
						>
							{{ tsong[1] }}
						</router-link>
					</div>
					<!-- sidebar: view -->
					<div class="divider text-center show-lg" data-content="V"></div>
					<div class="divider text-center hide-lg" data-content="VIEW"></div>
					<div class="form-group tooltip tooltip-right" data-tooltip=" CHORDS ">
						<label class="form-switch switch-lg c-hand">
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
			</div>
			<!-- content -->
			<div class="off-canvas-content">
				<div class="container">
					<div class="columns">
						<div v-if="ready.songs && song" class="column col-12">
							<h2>{{ song.title }} <span class="label text-pre ml-2 px-3">{{ showTuning.current }}</span></h2>
							<h3>{{ song.subtitle }}</h3>
							<SongContent
								:content="song.content"
								:chords="chords"
								:tuning="tuning"
								:presentation="false"
							/>
							<footer>
								<p>{{ song.authors }}</p>
								<p>
									<router-link v-for="tag in song.tags" :key="tag" :to="{ name: 'songs-tag', params: { tag: tag }}" class="mr-2">
										<span class="label px-2 py-1">
											<i class="icon ion-md-pricetag mr-1"></i>
											{{ tag }}
										</span>
									</router-link>
								</p>
								<p v-if="song.ccli" class="text-gray">CCLI Song Number: <a :href="'https://songselect.ccli.com/Songs/' + song.ccli" target="_blank">{{ song.ccli }}</a></p>
								<p class="text-gray text-breaks">&copy; {{ song.year }} {{ song.publisher }}</p>
							</footer>
						</div>
					</div>
				</div>
			</div>
			<!-- modals -->
			<SongSet
				v-if="modal.set"
				:db="db"
				:active="modal.set"
				:existing="existing"
				:initialSong="song"
				:songKey="songKey"
				:songs="songs"
				:tags="tags"
				:ready="ready"
				@closed="modal.set = false"
			/>
			<SongDelete
				v-if="modal.delete"
				:db="db"
				:active="modal.delete"
				:title="song ? song.title : ''"
				:id="songKey"
				@closed="modal.delete = false"
			/>
			<SongPresent
				v-if="modal.present"
				:active="modal.present"
				:title="song.title"
				:subtitle="song.subtitle"
				:content="song.content"
				:chords="chords"
				:tuning="tuning"
				@chords="chords = !chords"
				@closed="modal.present = false"
			/>
		</div>
	</div>
</template>

<script>
// get basic program parameters
import basics from '@/basics.js'
// get components
import SongContent from '@/components/SongContent.vue'
import SongSet from '@/components/SongSet.vue'
import SongDelete from '@/components/SongDelete.vue'
import SongPresent from '@/components/SongPresent.vue'
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
	props: ['db', 'songs', 'tags', 'user', 'role', 'ready'],
	components: {
		SongContent,
		SongSet,
		SongDelete,
		SongPresent,
	},
	data () {
		return {
			chords: true,
			tuning: 0,
			modal: {
				song: {},
				set: false,
				delete: false,
				present: false,
			},
			existing: true,
			tunes: basics.tunes
		}
	},
	methods: {
		isChordLine(line) {
			return basics.isChordLine(line)
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
			basics.download(content, this.songKey + '.txt')
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
			basics.download(content, this.songKey + '.sng')
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
			var content = [], parts = basics.parsedContent(this.song.content, this.tuning, this.chords, false)
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
	},
	computed: {
		songKey () {
			return this.$route.params.id
		},
		song () {
			if (this.ready.songs) {
				return this.songs[this.songKey]
			}
			return false
		},
		showLanguages () {
			if (this.ready.songs && this.song) {
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
			if (this.song) {
				return {
					previous: this.tunes[(12 + this.tunes.indexOf(this.song.tuning) + (this.tuning-1 % 12)) % 12],
					current: this.tunes[(12 + this.tunes.indexOf(this.song.tuning) + (this.tuning % 12)) % 12],
					next: this.tunes[(12 + this.tunes.indexOf(this.song.tuning) + (this.tuning+1 % 12)) % 12],
				}
			} else {
				return '-'
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
