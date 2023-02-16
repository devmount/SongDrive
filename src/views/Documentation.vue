<template>
	<div class="relative">
		<!-- secondary sidebar -->
		<div class="fixed top-4 left-4 lg:left-64 lg:ml-4 flex flex-col items-stretch bg-blade-900 rounded-lg p-2">
			<!-- scroll to top -->
			<button
				class="py-1 px-2 rounded-md hover:bg-blade-800 flex justify-start items-center gap-2 mb-4"
				@click="scrollTo('start')"
			>
				<icon-arrow-up class="w-5 h-5 stroke-1.5" />
				<span>{{ t('button.top') }}</span>
			</button>
			<!-- table of contents -->
			<button
				v-for="t in toc"
				:key="t"
				class="py-1 px-2 rounded-md hover:bg-blade-800 flex justify-start items-center gap-2"
				@click="scrollTo(dashCase(t.text))"
			>
				<icon-bookmark class="w-5 h-5 stroke-1.5" />
				<span>{{ t.text }}</span>
			</button>
		</div>
		<!-- content -->
		<div class="flex flex-col gap-16 max-w-4xl mx-auto py-12" id="start">
			<!-- title -->
			<div class="flex flex-col gap-12">
				<!-- heading -->
				<div class="flex flex-col justify-center items-center gap-4">
					<img class="w-32" src="@/assets/logo.svg" alt="SongDrive Song Management Tool" />
					<div class="text-3xl uppercase text-spring-600">{{ t('app.name') }}</div>
					<div class="text-2xl">{{ t('app.summary') }}</div>
				</div>
				<!-- features -->
				<div class="grid grid-cols-3 gap-8">
					<div class="flex flex-col justify-start items-center gap-4">
						<icon-bolt class="w-12 h-12 stroke-1" />
						<div class="text-xl uppercase tracking-widest">{{ t('docu.features.0.title') }}</div>
						<div class="text-center">{{ t('docu.features.0.description') }}</div>
					</div>
					<div class="flex flex-col justify-center items-center gap-4">
						<icon-microphone class="w-12 h-12 stroke-1" />
						<div class="text-xl uppercase tracking-widest">{{ t('docu.features.1.title') }}</div>
						<div class="text-center">{{ t('docu.features.1.description') }}</div>
					</div>
					<div class="flex flex-col justify-center items-center gap-4">
						<icon-tools class="w-12 h-12 stroke-1" />
						<div class="text-xl uppercase tracking-widest">{{ t('docu.features.2.title') }}</div>
						<div class="text-center">{{ t('docu.features.2.description') }}</div>
					</div>
				</div>
			</div>
			<!-- content -->
			<div class="markdown" v-html="content"></div>
			<!-- footer with links to edit documentation -->
			<div class="max-w-lg mx-auto text-blade-500 flex flex-col gap-4">
				<div class="text-center">{{ t('text.foundABug') }}</div>
				<div class="flex gap-4 justify-center items-center">
					<secondary-button
						:href="'https://github.com/devmount/SongDrive/blob/main/src/docs/docs.' + locale + '.md'"
						class="btn btn-secondary d-block stretch text-uppercase tooltip tooltip-right tooltip-lg mb-1"
						target="_blank"
					>
						<icon-notes class="w-5 h-5 stroke-1.5" />
						<span class="mr-2">{{ t('button.docsOnGithub') }}</span>
						<icon-external-link class="w-5 h-5 stroke-1.5" />
					</secondary-button>
					<secondary-button
						:href="'https://github.com/devmount/SongDrive/edit/main/src/docs/docs.' + locale + '.md'"
						class="btn btn-secondary d-block stretch text-uppercase tooltip tooltip-right tooltip-lg mb-1"
						target="_blank"
					>
						<icon-pencil class="w-5 h-5 stroke-1.5" />
						<span class="mr-2">{{ t('button.editThis') }}</span>
						<icon-external-link class="w-5 h-5 stroke-1.5" />
					</secondary-button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import 'highlight.js/styles/github-dark.css';
import { computed } from 'vue';
import { sdHighlight } from '@/utils.js';
import { useI18n } from 'vue-i18n';
import SecondaryButton from '@/elements/SecondaryButton';

// icons
import {
	IconArrowUp,
	IconBookmark,
	IconNotes,
	IconExternalLink,
	IconPencil,
	IconTools,
	IconBolt,
	IconMicrophone,
} from '@tabler/icons-vue';

// component constants
const { marked } = require('marked');
const { t, locale } = useI18n();

// markdown parser
const hljs = require('highlight.js');

// documentation contents
const docs = {
	de: require("@/docs/docs.de.md").default,
	en: require("@/docs/docs.en.md").default,
};

// convert spaces to dashes
const dashCase = (text) => {
	return text.toLowerCase().replace(' ', '-');
};

// scroll to element of given id
const scrollTo = (id) => {
	document.getElementById(id).scrollIntoView({ behavior: "smooth" });
};

// generate table of contents from h2's
const toc = computed(
	() => marked.lexer(docs[locale.value]).filter(t => t.type === 'heading' && t.depth === 2)
);

// parse documentation markdown content
const content = computed(
	() => marked.parse(
		docs[locale.value],
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
	)
);
</script>
