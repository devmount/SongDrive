import Vue from 'vue'
import App from './App'
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

// vue-i18n
import VueI18n from 'vue-i18n'
import messages from './translations'
Vue.use(VueI18n)
let lang = navigator.language.slice(0, 2)
const i18n = new VueI18n({
  locale: ['en', 'de'].indexOf(lang) > -1 ? lang : 'en', // set locale
  messages, // set locale messages
})

// initialize Chart.js with global configuration
import Chart from 'chart.js'
Chart.defaults.global.defaultFontColor = "#7e8d97"
Chart.defaults.global.elements.arc.borderWidth = 0
Chart.defaults.global.legend.display = false
Chart.defaults.global.tooltips.mode = 'index'
Chart.defaults.global.tooltips.intersect = false
Chart.defaults.global.tooltips.multiKeyBackground = '#000'
Chart.defaults.global.tooltips.titleMarginBottom = 10
Chart.defaults.global.tooltips.xPadding = 10
Chart.defaults.global.tooltips.yPadding = 10
Chart.defaults.global.tooltips.cornerRadius = 2
Chart.defaults.global.hover.mode = 'index'

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
