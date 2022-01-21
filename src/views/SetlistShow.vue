<template>
	<div
		class="setlist-show"
		ref="setlist-show"
		tabindex="0"
		@keydown.ctrl.83.prevent="!modal.present ? updateActive() : null"
		@keydown.ctrl.75.prevent="chords = !chords"
		@keydown.ctrl.80.prevent="modal.present=true"
		@keydown.esc.exact="modal.set=false; modal.delete=false; modal.present=false; $refs['setlist-show'].focus()"
	>
		<div class="off-canvas off-canvas-secondary">
			<!-- secondary sidebar -->
			<div class="off-canvas-sidebar active">
				<div class="sidebar-wrapper">
					<button
						class="btn btn-secondary d-block stretch text-uppercase tooltip tooltip-right tooltip-lg mb-1"
						:data-tooltip="$t('button.back')"
						@click="$router.go(-1)"
					>
						<ion-icon name="arrow-back-outline" class="icon-left"></ion-icon>
						<span class="hide-lg">{{ $t('button.back') }}</span>
					</button>
					<!-- sidebar: manage -->
					<template v-if="user && role > 1">
						<div class="divider text-center show-lg" :data-content="$t('divider.manage').charAt(0)"></div>
						<div class="divider text-center hide-lg" :data-content="$t('divider.manage')"></div>
						<button
							class="btn btn-secondary d-block stretch text-uppercase tooltip tooltip-right tooltip-lg mb-1"
							:data-tooltip="$t('divider.manage') + ': ' + $t('button.edit')"
							@click="existing=true; modal.set=true"
						>
							<ion-icon name="create-outline" class="icon-left"></ion-icon>
							<span class="hide-lg">{{ $t('button.edit') }}</span>
						</button>
						<button
							class="btn btn-secondary d-block stretch text-uppercase tooltip tooltip-right tooltip-lg mb-1"
							:data-tooltip="$t('divider.manage') + ': ' + $t('button.duplicate')"
							@click="existing=false; modal.set=true"
						>
							<ion-icon name="copy-outline" class="icon-left"></ion-icon>
							<span class="hide-lg">{{ $t('button.duplicate') }}</span>
						</button>
					</template>
					<button
						v-if="user && role > 2"
						class="btn btn-error-secondary d-block stretch text-uppercase tooltip tooltip-right tooltip-lg"
						:data-tooltip="$t('divider.manage') + ': ' + $t('button.delete')"
						@click="modal.delete = true"
					>
						<ion-icon name="trash-outline" class="icon-left"></ion-icon>
						<span class="hide-lg">{{ $t('button.delete') }}</span>
					</button>
					<!-- sidebar: view -->
					<div class="divider text-center show-lg" :data-content="$t('divider.view').charAt(0)"></div>
					<div class="divider text-center hide-lg" :data-content="$t('divider.view')"></div>
					<div v-if="setlist && user && role > 1" class="form-group">
						<label
							class="form-switch switch-lg text-uppercase c-hand tooltip tooltip-right tooltip-lg"
							:data-tooltip="$t('divider.view') + ': ' + $t('switch.sync')"
						>
							<input type="checkbox" v-model="setlist.active" @click.prevent="updateActive">
							<i class="form-icon"></i>
							<span class="hide-lg">{{ $t('switch.sync') }}</span>
						</label>
					</div>
					<div class="form-group">
						<label
							class="form-switch switch-lg text-uppercase c-hand tooltip tooltip-right tooltip-lg"
							:data-tooltip="$t('divider.view') + ': ' + $t('switch.chords')"
						>
							<input type="checkbox" v-model="chords">
							<i class="form-icon"></i>
							<span class="hide-lg">{{ $t('switch.chords') }}</span>
						</label>
					</div>
					<button
						class="btn btn-secondary d-block stretch text-uppercase tooltip tooltip-right tooltip-lg mb-1"
						:data-tooltip="$t('divider.view') + ': ' + $t('button.present')"
						@click="modal.present=true"
					>
						<ion-icon name="videocam-outline" class="icon-left"></ion-icon>
						<span class="hide-lg">{{ $t('button.present') }}</span>
					</button>
					<router-link
						:to="{ name: 'setlist-show', params: { id: setlistKey }}"
						target="_blank"
						class="btn btn-secondary d-block stretch text-uppercase tooltip tooltip-right tooltip-lg"
						:data-tooltip="$t('divider.view') + ': ' + $t('button.launch')"
					>
						<ion-icon name="open-outline" class="icon-left"></ion-icon>
						<span class="hide-lg">{{ $t('button.launch') }}</span>
					</router-link>
					<!-- sidebar: export -->
					<div class="divider text-center show-lg" :data-content="$t('divider.copy').charAt(0)"></div>
					<div class="divider text-center hide-lg" :data-content="$t('divider.copy')"></div>
					<button
						class="btn btn-secondary d-block stretch text-uppercase tooltip tooltip-right tooltip-lg mb-1"
						:data-tooltip="$t('divider.copy') + ': ' + $t('button.formatPlain')"
						@click="copyList('plain')"
					>
						<ion-icon name="list" class="icon-left"></ion-icon>
						<span class="hide-lg text-pre">{{ $t('button.formatPlain') }}</span>
					</button>
					<button
						class="btn btn-secondary d-block stretch text-uppercase tooltip tooltip-right tooltip-lg mb-1"
						:data-tooltip="$t('divider.copy') + ': ' + $t('button.formatMarkdown')"
						@click="copyList('markdown')"
					>
						<ion-icon name="logo-markdown" class="icon-left"></ion-icon>
						<span class="hide-lg text-pre">{{ $t('button.formatMarkdown') }}</span>
					</button>
					<button
						class="btn btn-secondary d-block stretch text-uppercase tooltip tooltip-right tooltip-lg mb-1"
						:data-tooltip="$t('divider.copy') + ': ' + $t('button.formatSlack')"
						@click="copyList('slack')"
					>
						<ion-icon name="logo-slack" class="icon-left"></ion-icon>
						<span class="hide-lg text-pre">{{ $t('button.formatSlack') }}</span>
					</button>
					<!-- sidebar: export -->
					<div class="divider text-center show-lg" :data-content="$t('divider.export').charAt(0)"></div>
					<div class="divider text-center hide-lg" :data-content="$t('divider.export')"></div>
					<button
						class="btn btn-secondary d-block stretch text-uppercase tooltip tooltip-right tooltip-lg mb-1"
						:data-tooltip="$t('divider.export') + ': ' + $t('button.exportSetlistList')"
						@click="exportPdf('list')"
					>
						<ion-icon name="download-outline" class="icon-left"></ion-icon>
						<span class="hide-lg text-pre">{{ $t('button.exportSetlistList') }}</span>
					</button>
					<button
						class="btn btn-secondary d-block stretch text-uppercase tooltip tooltip-right tooltip-lg"
						:data-tooltip="$t('divider.export') + ': ' + $t('button.exportSetlistSheets')"
						@click="exportPdf('sheets')"
					>
						<ion-icon name="download-outline" class="icon-left"></ion-icon>
						<span class="hide-lg text-pre">{{ $t('button.exportSetlistSheets') }}</span>
					</button>
				</div>
			</div>
			<!-- content -->
			<div class="off-canvas-content">
				<div class="container">
					<div class="columns">
						<div v-if="ready.setlists && setlist" class="column col-12">
							<h2>{{ setlist.title }}</h2>
							<h3>
								<ion-icon name="list" class="icon-sm"></ion-icon>
								{{ $tc('object.song', setlist.songs.length, { n: setlist.songs.length }) }}
								<ion-icon name="calendar-outline" class="icon-sm ml-3"></ion-icon>
								{{ humanDate(setlist.date, $i18n.locale) }}
								<span v-if="ready.users && users[setlist.creator]">
									<ion-icon name="person-outline" class="icon-sm ml-3"></ion-icon>
									{{ users[setlist.creator].name }}
								</span>
							</h3>
						</div>
						<div v-if="ready.songs && ready.setlists && setlist" class="column col-12">
							<table class="table table-striped table-hover">
								<thead>
									<tr>
										<th v-if="user && role > 1"></th>
										<th>{{ $t('field.title') }}</th>
										<th class="hide-xl">{{ $t('field.language') }}</th>
										<th>{{ $t('field.tuning') }}</th>
										<th class="hide-xl">{{ $t('field.ccli') }}</th>
										<th></th>
									</tr>
								</thead>
								<tbody v-sortable="{ onEnd: reorder, handle: '.handle' }">
									<tr v-for="(song, i) in setlist.songs" :key="song.id">
										<td v-if="user && role > 1" class="c-move text-center text-gray">
											<ion-icon name="reorder-four-outline" class="icon-1-5x pl-2 handle"></ion-icon>
										</td>
										<td class="c-hand" @click.prevent="$router.push({ name: 'song-show', params: { id: song.id, key: song.tuning ? song.tuning : songs[song.id].tuning }})">
											{{ songs[song.id].title }} <br class="show-xl hide-sm" />
											<span class="text-gray hide-sm">({{ songs[song.id].subtitle }})</span>
										</td>
										<td class="hide-xl text-uppercase">{{ songs[song.id].language }}</td>
										<td class="tuning">
											<button
												v-if="user && role > 1"
												class="btn btn-secondary btn-sm btn-fw"
												@click.prevent="tuneDown(songs[song.id], i)"
											>
												<ion-icon name="arrow-back" class="icon-sm"></ion-icon>
											</button>
											<code>{{ song.tuning ? song.tuning : songs[song.id].tuning }}</code>
											<button
												v-if="user && role > 1"
												class="btn btn-secondary btn-sm btn-fw"
												@click.prevent="tuneUp(songs[song.id], i)"
											>
												<ion-icon name="arrow-forward" class="icon-sm"></ion-icon>
											</button>
										</td>
										<td class="hide-xl">
											<a :href="'https://songselect.ccli.com/Songs/' + songs[song.id].ccli" target="_blank">
												{{ songs[song.id].ccli }}
											</a>
										</td>
										<td class="text-right">
											<button
												class="btn btn-primary"
												@click.prevent="$router.push({ name: 'song-show', params: { id: song.id, key: song.tuning ? song.tuning : songs[song.id].tuning }})"
											>
												<ion-icon name="eye-outline"></ion-icon>
												<span class="hide-lg ml-2">{{ $t('button.show') }}</span>
											</button>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
					<div class="columns">
						<div class="column col-12 mt-4">
							<h2>{{ $t('widget.stats') }}</h2>
						</div>
						<div class="column col-4 col-xl-6 col-md-12 mt-4">
							<div class="panel pb-4">
								<div class="panel-header">
									<div class="panel-title h5 text-center">
										<ion-icon name="globe-outline"></ion-icon> {{ $tc('widget.languages', 2) }}
									</div>
								</div>
								<div class="panel-body">
									<DoughnutChart
										:info="{
											number: setlistLanguages.labels.length,
											label: $tc('widget.languages', setlistLanguages.labels.length)
										}"
										:datasets="setlistLanguages.datasets"
										:labels="setlistLanguages.labels"
									/>
								</div>
							</div>
						</div>
						<div class="column col-4 col-xl-6 col-md-12 mt-4">
							<div class="panel pb-4">
								<div class="panel-header">
									<div class="panel-title h5 text-center">
										<ion-icon name="musical-note"></ion-icon> {{ $t('widget.keys') }}
									</div>
								</div>
								<div class="panel-body">
									<DoughnutChart
										:info="{ number: setlistKeys.labels.length, label: $t('widget.keys') }"
										:datasets="setlistKeys.datasets"
										:labels="setlistKeys.labels"
									/>
								</div>
							</div>
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
				:setlistKey="setlistKey"
				:user="user"
				:songs="songs"
				:setlists="setlists"
				:tags="tags"
				:languages="languages"
				:ready="ready"
				@closed="modal.set = false"
			/>
			<SetlistDelete
				v-if="modal.delete"
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
// get components
import SetlistSet from '@/modals/SetlistSet';
import SetlistDelete from '@/modals/SetlistDelete';
import SetlistPresent from '@/modals/SetlistPresent';
import DoughnutChart from '@/charts/DoughnutChart';

