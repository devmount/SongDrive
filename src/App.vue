<template>
	<div id="app">
		<div class="off-canvas off-canvas-sidebar-show">
			<!-- off-screen toggle button -->
			<a class="off-canvas-toggle btn btn-primary btn-action" @click="open = true">
				<i class="icon ion-md-menu"></i>
			</a>

			<!-- off-screen sidebar -->
			<div id="sidebar-id" class="off-canvas-sidebar" :class="{ active: open }">
				<div class="sidebar-wrapper">
					<div class="brand text-center mt-2">
						<router-link to="/" class="logo">
							<img src="./assets/logo.svg" alt="SongDrive Song Management Tool" />
							<h1>SONGDRIVE</h1>
							<div class="text-gray text-small text-right mr-5 pr-1">v{{ appVersion }} BETA</div>
						</router-link>
					</div>
					<ul class="menu text-uppercase">
						<li class="divider text-center" data-content="START"></li>
						<li class="menu-item">
							<router-link to="/" class="py-2" @click.native="open = false"><i class="icon ion-md-apps mr-2"></i> Dashboard</router-link>
						</li>
						<li class="menu-item">
							<router-link to="/songs" class="py-2" @click.native="open = false"><i class="icon ion-md-musical-notes mr-2"></i> Songs</router-link>
							<div class="menu-badge">
								<label v-if="ready.songs" class="label py-1">{{ Object.keys(songs).length }}</label>
								<label v-else class="label py-1"><div class="loading d-inline-block px-2"></div></label>
								<button v-if="auth.user && ready.users && auth.roles[users[auth.user].role] > 2" class="btn btn-secondary btn-action btn-sm mx-2 tooltip tooltip-left" data-tooltip="Add new Song" @click="modal.addsong = true"><i class="icon ion-md-add"></i></button>
							</div>
						</li>
						<li class="menu-item">
							<router-link to="/setlists" class="py-2" @click.native="open = false"><i class="icon ion-md-list mr-2"></i> Setlists</router-link>
							<div class="menu-badge">
								<label v-if="ready.setlists" class="label py-1">{{ Object.keys(setlists).length }}</label>
								<label v-else class="label py-1"><div class="loading d-inline-block px-2"></div></label>
								<button v-if="auth.user && ready.users && auth.roles[users[auth.user].role] > 1" class="btn btn-secondary btn-action btn-sm mx-2 tooltip tooltip-left" data-tooltip="Add new Setlist" @click="modal.addsetlist = true"><i class="icon ion-md-add"></i></button>
							</div>
						</li>
						<li class="divider text-center" data-content="ACCOUNT"></li>
						<li v-if="!auth.user" class="menu-item pb-2">
							<div class="form-group">
								<input type="text" v-model="auth.email" class="form-input mb-1" placeholder="email" />
								<input type="password" v-model="auth.password" class="form-input mb-1" placeholder="password" />
								<button class="btn btn-primary d-block stretch" @click="signIn" v-shortkey="['enter']" @shortkey="signIn">
									<i class="icon ion-md-arrow-forward float-right mr-1"></i>Sign In
								</button>
							</div>
						</li>
						<li v-if="auth.user && ready.users" class="menu-item pt-2 pb-2">
							<router-link to="/profile" class="py-2" @click.native="open = false">
								<div class="tile tile-centered">
									<div class="tile-icon mr-2 ml-1">
										<img v-if="auth.userObject.photoURL" class="avatar" :src="auth.userObject.photoURL" alt="Avatar">
										<figure v-else class="avatar" :data-initial="auth.userObject.displayName.substring(0,2).toUpperCase()" alt="Avatar"></figure>
									</div>
									<div class="tile-content">
										{{ users[auth.user].name }}
										<div class="text-gray text-small">{{ users[auth.user].role }}</div>
									</div>
								</div>
							</router-link>
						</li>
						<li v-if="auth.user" class="menu-item">
							<router-link to="/settings" class="py-2" @click.native="open = false"><i class="icon ion-md-options mr-2"></i> Settings</router-link>
						</li>
						<li v-if="auth.user" class="menu-item">
							<button class="btn btn-secondary d-block stretch mt-3" @click="signOut">
								<i class="icon ion-md-log-out float-right mr-1"></i>Sign Out
							</button>
						</li>
					</ul>
				</div>
			</div>
			<a class="off-canvas-overlay" @click="open = false"></a>

			<!-- off-screen content -->
			<div class="off-canvas-content">
				<router-view
					:key="$route.fullPath"
					:db="db"
					:user="auth.user"
					:userObject="auth.userObject"
					:role="auth.user && ready.users ? auth.roles[users[auth.user].role] : ''"
					:roleName="auth.user && ready.users ? users[auth.user].role : ''"
					:songs="songs"
					:setlists="setlists"
					:users="users"
					:tags="tags"
					:ready="ready"
				></router-view>
			</div>

			<!-- modals -->
			<SongSet
				v-if="modal.addsong"
				:db="db"
				:active="modal.addsong"
				:existing="false"
				:initialSong="newSong"
				songKey=""
				:songs="songs"
				:tags="tags"
				:ready="ready"
				@closed="modal.addsong = false"
				@reset="resetSong"
			/>
			<SetlistSet
				v-if="modal.addsetlist"
				:db="db"
				:active="modal.addsetlist"
				:existing="false"
				:initialSetlist="newSetlist"
				setlistKey=""
				:songs="songs"
				:tags="tags"
				:ready="ready"
				@closed="modal.addsetlist = false"
				@reset="resetSetlist"
			/>
		</div>

		<!-- notifications -->
		<notifications position="bottom right" :duration="5000" classes="toast" />
	</div>
