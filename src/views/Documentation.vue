<template>
	<div class="documentation">
		<div class="off-canvas off-canvas-secondary">
			<!-- secondary sidebar -->
			<div class="off-canvas-sidebar active">
				<div class="sidebar-wrapper">
					<!-- scroll to top -->
					<button
						class="btn btn-secondary d-block stretch text-uppercase tooltip tooltip-right tooltip-lg mb-1"
						:data-tooltip="$t('button.top')"
						@click="scrollTo('start')"
					>
						<ion-icon name="arrow-up-outline" class="icon-left"></ion-icon>
						<span class="hide-lg">{{ $t('button.top') }}</span>
					</button>
					<!-- table of contents -->
					<div class="divider text-center show-lg" :data-content="$t('divider.toc').charAt(0)"></div>
					<div class="divider text-center hide-lg" :data-content="$t('divider.toc')"></div>
					<button
						v-for="t in toc"
						class="btn btn-secondary d-block stretch text-uppercase tooltip tooltip-right tooltip-lg mb-1"
						:data-tooltip="t.text"
						@click="scrollTo(dashCase(t.text))"
					>
						<ion-icon name="bookmark-outline" class="icon-left"></ion-icon>
						<span class="hide-lg">{{ t.text }}</span>
					</button>
					<!-- edit documentation -->
					<div class="divider text-center show-lg" :data-content="$t('divider.docs').charAt(0)"></div>
					<div class="divider text-center hide-lg" :data-content="$t('divider.docs')"></div>
					<a
						:href="'https://github.com/devmount/SongDrive/blob/main/src/docs/docs.' + $i18n.locale + '.md'"
						class="btn btn-secondary d-block stretch text-uppercase tooltip tooltip-right tooltip-lg mb-1"
						:data-tooltip="$t('button.source')"
						target="_blank"
					>
						<ion-icon name="code-slash-outline" class="icon-left"></ion-icon>
						<span class="hide-lg">{{ $t('button.source') }}</span>
						<ion-icon name="open-outline" class="icon-right hide-lg"></ion-icon>
					</a>
					<a
						:href="'https://github.com/devmount/SongDrive/edit/main/src/docs/docs.' + $i18n.locale + '.md'"
						class="btn btn-secondary d-block stretch text-uppercase tooltip tooltip-right tooltip-lg mb-1"
						:data-tooltip="$t('button.edit')"
						target="_blank"
					>
						<ion-icon name="create-outline" class="icon-left"></ion-icon>
						<span class="hide-lg">{{ $t('button.edit') }}</span>
						<ion-icon name="open-outline" class="icon-right hide-lg"></ion-icon>
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
		if (lang == 'songdrive') {
			let parsedCode = [];
			code.split('\n').forEach(line => {
				// check for marker
				if (line.substring(0,2) === '--') {
					parsedCode.push('<span class="text-gray">' + line + '</span>');
				} else
				// check for chords
				if (line.slice(-2) === '  ') {
					parsedCode.push('<span class="text-primary">' + line + '</span>');
				}
				// lyrics
				else {
					parsedCode.push(line);
				}
			});
			return parsedCode.join('\n');
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
});

// documentation contents
const docs = {
	de: require("@/docs/docs.de.md").default,
	en: require("@/docs/docs.en.md").default,
};

export default {
	name: 'documentation',
	methods: {
		dashCase (text) {
			return text.toLowerCase().replace(' ', '-');
		},
		scrollTo (id) {
			document.getElementById(id).scrollIntoView({behavior: "smooth" });
		}
	},
	computed: {
		toc () {
			return marked.lexer(docs[this.$i18n.locale]).filter(t => t.type === 'heading' && t.depth === 2);
		},
		content () {
			return marked(docs[this.$i18n.locale]);
		}
	}
}
</script>

<style lang="scss">
.documentation {
	
	.logo {
		width: 150px;
		margin-top: 2rem;
	}
	.md-content {
		max-width: 960px;
		margin: 0 auto;
		padding-bottom: 5rem;
	}
	h2, h3 {
		margin-top: 1.5em;
		margin-bottom: 1em;
		padding: 0;
	}
	table {
		border-collapse: collapse;
		th, td {
			padding: .5rem;
		}
		thead th {
			border-bottom: 1px solid currentColor;
		}
		tr:not(:last-child) td {
			border-bottom: 1px solid #4a5052; // $gray-color-700
		}
	}
}
</style>
