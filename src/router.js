import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '@/views/Dashboard.vue';
import Songs from '@/views/Songs.vue';
import SongShow from '@/views/SongShow.vue';
import Setlists from '@/views/Setlists.vue';
import SetlistShow from '@/views/SetlistShow.vue';

export default createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{ path: '/',                         name: 'dashboard',     component: Dashboard   },
		{ path: '/songs',                    name: 'songs',         component: Songs       },
		{ path: '/songs/:tag',               name: 'songs-tag',     component: Songs       },
		{ path: '/song/:id/:key?/:setlist?', name: 'song-show',     component: SongShow    },
		{ path: '/setlists',                 name: 'setlists',      component: Setlists    },
		{ path: '/setlists/:year',           name: 'setlists-year', component: Setlists    },
		{ path: '/setlist/:id',              name: 'setlist-show',  component: SetlistShow },
		// lazy load all other routes
		{ path: '/profile',       name: 'profile',       component: () => import('@/views/Profile.vue')       },
		{ path: '/settings',      name: 'settings',      component: () => import('@/views/Settings.vue')      },
		{ path: '/shortcuts',     name: 'shortcuts',     component: () => import('@/views/Shortcuts.vue')     },
		{ path: '/documentation', name: 'documentation', component: () => import('@/views/Documentation.vue') },
	]
})
