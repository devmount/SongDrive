<template>
	<div id="app">
		<!-- logged in, confirmed and verified -->
		<div
			v-if="auth.ready && auth.user && auth.userObject.emailVerified && ready.users && users[auth.user] && ready.permissions && permissions[auth.user] && !loading"
			class="off-canvas off-canvas-sidebar-show"
		>
			<!-- off-screen toggle button -->
			<a class="off-canvas-toggle btn btn-primary btn-action" @click="open = true">
				<ion-icon :icon="menu" size="large"></ion-icon>
			</a>

			<!-- off-screen sidebar -->
			<div id="sidebar-id" class="off-canvas-sidebar" :class="{ active: open }">
				<div class="sidebar-wrapper">
					<div class="brand text-center mt-2">
						<router-link to="/">
							<Logo />
						</router-link>
					</div>
					<ul class="menu text-uppercase">
						<li class="divider text-center" :data-content="$t('divider.start')"></li>
						<li class="menu-item">
							<router-link to="/" class="py-2" @click.native="open = false">
								<ion-icon :icon="appsSharp" class="mr-2"></ion-icon> {{ $t('page.dashboard') }}
							</router-link>
						</li>
						<li class="menu-item">
							<router-link to="/songs" class="py-2" @click.native="open = false">
								<ion-icon :icon="musicalNotesSharp" class="mr-2"></ion-icon> {{ $t('page.songs') }}
							</router-link>
							<div class="menu-badge">
								<label v-if="ready.songs" class="label py-1">{{ Object.keys(songs).length }}</label>
								<label v-else class="label py-1"><div class="loading d-inline-block px-2"></div></label>
								<button
									v-if="userRoles()[permissions[auth.user].role] > 2"
									class="btn btn-secondary btn-action btn-sm mx-2 tooltip tooltip-left"
									:data-tooltip="$t('tooltip.songAdd')"
									@click="modal.addsong = true"
								>
									<ion-icon :icon="addSharp"></ion-icon>
								</button>
							</div>
						</li>
						<li class="menu-item">
							<router-link to="/setlists" class="py-2" @click.native="open = false">
								<ion-icon :icon="list" class="mr-2"></ion-icon> {{ $t('page.setlists') }}
							</router-link>
							<div class="menu-badge">
								<label v-if="ready.setlists" class="label py-1">{{ setlistCount }}</label>
								<label v-else class="label py-1"><div class="loading d-inline-block px-2"></div></label>
								<button
									v-if="userRoles()[permissions[auth.user].role] > 1"
									class="btn btn-secondary btn-action btn-sm mx-2 tooltip tooltip-left"
									:data-tooltip="$t('tooltip.setlistAdd')"
									@click="modal.addsetlist = true"
								>
									<ion-icon :icon="addSharp"></ion-icon>
								</button>
							</div>
						</li>
						<li class="divider text-center" :data-content="$t('divider.account')"></li>
						<li class="menu-item pt-2 pb-2">
							<router-link to="/profile" class="py-2" @click.native="open = false">
								<div class="tile tile-centered">
									<div class="tile-icon mr-2 ml-1">
										<img v-if="users[auth.user].photo" class="avatar" :src="users[auth.user].photo" alt="Avatar">
										<figure
											v-else-if="userName"
											class="avatar"
											:data-initial="initials(userName)"
											alt="Avatar"
										></figure>
										<span v-else class="avatar flex-center">
											<ion-icon :icon="person"></ion-icon>
										</span>
									</div>
									<div class="tile-content">
										{{ userName }}
										<div class="text-gray text-small">
											{{ $t('role.' + permissions[auth.user].role) }}
										</div>
									</div>
								</div>
							</router-link>
						</li>
						<li class="menu-item">
							<router-link to="/settings" class="py-2" :class="{ badge: registrationsExist && userRoles()[permissions[auth.user].role] > 3 }" @click.native="open = false">
								<ion-icon :icon="optionsOutline" class="mr-2"></ion-icon> {{ $t('page.settings') }}
							</router-link>
						</li>
						<li class="menu-item">
							<button class="btn btn-secondary d-block stretch mt-3" @click="signOut">
								{{ $t('button.signOut') }} <ion-icon :icon="logOutOutline" class="icon-right"></ion-icon>
							</button>
						</li>
					</ul>
					<ul class="menu text-uppercase">
						<li class="divider text-center" :data-content="$t('divider.info')"></li>
						<li class="menu-item">
							<router-link to="/shortcuts" class="py-2" @click.native="open = false">
								<ion-icon :icon="bulbOutline" class="mr-2"></ion-icon> {{ $t('page.shortcuts') }}
							</router-link>
						</li>
						<li class="menu-item">
							<router-link to="/documentation" class="py-2" @click.native="open = false">
								<ion-icon :icon="bookOutline" class="mr-2"></ion-icon> {{ $t('page.docu') }}
							</router-link>
						</li>
						<li class="menu-item">
							<a href="https://github.com/devmount/SongDrive" class="py-2" target="_blank">
								<ion-icon :icon="logoGithub" class="mr-2"></ion-icon>
								{{ $t('page.github') }}
								<ion-icon :icon="openOutline" class="icon-right"></ion-icon>
							</a>
						</li>
					</ul>
					<footer>
						<div class="text-center text-small text-gray">
							<span>
								{{ $t('app.created.0') }}
								<ion-icon :icon='heartOutline'></ion-icon>
								{{ $t('app.created.1') }}
							</span>
							<a href="https://devmount.de" target="_blank">
								<svg class="logo-devmount ml-1" x="0px" y="0px" viewBox="0 0 234 234">
									<path class="st0" d="M6.9,140.6L87.1,40.2l78.2,77.6"/>
									<path class="st0" d="M40.4,193.8l62.1-77.8l35.9,35.4l48.8-60.6l39.8,39.5"/>
								</svg>
							</a>
						</div>
						<div class="text-center text-small text-gray">
							2016–{{ (new Date()).getFullYear() }}
							<svg class="legal" viewBox="0 0 14 16">
								<path fill-rule="evenodd" d="M7 4c-.83 0-1.5-.67-1.5-1.5S6.17 1 7 1s1.5.67 1.5 1.5S7.83 4 7 4zm7 6c0 1.11-.89 2-2 2h-1c-1.11 0-2-.89-2-2l2-4h-1c-.55 0-1-.45-1-1H8v8c.42 0 1 .45 1 1h1c.42 0 1 .45 1 1H3c0-.55.58-1 1-1h1c0-.55.58-1 1-1h.03L6 5H5c0 .55-.45 1-1 1H3l2 4c0 1.11-.89 2-2 2H2c-1.11 0-2-.89-2-2l2-4H1V5h3c0-.55.45-1 1-1h4c.55 0 1 .45 1 1h3v1h-1l2 4zM2.5 7L1 10h3L2.5 7zM13 10l-1.5-3-1.5 3h3z"></path>
							</svg>
							<a href="https://github.com/devmount/SongDrive/blob/main/LICENSE" target="_blank">
								{{ $t('app.license') }}
							</a>
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
					:role="userRoles()[permissions[auth.user].role]"
					:roleName="permissions[auth.user].role"
					:ready="ready"
					:config="config"
					:languages="languages"
					:permissions="permissions"
					:registrations="registrations"
					:setlists="setlists"
					:songs="songs"
					:tags="tags"
					:users="users"
					@started="loading=true"
				></router-view>
			</div>
		</div>
		<!-- logged in but not confimed yet -->
		<div v-if="auth.ready && auth.user && auth.confirmed === false && !loading">
			<UserUnconfirmed :config="config" :ready="ready" @signOut="signOut" />
		</div>
		<!-- logged in, confimed but not verified yet -->
		<div v-if="auth.ready && auth.user && auth.confirmed && !auth.userObject.emailVerified && !loading">
			<UserUnverified :config="config" :ready="ready" @signOut="signOut" @resendEmailVerification="resendEmailVerification()" />
		</div>
		<!-- login screen -->
		<div v-if="auth.ready && !auth.user && !loading">
			<Login
				@signIn="signIn"
				@signUp="modal.signup = true"
				@resetPassword="modal.passwordreset = true"
			/>
		</div>
		<!-- loading screen -->
		<div v-if="!auth.ready || !auth.user || auth.confirmed === null || loading" class="full-viewport d-flex justify-center align-center">
			<div class="loading loading-xl"></div>
		</div>

		<!-- modals -->
		<SongSet
			v-if="modal.addsong"
			:active="modal.addsong"
			:existing="false"
			:initialSong="newSong"
			songKey=""
			:songs="songs"
			:setlists="setlists"
			:tags="tags"
			:languages="languages"
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
			:languages="languages"
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
		<PasswordReset
			v-if="modal.passwordreset"
			:active="modal.passwordreset"
			@closed="modal.passwordreset = false"
			@submitted="sendPasswordReset"
		/>

		<!-- notifications -->
		<notifications position="bottom right" :duration="5000" :width="400">
			<template #body="props">
				<div :class="'toast toast-' + props.item.type">
					<ion-icon :icon="close" class="float-right c-hand icon-1-5x" @click="props.close"></ion-icon>
					<h5>{{ props.item.title }}</h5>
					<p v-html="props.item.text"></p>
				</div>
			</template>
		</notifications>
	</div>