</template>

<script>
// get components
import SongSet from '@/components/SongSet.vue'
import SetlistSet from '@/components/SetlistSet.vue'
// get database object authorized in config.js
import { db } from '@/firebase'
import { firebase } from "@firebase/app"
import '@firebase/auth'

export default {
	name: 'app',
	version: 'v1.0.3',
	components: {
		SongSet,
		SetlistSet,
	},
	firestore () {
		return {
			songs: {
				ref: db.collection('songs'),
				objects: true,
				resolve: () => { this.ready.songs = true },
				reject: () => { this.ready.songs = true }
			},
			setlists: {
				ref: db.collection('setlists').orderBy('date', 'desc'),
				objects: true,
				resolve: () => { this.ready.setlists = true },
				reject: () => { this.ready.setlists = true }
			},
			users: {
				ref: db.collection('users'),
				objects: true,
				resolve: () => { this.ready.users = true },
				reject: () => { this.ready.users = true }
			},
			tags: {
				ref: db.collection('tags'),
				objects: true,
				resolve: () => { this.ready.tags = true },
				reject: () => { this.ready.tags = true }
			},
		}
	},
	data () {
		return {
			ready: {
				songs: false,
				setlists: false,
				users: false,
				tags: false,
			},
			open: false,
			modal: {
				addsong: false,
				addsetlist: false
			},
			newSong: {
				authors: '',
				ccli: '',
				content: '',
				language: '',
				note: '',
				publisher: '',
				subtitle: '',
				tags: [],
				title: '',
				translations: [],
				tuning: '',
				year: ''
			},
			newSetlist: {
				title: '',
				date: '',
				songs: [],
			},
			db: db,
			auth: {
				roles: { reader: 1, performer: 2, editor: 3, admin: 4 },
				email: '',
				password: '',
				user: firebase.auth().currentUser ? firebase.auth().currentUser.uid : '',
				userObject: firebase.auth().currentUser ? firebase.auth().currentUser : {},
			}
		}
	},
	methods: {
		resetSong () {
			this.newSong = {
				authors: '',
				ccli: '',
				content: '',
				language: '',
				note: '',
				publisher: '',
				subtitle: '',
				tags: [],
				title: '',
				translations: [],
				tuning: '',
				year: ''
			}
		},
		resetSetlist () {
			this.newSetlist = {
				title: '',
				date: '',
				songs: [],
			}
		},
		signIn () {
			var self = this
			firebase.auth().signInWithEmailAndPassword(this.auth.email, this.auth.password).then(() => {
				// sign-in successful
				self.auth.user = firebase.auth().currentUser.uid
				self.auth.userObject = firebase.auth().currentUser
				self.$notify({
					title: '<button class="btn btn-clear float-right"></button>Successfully signed in!',
					text: 'You can now edit content.',
					type: 'toast-primary'
				})
			}).catch((error) => {
				// throw error message
				self.$notify({
					title: '<button class="btn btn-clear float-right"></button>' + error.code + '!',
					text: error.message,
					type: 'toast-primary'
				})
			})
		},
		signOut () {
			var self = this
			firebase.auth().signOut().then(() => {
				// sign-out successful
				self.auth.user = ''
				self.$notify({
					title: '<button class="btn btn-clear float-right"></button>Successfully signed out!',
					text: 'You are now in read-only mode.',
					type: 'toast-primary'
				})
			}).catch(function(error) {
				// throw error message
				self.$notify({
					title: '<button class="btn btn-clear float-right"></button>' + error.code + '!',
					text: error.message,
					type: 'toast-primary'
				})
			})
		},
	},
	computed: {
		appVersion() {
			return process.env.PACKAGE_VERSION;
		}
	},
	mounted () {
		// check initially if authenticated user exists
		var self = this
		firebase.auth().onAuthStateChanged(function(user) {
			self.auth.user = user ? user.uid : ''
			self.auth.userObject = user ? user : ''
		}.bind(this))
	}
}
</script>

