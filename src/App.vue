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
						<li v-if="!auth.user && ready.users" class="menu-item pb-2">
							<div class="form-group">
								<input v-if="!noUsers" type="text" v-model="auth.email" class="form-input mb-1" :placeholder="$t('field.email')" />
								<input v-if="!noUsers" type="password" v-model="auth.password" class="form-input mb-2" :placeholder="$t('field.password')"  @click="signIn" @keydown.enter="signIn" />
								<button v-if="!noUsers" class="btn btn-primary d-block stretch mb-2">
									{{ $t('button.signIn') }} <ion-icon name="log-in-outline" class="icon-right"></ion-icon>
								</button>
								<div v-if="noUsers" class="text-normalcase text-center mb-2">{{ $t('text.noUsersAvailable') }}</div>
								<button v-if="!noUsers" class="btn d-block stretch" :class="{ 'btn-secondary': !noUsers, 'btn-primary': noUsers}" @click="modal.signup = true">
									{{ $t('button.signUp') }} <ion-icon name="person-add-outline" class="icon-right"></ion-icon>
								</button>
							</div>
						</li>
						<li v-if="auth.user && ready.users" class="menu-item pt-2 pb-2">
							<router-link to="/profile" class="py-2" @click.native="open = false">
								<div class="tile tile-centered">
									<div class="tile-icon mr-2 ml-1">
										<img v-if="auth.userObject.photoURL" class="avatar" :src="auth.userObject.photoURL" alt="Avatar">
										<figure v-else-if="userName" class="avatar" :data-initial="userName.substring(0,2).toUpperCase()" alt="Avatar"></figure>
									</div>
									<div class="tile-content">
										{{ userName }}
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
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { collection, onSnapshot } from "firebase/firestore";

export default {
	name: 'app',
	components: {
		SongSet,
		SetlistSet,
		SignUp
	},
	data () {
		return {
			// db tables
			songs: {},
			setlists: {},
			tags: {},
			users: {},
			registrations: {},
			// loading indicators
			ready: {
				songs: false,
				setlists: false,
				tags: false,
				users: false,
				registrations: false,
			},
			// modals
			open: false,
			modal: {
				addsong: false,
				addsetlist: false,
				signup: false,
			},
			// objects to save
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
			// authentification
			auth: {
				email: '',
				password: '',
				user: firebase.auth().currentUser ? firebase.auth().currentUser.uid : '',
				userObject: firebase.auth().currentUser ? firebase.auth().currentUser : {},
			}
		}
	},
	created () {
		// add listeners for changes on each db table
		["users", "registrations", "songs", "setlists", "tags"].forEach(table => {
			onSnapshot(collection(this.$db, table), (snapshot) => {
				snapshot.docChanges().forEach((change) => {
					if (change.type === "added" || change.type === "modified") {
						this.$set(this[table], change.doc.id, change.doc.data())
					}
					if (change.type === "removed") {
						this.$delete(this[table], change.doc.id);
					}
				});
				this.ready[table] = true;
			});
		});
	},
	mounted () {
		// check initially if authenticated user exists
		firebase.auth().onAuthStateChanged(function(user) {
			this.auth.user = user ? user.uid : ''
			this.auth.userObject = user ? user : ''
		}.bind(this))
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
		},
		// check if db is empty = no users or registrations yet
		noUsers() {
			return Object.keys(this.users).length === 0 && Object.keys(this.registrations).length === 0
		},
		// get user name either from user object or from users db table
		userName () {
			return this.auth.userObject.displayName
				? this.auth.userObject.displayName
				: this.users[this.auth.user]?.name ? this.users[this.auth.user].name : '' 
		},
	},
}
</script>

<style lang="scss">
// apply all global styles
@import "@/assets/global";

</style>
