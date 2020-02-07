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

// vue clipboard2
import VueClipboard from 'vue-clipboard2'
Vue.use(VueClipboard)

// vue shortkey
Vue.use(require('vue-shortkey'))

Vue.config.productionTip = false

// extend Object for filtering
Object.filter = (obj, predicate) => 
	Object.keys(obj)
		.filter( key => predicate(obj[key]) )
		.reduce( (res, key) => (res[key] = obj[key], res), {} );

new Vue({
	router,
	render: h => h(App)
}).$mount('#app')
