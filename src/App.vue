<template>
	<div id="app">
		<div class="off-canvas off-canvas-sidebar-show">
			<!-- off-screen toggle button -->
			<a class="off-canvas-toggle btn btn-primary btn-action" @click="open = true">
				<ion-icon name="menu" size="large"></ion-icon>
			</a>

			<!-- off-screen sidebar -->
			<div id="sidebar-id" class="off-canvas-sidebar" :class="{ active: open }">
				<div class="sidebar-wrapper">
					<div class="brand text-center mt-2">
						<router-link to="/" class="logo">
							<img src="./assets/logo.svg" alt="SongDrive Song Management Tool" />
							<h1>{{ $t('app.name') }}</h1>
							<div class="text-gray text-small text-right mr-5 pr-1">v{{ appVersion }} BETA</div>
						</router-link>
					</div>
					<ul class="menu text-uppercase">
						<li class="divider text-center" :data-content="$t('divider.start')"></li>
						<li class="menu-item">
							<router-link to="/" class="py-2" @click.native="open = false"><ion-icon name="apps-sharp" class="mr-2"></ion-icon> {{ $t('page.dashboard') }}</router-link>
						</li>
						<li class="menu-item">
							<router-link to="/songs" class="py-2" @click.native="open = false"><ion-icon name="musical-notes-sharp" class="mr-2"></ion-icon> {{ $t('page.songs') }}</router-link>
							<div class="menu-badge">
								<label v-if="ready.songs" class="label py-1">{{ Object.keys(songs).length }}</label>
								<label v-else class="label py-1"><div class="loading d-inline-block px-2"></div></label>
								<button v-if="auth.user && users[auth.user] && ready.users && userRoles()[users[auth.user].role] > 2" class="btn btn-secondary btn-action btn-sm mx-2 tooltip tooltip-left" :data-tooltip="$t('tooltip.songAdd')" @click="modal.addsong = true"><ion-icon name="add-sharp"></ion-icon></button>
							</div>
						</li>
						<li class="menu-item">
							<router-link to="/setlists" class="py-2" @click.native="open = false"><ion-icon name="list" class="mr-2"></ion-icon> {{ $t('page.setlists') }}</router-link>
							<div class="menu-badge">
								<label v-if="ready.setlists" class="label py-1">{{ Object.keys(setlists).length }}</label>
								<label v-else class="label py-1"><div class="loading d-inline-block px-2"></div></label>
								<button v-if="auth.user && users[auth.user] && ready.users && userRoles()[users[auth.user].role] > 1" class="btn btn-secondary btn-action btn-sm mx-2 tooltip tooltip-left" :data-tooltip="$t('tooltip.setlistAdd')" @click="modal.addsetlist = true"><ion-icon name="add-sharp"></ion-icon></button>
							</div>
						</li>
						<li class="divider text-center" :data-content="$t('divider.account')"></li>
						<li v-if="!auth.user" class="menu-item pb-2">
							<div class="form-group">
								<input type="text" v-model="auth.email" class="form-input mb-1" :placeholder="$t('field.email')" />
								<input type="password" v-model="auth.password" class="form-input mb-2" :placeholder="$t('field.password')"  @click="signIn" @keydown.enter="signIn" />
								<button class="btn btn-primary d-block stretch mb-2">
									{{ $t('button.signIn') }} <ion-icon name="log-in-outline" class="icon-right"></ion-icon>
								</button>
								<button class="btn btn-secondary d-block stretch" @click="modal.signup = true">
									{{ $t('button.signUp') }} <ion-icon name="person-add-outline" class="icon-right"></ion-icon>
								</button>
							</div>
						</li>
						<li v-if="auth.user && ready.users" class="menu-item pt-2 pb-2">
							<router-link to="/profile" class="py-2" @click.native="open = false">
								<div class="tile tile-centered">
									<div class="tile-icon mr-2 ml-1">
										<img v-if="auth.userObject.photoURL" class="avatar" :src="auth.userObject.photoURL" alt="Avatar">
										<figure v-else-if="auth.userObject.displayName" class="avatar" :data-initial="auth.userObject.displayName.substring(0,2).toUpperCase()" alt="Avatar"></figure>
									</div>
									<div class="tile-content">
										{{ auth.userObject.displayName }}
										<div class="text-gray text-small">{{ users[auth.user] ? $t('role.' + users[auth.user].role) : $t('role.unconfirmed') }}</div>
									</div>
								</div>
							</router-link>
						</li>
						<li v-if="auth.user && users[auth.user]" class="menu-item">
							<router-link to="/settings" class="py-2" @click.native="open = false"><ion-icon name="options-outline" class="mr-2"></ion-icon> {{ $t('page.settings') }}</router-link>
						</li>
						<li v-if="auth.user" class="menu-item">
							<button class="btn btn-secondary d-block stretch mt-3" @click="signOut">
								{{ $t('button.signOut') }} <ion-icon name="log-out-outline" class="icon-right"></ion-icon>
							</button>
						</li>
					</ul>
					<ul class="menu text-uppercase">
						<li class="divider text-center" :data-content="$t('divider.info')"></li>
						<li class="menu-item">
							<router-link to="/shortcuts" class="py-2" @click.native="open = false">
								<ion-icon name="bulb-outline" class="mr-2"></ion-icon> {{ $t('page.shortcuts') }}
							</router-link>
						</li>
						<li class="menu-item">
							<a href="https://devmount.github.io/SongDrive" class="py-2" target="_blank">
								<ion-icon name="book-outline" class="mr-2"></ion-icon>
								{{ $t('page.docu') }}
								<ion-icon name="open-outline" class="icon-right"></ion-icon>
							</a>
						</li>
						<li class="menu-item">
							<a href="https://github.com/devmount/SongDrive" class="py-2" target="_blank">
								<ion-icon name="logo-github" class="mr-2"></ion-icon>
								{{ $t('page.github') }}
								<ion-icon name="open-outline" class="icon-right"></ion-icon>
							</a>
						</li>
					</ul>
					<footer>
						<div class="text-center text-small text-gray">
							<span v-html="$t('app.created')"></span>
							<a href="https://devmount.de" target="_blank">
								<svg class="logo-devmount ml-1" x="0px" y="0px" viewBox="0 0 234 234">
									<path class="st0" d="M6.9,140.6L87.1,40.2l78.2,77.6"/>
									<path class="st0" d="M40.4,193.8l62.1-77.8l35.9,35.4l48.8-60.6l39.8,39.5"/>
								</svg>
							</a>
						</div>
						<div class="text-center text-small text-gray">
							2016–{{ (new Date()).getFullYear() }}
							<svg class="legal" viewBox="0 0 14 16"><path fill-rule="evenodd" d="M7 4c-.83 0-1.5-.67-1.5-1.5S6.17 1 7 1s1.5.67 1.5 1.5S7.83 4 7 4zm7 6c0 1.11-.89 2-2 2h-1c-1.11 0-2-.89-2-2l2-4h-1c-.55 0-1-.45-1-1H8v8c.42 0 1 .45 1 1h1c.42 0 1 .45 1 1H3c0-.55.58-1 1-1h1c0-.55.58-1 1-1h.03L6 5H5c0 .55-.45 1-1 1H3l2 4c0 1.11-.89 2-2 2H2c-1.11 0-2-.89-2-2l2-4H1V5h3c0-.55.45-1 1-1h4c.55 0 1 .45 1 1h3v1h-1l2 4zM2.5 7L1 10h3L2.5 7zM13 10l-1.5-3-1.5 3h3z"></path></svg>
							<a href="https://github.com/devmount/SongDrive/blob/master/LICENSE" target="_blank"> {{ $t('app.license') }}</a>
						</div>
					</footer>
				</div>
			</div>
			<a class="off-canvas-overlay" @click="open = false"></a>

			<!-- off-screen content -->
			<div class="off-canvas-content">
				<router-view
					:key="$route.fullPath"
					:user="auth.user"
					:userObject="auth.userObject"
					:role="auth.user && users[auth.user] && ready.users ? userRoles()[users[auth.user].role] : ''"
					:roleName="auth.user && users[auth.user] && ready.users ? users[auth.user].role : ''"
					:songs="songs"
					:setlists="setlists"
					:tags="tags"
					:users="users"
					:registrations="registrations"
					:ready="ready"
				></router-view>
			</div>

			<!-- modals -->
			<SongSet
				v-if="modal.addsong"
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
				:active="modal.addsetlist"
				:existing="false"
				:initialSetlist="newSetlist"
				setlistKey=""
				:user="auth.user"
				:songs="songs"
				:setlists="setlists"
				:tags="tags"
				:ready="ready"
				@closed="modal.addsetlist = false"
				@reset="resetSetlist"
			/>
			<SignUp
				v-if="modal.signup"
				:active="modal.signup"
				@closed="modal.signup = false"
				@submitted="signUp"
			/>
		</div>

		<!-- notifications -->
		<notifications position="bottom right" :duration="5000" :width="400">
			<template slot="body" slot-scope="props">
				<div :class="'toast toast-' + props.item.type">
					<ion-icon name="close" class="float-right c-hand icon-1-5x" @click="props.close"></ion-icon>
					<h5>{{props.item.title}}</h5>
					<p v-html="props.item.text"></p>
				</div>
			</template>
		</notifications>
	</div>