<style lang="scss">
// import external dependencies
@import url('https://fonts.googleapis.com/css?family=Fira+Mono');
@import url('https://cdn.jsdelivr.net/gh/tonsky/FiraCode@1.206/distr/fira_code.css');

// overwrite spectre variables
$primary-color: #88b544;
$primary-dark-color: #222627;
$error-color: #ed2f47;
$body-font-color: #c1ced1;
$bg-color: #131516;
$bg-color-medium: #181a1b;
$bg-color-light: #1b1e1f;
$bg-color-dark: #222627;
$border-color: #222627;
$gray-color: #5e6769;
$gray-color-dark: #4a5052;
$dark-color: #010101;
$black-color: #000000;
$mono-font-family: "Fira Mono", monospace;
$size-2x: 1440px;

$html-font-size: 20px;
$unit-2: .4rem;
$layout-spacing: $unit-2;
$grid-spacing: ($layout-spacing / ($layout-spacing * 0 + 1)) * $html-font-size;

// import spectre
@import "~spectre.css/src/spectre";
@import "~spectre.css/src/spectre-exp";

// import ionicons
$ionicons-font-path: "~ionicons/dist/fonts";
@import "~ionicons/dist/scss/ionicons";

// icons
.icon {
	font-size: 1em;
}
.icon-1-5x {
	font-size: 1.5em;
}
.icon-2x {
	font-size: 2em;
}
.icon-4x {
	font-size: 4em;
}

// positions and spacing
.m-0 { margin: 0; }
.p-0 { padding: 0; }

.m-3 { margin: .6rem !important; }
.mt-3 { margin-top: .6rem !important; }
.mr-3 { margin-right: .6rem !important; }
.mb-3 { margin-bottom: .6rem !important; }
.ml-3 { margin-left: .6rem !important; }
.mx-3 { margin-right: .6rem !important; margin-left: .6rem !important; }
.my-3 { margin-top: .6rem !important; margin-bottom: .6rem !important; }
.p-3 { padding: .6rem !important; }
.pt-3 { padding-top: .6rem !important; }
.pr-3 { padding-right: .6rem !important; }
.pb-3 { padding-bottom: .6rem !important; }
.pl-3 { padding-left: .6rem !important; }
.px-3 { padding-right: .6rem !important; padding-left: .6rem !important; }
.py-3 { padding-top: .6rem !important; padding-bottom: .6rem !important; }

.m-4 { margin: .8rem !important; }
.mt-4 { margin-top: .8rem !important; }
.mr-4 { margin-right: .8rem !important; }
.mb-4 { margin-bottom: .8rem !important; }
.ml-4 { margin-left: .8rem !important; }
.mx-4 { margin-right: .8rem !important; margin-left: .8rem !important; }
.my-4 { margin-top: .8rem !important; margin-bottom: .8rem !important; }
.p-4 { padding: .8rem !important; }
.pt-4 { padding-top: .8rem !important; }
.pr-4 { padding-right: .8rem !important; }
.pb-4 { padding-bottom: .8rem !important; }
.pl-4 { padding-left: .8rem !important; }
.px-4 { padding-right: .8rem !important; padding-left: .8rem !important; }
.py-4 { padding-top: .8rem !important; padding-bottom: .8rem !important; }

