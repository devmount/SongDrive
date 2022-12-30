<template>
	<div class="documentation relative">
		<!-- secondary sidebar -->
		<div class="fixed top-4 left-4">
			<!-- scroll to top -->
			<button
				class="btn btn-secondary d-block stretch text-uppercase tooltip tooltip-right tooltip-lg mb-1"
				:data-tooltip="t('button.top')"
				@click="scrollTo('start')"
			>
				<ion-icon :icon="arrowUpOutline" class="icon-left" />
				<span class="hide-lg">{{ t('button.top') }}</span>
			</button>
			<!-- table of contents -->
			<div class="divider text-center show-lg" :data-content="t('divider.toc').charAt(0)"></div>
			<div class="divider text-center hide-lg" :data-content="t('divider.toc')"></div>
			<button
				v-for="t in toc"
				:key="t"
				class="btn btn-secondary d-block stretch text-uppercase tooltip tooltip-right tooltip-lg mb-1"
				:data-tooltip="t.text"
				@click="scrollTo(dashCase(t.text))"
			>
				<ion-icon :icon="bookmarkOutline" class="icon-left" />
				<span class="hide-lg">{{ t.text }}</span>
			</button>
			<!-- edit documentation -->
			<div class="divider text-center show-lg" :data-content="t('divider.docs').charAt(0)"></div>
			<div class="divider text-center hide-lg" :data-content="t('divider.docs')"></div>
			<a
				:href="'https://github.com/devmount/SongDrive/blob/main/src/docs/docs.' + locale + '.md'"
				class="btn btn-secondary d-block stretch text-uppercase tooltip tooltip-right tooltip-lg mb-1"
				:data-tooltip="t('button.source')"
				target="_blank"
			>
				<ion-icon :icon="codeSlashOutline" class="icon-left" />
				<span class="hide-lg">{{ t('button.source') }}</span>
				<ion-icon :icon="openOutline" class="icon-right hide-lg" />
			</a>
			<a
				:href="'https://github.com/devmount/SongDrive/edit/main/src/docs/docs.' + locale + '.md'"
				class="btn btn-secondary d-block stretch text-uppercase tooltip tooltip-right tooltip-lg mb-1"
				:data-tooltip="t('button.edit')"
				target="_blank"
			>
				<ion-icon :icon="createOutline" class="icon-left" />
				<span class="hide-lg">{{ t('button.edit') }}</span>
				<ion-icon :icon="openOutline" class="icon-right hide-lg" />
			</a>
		</div>
		<!-- content -->
		<div class="flex flex-col gap-8 max-w-4xl mx-auto" id="start">
			<!-- title -->
			<div class="flex flex-col gap-12">
				<!-- heading -->
				<div class="flex flex-col justify-center items-center gap-4">
					<img class="logo" src="@/assets/logo.svg" alt="SongDrive Song Management Tool" />
					<div class="text-3xl uppercase text-spring-600">{{ t('app.name') }}</div>
					<div class="text-2xl">{{ t('app.summary') }}</div>
				</div>
				<!-- features -->
				<div class="grid grid-cols-3 gap-8">
					<div class="flex flex-col justify-start items-center gap-4">
						<ion-icon :icon="flashOutline" class="w-12 h-12" style="--ionicon-stroke-width: 20" />
						<div class="text-xl uppercase tracking-widest">{{ t('docu.features.0.title') }}</div>
						<div class="text-center">{{ t('docu.features.0.description') }}</div>
					</div>
					<div class="flex flex-col justify-center items-center gap-4">
						<ion-icon :icon="micOutline" class="w-12 h-12" style="--ionicon-stroke-width: 20" />
						<div class="text-xl uppercase tracking-widest">{{ t('docu.features.1.title') }}</div>
						<div class="text-center">{{ t('docu.features.1.description') }}</div>
					</div>
					<div class="flex flex-col justify-center items-center gap-4">
						<ion-icon :icon="constructOutline" class="w-12 h-12" style="--ionicon-stroke-width: 20" />
						<div class="text-xl uppercase tracking-widest">{{ t('docu.features.2.title') }}</div>
						<div class="text-center">{{ t('docu.features.2.description') }}</div>
					</div>
				</div>
			</div>
			<!-- content -->
			<div class="columns">
				<div class="column md-content" v-html="content"></div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from "vue-i18n";
import {
	arrowUpOutline,
	bookmarkOutline,
	codeSlashOutline,
	constructOutline,
	createOutline,
	flashOutline,
	micOutline,
	openOutline
} from 'ionicons/icons';
import { sdHighlight } from '@/utils.js';
import 'highlight.js/styles/github-dark.css';
const { t, locale } = useI18n();
const { marked } = require('marked');

// markdown parser
const hljs = require('highlight.js');

// documentation contents
const docs = {
	de: require("@/docs/docs.de.md").default,
	en: require("@/docs/docs.en.md").default,
};

// methods
const dashCase = (text) => {
	return text.toLowerCase().replace(' ', '-');
};
const scrollTo = (id) => {
	document.getElementById(id).scrollIntoView({ behavior: "smooth" });
};

// computed
const toc = computed(
	() => marked.lexer(docs[locale.value]).filter(t => t.type === 'heading' && t.depth === 2)
);
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

<style>
.documentation .logo {
  width: 150px;
  margin-top: 2rem;
}
.documentation .md-content {
  max-width: 960px;
  margin: 0 auto;
  padding-bottom: 5rem;
}
.documentation h2, .documentation h3 {
  margin-top: 1.5em;
  margin-bottom: 1em;
  padding: 0;
}
.documentation table {
  border-collapse: collapse;
}
.documentation table th, .documentation table td {
  padding: 0.5rem;
}
.documentation table thead th {
  border-bottom: 1px solid currentColor;
}
.documentation table tr:not(:last-child) td {
  border-bottom: 1px solid #4a5052; /* $gray-color-700 */
}
</style>
