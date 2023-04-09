<template>
	<modal
		:active="active"
		:title="t('modal.songSyntaxCheatsheet')"
		size="xl2"
		:child="true"
		@closed="emit('closed')"
	>
		<div class="markdown overflow-y-scroll" v-html="content"></div>
	</modal>
</template>

<script setup>
import 'highlight.js/styles/github-dark.css';
import { computed } from 'vue';
import { marked } from 'marked';
import { sdHighlight } from '@/utils.js';
import { useI18n } from 'vue-i18n';
import de from "@/docs/syntax-cheatsheet.de.md?raw";
import en from "@/docs/syntax-cheatsheet.en.md?raw";
import hljs from 'highlight.js';
import Modal from '@/elements/Modal.vue';


// component constants
const { t, locale } = useI18n();

// cheatsheet contents
const cheatsheets = { de, en };
const lang = ['de', 'en'].includes(locale.value) ? locale.value : 'en';

// component properties
const props = defineProps({
	active: Boolean // state of modal display, true to show modal
});

// emits
const emit = defineEmits(['closed']);

// parse content of cheatsheet markdown file
const content = computed(() => marked.parse(
	cheatsheets[lang],
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
