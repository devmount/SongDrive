<template>
	<div class="documentation">
		<div class="container no-sidebar">
			<!-- title -->
			<div class="columns text-center">
				<!-- heading -->
				<div class="column col-12 mb-15">
					<img class="logo" src="@/assets/logo.svg" alt="SongDrive Song Management Tool" />
					<h2 class="text-primary weight-normal mt-5 mb-3">{{ $t('app.name') }}</h2>
					<div class="text-big">{{ $t('app.summary') }}</div>
				</div>
				<!-- features -->
				<div class="columns col-8 col-xl-12 col-mx-auto mb-15">
					<div v-for="i in 3" class="column col-4 col-xl-6 col-sm-12">
						<ion-icon :name="$t('docu.features')[i-1].icon" class="icon-3x icon-thin mb-3"></ion-icon>
						<h3>{{ $t('docu.features')[i-1].title }}</h3>
						<div>{{ $t('docu.features')[i-1].description }}</div>
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

<script>
// markdown parser
const marked = require("marked");
const hljs = require('highlight.js');
import 'highlight.js/styles/github-dark.css';

marked.setOptions({
  renderer: new marked.Renderer(),
  highlight: (code, lang) => {
		const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: 'hljs language-',
  pedantic: false,
  gfm: true,
  breaks: true,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  xhtml: false
});

// documentation contents
const docs = {
	de: require("@/docs/docs.de.md").default.replace("\r\n", "\n"),
	en: require("@/docs/docs.en.md").default.replace("\r\n", "\n"),
};

export default {
	name: 'documentation',
	computed: {
		content () {
			return marked(docs[this.$i18n.locale]);
		}
	}
}
</script>

<style lang="scss">
.documentation {
	padding-bottom: 5rem;
	
	.logo {
		width: 150px;
		margin-top: 2rem;
	}
	.md-content {
		max-width: 960px;
		margin: 0 auto;
	}
	h2, h3 {
		margin-top: 1.5em;
		margin-bottom: 1em;
		padding: 0;
	}
}
</style>