</template>

<script setup>
// get icons
import {
	appsSharp,
	addSharp,
	bookOutline,
	bulbOutline,
	close,
	heartOutline,
	list,
	logoGithub,
	logOutOutline,
	menu,
	musicalNotesSharp,
	openOutline,
	optionsOutline,
	person
} from 'ionicons/icons';
</script>

<script>
import { defineComponent } from 'vue';

// get components
import Logo from '@/partials/Logo';
import Login from '@/partials/Login';
import SignUp from '@/modals/SignUp';
import PasswordReset from '@/modals/PasswordReset';
import UserUnconfirmed from '@/partials/UserUnconfirmed';
import UserUnverified from '@/partials/UserUnverified';
import SongSet from '@/modals/SongSet';
import SetlistSet from '@/modals/SetlistSet';
// get database object authorized in config.js
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { collection, onSnapshot } from "firebase/firestore";

export default defineComponent({
	name: 'app',
	components: {
		Logo,
		Login,
		SignUp,
		PasswordReset,
		UserUnconfirmed,
		UserUnverified,
		SongSet,
		SetlistSet,
	},
	data () {
		return {
			// db tables
			config: {},
			languages: {},
			permissions: {},
			registrations: {},
			setlists: {},
			songs: {},
			tags: {},
			users: {},
			// db table ready state
			ready: {
				config: false,
				languages: false,
				permissions: false,
				registrations: false,
				setlists: false,
				songs: false,
				tags: false,
				users: false,
			},
			// db table listeners
			listener: {
				config: null,
				languages: null,
				permissions: null,
				registrations: null,
				setlists: null,
				songs: null,
				tags: null,
				users: null,
			},
			// modals
			open: false,
			modal: {
				addsong: false,
				addsetlist: false,
				signup: false,
				passwordreset: false,
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
				private: false,
				date: '',
				songs: [],
			},
			// authentification
			auth: {
				confirmed: null,
				ready: false,
				user: '',
				userObject: null,
			},
			// explicit loading indication
			// currently used for switching profiles on user creation
			loading: false
		};
	},
	mounted () {
		// add listener for authentification state
		firebase.auth().onAuthStateChanged(user => {
			if (user) {
				// load app config on auth change only when not explicitly loading
				if (!this.loading) {
					this.loadConfig();
				}
				this.auth.user = user.uid;
				this.auth.userObject = user;
				let userRef = this.$db.collection("users").doc(user.uid);
				userRef.get().then((userEntry) => {
					if (userEntry.exists) {
						this.auth.confirmed = true;
						if (user.emailVerified) {
							this.listen();
						}
						this.loading = false;
					} else {
						this.auth.confirmed = false;
					}
				}).catch(() => {
					this.auth.confirmed = false;
				});
			} else {
				if (this.auth.confirmed) {
					this.unlisten();
				}
				this.auth.user = '';
				this.auth.userObject = null;
			}
			this.auth.ready = true;
		});
	},
	methods: {
		// add listeners for changes on each db table
		listen () {
			for (const table in this.listener) {
				this.listener[table] = onSnapshot(collection(this.$db, table), (snapshot) => {
					snapshot.docChanges().forEach(change => {
						if (change.type === "added" || change.type === "modified") {
							this[table][change.doc.id] = change.doc.data();
						}
						if (change.type === "removed") {
							delete this[table][change.doc.id];
						}
					});
					this.ready[table] = true;
				});
			}
		},
		// remove listeners for changes on each db table
		unlisten () {
			for (const table in this.listener) {
				let unsubscribe = this.listener[table];
				unsubscribe();
			}
		},
		// loads configuration without listener
		loadConfig () {
			let contactRef = this.$db.collection("config").doc("contact");
			contactRef.get().then(doc => {
				if (doc.exists) {
					this.config.contact = doc.data();
					this.ready.config = true;
				}
			}).catch((error) => this.throwError(error));
		},
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
			};
		},
		resetSetlist () {
			this.newSetlist = {
				title: '',
				date: '',
				songs: [],
			};
		},
		signIn (email, password) {
			firebase.auth().signInWithEmailAndPassword(email, password).then(() => {
				// login successful
				const user = firebase.auth().currentUser;
				this.auth.user = user.uid;
				this.auth.userObject = user;
				// load general app config
				this.loadConfig();
				// now add listeners for changes on each db table
				if (this.auth.confirmed && user.emailVerified) {
					this.listen();
				}
				// toast successful login
				this.$notify({
					title: this.$t('toast.signedIn'),
					text: this.$t('toast.signedInText', { name: this.auth.userObject.displayName }),
					type: 'primary'
				});
			}).catch((error) => this.throwError(error));
		},
		signOut () {
			firebase.auth().signOut().then(() => {
				// sign-out successful
				if (this.auth.confirmed) {
					this.unlisten();
				}
				// toast successfoul log out
				this.$notify({
					title: this.$t('toast.signedOut'),
					text: this.$t('toast.signedOutText'),
					type: 'primary'
				});
			}).catch((error) => this.throwError(error));
		},
		signUp (user) {
			firebase.auth().createUserWithEmailAndPassword(user.email, user.password).then(() => {
				// sign-up successful
				this.auth.user = firebase.auth().currentUser.uid
				// load general app config
				this.loadConfig();
				// create registration for admin approval
				this.$db.collection('registrations').doc(this.auth.user).set({ email: user.email, name: user.name }).then(() => {
					this.auth.userObject = firebase.auth().currentUser
					this.auth.userObject.updateProfile({ displayName: user.name })
					this.$notify({
						title: this.$t('toast.signedUp'),
						text: this.$t('toast.signedUpText', { name: user.name }),
						type: 'primary'
					});
				}).catch((error) => this.throwError(error));
				// send verification email
				firebase.auth().currentUser.sendEmailVerification().then(() => {
					// Verification email sent
					this.$notify({
						title:  this.$t('toast.verficationSent'),
						text:  this.$t('toast.verficationSentText'),
						type: 'primary'
					});
				}).catch((error) => this.throwError(error));
			}).catch((error) => this.throwError(error));
		},
		// resend email with verification link to currently logged in user
		resendEmailVerification () {
			firebase.auth().currentUser.sendEmailVerification().then(() => {
				this.$notify({
					title: this.$t('toast.verficationSent'),
					text: this.$t('toast.verficationSentText'),
					type: 'primary'
				});
			}).catch((error) => this.throwError(error));
		},
		// send password reset email
		sendPasswordReset (email) {
			firebase.auth().sendPasswordResetEmail(email).then(() => {
				this.$notify({
					title: this.$t('toast.passwordResetSent'),
					text: this.$t('toast.passwordResetSentText'),
					type: 'primary'
				});
			}).catch((error) => this.throwError(error));
		}
	},
	computed: {
		// check if db is empty = no users or registrations yet
		noUsers() {
			return Object.keys(this.users).length === 0 && Object.keys(this.registrations).length === 0;
		},
		// get user name either from user object or from users db table
		userName () {
			return this.ready.users ? this.users[this.auth.user].name : '';
		},
		// check if at least one registration exists
		registrationsExist () {
			return Object.keys(this.registrations).length > 0;
		},
		// number of setlists visible for user
		setlistCount () {
			return Object.values(this.setlists).filter(s => !s.private || s.private && s.creator==this.auth.user).length;
		}
	},
});
</script>

<style lang="scss">
// apply all global styles
@import "@/assets/global";
</style>
