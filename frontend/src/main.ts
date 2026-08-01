// init app
import { createApp } from 'vue';
import { markedKey, versionKey } from '@/keys';
import App from '@/App.vue';
const app = createApp(App);

// init router
import router from '@/router.js'
app.use(router);

// set global properties
app.provide(versionKey, APP_VERSION);

// vue-notification
import Notifications from '@kyvg/vue3-notification';
app.use(Notifications);

// vue-i18n
import de from '@/locales/de.json';
import en from '@/locales/en.json';
import { createI18n } from 'vue-i18n';
const messages = {
	'de': de, // German
	'en': en, // English
};
const loc: string = !('lang' in localStorage)
	? navigator.language.substring(0, 2) || (navigator as Navigator & { userLanguage?: string }).userLanguage?.substring(0, 2) || 'en'
	: (localStorage.getItem('lang') ?? 'en');
const i18n = createI18n({
	legacy: false,
	globalInjection: true,
	locale: loc,
	fallbackLocale: 'en',
  messages
});
app.use(i18n);

// marked
import { marked } from 'marked';
import { markedHighlight } from "marked-highlight";
import { sdHighlight } from '@/utils.js';
import hljs from 'highlight.js/lib/core';
import plaintext from 'highlight.js/lib/languages/plaintext';

// Only plaintext is needed as fallback
hljs.registerLanguage('plaintext', plaintext);

marked.use(markedHighlight({
	langPrefix: 'hljs language-',
	highlight: (code, lang) => {
		if (lang == 'songdrive') {
			return sdHighlight(code);
		} else {
			const language = hljs.getLanguage(lang) ? lang : 'plaintext';
			return hljs.highlight(code, { language }).value;
		}
	},
}));
app.provide(markedKey, marked);

// init basic css with tailwind imports
import '@/assets/main.css';

// ready? let's go!
app.mount('#app');
