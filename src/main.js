// init app
import { createApp } from 'vue';
import App from '@/App.vue';
const app = createApp(App);

// init router
import router from '@/router'
app.use(router);

// set firebase db config
import firebase from 'firebase/compat/app';
const conf = {
	apiKey:        String(process.env.VUE_APP_FB_API_KEY),
	authDomain:    process.env.VUE_APP_FB_PROJECT_ID + ".firebaseapp.com",
	databaseURL:   "https://" + process.env.VUE_APP_FB_PROJECT_ID + ".firebaseio.com",
	projectId:     String(process.env.VUE_APP_FB_PROJECT_ID),
	storageBucket: process.env.VUE_APP_FB_PROJECT_ID + ".appspot.com"
};
let firebaseApp = firebase.initializeApp(conf);

// set global properties
app.provide('db', firebaseApp.firestore());
app.provide('version', process.env.VUE_APP_VERSION);

// ionicons
import { IonIcon } from '@ionic/vue';
app.component('ion-icon', IonIcon);

// vue-notification
import Notifications from '@kyvg/vue3-notification';
app.use(Notifications);

// vue-sortable
import Sortable from 'sortablejs';
app.directive('sortable', (el, binding) => {
	new Sortable(el, binding.value || {});
});

// vue-i18n
import { createI18n } from 'vue-i18n';
const messages = {
	"de": require("./locales/de.json"), // German
	"en": require("./locales/en.json"), // English
};
const loc = navigator.language || navigator.userLanguage;
const i18n = createI18n({
	legacy: false,
	globalInjection: true,
	locale: loc,
	fallbackLocale: "en",
  messages
});
app.use(i18n);

// extend Object for filtering
Object.filter = (obj, predicate) => 
	Object.keys(obj)
		.filter(key => predicate(obj[key]))
		.reduce((res, key) => (res[key] = obj[key], res), {});

// ready? let's go!
app.mount('#app');