.m-5 { margin: 1rem !important; }
.mt-5 { margin-top: 1rem !important; }
.mr-5 { margin-right: 1rem !important; }
.mb-5 { margin-bottom: 1rem !important; }
.ml-5 { margin-left: 1rem !important; }
.mx-5 { margin-right: 1rem !important; margin-left: 1rem !important; }
.my-5 { margin-top: 1rem !important; margin-bottom: 1rem !important; }
.p-5 { padding: 1rem !important; }
.pt-5 { padding-top: 1rem !important; }
.pr-5 { padding-right: 1rem !important; }
.pb-5 { padding-bottom: 1rem !important; }
.pl-5 { padding-left: 1rem !important; }
.px-5 { padding-right: 1rem !important; padding-left: 1rem !important; }
.py-5 { padding-top: 1rem !important; padding-bottom: 1rem !important; }

.ls-1 { letter-spacing: 1px; }
.ls-2 { letter-spacing: 2px; }

// colors
.bg-primary-dark {
	background-color: $primary-dark-color;
}

// responsive grid
.container {
	&.grid-2x {
		max-width: $grid-spacing * 2 + $size-2x;
	}
}
.show-2x {
	display: none !important;
}
@media (max-width: $size-2x) {
	.col-2x-12,
	.col-2x-11,
	.col-2x-10,
	.col-2x-9,
	.col-2x-8,
	.col-2x-7,
	.col-2x-6,
	.col-2x-5,
	.col-2x-4,
	.col-2x-3,
	.col-2x-2,
	.col-2x-1,
	.col-2x-auto {
		flex: none;
	}
	.col-2x-12 {
		width: 100%;
	}
	.col-2x-11 {
		width: 91.66666667%;
	}
	.col-2x-10 {
		width: 83.33333333%;
	}
	.col-2x-9 {
		width: 75%;
	}
	.col-2x-8 {
		width: 66.66666667%;
	}
	.col-2x-7 {
		width: 58.33333333%;
	}
	.col-2x-6 {
		width: 50%;
	}
	.col-2x-5 {
		width: 41.66666667%;
	}
	.col-2x-4 {
		width: 33.33333333%;
	}
	.col-2x-3 {
		width: 25%;
	}
	.col-2x-2 {
		width: 16.66666667%;
	}
	.col-2x-1 {
		width: 8.33333333%;
	}
	.col-2x-auto {
		width: auto;
	}
	.hide-2x {
		display: none !important;
	}
	.show-2x {
		display: block !important;
	}
}

// typography
h1, h2, h3, h4, h5, h6,
.h1, .h2, .h3, .h4, .h5, .h6 {
	text-transform: uppercase;
	font-weight: 300;
}
h2, .h2 {
	font-size: 2.5em;
	letter-spacing: 3px;
	margin-bottom: .2em;

	.loading {
		vertical-align: text-bottom;
	}
}
h3, .h3 {
	font-size: 1em;
	letter-spacing: 2px;
	padding-bottom: 1em;
}
h5, .h5 {
	letter-spacing: 2px;
}
h6, .h6 {
	letter-spacing: 1px;
}
@media (max-width: $size-xl) {
	h2, h3,
	.h2, .h3 {
		text-align: center;
	}
}
code {
	font-family: $mono-font-family;
	background: $bg-color-dark;
	color: $body-font-color;
}
.text-pre {
	font-family: $mono-font-family;
}
.text-breaks {
	white-space: pre;
}
.text-small {
	font-size: .8em;
	line-height: 1.1em;
}
.text-huge {
	font-size: 4em;
	line-height: 1.5em;
	font-weight: 300;
}
.text-transparent {
	color: transparent;
}

// display
.d-flex > * {
	flex: auto;
	flex-basis: 0;
}
.d-flex > * + * {
	margin-left: .2rem;
}
@media (max-width: $size-lg) {
	.d-flex {
		flex-direction: column;
	}
	.d-flex > * {
		margin-left: 0;
	}
}
::selection {
	background: $primary-color;
}
::-moz-selection {
	background: $primary-color;
}

// loading
.loading {
	&.loading-xl {
		min-height: $unit-12;
		&::after {
			height: $unit-12;
			margin-left: -$unit-6;
			margin-top: -$unit-6;
			width: $unit-12;
		}
	}
}

// toast
.notifications {
	margin-right: .8em;
}
.toast {
	margin-bottom: .8em;
}

