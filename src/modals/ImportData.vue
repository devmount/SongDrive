<template>
	<modal :active="active" :title="t('modal.import')" size="xl" @closed="emit('closed')">
		<div class="flex flex-col gap-4">
			<!-- file selection -->
			<div class="flex gap-4">
				<div class="flex flex-col items-center">
					<circle-check-icon v-if="fileSelected" class="w-6 h-6 text-spring-600" />
					<circle-dashed-icon v-else class="w-6 h-6 text-spring-700" />
					<div
						class="w-px mt-1 grow -mb-3"
						:class="{ 'bg-spring-700': fileSelected, 'bg-blade-700': !fileSelected }
					"></div>
				</div>
				<div class="flex flex-col gap-2">
					<div>{{ t('text.selectJsonFile') }}</div>
					<div class="flex items-center gap-4">
						<primary-button class="grow-0" @click="backupFile.click()">
							<span>{{ t('button.chooseFile') }}</span>
						</primary-button>
						<span v-if="file" class="font-mono">{{ file.name }}</span>
						<span v-if="file">({{ humanFileSize(file.size, true) }})</span>
					</div>
					<div v-if="error.noFile" class="text-rose-600">{{ t('error.requiredFile') }}</div>
					<div v-if="error.wrongFormat" class="text-rose-600">{{ t('error.requiredJsonFormat') }}</div>
				</div>
			</div>
			<!-- start import -->
			<div class="flex gap-4">
				<div class="flex flex-col items-center">
					<circle-check-icon v-if="progress.started" class="w-6 h-6 text-spring-600" />
					<circle-dashed-icon v-else class="w-6 h-6 text-spring-700" />
					<div
						class="w-px mt-1 grow -mb-3"
						:class="{ 'bg-spring-700': progress.started, 'bg-blade-700': !progress.started }
					"></div>
				</div>
				<div class="flex flex-col gap-2">
					<div :class="{ 'text-blade-600': !fileSelected }">{{ t('text.doTheImport') }}</div>
					<div class="flex items-center gap-4">
						<primary-button class="grow-0" :disabled="!fileSelected" @click="importData()">
							<span>{{ t('button.startImport') }}</span>
						</primary-button>
					</div>
				</div>
			</div>
			<!-- import progress and result -->
			<div class="flex gap-4">
				<div class="flex flex-col items-center">
					<circle-check-icon v-if="progress.finished" class="w-6 h-6 text-spring-600" />
					<circle-dashed-icon v-else class="w-6 h-6 text-spring-700" />
				</div>
				<div class="flex flex-col gap-2 w-full">
					<div :class="{ 'text-blade-600': !progress.started }">{{ t('text.importResult', [progress.imported]) }}</div>
					<div class="h-2 bg-blade-750 rounded-sm">
						<div class="h-2 bg-spring-700 rounded-sm" role="progressbar" :style="{ width: percentageImported + '%' }"></div>
					</div>
				</div>
			</div>
		</div>
		<!-- file input. Hidden because it's ugly. -->
		<input class="hidden" type="file" name="upload" accept=".json" ref="backupFile" @change="getFile(backupFile)" />
		<div class="flex flex-col justify-end items-center gap-4 mt-4 2xs:flex-row">
			<button class="px-3 py-2 text-blade-500" aria-label="Cancel" @click.prevent="emit('closed')">
				{{ t('button.close') }}
			</button>
			<primary-button :disabled="!progress.finished" @click="emit('closed')">
				{{ t('button.done') }}
				<check-icon class="w-6 h-6 stroke-1.5" />
			</primary-button>
		</div>
	</modal>
</template>

<script setup>
import { humanFileSize } from '@/utils.js';
import { ref, reactive, computed, inject } from 'vue';
import { useI18n } from "vue-i18n";
import Modal from '@/elements/Modal';
import PrimaryButton from '@/elements/PrimaryButton';

// icons
import { 
	CheckIcon,
	CircleCheckIcon,
	CircleDashedIcon,
} from "vue-tabler-icons";

// component constants
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
