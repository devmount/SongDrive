<template>
	<div class="song-show">
		<div class="off-canvas off-canvas-secondary">
			<!-- secondary sidebar -->
			<div class="off-canvas-sidebar active">
				<div class="sidebar-wrapper">
					<button class="btn btn-secondary d-block stretch text-uppercase mb-1" @click="$router.go(-1)">
						<ion-icon name="arrow-back-outline" class="icon-left"></ion-icon><span class="hide-lg"> {{ $t('button.back') }}</span>
					</button>
					<!-- sidebar: manage -->
					<div v-if="user && role > 2" class="divider text-center show-lg" :data-content="$t('divider.manage').charAt(0)"></div>
					<div v-if="user && role > 2" class="divider text-center hide-lg" :data-content="$t('divider.manage')"></div>
					<button v-if="user && role > 2" class="btn btn-secondary d-block stretch text-uppercase mb-1" @click="existing=true; modal.set=true">
						<ion-icon name="create-outline" class="icon-left"></ion-icon><span class="hide-lg"> {{ $t('button.edit') }}</span>
					</button>
					<button v-if="user && role > 2" class="btn btn-secondary d-block stretch text-uppercase mb-1" @click="existing=false; modal.set=true">
						<ion-icon name="copy-outline" class="icon-left"></ion-icon><span class="hide-lg"> {{ $t('button.duplicate') }}</span>
					</button>
					<button v-if="user && role > 2" class="btn btn-secondary btn-error d-block stretch text-uppercase" @click="modal.delete = true">
						<ion-icon name="trash-outline" class="icon-left"></ion-icon><span class="hide-lg"> {{ $t('button.delete') }}</span>
					</button>
					<!-- sidebar: language -->
					<div class="divider text-center show-lg" :data-content="$t('divider.language').charAt(0)"></div>
					<div class="divider text-center hide-lg" :data-content="$t('divider.language')"></div>
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
					<div class="divider text-center show-lg" :data-content="$t('divider.view').charAt(0)"></div>
					<div class="divider text-center hide-lg" :data-content="$t('divider.view')"></div>
					<div class="form-group">
						<label class="form-switch switch-lg c-hand text-uppercase">
							<input type="checkbox" v-model="chords" @click="chords = !chords">
							<i class="form-icon"></i><span class="hide-lg"> {{ $t('switch.chords') }}</span>
						</label>
					</div>
					<button class="btn btn-secondary d-block stretch text-uppercase" @click="modal.present=true">
						<ion-icon name="videocam-outline" class="icon-left"></ion-icon><span class="hide-lg"> {{ $t('button.present') }}</span>
					</button>
					<!-- sidebar: tuning -->
					<div class="divider text-center show-lg" :data-content="$t('divider.tuning').charAt(0)"></div>
					<div class="divider text-center hide-lg" :data-content="$t('divider.tuning')"></div>
					<div class="d-flex mb-2">
						<span class="text-center text-pre text-gray text-large hide-lg">{{ showTuning.previous }}</span>
						<span class="label label-rounded text-center text-large text-pre text-bold">{{ showTuning.current }}</span>
						<span class="text-center text-pre text-gray text-large hide-lg">{{ showTuning.next }}</span>
					</div>
					<div class="d-flex">
						<button class="btn btn-secondary mb-1 hide-lg" :class="{ disabled: !chords }" @click="tuning--"><ion-icon name="arrow-back"></ion-icon></button>
						<button class="btn btn-secondary mb-1 show-lg" :class="{ disabled: !chords }" @click="tuning++"><ion-icon name="arrow-up"></ion-icon></button>
						<button class="btn btn-secondary mb-1" :class="{ disabled: !chords }" @click="tuning = 0"><ion-icon name="refresh"></ion-icon></button>
						<button class="btn btn-secondary mb-1 hide-lg" :class="{ disabled: !chords }" @click="tuning++"><ion-icon name="arrow-forward"></ion-icon></button>
						<button class="btn btn-secondary mb-1 show-lg" :class="{ disabled: !chords }" @click="tuning--"><ion-icon name="arrow-down"></ion-icon></button>
					</div>
					<!-- sidebar: export -->
					<div class="divider text-center show-lg" :data-content="$t('divider.export').charAt(0)"></div>
					<div class="divider text-center hide-lg" :data-content="$t('divider.export')"></div>
					<button class="btn btn-secondary d-block stretch text-uppercase mb-1" @click="exportTxt">
						<ion-icon name="download-outline" class="icon-left"></ion-icon><span class="hide-lg text-pre"> {{ $t('button.filetypeTxt') }}</span>
					</button>
					<button class="btn btn-secondary d-block stretch text-uppercase mb-1" @click="exportSng">
						<ion-icon name="download-outline" class="icon-left"></ion-icon><span class="hide-lg text-pre"> {{ $t('button.filetypeSng') }}</span>
					</button>
					<button class="btn btn-secondary d-block stretch text-uppercase" @click="exportPdf">
						<ion-icon name="download-outline" class="icon-left"></ion-icon><span class="hide-lg text-pre"> {{ $t('button.filetypePdf') }}</span>
					</button>
				</div>
			</div>
			<!-- content -->
			<div class="off-canvas-content">
				<div class="container">
					<div class="columns pb-4">
						<div v-if="ready.songs && song" class="column col-12">
							<h2>{{ song.title }} <span class="label text-pre ml-2 px-3">{{ showTuning.current }}</span></h2>
							<h3>{{ song.subtitle }}</h3>
							<SongContent
								:content="song.content"
								:chords="chords"
								:tuning="tuning"
								:presentation="false"
							/>
						</div>
					</div>
					<div class="columns mt-4 pt-4">
						<div v-if="ready.songs && song" class="column col-6 col-md-12">
							<footer class="text-small">
								<p>{{ song.authors }}</p>
								<p>
									<a v-if="song.ccli" :href="'https://songselect.ccli.com/Songs/' + song.ccli" class="mr-4" target="_blank">
										<span class="label px-2 py-1">
											<ion-icon name="open-outline" class="icon-sm mr-1"></ion-icon>
											{{ $t('field.ccli') }}
										</span>
									</a>
									<router-link v-for="tag in song.tags" :key="tag" :to="{ name: 'songs-tag', params: { tag: tag }}" class="mr-2">
										<span class="label px-2 py-1">
											<ion-icon name="pricetag-outline" class="icon-sm mr-1"></ion-icon>
											{{ $t('tag.' + tag) }}
										</span>
									</router-link>
								</p>
								<p class="text-gray text-breaks">&copy; {{ song.year }} {{ song.publisher }}</p>
							</footer>
						</div>
						<div v-if="ready.songs && song && song.youtube" class="column col-6 col-md-12">
							<iframe :src="'https://www.youtube-nocookie.com/embed/' + song.youtube" frameborder="0" allowfullscreen></iframe>
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
import basics from '@/basics'
// get components
import SongContent from '@/partials/SongContent'
import SongSet from '@/modals/SongSet'
import SongDelete from '@/modals/SongDelete'
import SongPresent from '@/modals/SongPresent'
// pdf creation
var pdfMake = require('pdfmake/build/pdfmake')
var pdfFonts = require('@/assets/vfs_fonts')
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
			var content = this.song.title + ' [' + this.tunes[(12 + this.tunes.indexOf(this.song.tuning) + (this.tuning % 12)) % 12] + ']' + '\n\n'
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
			this.$notify({ title: this.$t('toast.exportedText'), text: this.$t('toast.exportedSongTextText'), type: 'primary' })
		},
		exportSng: function() {
			// add header
			var content =
				'#LangCount=1' + '\n' +
				'#Title=' + this.song.title + '\n' +
				'#Author=' + this.song.authors +
				'#Melody=' + this.song.authors +
				'#(c)=' + (this.song.year ? this.song.year + ' ' : '') + this.song.publisher.replace(/(?:\r\n|\r|\n)/g, '; ') + '\n' +
				'#Key=' + this.tunes[(12 + this.tunes.indexOf(this.song.tuning) + (this.tuning % 12)) % 12] + '\n' +
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
			this.$notify({ title: this.$t('toast.exportedSng'), text: this.$t('toast.exportedSongSngText'), type: 'primary' })
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
			this.$notify({ title: this.$t('toast.exportedPdf'), text: this.$t('toast.exportedSongPdfText'), type: 'primary' })
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
				{ text: this.song.title.toUpperCase() + (this.tuning ? '  [' + this.tunes[(12 + this.tunes.indexOf(this.song.tuning) + (this.tuning % 12)) % 12] + ']' : ''), style: 'header' },
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

</style>
