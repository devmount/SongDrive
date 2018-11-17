import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './registerServiceWorker'

import VueFirestore from 'vue-firestore'
Vue.use(VueFirestore)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
