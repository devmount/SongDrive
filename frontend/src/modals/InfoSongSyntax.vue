<template>
	<modal-dialog
		:active="active"
		:title="t('modal.songSyntaxCheatsheet')"
		size="xl2"
		:child="true"
		@closed="emit('closed')"
	>
		<div class="markdown overflow-y-scroll" v-html="content"></div>
	</modal-dialog>
</template>

<script setup lang="ts">
import { injectStrict, markedKey } from '@/keys';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import de from "@/docs/syntax-cheatsheet.de.md?raw";
import en from "@/docs/syntax-cheatsheet.en.md?raw";
import ModalDialog from '@/elements/ModalDialog.vue';


// component constants
const { t, locale } = useI18n();
const loc = locale.value.substring(0, 2);

// cheatsheet contents
const cheatsheets: Record<string, string> = { de, en };
const lang = ['de', 'en'].includes(loc) ? loc : 'en';

// component properties
const props = defineProps({
	active: Boolean // state of modal display, true to show modal
});

// emits
const emit = defineEmits(['closed']);

// parse content of cheatsheet markdown file
const marked = injectStrict(markedKey);
const content = computed(() => marked.parse(
	cheatsheets[lang],
	{
		renderer: new marked.Renderer(),
		pedantic: false,
		gfm: true,
		breaks: true,
	}
));
</script>
