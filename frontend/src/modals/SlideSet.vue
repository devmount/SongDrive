<template>
	<modal-dialog
		:active="active"
		:title="!initialSlide ? t('modal.newSlide') : t('modal.editSlide')"
		size="lg"
		@closed="emit('closed')"
	>
		<div class="flex flex-col gap-2">
			<!-- title -->
			<label class="flex flex-col gap-1">
				<div>{{ t('field.title') }} <span class="text-rose-600">*</span></div>
				<input
					type="text"
					v-model="slide.title"
					:class="{ 'border-rose-600!': error.title && !slide.title }"
				/>
				<div v-if="error.title && !slide.title" class="text-rose-600">
					{{ t('error.requiredTitle') }}
				</div>
			</label>
			<!-- content -->
			<label class="flex flex-col gap-1">
				<div>{{ t('field.content') }}</div>
				<textarea v-model="slide.content" rows="8"></textarea>
			</label>
		</div>
		<div class="flex flex-col justify-end items-center gap-4 mt-4 2xs:flex-row">
			<button class="px-3 py-2 text-blade-500" aria-label="Cancel" @click.prevent="emit('closed')">
				{{ t('button.cancel') }}
			</button>
			<primary-button @click="save">
				<span v-if="!initialSlide">{{ t('button.createSlide') }}</span>
				<span v-else>{{ t('button.updateSlide') }}</span>
				<icon-device-floppy class="w-6 h-6 stroke-1.5" />
			</primary-button>
		</div>
	</modal-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import type { SetlistSlide } from '@backend/models';
import ModalDialog from '@/elements/ModalDialog.vue';
import PrimaryButton from '@/elements/PrimaryButton.vue';

// icons
import { IconDeviceFloppy } from '@tabler/icons-vue';

// component constants
const { t } = useI18n();

// component properties
const props = defineProps({
	active:       Boolean, // state of modal display, true to show modal
	initialSlide: { type: Object as PropType<SetlistSlide | null>, default: null }, // slide to edit, null when creating a new one
});

// emits
const emit = defineEmits(['closed', 'save']);

// blank slide template
const blankSlide = (): SetlistSlide => ({ type: 'plain', title: '', content: '' });

// slide input data
const slide = ref<SetlistSlide>({ ...(props.initialSlide ?? blankSlide()) });

// check if errors occured
const error = reactive({
	title: false,
});
const initInput = () => {
	error.title = false;
	slide.value = { ...(props.initialSlide ?? blankSlide()) };
};
watch(() => props.active === true, () => initInput());

// validate and emit the slide to be saved by the parent
const save = () => {
	error.title = slide.value.title == '';
	if (error.title) return;
	emit('save', { ...slide.value });
};
</script>
