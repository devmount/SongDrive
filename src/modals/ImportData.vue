<template>
	<div class="modal modal-md" :class="{ active: active }">
		<a class="modal-overlay"></a>
		<div class="modal-container">
			<div class="modal-header">
				<a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="emit('closed')"></a>
				<div class="modal-title h5">{{ t('modal.import') }}</div>
			</div>
			<div class="modal-body">
				<div class="content">
					<div class="timeline">
						<!-- file selection -->
						<div class="timeline-item" id="timeline-example-1">
							<div class="timeline-left">
								<span class="timeline-icon" :class="{ 'icon-lg': fileSelected }">
									<ion-icon :icon="checkmarkOutline" v-if="fileSelected" />
								</span>
							</div>
							<div class="timeline-content">
								<div class="tile">
									<div class="tile-content">
										<div class="tile-title">
											<div class="mb-4">{{ t('text.selectJsonFile') }}</div>
											<button class="btn btn-primary" @click="backupFile.click()">
												<span>{{ t('button.chooseFile') }}</span>
											</button>
											<span v-if="file" class="ml-4">
												<span class="text-pre">{{ file.name }}</span>
												<span class="ml-4">({{ humanFileSize(file.size, true) }})</span>
											</span>
											<p v-if="error.noFile" class="form-input-hint">{{ t('error.requiredFile') }}</p>
											<p v-if="error.wrongFormat" class="form-input-hint">{{ t('error.requiredJsonFormat') }}</p>
										</div>
									</div>
								</div>
							</div>
						</div>
						<!-- start import -->
						<div class="timeline-item" id="timeline-example-2">
							<div class="timeline-left">
								<span class="timeline-icon" :class="{ 'icon-lg': progress.started }">
									<ion-icon :icon="checkmarkOutline" v-if="progress.started" />
								</span>
							</div>
							<div class="timeline-content">
								<div class="tile">
									<div class="tile-content">
										<div class="tile-title">
											<div class="mb-4" :class="{ 'text-gray': !fileSelected }">{{ t('text.doTheImport') }}</div>
											<button class="btn btn-primary" :class="{ 'disabled': !fileSelected }" @click="importData()">
												<span>{{ t('button.startImport') }}</span>
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
									<ion-icon :icon="checkmarkOutline" v-if="progress.finished && progress.total > 0" />
								</span>
							</div>
							<div class="timeline-content">
								<div class="tile">
									<div class="tile-content">
										<div class="tile-title">
											<div class="mb-4" :class="{ 'text-gray': !progress.started }">{{ t('text.importResult', [progress.imported]) }}</div>
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
					<input class="d-invisible" type="file" name="upload" accept=".json" ref="backupFile" @change="getFile(backupFile)" />
				</div>
			</div>
			<div class="modal-footer">
				<a v-if="!progress.finished" class="btn btn-link btn-gray" href="#" aria-label="Close" @click.prevent="emit('closed')">
					{{ t('button.close') }}
				</a>
				<button v-else class="btn btn-primary" aria-label="Close" @click.prevent="emit('closed')">
					<span>{{ t('button.done') }}</span>
				</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, reactive, computed, inject } from 'vue';
import { useI18n } from "vue-i18n";
import { humanFileSize } from '@/utils.js';
import { checkmarkOutline } from 'ionicons/icons';
const { t } = useI18n();


// global properties
const db = inject('db');

// inherited properties
const props = defineProps({
	active: Boolean // state of modal display, true to show modal
});

// reactive data
const backupFile = ref(null);
const file = ref(null);
const error = reactive({
	noFile: false,
	wrongFormat: false,
});
const progress = reactive({
	currentCollection: '',
	imported: 0,
	total: 0,
	started: false,
	finished: false
});

// emits
const emit = defineEmits(['closed']);

// computed
// true if form errors occured
const errors = computed(() => (error.noFile || error.wrongFormat));
// true if a file was selected
const fileSelected = computed(() => {
	return file.value !== null;
});
// percentage of import progress
const percentageImported = computed(() => {
	return progress.total > 0 ? progress.imported*100/progress.total : 0;
});

// methods
// set file object for given file input handle
const getFile = (handle) => {
	file.value = handle.files[0];
};
// do the actuel data import
const importData = async () => {
	// get file and check for errors
	error.noFile = !file.value;
	error.wrongFormat = (file.value && file.value.type !== 'text/plain' && file.value.type !== 'application/json');
	// no errors: start saving song data
	if (!errors.value) {
		progress.started = true;
		const result = new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsText(file.value, "UTF-8");
			reader.onload = async (event) => {
				try {
					const dbImport = JSON.parse(event.target.result);
					const collections = Object.keys(dbImport);
					collections.forEach(c => progress.total += Object.keys(dbImport[c]).length);
					// iterate all collections
					await Promise.all(collections.map(async collection => {
						progress.currentCollection = collection;
						const objects = dbImport[collection];
						// iterate all data objects
						const keys = Object.keys(objects);
						await Promise.all(keys.map(async key => {
							await db.collection(collection).doc(key).set(objects[key]);
							progress.imported++
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
		progress.finished = true;
	}
};

</script>
