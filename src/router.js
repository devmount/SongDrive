import Vue from 'vue'
import Router from 'vue-router'
import Dashboard from './views/Dashboard.vue'

Vue.use(Router)

export default new Router({
  routes: [
    { path: '/',           name: 'dashboard', component: Dashboard },
    { path: '/songs',      name: 'songs',     component: () => import('./views/Songs.vue')    }, // lazy loaded
    { path: '/songs/:tag', name: 'songs-tag', component: () => import('./views/Songs.vue')    }, // lazy loaded
    { path: '/song/:id',   name: 'song-show', component: () => import('./views/SongShow.vue') }, // lazy loaded
    { path: '/setlists',   name: 'setlists',  component: () => import('./views/Setlists.vue') }, // lazy loaded
    { path: '/profile',    name: 'profile',   component: () => import('./views/Profile.vue')  }, // lazy loaded
    { path: '/settings',   name: 'settings',  component: () => import('./views/Settings.vue') }, // lazy loaded
  ]
})
