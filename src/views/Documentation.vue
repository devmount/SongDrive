<template>
	<div class="documentation">
		<div class="off-canvas off-canvas-secondary">
			<!-- secondary sidebar -->
			<div class="off-canvas-sidebar active">
				<div class="sidebar-wrapper">
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
			</div>
			<!-- content -->
			<div class="off-canvas-content" id="start">
				<div class="container no-sidebar">
					<!-- title -->
					<div class="columns text-center">
						<!-- heading -->
						<div class="column col-12 mb-15">
							<img class="logo" src="@/assets/logo.svg" alt="SongDrive Song Management Tool" />
							<h2 class="text-primary weight-normal mt-5 mb-3">{{ t('app.name') }}</h2>
							<div class="text-big">{{ t('app.summary') }}</div>
						</div>
						<!-- features -->
						<div class="columns col-8 col-xl-12 col-mx-auto mb-15">
							<div class="column col-4 col-xl-6 col-sm-12">
								<ion-icon :icon="flashOutline" class="icon-3x icon-thin mb-3" />
								<h3>{{ t('docu.features.0.title') }}</h3>
								<div>{{ t('docu.features.0.description') }}</div>
							</div>
							<div class="column col-4 col-xl-6 col-sm-12">
								<ion-icon :icon="micOutline" class="icon-3x icon-thin mb-3" />
								<h3>{{ t('docu.features.1.title') }}</h3>
								<div>{{ t('docu.features.1.description') }}</div>
							</div>
							<div class="column col-4 col-xl-6 col-sm-12">
								<ion-icon :icon="constructOutline" class="icon-3x icon-thin mb-3" />
								<h3>{{ t('docu.features.2.title') }}</h3>
								<div>{{ t('docu.features.2.description') }}</div>
							</div>
						</div>
					</div>
					<!-- content -->
					<div class="columns">
						<div class="column md-content" v-html="content"></div>
					</div>
				</div>
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