// form and buttons
.btn {
	&.btn-secondary {
		background: $bg-color-dark;
		border-color: $bg-color-medium;
		color: $gray-color;
		
		&:focus:not(.btn-error) {
			background: $bg-color-dark;
			border-color: $bg-color-medium;
			color: $gray-color;
		}
		&:hover:not(.btn-error) {
			background: darken($primary-color-dark, 2%);
			border-color: darken($primary-color-dark, 5%);
			color: $light-color;
		}
		&:active:not(.btn-error),
		&.active:not(.btn-error) {
			background: darken($primary-color-dark, 4%);
			border-color: darken($primary-color-dark, 7%);
			color: $light-color;
		}
	}
	&.btn-sm {
		&.btn-fw {
			width: 1.4rem;
		}
	}
	&.btn-xl {
		&.btn-fw {
			width: 2.5rem;
		}
		min-width: 2.5rem;
		height: 2.5rem;
		line-height: 1.8rem;
		font-size: 1.5em;
	}
	&.btn-toggle.btn-primary:focus {
		background: $primary-color;
	}
	&.btn-toggle.btn-secondary:focus {
		background: $bg-color-dark;
	}
	&.stretch {
		width: 100%;
	}
	&.btn-link {
		&.btn-gray {
			color: $gray-color;
		}
	}
}
.switch-lg {
	padding-left: 2.4rem;
	line-height: 1.4rem;

	.form-icon {
		border-radius: 0.55rem;
		height: 1.1rem;
		width: 2rem;

		&::before {
			display: block;
			height: 1rem;
			width: 1rem;
		}
	}
	input:checked + .form-icon::before {
		left: 18px;
	}
}
.input-group.filter > .addon-lg {
	min-width: 40px;
	text-align: center;
}
a:focus,
.btn:focus {
  box-shadow: 0 0 0 .2rem rgba($primary-dark-color, .2);
}
.btn.btn-primary:focus,
.slider:focus,
.form-input:focus,
.form-select:focus,
.form-autocomplete .form-autocomplete-input.is-focused {
  box-shadow: 0 0 0 .2rem rgba($primary-color, .2);
}
.btn.btn-error:focus {
  box-shadow: 0 0 0 .2rem rgba($error-color, .2);
}
.form-input,
.form-select {
  .has-error &,
  &.is-error {
    background: darken($error-color, 40%);
    border-color: $error-color;
    &:focus {
      box-shadow: 0 0 0 .2rem rgba($error-color, .2);
    }
  }
}

// label
.label {
	&:hover {
		background: darken($primary-color-dark, 2%);
	}
}

// table
.table {
	td, th {
		border: none;
	}
}

// chip
.chip {
	height: 1.3rem;

	figure {
		&::before {
			text-transform: uppercase;
		}
	}
}

// tile
.tile {
	figure {
		&::before {
			text-transform: uppercase;
			font-weight: 400;
		}
	}
	& .tile-title,
	& .tile-subtitle {
		line-height: .85rem;
	}
	&.tile-hover:hover {
		background: $bg-color-dark;
	}

	.tile-icon {
		.avatar-secondary {
			background: $bg-color-dark;
			&::before {
				text-transform: unset;
			}
		}
	}
}

// modal
.modal {
	.modal-container {
		.modal-header {
			color: $light-color;

			.modal-subtitle {
				font-weight: 400;
			}
		}
	}
	&.modal-lg {
		.modal-overlay {
			background: rgba($bg-color, .75);
		}
		.modal-container {
			max-width: 100vw;
			max-height: 100vh;
		}

		&.modal-full {
			padding: 0;

			.modal-overlay {
				background: $black-color;
			}
			.modal-container {
				background: $black-color;
				height: 100vh;

				.modal-footer {
					position: absolute;
					bottom: 0;
					right: 0;
				}
			}
		}
	}

	&.modal-secondary {
		.modal-body {
			height: 50vh;
		}
	}
}

// off-canvas
.off-canvas {
	z-index: 0;
	.off-canvas-toggle {
		z-index: 10;
		width: 2.2rem;
	}

	.off-canvas-sidebar {
		min-width: 12rem;
		overflow: visible;

		.sidebar-wrapper {
			position: fixed;
			min-width: inherit;
		}
	}
	.off-canvas-content {
		min-height: 100vh;
		padding: 0 !important;
	}
}
@media (max-width: $size-xl) {
	.off-canvas {
		.off-canvas-content {
			padding: .5rem;
		}
	}
}
@media (min-width: $size-lg) {
	.off-canvas {
		.off-canvas-sidebar {
			z-index: 0;
		}
	}
}
.off-canvas-secondary {
	.off-canvas-sidebar {
		background: $bg-color-medium;
		padding: 1rem;
		min-width: 8.5rem;
		-webkit-box-flex: 0;
		-ms-flex: 0 0 auto;
		flex: 0 0 auto;
		position: relative;
		-webkit-transform: none;
		transform: none;

		.divider {
			margin-top: 2em;
		}
		.divider[data-content]::after {
			background: $bg-color-medium;
		}

		.tooltip::after {
			display: none;
		}

		.sidebar-wrapper {
			position: fixed;
			min-width: 6.5rem;
		}
	}
}
@media (max-width: $size-lg) {
	.off-canvas-secondary {
		.off-canvas-sidebar {
			padding: 3rem .4rem .4rem .4rem;
			min-width: 2.2rem;
			width: 3rem;

			.btn, .form-switch, .label, .divider {
				max-width: 2.2rem;
			}
			.btn {
				min-height: 2rem;
				line-height: 1.3rem;
			}
		}
	}
}
.container.no-sidebar,
.off-canvas-secondary .off-canvas-content .container {
	padding: 1rem;
}

