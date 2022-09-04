<template>
	<div class="modal modal-md" :class="{ active: active }">
		<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="emit('closed')"></a>
		<div class="modal-container">
			<div class="modal-header">
				<a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="emit('closed')"></a>
				<div class="modal-title h5">{{ t('modal.songSyntaxCheatsheet') }}</div>
			</div>
			<div class="modal-body">
				<div v-html="content"></div>
			</div>
			<div class="modal-footer"></div>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from "vue-i18n";
const { t, locale } = useI18n();
import { sdHighlight } from '@/utils.js';

// markdown parser
import { marked } from 'marked';
const hljs = require('highlight.js');
import 'highlight.js/styles/github-dark.css';

// cheatsheet contents
const cheatsheets = {
	de: require("@/docs/syntax-cheatsheet.de.md").default,
	en: require("@/docs/syntax-cheatsheet.en.md").default,
};

// inherited properties
const props = defineProps({
	active: Boolean // state of modal display, true to show modal
});

// emits
const emit = defineEmits(['closed']);

const content = computed(() => marked.parse(
	cheatsheets[locale.value],
	{
		renderer: new marked.Renderer(),
		highlight: (code, lang) => {
			if (lang == 'songdrive') {
				return sdHighlight(code);
			} else {
				const language = hljs.getLanguage(lang) ? lang : 'plaintext';
				return hljs.highlight(code, { language }).value;
			}
		},
		langPrefix: 'hljs language-',
		pedantic: false,
		gfm: true,
		breaks: true,
		sanitize: false,
		smartLists: true,
		smartypants: false,
		xhtml: false
	}
));
</script>
