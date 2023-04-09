import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '@/views/Dashboard.vue';

export default createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{ path: '/',               name: 'dashboard',     component: Dashboard },
		// lazy load all other routes
		{ path: '/songs',          name: 'songs',         component: () => import('@/views/Songs.vue')         },
		{ path: '/songs/:tag',     name: 'songs-tag',     component: () => import('@/views/Songs.vue')         },
		{ path: '/song/:id/:key?', name: 'song-show',     component: () => import('@/views/SongShow.vue')      },
		{ path: '/setlists',       name: 'setlists',      component: () => import('@/views/Setlists.vue')      },
		{ path: '/setlists/:year', name: 'setlists-year', component: () => import('@/views/Setlists.vue')      },
		{ path: '/setlist/:id',    name: 'setlist-show',  component: () => import('@/views/SetlistShow.vue')   },
		{ path: '/profile',        name: 'profile',       component: () => import('@/views/Profile.vue')       },
		{ path: '/settings',       name: 'settings',      component: () => import('@/views/Settings.vue')      },
		{ path: '/shortcuts',      name: 'shortcuts',     component: () => import('@/views/Shortcuts.vue')     },
		{ path: '/documentation',  name: 'documentation', component: () => import('@/views/Documentation.vue') },
	]
})