// pdf creation
var pdfMake = require('pdfmake/build/pdfmake');
var pdfFonts = require('@/assets/vfs_fonts');
pdfMake.vfs = pdfFonts.pdfMake.vfs;
pdfMake.fonts = {
	FiraMono: {
		normal: 'FiraMono-Regular.ttf',
	},
	FiraSans: {
		normal: 'FiraSans-Light.ttf',
	}
};

export default {
	name: 'setlist-show',
	props: ['songs', 'setlists', 'users', 'tags', 'languages', 'user', 'role', 'ready'],
	components: {
		SetlistSet,
		SetlistDelete,
		SetlistPresent,
		DoughnutChart,
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
		}
	},
	computed: {
		setlistKey () {
			return this.$route.params.id;
		},
		setlist () {
			if (this.ready.setlists) {
				return this.setlists[this.setlistKey];
			}
			return false;
		},
		getSetlistSongs () {
			if (this.ready.songs && this.ready.setlists && this.setlist?.songs?.length > 0) {
				let songs = [];
				for (const key in this.setlist.songs) {
					if (this.setlist.songs.hasOwnProperty(key)) {
						let song = this.songs[this.setlist.songs[key].id], setlistTuning = this.setlist.songs[key].tuning;
						song['customTuningDelta'] = setlistTuning != 0
							? this.keyScale().indexOf(setlistTuning) - this.keyScale().indexOf(song.tuning)
							: 0;
						song['customTuning'] = setlistTuning != 0 ? setlistTuning : song.tuning;
						songs.push(song);
					}
				}
				return songs;
			}
			return [];
		},
		setlistLanguages () {
			let languages = {};
			for (let i = 0; i < this.getSetlistSongs.length; i++) {
				const song = this.getSetlistSongs[i];
				if (!languages.hasOwnProperty(song.language)) {
					languages[song.language] = 0;
				}
				languages[song.language]++;
			}
			return {
				datasets: [
					{ data: Object.values(languages), color: '#88b544' },
				],
				labels: Object.keys(languages).map(e => ' ' + this.languages[e]?.label)
			};
		},
		setlistKeys () {
			let keys = {};
			for (let i = 0; i < this.getSetlistSongs.length; i++) {
				const song = this.getSetlistSongs[i];
				if (!keys.hasOwnProperty(song.customTuning)) {
					keys[song.customTuning] = 0;
				}
				keys[song.customTuning]++;
			}
			return {
				datasets: [
					{ data: Object.values(keys), color: '#88b544' },
				],
				labels: Object.keys(keys).map(e => ' ' + e)
			};
		},
	},
	methods: {
		reorder ({oldIndex, newIndex}) {
			const movedItem = this.setlist.songs.splice(oldIndex, 1)[0];
			this.setlist.songs.splice(newIndex, 0, movedItem);
			this.$db.collection('setlists').doc(this.$route.params.id).set(
				{ songs: this.setlist.songs },
				{ merge: true }
			).then(() => {
				this.$notify({
					title: this.$t('toast.songOrderUpdated'),
					text: this.$t('toast.setlistSavedText'),
					type: 'primary'
				});
			}).catch((error) => this.throwError(error));;
		},
		tuneUp (song, songPosition) {
			let songs = this.setlist.songs;
			// update tuning
			let tone = songs[songPosition].tuning ? songs[songPosition].tuning : song.tuning;
			let i = this.keyScale().indexOf(tone);
			if (i>=this.keyScale().length-1) {
				tone = this.keyScale()[0];
			} else {
				tone = this.keyScale()[++i];
			}
			// save tuning in setlist
			songs[songPosition].tuning = tone;
			this.$db.collection('setlists').doc(this.$route.params.id).set({songs: songs}, { merge: true });
		},
		tuneDown (song, songPosition) {
			let songs = this.setlist.songs;
			// update tuning
			let tone = songs[songPosition].tuning ? songs[songPosition].tuning : song.tuning;
			let i = this.keyScale().indexOf(tone);
			if (i<=0) {
				tone = this.keyScale()[this.keyScale().length-1];
			} else {
				tone = this.keyScale()[--i];
			}
			// save tuning in setlist
			songs[songPosition].tuning = tone;
			this.$db.collection('setlists').doc(this.$route.params.id).set({songs: songs}, { merge: true });
		},
		updateActive () {
			// update setlist's active flag to enable sync
			var sync = !this.setlist.active;
			this.$db.collection('setlists').doc(this.$route.params.id).set({active: sync}, { merge: true }).then(() => {
				this.$notify({
					title: this.$t('toast.sync' + (sync ? 'Activated' : 'Deactivated')),
					text: this.$t('toast.setlistStatusSavedText'),
					type: 'primary'
				});
			}).catch((error) => this.throwError(error));;
		},
		updatePosition (position) {
			// update setlist's position if sync enabled
			if (this.setlist.active) {
				this.$db.collection('setlists').doc(this.$route.params.id).set({position: position}, { merge: true });
			}
		},
		copyList (format) {
			// build text list
			let list = [], label = '';
			switch (format) {
				case 'plain':
					list = this.setlist.songs.map(
						(s, i) => (i+1) + '. ' + this.songs[s.id].title + ' (' + this.songs[s.id].subtitle + ')'
						+ ' [' + (this.songs[s.id].customTuning ? this.songs[s.id].customTuning : this.songs[s.id].tuning) + ']'
					);
					label = 'plain text';
					break;
				case 'markdown':
					list = this.setlist.songs.map(
						(s, i) => (i+1) + '. **' + this.songs[s.id].title + '** – _' + this.songs[s.id].subtitle + '_'
						+ ' [**`' + (this.songs[s.id].customTuning ? this.songs[s.id].customTuning : this.songs[s.id].tuning) + '`**]'
					);
					label = 'markdown';
					break;
				case 'slack':
					list = this.setlist.songs.map(
						(s, i) => (i+1) + '. *' + this.songs[s.id].title + '* – _' + this.songs[s.id].subtitle + '_'
						+ ' `' + (this.songs[s.id].customTuning ? this.songs[s.id].customTuning : this.songs[s.id].tuning) + '`'
					);
					label = 'slack';
					break;
				default:
					break;
			}
			this.$copyText(list.join('\n')).then(() => {
				this.$notify({
					title: this.$t('toast.copiedToClipboard'),
					text: this.$t('toast.setlistFormatCopiedText', {format: label}),
					type: 'primary'
				});
			}, (error) => this.throwError(error));
		},
		exportPdf (mode) {
			var content = mode == 'sheets' ? this.getPdfSongsheets() : this.getPdfSetlist();
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
						font: this.chords ? 'FiraMono' : 'FiraSans',
						fontSize: this.chords ? 12 : 16,
						margin: [ 0, 15, 0, 0 ]
					},
					footer: {
						font: 'FiraSans',
						fontSize: 8,
						margin: [ 0, 30, 0, 0 ]
					}
				}
			};
			pdfMake.createPdf(doc).download();
			// toast success message
			this.$notify({
				title: this.$t('toast.exportedPdf'),
				text: this.$t('toast.exportedSetlistPdfText'),
				type: 'primary'
			});
		},
		getPdfSetlist () {
			let songs = [];
			for (const key in this.setlist.songs) {
				if (this.setlist.songs.hasOwnProperty(key)) {
					const song = this.songs[this.setlist.songs[key].id];
					songs.push(' ‒ ' + song.title + ' [' + (song.customTuning ? song.customTuning : song.tuning) + ']');
				}
			}
			return [
				{ text: this.setlist.title.toUpperCase(), style: 'header' },
				{ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 505, y2: 0, lineWidth: .5 }] },
				{
					text: (new Date(this.setlist.date)).toLocaleDateString("de-DE",
					{ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
					style: 'subtitle',
					margin: [ 0, 6, 0, 0 ]
				},
				{ ol: songs, style: 'list'}
			];
		},
		getPdfSongsheets () {
			var sheets = [];
			for (const key in this.setlist.songs) {
				if (this.setlist.songs.hasOwnProperty(key)) {
					const song = this.songs[this.setlist.songs[key].id];
					// handle song content parts
					var content = [];
					let parts = this.parsedContent(
						song.content,
						song.customTuning ? song.customTuningDelta : 0,
						this.chords, false
					);
					parts.forEach((part) => {
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
							});
						} else {
							content.push({
								// song content with respect to leading whitespaces
								text: '\u200B' + part.content.replace(/\n/g, "\n" + '\u200B'),
								style: 'code',
							});
						}
					});
					var meta = [
						// song title [tuning] with a line beneath
						{ text: song.title.toUpperCase(), style: 'header' },
						{ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 505, y2: 0, lineWidth: .5 }] },
						{
							text: this.chords ? 'Tuning: ' + (song.customTuning ? song.customTuning : song.tuning) : '',
							style: 'subtitle',
							alignment: 'right',
							margin: [ 0, 4, 0, 0 ]
						},
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
					];
					// add page break after every song exept for the last
					if (this.setlist.songs.length > 0 && key < this.setlist.songs.length-1) {
						meta.push({ text: '', pageBreak: 'after', style: 'code' });
					}
					sheets = sheets.concat(meta);
				}
			}
			return sheets;
		}
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