// branding
.brand {
	padding: 1em 1em 0 1em;

	.logo {
		padding: .3em 0;
		text-decoration: none;

		img {
			display: inline-block;
			width: 32px;
		}
		h1 {
			display: inline-block;
			font-size: 1.1rem;
			font-weight: 400;
			letter-spacing: 2px;
			line-height: 1.6rem;
			margin-bottom: 0;
			margin-left: .5rem;
			margin-right: .5rem;
		}
	}
}

// sidebar menu
.menu {
	box-shadow: none;
	background: $bg-color;

	.divider {
		margin-top: 2em;
		margin-bottom: 1.2em;

		&[data-content]::after {
			background: $bg-color;
		}
	}

	.menu-item {
		a {
			&:hover {
				background: $primary-dark-color;
			}
			&.text-error:hover {
				background: #27181c;
			}

			&.router-link-exact-active {
				background: $primary-dark-color;
				color: $primary-color;
			}
		}
		.loading {
			&::after {
				border-left-color: white;
				border-bottom-color: white;
			}
		}
		.menu-badge {
			.label {
				vertical-align: middle;
			}
			.btn {
				margin-top: 0;
			}
		}
	}
}

// filter select field
.filter:required:invalid {
	color: $gray-color;
}
.filter option[value=""][disabled] {
	display: none;
}
.filter option {
	color: $body-font-color;
}

// shapes
.s-circle {
	&.s-circle-state {
		width: 1rem;
		height: 1rem;
		border: 2px solid $gray-color;

		&.active {
			background: $primary-color;
			border-color: $primary-color;
		}
	}
}

// avatar
.avatar {
	&.avatar-xxl {
		font-size: 2rem;
		height: 4rem;
		width: 4rem;
	}

	.icon {
		line-height: 1.8;
	}
}

// calendar
.calendar-wrapper {
	.calendar {
		width: 100%;
		background: transparent;
		border: none;

		header {
			.prev:after {
				border-right-color: $body-font-color;
			}
			.next:after {
				border-left-color: $body-font-color;
			}

			.prev:not(.disabled):hover, 
			.next:not(.disabled):hover, 
			.up:not(.disabled):hover {
				background: $primary-dark-color;
				color: $primary-color;
			}

			.prev:not(.disabled):hover:after {
				border-right-color: $primary-color;
			}
			.next:not(.disabled):hover:after {
				border-left-color: $primary-color;
			}
		}

		.cell {
			height: 60px;
			line-height: 60px;
			border-radius: 0.1rem;

			&:not(.blank):not(.disabled).day:hover,
			&:not(.blank):not(.disabled).month:hover,
			&:not(.blank):not(.disabled).year:hover {
				border: 1px solid $primary-color;
			}

			&.selected,
			&.selected:hover {
				background: $primary-color;
				font-weight: 900;
			}
		}
	}
}

// slide presentation
.hooper.presentation {
	width: 100%;
	height: 98vh;

	&:focus {
		outline: none;
	}

	.hooper-slide,
	.hooper-slide:focus,
	.hooper-slide:active {
		outline: none;
	}
	
	.hooper-pagination {
		padding: .8rem;
		left: 0;
		right: initial;
		transform: none;
		z-index: 20;

		.hooper-indicator {
			margin: 0 7px;
			width: 1.7em;
			height: 1.7em;
			border-radius: 50%;
			padding: 0;
			background-color: $gray-color-dark;

			&.is-active {
				background-color: $primary-color;
			}

			&:focus {
				outline: none;
			}
		}
	}
}
</style>
