import Vue from 'vue';
import Router from 'vue-router';
import Dashboard from './views/Dashboard';

Vue.use(Router);

export default new Router({
	mode: 'history',
	// base: process.env.BASE_URL,
	routes: [
		{ path: '/',               name: 'dashboard',     component: Dashboard },
		// lazy load all other routes
		{ path: '/songs',          name: 'songs',         component: () => import('./views/Songs')         },
		{ path: '/songs/:tag',     name: 'songs-tag',     component: () => import('./views/Songs')         },
		{ path: '/song/:id/:key?', name: 'song-show',     component: () => import('./views/SongShow')      },
		{ path: '/setlists',       name: 'setlists',      component: () => import('./views/Setlists')      },
		{ path: '/setlists/:year', name: 'setlists-year', component: () => import('./views/Setlists')      },
		{ path: '/setlist/:id',    name: 'setlist-show',  component: () => import('./views/SetlistShow')   },
		{ path: '/profile',        name: 'profile',       component: () => import('./views/Profile')       },
		{ path: '/settings',       name: 'settings',      component: () => import('./views/Settings')      },
		{ path: '/shortcuts',      name: 'shortcuts',     component: () => import('./views/Shortcuts')     },
		{ path: '/documentation',  name: 'documentation', component: () => import('./views/Documentation') },
	]
})
