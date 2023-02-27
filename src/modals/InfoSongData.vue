<template>
	<modal
		:active="active"
		:title="t('modal.songInfo')"
		:child="true"
		@closed="emit('closed')"
	>
		<div v-if="song.note">
			<div class="font-bold">{{ t('field.note') }}</div>
			<p v-html="song.note"></p>
		</div>
	</modal>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import Modal from '@/elements/Modal';

// component constants
const { t } = useI18n();

// component properties
const props = defineProps({
	active: Boolean, // state of modal display, true to show modal
	song:   Object,  // song to show information for
});

// emits
const emit = defineEmits(['closed']);
</script>
