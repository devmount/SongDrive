<template>
	<div class="modal modal-md" :class="{ active: active }">
		<a class="modal-overlay"></a>
		<div class="modal-container">
			<div class="modal-header">
				<a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="$emit('closed')"></a>
				<div class="modal-title h5">{{ $t('modal.import') }}</div>
			</div>
			<div class="modal-body">
				<div class="content">
					<div class="timeline">
						<!-- file selection -->
						<div class="timeline-item" id="timeline-example-1">
							<div class="timeline-left">
								<span class="timeline-icon" :class="{ 'icon-lg': fileSelected }">
									<ion-icon v-if="fileSelected" name="checkmark-outline"></ion-icon>
								</span>
							</div>
							<div class="timeline-content">
								<div class="tile">
									<div class="tile-content">
										<div class="tile-title">
											<div class="mb-4">{{ $t('text.selectJsonFile') }}</div>
											<button class="btn btn-primary" @click="$refs['backupFile'].click()">
												<span>{{ $t('button.chooseFile') }}</span>
											</button>
											<span v-if="file" class="ml-4">
												<span class="text-pre">{{ file.name }}</span>
												<span class="ml-4">({{ humanFileSize(file.size, true) }})</span>
											</span>
											<p v-if="error.noFile" class="form-input-hint">{{ $t('error.requiredFile') }}</p>
											<p v-if="error.wrongFormat" class="form-input-hint">{{ $t('error.requiredJsonFormat') }}</p>
										</div>
									</div>
								</div>
							</div>
						</div>
						<!-- start import -->
						<div class="timeline-item" id="timeline-example-2">
							<div class="timeline-left">
								<span class="timeline-icon" :class="{ 'icon-lg': progress.started }">
									<ion-icon v-if="progress.started" name="checkmark-outline"></ion-icon>
								</span>
							</div>
							<div class="timeline-content">
								<div class="tile">
									<div class="tile-content">
										<div class="tile-title">
											<div class="mb-4" :class="{ 'text-gray': !fileSelected }">{{ $t('text.doTheImport') }}</div>
											<button class="btn btn-primary" :class="{ 'disabled': !fileSelected }" @click="importData($refs['backupFile'])">
												<span>{{ $t('button.startImport') }}</span>
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
						<!-- import progress and result -->
						<div class="timeline-item" id="timeline-example-3">
							<div class="timeline-left">
								<span class="timeline-icon" :class="{ 'icon-lg': progress.finished && progress.total > 0 }">
									<ion-icon v-if="progress.finished && progress.total > 0" name="checkmark-outline"></ion-icon>
								</span>
							</div>
							<div class="timeline-content">
								<div class="tile">
									<div class="tile-content">
										<div class="tile-title">
											<div class="mb-4" :class="{ 'text-gray': !progress.started }">{{ $t('text.importResult', [progress.imported]) }}</div>
											<div class="bar bar-sm mt-4">
												<div class="bar-item" role="progressbar" :style="{ width: percentageImported + '%' }"></div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<!-- file input. Hidden because it's ugly. -->
					<input class="d-invisible" type="file" name="upload" accept=".json" ref="backupFile" @change="getFile($refs['backupFile'])" />
				</div>
			</div>
			<div class="modal-footer">
				<a v-if="!progress.finished" class="btn btn-link btn-gray" href="#" aria-label="Close" @click.prevent="$emit('closed')">
					{{ $t('button.close') }}
				</a>
				<button v-else class="btn btn-primary" aria-label="Close" @click.prevent="$emit('closed')">
					<span>{{ $t('button.done') }}</span>
				</button>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'import-data',
	props: {
		active: Boolean,
	},
	data () {
		return {
			file: null,
			error: {
				noFile: false,
				wrongFormat: false,
			},
			progress: {
				currentCollection: '',
				imported: 0,
				total: 0,
				started: false,
				finished: false
			}
		}
	},
	methods: {
		// set file object for given file input handle
		getFile (handle) {
			this.file = handle.files[0];
		},
		// do the actuel data import
		async importData (handle) {
			// get file and check for errors
			let file = handle.files[0];
			this.error.noFile = !file;
			this.error.wrongFormat = (file && file.type !== 'text/plain' && file.type !== 'application/json');
			// no errors: start saving song data
			if (!this.errors) {
				this.progress.started = true;
				let result = new Promise((resolve, reject) => {
					let reader = new FileReader();
					reader.readAsText(file, "UTF-8");
					reader.onload = async (event) => {
						try {
							const dbImport = JSON.parse(event.target.result);
							const collections = Object.keys(dbImport);
							collections.forEach(c => this.progress.total += Object.keys(dbImport[c]).length);
							// iterate all collections
							await Promise.all(collections.map(async collection => {
								this.progress.currentCollection = collection;
								const objects = dbImport[collection];
								// iterate all data objects
								const keys = Object.keys(objects);
								await Promise.all(keys.map(async key => {
									await this.$db.collection(collection).doc(key).set(objects[key]);
									this.progress.imported++
								}));
							}));
							resolve();
						} catch (err) {
							reject(err);
						}
					}
					reader.onerror = (error) => reject(error);
				});
				await result;
				this.progress.finished = true;
			}
		}
	},
	computed: {
		// true if a file was selected
		fileSelected () {
			return this.file !== null;
		},
		// true if form errors occured
		errors () {
			return (this.error.noFile || this.error.wrongFormat);
		},
		// percentage of import progress
		percentageImported () {
			return this.progress.total > 0 ? this.progress.imported*100/this.progress.total : 0;
		}
	}
}
</script>
