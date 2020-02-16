import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './registerServiceWorker'

// vue-firestore
import VueFirestore from 'vue-firestore'
Vue.use(VueFirestore)

// vue-notification
import Notifications from 'vue-notification'
Vue.use(Notifications)

// ionicons
Vue.config.ignoredElements = [/^ion-/]

// vue-sortable
import Sortable from 'sortablejs'
Vue.directive('sortable', {
	inserted: function (el, binding) {
		new Sortable(el, binding.value || {})
	}
})

// vue-clipboard2
import VueClipboard from 'vue-clipboard2'
Vue.use(VueClipboard)

// vue-shortkey
Vue.use(require('vue-shortkey'))

// vue-i18n
import VueI18n from 'vue-i18n'
import messages from './translations'
Vue.use(VueI18n)
const i18n = new VueI18n({
  locale: 'en', // set locale
  messages, // set locale messages
})

Vue.config.productionTip = false

// extend Object for filtering
Object.filter = (obj, predicate) => 
	Object.keys(obj)
		.filter( key => predicate(obj[key]) )
		.reduce( (res, key) => (res[key] = obj[key], res), {} );

new Vue({
	router,
	i18n,
	render: h => h(App)
}).$mount('#app')
