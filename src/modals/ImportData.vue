<template>
	<div class="modal modal-md" :class="{ active: active }">
		<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="$emit('closed')"></a>
		<div class="modal-container">
			<div class="modal-header">
				<a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="$emit('closed')"></a>
				<div class="modal-title h5">{{ $t('modal.import') }}</div>
			</div>
			<div class="modal-body">
				<div class="content">
					<label class="form-label" for="upload">{{ $t('field.upload') }} <span class="text-error">*</span></label>
					<input type="file" name="upuload" accept=".json" ref="backupFile" />
					<p v-if="error.noFile" class="form-input-hint">{{ $t('error.requiredFile') }}</p>
					<p v-if="error.wrongFormat" class="form-input-hint">{{ $t('error.requiredJsonFormat') }}</p>
					<div class="bar bar-sm mt-4">
						<div class="bar-item" role="progressbar" :style="{ width: percentageImported + '%' }"></div>
					</div>
					<div>
						Importing: {{ progress.currentCollection }}
					</div>
				</div>
			</div>
			<div class="modal-footer">
				<a class="btn btn-link btn-gray" href="#" aria-label="Cancel" @click.prevent="$emit('closed')">
					{{ $t('button.cancel') }}
				</a>
				<button class="btn btn-primary ml-2" @click="importData($refs['backupFile'])">
					<span>{{ $t('button.startImport') }}</span>
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
			confirmed: false,
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
		async importData(handle) {
			// get file and check for errors
			let file = handle.files[0];
			this.error.noFile = !file;
			this.error.wrongFormat = (file.type !== 'text/plain' && file.type !== 'application/json');
			// no errors: start saving song data
			if (!this.errors) {
				this.progress.started = true;
				let reader = new FileReader();
				reader.readAsText(file, "UTF-8");
				reader.onload = async (event) => {
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
				}
				reader.onerror = error => console.error(error);
				this.progress.finished = true;
			}
		}
	},
	computed: {
		// calculate wether form errors occured
		errors () {
			return (this.error.noFile || this.error.wrongFormat);
		},
		// calculate import progress in percent
		percentageImported () {
			return this.progress.total > 0 ? this.progress.imported*100/this.progress.total : 0;
		}
	}
}
</script>
