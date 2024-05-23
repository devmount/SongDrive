// init app
import { createApp } from 'vue';
import App from '@/App.vue';
const app = createApp(App);

// init router
import router from '@/router.js'
app.use(router);

// set firebase db config
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
const API_KEY = import.meta.env.VITE_FB_API_KEY;
const PROJECT_ID = import.meta.env.VITE_FB_PROJECT_ID;
const conf = {
	apiKey:        String(API_KEY),
	authDomain:    PROJECT_ID + '.firebaseapp.com',
	databaseURL:   'https://' + PROJECT_ID + '.firebaseio.com',
	projectId:     String(PROJECT_ID),
	storageBucket: PROJECT_ID + '.appspot.com'
};
let firebaseApp = initializeApp(conf);

// set global properties
app.provide('firebaseApp', firebaseApp);
app.provide('db', getFirestore(firebaseApp));
app.provide('version', APP_VERSION);

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
const loc = !('lang' in localStorage)
	? navigator.language || navigator.userLanguage
	: localStorage.getItem('lang');
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
import hljs from 'highlight.js';
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
marked.use({
	mangle: false,
  headerIds: false,
});
app.provide('marked', marked);

// extend Object for filtering
Object.filter = (obj, predicate) => 
	Object.keys(obj)
		.filter(key => predicate(obj[key]))
		.reduce((res, key) => (res[key] = obj[key], res), {});

// init basic css with tailwind imports
import '@/assets/main.css';

// ready? let's go!
app.mount('#app');