</template>

<script>
// get components
import SongSet from '@/modals/SongSet'
import SetlistSet from '@/modals/SetlistSet'
import SignUp from '@/modals/SignUp'
// get database object authorized in config.js
var firebase = require("firebase/app")
require("firebase/auth")
require('firebase/firestore')

export default {
	name: 'app',
	components: {
		SongSet,
		SetlistSet,
		SignUp
	},
	firestore () {
		return {
			songs: {
				ref: this.$db.collection('songs'),
				objects: true,
				resolve: () => { this.ready.songs = true },
				reject: () => { this.ready.songs = true }
			},
			setlists: {
				ref: this.$db.collection('setlists').orderBy('date', 'desc'),
				objects: true,
				resolve: () => { this.ready.setlists = true },
				reject: () => { this.ready.setlists = true }
			},
			tags: {
				ref: this.$db.collection('tags'),
				objects: true,
				resolve: () => { this.ready.tags = true },
				reject: () => { this.ready.tags = true }
			},
			users: {
				ref: this.$db.collection('users'),
				objects: true,
				resolve: () => { this.ready.users = true },
				reject: () => { this.ready.users = true }
			},
			registrations: {
				ref: this.$db.collection('registrations'),
				objects: true,
				resolve: () => { this.ready.registrations = true },
				reject: () => { this.ready.registrations = true }
			},
		}
	},
	data () {
		return {
			ready: {
				songs: false,
				setlists: false,
				tags: false,
				users: false,
				registrations: false,
			},
			open: false,
			modal: {
				addsong: false,
				addsetlist: false,
				signup: false,
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
				year: '',
				youtube: '',
			},
			newSetlist: {
				title: '',
				date: '',
				songs: [],
			},
			auth: {
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
				self.auth.email = ''
				self.auth.password = ''
				self.$notify({ title: self.$t('toast.signedIn'), text: self.$t('toast.signedInText', { name: self.auth.userObject.displayName}), type: 'primary' })
			}).catch((error) => self.$notify({ title: error.code, text: error.message, type: 'error' }))
		},
		signOut () {
			var self = this
			firebase.auth().signOut().then(() => {
				// sign-out successful
				self.auth.user = ''
				self.$notify({ title: self.$t('toast.signedOut'), text: self.$t('toast.signedOutText'), type: 'primary' })
			}).catch((error) => self.$notify({ title: error.code, text: error.message, type: 'error' }))
		},
		signUp (u) {
			var self = this
			firebase.auth().createUserWithEmailAndPassword(u.email, u.password).then(() => {
				// sign-up successful
				self.auth.user = firebase.auth().currentUser.uid
				// create registration for admin approval
				self.$db.collection('registrations').doc(self.auth.user).set({ email: u.email, name: u.name })
					.then(() => {
						self.auth.userObject = firebase.auth().currentUser
						self.auth.userObject.updateProfile({ displayName: u.name })
						self.$notify({ title: self.$t('toast.signedUp'), text: self.$t('toast.signedUpText', { name: u.name }), type: 'primary' })
					}).catch((error) => self.$notify({ title: error.code, text: error.message, type: 'error' }))
				// send verification email
				firebase.auth().currentUser.sendEmailVerification()
					.then(() => {
						// Verification email sent
						self.$notify({ title:  self.$t('toast.verficationSent'), text:  self.$t('toast.verficationSentText'), type: 'primary' })
					}).catch((error) => self.$notify({ title: error.code, text: error.message, type: 'error' }))
			}).catch((error) => self.$notify({ title: error.code, text: error.message, type: 'error' }))
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

$primary-color: #88b544;
$primary-color-dark: darken($primary-color, 3%);
$primary-color-light: lighten($primary-color, 3%);
$secondary-color: lighten($primary-color, 37.5%);
$secondary-color-dark: darken($secondary-color, 3%);
$secondary-color-light: lighten($secondary-color, 3%);
// Gray colors
$dark-color: #010101;
$light-color: #fff;
$black-color: #000;
$gray-color: #5e6769;
$gray-color-dark: #4a5052;
$gray-color-light: lighten($gray-color, 40%);
$border-color: #222627;
$border-color-dark: darken($border-color, 10%);
$border-color-light: lighten($border-color, 8%);
$bg-color: #131516;
$bg-color-dark: #222627;
$bg-color-medium: #181a1b;
$bg-color-light: #1b1e1f;
// Control colors
$success-color: #88b544;
$warning-color: #ffb700;
$error-color: #ed2f47;
// Other colors
$code-color: #ed2f47;
$highlight-color: #ffe9b3;
$body-bg: $bg-color-light;
$body-font-color: #c1ced1;
$link-color: $primary-color;
$link-color-dark: darken($link-color, 10%);
$link-color-light: lighten($link-color, 10%);

$mono-font-family: "Fira Mono", monospace;
$code-font-family: "Fira Code", monospace;
$size-2x: 1440px;
$border-radius: 0;

$html-font-size: 20px;
$unit-2: .4rem;
$layout-spacing: $unit-2;
$grid-spacing: ($layout-spacing / ($layout-spacing * 0 + 1)) * $html-font-size;

// import spectre
@import "~spectre.css/src/spectre";
@import "~spectre.css/src/spectre-exp";

// icons
.icon {
	font-size: 1em;
}
.icon-1-5x {
	font-size: 24px;
}
.icon-2x {
	font-size: 32px;
}
.icon-4x {
	font-size: 64px;
}
.icon-sm {
	font-size: 16px;
}
.icon-right {
	float: right;
	margin-top: 3px;
	margin-right: 3px;
}
.icon-left {
	float: left;
	margin-top: 3px;
	margin-left: 3px;
}
ion-icon {
	font-size: 19px;
	vertical-align: middle;
	margin-bottom: 2px;
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
	background-color: $bg-color-dark;
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
	font-size: 1.8em;
	letter-spacing: 3px;
	margin-bottom: .2em;

	&.view-title {
		font-size: 2.5em;
	}

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
.featured {
	.featured-number {
		font-size: 4em;
		line-height: 1.5em;
		font-weight: 300;

		@media (max-width: $size-lg) {
			font-size: 3em;
			line-height: 1.25em;
		}
	}
	.featured-description {
		@media (max-width: $size-lg) {
			font-size: .75rem;
		}
	}
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
.vue-notification-group {
	padding-right: .8em;
}
.toast {
	margin-bottom: .8em;
	padding: .6rem;

	h5 {
		text-transform: none;
		letter-spacing: normal;
		font-weight: 500;
	}
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
a:focus,
a:active,
.btn:focus {
  box-shadow: 0 0 0 .2rem rgba($bg-color-dark, .2);
}
.form-checkbox,
.form-radio,
.form-switch {
	margin: 0.2rem;
}
.btn.btn-primary:focus,
.btn.btn-secondary:active:focus,
.slider:focus,
.form-input:focus,
.form-checkbox input:focus + .form-icon,
.form-radio input:focus + .form-icon,
.form-switch input:focus + .form-icon,
.form-select:focus,
.form-select:not([multiple]):not([size]):focus,
.form-autocomplete .form-autocomplete-input.is-focused {
	border-color: $primary-color;
  box-shadow: 0 0 0 .2rem rgba($primary-color, .2);
}
.btn.btn-secondary:focus {
	border-color: $border-color;
  box-shadow: 0 0 0 .2rem rgba($border-color, .5);
}
.btn.btn-error:focus,
.btn.btn-error.btn-secondary:active:focus {
	border-color: $error-color;
  box-shadow: 0 0 0 .2rem rgba($error-color, .2);
}
.form-input,
.form-checkbox .form-icon,
.form-radio .form-icon,
.form-select,
.form-select:not([multiple]):not([size]) {
	background-color: $bg-color-medium;
	border-color: $black-color;
}
.form-switch .form-icon {
	background-color: $bg-color-dark;
	border-color: $black-color;
	&:before {
		background-color: $bg-color;
	}
}
.form-input,
.form-select,
.form-select:not([multiple]):not([size]) {
	width: 100%;

  .has-error &,
  &.is-error {
    background-color: darken($error-color, 40%);
    border-color: $error-color;
    &:focus {
      box-shadow: 0 0 0 .2rem rgba($error-color, .2);
    }
  }
}
.input-group {
	.input-group-addon {
		text-align: center;
		min-width: 35px;
		padding: 0.2rem 0;

		&.addon-lg {
			font-size: 0.9rem;
			padding: 0.3rem 0;
		}
	}

	.form-input,
	.form-select {
		width: auto;
	}
}

// filter select field
.filter {
	&:required:invalid {
		color: $gray-color;
	}
	option[value=""][disabled] {
		display: none;
	}
	option {
		color: $body-font-color;
	}
}

// label
a {
	.label {
		&:hover {
			background: darken($primary-color-dark, 2%);
		}
	}
}

// table
.table {
	td, th {
		border: none;
	}
	&.table-striped tbody tr:nth-of-type(odd) {
		background: $bg-color-medium;
		&:hover {
			background: $bg-color-dark;
		}
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

// panel
.panel {
	border: 2px solid $border-color;
	border-radius: 2px;
	box-shadow: 0 5px 20px -10px $black-color;
	height: 100%;

	.panel-link {

		.btn {
			text-transform: uppercase;
			color: $gray-color;

			&:hover {
			background: $border-color;
				color: $body-font-color;
			}
		}
	}
}

// tooltip
.tooltip::after {
	line-height: 1.1rem;
}

// empty
.empty {
	background: none;
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
	&.active .modal-overlay {
		background: rgba($dark-color, .75);
	}
	&.modal-lg {
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

	&.modal-presentation {
		&.modal-lg.modal-full {
			.verse::before {
				background: $black-color;
			}
		}
		.modal-container .modal-header {
			padding-bottom: 0;
		}
		.modal-container .modal-body {
			overflow: visible;
		}
	}

	&.modal-setlist-presentation {
		&.modal-lg.modal-full {
			.verse::before {
				background: $black-color;
			}
		}

		.modal-container {
			.modal-header,
			.modal-body {
				padding-bottom: 0;
				padding-left: 0;
				padding-right: 0;
				overflow: visible;
			}

			.modal-footer {
				width: 100%;

				.navigation-prev {
					position: absolute;
					bottom: .8rem;
					right: 50%;
				}
				.navigation-next {
					position: absolute;
					bottom: .8rem;
					left: 50%;
				}
				.chords {
					font-weight: bold;
					color: $primary-color;
				}

				.clock {
					font-family: $code-font-family;
					font-size: 1.5em;
					vertical-align: middle;
				}

				&.hidden {
					opacity: 0;
					transition: opacity .5s ease;

					&:hover {
						opacity: 1;
					}
				}
			}
		}

		.hide {
			background: $black-color;
			position: absolute;
			top: 0;
			width: 100vw;
			height: calc(100vh - 90px);
			z-index: 100;
		}
	}

	.fade-enter-active,
	.fade-leave-active {
		transition: opacity .5s;
	}
	.fade-enter,
	.fade-leave-to {
		opacity: 0;
	}
}
@media (min-width: $size-sm) {
	.modal-lg {
		.max-column {
			height: 60vh;
			overflow-y: scroll;
		}
	}
}
@media (max-width: $size-sm) {
	.modal-lg {
		.max-column {
			height: 30vh;
			overflow-y: scroll;
		}
	}
}
@media (max-width: $size-md) {
	.modal-lg {
		padding: 0;
	}
}
// off-canvas
.off-canvas {
	z-index: 0;
	.off-canvas-toggle {
		z-index: 10;
		width: 2.2rem;
		padding: 1px 0;
	}

	.off-canvas-sidebar {
		width: 12rem;
		overflow: visible;

		.sidebar-wrapper {
			position: fixed;
			width: inherit;
			min-height: 100vh;
			padding-bottom: 5rem;

			footer {
				position: absolute;
				bottom: 1rem;
				width: 100%;

				a {
					text-decoration: none;
					color: inherit;

					&:hover {
						color: $primary-color;
					}
				}

				.logo-devmount {
					width: 25px;
					vertical-align: middle;
					padding-bottom: 5px;
					
					path {
						fill: none;
						stroke: currentColor;
						stroke-width: 9;
						stroke-linecap: round;
					}
				}
				.legal {
					fill: currentColor;
					width: 18px;
					vertical-align: middle;
					padding: 0 2px 5px 2px;
				}
			}
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
		width: 8.5rem;
		flex: 0 0 auto;
		position: relative;
		transform: none;

		.divider {
			margin-top: 2em;
		}
		.divider[data-content]::after {
			background: $bg-color-medium;
			text-transform: uppercase;
			letter-spacing: 2px;
		}

		.sidebar-wrapper {
			position: fixed;
			width: 8rem;
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
			text-transform: uppercase;
			letter-spacing: 2px;
		}
	}

	.menu-item {
		a {
			&:hover {
				background: $bg-color-dark;
			}
			&.text-error:hover {
				background: darken($error-color, 46%);
			}
			&.router-link-exact-active {
				background: $bg-color-dark;
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

// pagination
.pagination {
	margin: 0;
	padding: 0;
	justify-content: space-between;
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
				background: $bg-color-dark;
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

// song content
.song-content {
	& > .column {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}
	pre {
		position: relative;
		overflow: visible;
		margin-top: 30px;
		margin-bottom: 0;

		.present > & {
			font-size: 25px;
		}

		&>span {
			display: block;

			&.chords {
				color: $primary-color;
			}
		}
		// prevent short song parts being displayed next to each other
		&::after {
			content: '';
			height: 1px;
			width: 40vw;
			display: block;
		}
	}
	.present > pre {
		display: inline-block;

		&:first-child {
			margin-top: 20px;
		}
	}
	.verse {
		// border-left: 2px solid $bg-color-dark;
		position: relative;
		padding-left: 1em;
		margin-left: .6em;
	}
	.verse::before {
		display: inline-block;
		position: absolute;
		background: $bg-color-light;
		left: -.45em;
		top: .31em;
		width: .8em;
		line-height: 1.3em;
		height: 1.15em;
		text-align: center;
		font-size: 2em;
		font-family: "Fira Sans";
		font-weight: 300;
	}
	.verse.part1::before {
		content: '1';
	}
	.verse.part2::before {
		content: '2';
	}
	.verse.part3::before {
		content: '3';
	}
	.verse.part4::before {
		content: '4';
	}
	.verse.part5::before {
		content: '5';
	}
	.verse.part6::before {
		content: '6';
	}
	.verse.part7::before {
		content: '7';
	}
	.verse.part8::before {
		content: '8';
	}
	.verse.part9::before {
		content: '9';
	}

	.text > pre {
		font-family: "Fira Sans";
		font-size: 1.5em;
		margin-bottom: .2em;

		&.verse::before {
			top: -.1em;
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

// light mode
.light {
	&.modal {
		&.modal-presentation,
		&.modal-setlist-presentation {
			&.modal-lg.modal-full {
				color: $dark-color;
				.verse::before {
					background: $light-color;
				}
				.modal-container {
					background: $light-color;
					.modal-header {
						color: $black-color;
					}
				}
			}
			.hooper.presentation {
				.hooper-pagination {
					.hooper-indicator:not(.is-active) {
						background-color: $gray-color-light;
					}
				}
			}
			.hide {
				background: $light-color;
			}
		}
		.song-content .verse {
			border-left-color: $gray-color-light;
		}
	}
	.text-gray {
		color: $gray-color-light;
	}
	.btn {
		&.btn-secondary {
			background: $gray-color-light;
			border-color: darken($gray-color-light, 10%);
			color: $bg-color-dark;
			&:focus:not(.btn-error) {
				background: $gray-color-light;
				border-color: darken($gray-color-light, 10%);
				color: $bg-color-dark;
			}
		}
		&.btn-link {
			&.btn-gray {
				color: $gray-color;
			}
		}
	}
}
</style>
