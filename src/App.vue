<template>
	<div class="bg-blade-100 text-blade-600 dark:bg-blade-850 dark:text-blade-300">
		<!-- logged in, confirmed and verified -->
		<div
			v-if="auth.ready && auth.user && auth.userObject.emailVerified && ready.users && c.users[auth.user] && ready.permissions && c.permissions[auth.user] && !loading"
			class="off-canvas off-canvas-sidebar-show"
		>
			<!-- off-screen toggle button -->
			<button class="lg:hidden" @click="open = true">
				<ion-icon :icon="menu" size="large"></ion-icon>
			</button>

			<!-- off-screen sidebar -->
			<div class="max-w-2xs px-2 py-8 dark:bg-blade-900" :class="{ active: open }">
				<div class="brand text-center">
					<router-link to="/" class="flex flex-col w-max mx-auto">
						<logo :featured="false" :show-version="true" />
					</router-link>
				</div>
				<ul class="menu text-uppercase">
					<li class="divider text-center" :data-content="t('divider.start')"></li>
					<li class="menu-item">
						<router-link to="/" class="py-2" @click="open = false">
							<ion-icon :icon="appsSharp" class="mr-2"></ion-icon> {{ t('page.dashboard') }}
						</router-link>
					</li>
					<li class="menu-item">
						<router-link to="/songs" class="py-2" @click="open = false">
							<ion-icon :icon="musicalNotesSharp" class="mr-2"></ion-icon> {{ t('page.songs') }}
						</router-link>
						<div class="menu-badge">
							<label v-if="ready.songs" class="label py-1">{{ Object.keys(c.songs).length }}</label>
							<label v-else class="label py-1"><div class="loading d-inline-block px-2"></div></label>
							<button
								v-if="userRoles[c.permissions[auth.user].role] > 2"
								class="btn btn-secondary btn-action btn-sm mx-2 tooltip tooltip-left"
								:data-tooltip="t('tooltip.songAdd')"
								@click="modal.addsong = true"
							>
								<ion-icon :icon="addSharp"></ion-icon>
							</button>
						</div>
					</li>
					<li class="menu-item">
						<router-link to="/setlists" class="py-2" @click="open = false">
							<ion-icon :icon="list" class="mr-2"></ion-icon> {{ t('page.setlists') }}
						</router-link>
						<div class="menu-badge">
							<label v-if="ready.setlists" class="label py-1">{{ setlistCount }}</label>
							<label v-else class="label py-1"><div class="loading d-inline-block px-2"></div></label>
							<button
								v-if="userRoles[c.permissions[auth.user].role] > 1"
								class="btn btn-secondary btn-action btn-sm mx-2 tooltip tooltip-left"
								:data-tooltip="t('tooltip.setlistAdd')"
								@click="modal.addsetlist = true"
							>
								<ion-icon :icon="addSharp"></ion-icon>
							</button>
						</div>
					</li>
					<li class="divider text-center" :data-content="t('divider.account')"></li>
					<li class="menu-item pt-2 pb-2">
						<router-link to="/profile" class="py-2" @click="open = false">
							<div class="tile tile-centered">
								<div class="tile-icon mr-2 ml-1">
									<img v-if="c.users[auth.user].photo" class="avatar" :src="c.users[auth.user].photo" alt="Avatar">
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
										{{ t('role.' + c.permissions[auth.user].role) }}
									</div>
								</div>
							</div>
						</router-link>
					</li>
					<li class="menu-item">
						<router-link to="/settings" class="py-2" :class="{ badge: registrationsExist && userRoles[c.permissions[auth.user].role] > 3 }" @click="open = false">
							<ion-icon :icon="optionsOutline" class="mr-2"></ion-icon> {{ t('page.settings') }}
						</router-link>
					</li>
					<li class="menu-item">
						<button class="btn btn-secondary d-block stretch mt-3" @click="signOut">
							{{ t('button.signOut') }} <ion-icon :icon="logOutOutline" class="icon-right"></ion-icon>
						</button>
					</li>
				</ul>
				<ul class="menu text-uppercase">
					<li class="divider text-center" :data-content="t('divider.info')"></li>
					<li class="menu-item">
						<router-link to="/shortcuts" class="py-2" @click="open = false">
							<ion-icon :icon="bulbOutline" class="mr-2"></ion-icon> {{ t('page.shortcuts') }}
						</router-link>
					</li>
					<li class="menu-item">
						<router-link to="/documentation" class="py-2" @click="open = false">
							<ion-icon :icon="bookOutline" class="mr-2"></ion-icon> {{ t('page.docu') }}
						</router-link>
					</li>
					<li class="menu-item">
						<a href="https://github.com/devmount/SongDrive" class="py-2" target="_blank">
							<ion-icon :icon="logoGithub" class="mr-2"></ion-icon>
							{{ t('page.github') }}
							<ion-icon :icon="openOutline" class="icon-right"></ion-icon>
						</a>
					</li>
				</ul>
				<footer>
					<div class="text-center text-small text-gray">
						<span>
							{{ t('app.created.0') }}
							<ion-icon :icon='heartOutline'></ion-icon>
							{{ t('app.created.1') }}
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
							{{ t('app.license') }}
						</a>
					</div>
				</footer>
			</div>
			<a class="off-canvas-overlay" @click="open = false"></a>

			<!-- off-screen content -->
			<div class="off-canvas-content">
				<router-view
					:key="route.fullPath"
					:user="auth.user"
					:userObject="auth.userObject"
					:role="userRoles[c.permissions[auth.user].role]"
					:roleName="c.permissions[auth.user].role"
					:ready="ready"
					:config="c.config"
					:languages="c.languages"
					:permissions="c.permissions"
					:registrations="c.registrations"
					:setlists="c.setlists"
					:songs="c.songs"
					:tags="c.tags"
					:users="c.users"
					@started="loading=true"
				></router-view>
			</div>
		</div>
		<!-- logged in but not confimed yet -->
		<div v-if="auth.ready && auth.user && auth.confirmed === false && !loading">
			<user-unconfirmed :config="c.config" :ready="ready" @signOut="signOut" />
		</div>
		<!-- logged in, confimed but not verified yet -->
		<div v-if="auth.ready && auth.user && auth.confirmed && !auth.userObject.emailVerified && !loading">
			<user-unverified :config="c.config" :ready="ready" @signOut="signOut" @resendEmailVerification="resendEmailVerification()" />
		</div>
		<!-- login screen -->
		<div v-if="auth.ready && !auth.user && !loading">
			<login
				@sign-in="signIn"
				@sign-up="modal.signup = true"
				@reset-password="modal.passwordreset = true"
			/>
		</div>
		<!-- loading screen -->
		<div v-if="!auth.ready || !auth.user || auth.confirmed === null || loading" class="full-viewport d-flex justify-center align-center">
			<div class="loading loading-xl"></div>
		</div>

		<!-- modals -->
		<song-set
			v-if="modal.addsong"
			:active="modal.addsong"
			:existing="false"
			:initialSong="newSong"
			songKey=""
			:songs="c.songs"
			:setlists="c.setlists"
			:tags="c.tags"
			:languages="c.languages"
			:ready="ready"
			@closed="modal.addsong = false"
			@reset="resetSong"
		/>
		<setlist-set
			v-if="modal.addsetlist"
			:active="modal.addsetlist"
			:existing="false"
			:initialSetlist="newSetlist"
			setlistKey=""
			:user="auth.user"
			:songs="c.songs"
			:setlists="c.setlists"
			:tags="c.tags"
			:languages="c.languages"
			:ready="ready"
			@closed="modal.addsetlist = false"
			@reset="resetSetlist"
		/>
		<sign-up
			:active="modal.signup"
			@closed="modal.signup = false"
			@submitted="doSignUp"
		/>
		<password-reset
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
import { ref, reactive, computed, inject, onMounted } from 'vue';
import { useI18n } from "vue-i18n";
import { useRoute } from 'vue-router';
import { notify } from '@kyvg/vue3-notification';
import { userRoles, initials, throwError } from '@/utils.js';
import Logo from '@/partials/Logo';
import Login from '@/partials/Login';
import SignUp from '@/modals/SignUp';
import PasswordReset from '@/modals/PasswordReset';
import UserUnconfirmed from '@/partials/UserUnconfirmed';
import UserUnverified from '@/partials/UserUnverified';
import SongSet from '@/modals/SongSet';
import SetlistSet from '@/modals/SetlistSet';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { collection, onSnapshot } from "firebase/firestore";
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
const { t } = useI18n();
const route = useRoute();

// global properties
const db = inject('db');

// reactive data: db tables / collections
const c = reactive({
	config: {},
	languages: {},
	permissions: {},
	registrations: {},
	setlists: {},
	songs: {},
	tags: {},
	users: {},
});
// db table ready state
const ready = reactive({
	config: false,
	languages: false,
	permissions: false,
	registrations: false,
	setlists: false,
	songs: false,
	tags: false,
	users: false,
});
// db table listeners
const listener = reactive({
	config: null,
	languages: null,
	permissions: null,
	registrations: null,
	setlists: null,
	songs: null,
	tags: null,
	users: null,
});
// modals
const open = ref(false);
const modal = reactive({
	addsong: false,
	addsetlist: false,
	signup: false,
	passwordreset: false,
});
// objects to save
const newSong = reactive({
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
});
const newSetlist = reactive({
	title: '',
	private: false,
	date: '',
	songs: [],
});
// authentification
const auth = reactive({
	confirmed: null,
	ready: false,
	user: '',
	userObject: null,
});
// explicit loading indication
// currently used for switching profiles on user creation
const loading = ref(false);

// computed: check if db is empty = no users or registrations yet
const noUsers = computed(() => {
	return Object.keys(c.users).length === 0 && Object.keys(c.registrations).length === 0;
});
// computed: get user name either from user object or from users db collection
const userName = computed(() => {
	return ready.users ? c.users[auth.user].name : '';
});
// computed: check if at least one registration exists
const registrationsExist = computed(() => {
	return Object.keys(c.registrations).length > 0;
});
// computed: number of setlists visible for user
const setlistCount = computed(() => {
	return Object.values(c.setlists).filter(s => !s.private || s.private && s.creator==auth.user).length;
});

// add listeners for changes on each db collection
const listen = () => {
	for (const table in listener) {
		listener[table] = onSnapshot(collection(db, table), (snapshot) => {
			snapshot.docChanges().forEach(change => {
				if (change.type === "added" || change.type === "modified") {
					c[table][change.doc.id] = change.doc.data();
				}
				if (change.type === "removed") {
					delete c[table][change.doc.id];
				}
			});
			ready[table] = true;
		});
	}
};
// remove listeners for changes on each db table
const unlisten = () => {
	for (const table in listener) {
		let unsubscribe = listener[table];
		if (typeof unsubscribe === "function") unsubscribe();
	}
};
// loads configuration without listener
const loadConfig = () => {
	let contactRef = db.collection("config").doc("contact");
	contactRef.get().then(doc => {
		if (doc.exists) {
			c.config.contact = doc.data();
			ready.config = true;
		}
	}).catch((error) => throwError(error));
};
// set all newSong values to default
const resetSong = () => {
	newSong.authors = '';
	newSong.ccli = '';
	newSong.content = '';
	newSong.language = '';
	newSong.note = '';
	newSong.publisher = '';
	newSong.subtitle = '';
	newSong.tags = [];
	newSong.title = '';
	newSong.translations = [];
	newSong.tuning = '';
	newSong.year = '';
};
// set all newSetlist values to default
const resetSetlist = () => {
	newSetlist.title = '';
	newSetlist.date = '';
	newSetlist.songs = [];
};
// execute sign in on Firebase backend
const signIn = (email, password) => {
	firebase.auth().signInWithEmailAndPassword(email, password).then(() => {
		// login successful
		const user = firebase.auth().currentUser;
		auth.user = user.uid;
		auth.userObject = user;
		// load general app config
		loadConfig();
		// now add listeners for changes on each db table
		if (auth.confirmed && user.emailVerified) {
			listen();
		}
		// toast successful login
		notify({
			title: t('toast.signedIn'),
			text: t('toast.signedInText', { name: auth.userObject.displayName }),
			type: 'primary'
		});
	}).catch((error) => throwError(error));
};
// execute sign out on firebase backend
const signOut = () => {
	firebase.auth().signOut().then(() => {
		// sign-out successful
		if (auth.confirmed) {
			unlisten();
		}
		// toast successfoul log out
		notify({
			title: t('toast.signedOut'),
			text: t('toast.signedOutText'),
			type: 'primary'
		});
	}).catch((error) => throwError(error));
};
// execute user creation on firebase backend
const doSignUp = (user) => {
	firebase.auth().createUserWithEmailAndPassword(user.email, user.password).then(() => {
		// sign-up successful
		auth.user = firebase.auth().currentUser.uid
		// load general app config
		loadConfig();
		// create registration for admin approval
		db.collection('registrations').doc(auth.user).set({ email: user.email, name: user.name }).then(() => {
			auth.userObject = firebase.auth().currentUser
			auth.userObject.updateProfile({ displayName: user.name })
			notify({
				title: t('toast.signedUp'),
				text: t('toast.signedUpText', { name: user.name }),
				type: 'primary'
			});
		}).catch((error) => throwError(error));
		// send verification email
		firebase.auth().currentUser.sendEmailVerification().then(() => {
			// Verification email sent
			notify({
				title:  t('toast.verficationSent'),
				text:  t('toast.verficationSentText'),
				type: 'primary'
			});
		}).catch((error) => throwError(error));
	}).catch((error) => throwError(error));
};
// resend email with verification link to currently logged in user
const resendEmailVerification = () => {
	firebase.auth().currentUser.sendEmailVerification().then(() => {
		notify({
			title: t('toast.verficationSent'),
			text: t('toast.verficationSentText'),
			type: 'primary'
		});
	}).catch((error) => throwError(error));
};
// send password reset email
const sendPasswordReset = (email) => {
	firebase.auth().sendPasswordResetEmail(email).then(() => {
		notify({
			title: t('toast.passwordResetSent'),
			text: t('toast.passwordResetSentText'),
			type: 'primary'
		});
	}).catch((error) => throwError(error));
};

// handle mount hooks
onMounted(() => {
	// add listener for authentification state
	firebase.auth().onAuthStateChanged(user => {
		if (user) {
			// load app config on auth change only when not explicitly loading
			if (!loading.value) {
				loadConfig();
			}
			auth.user = user.uid;
			auth.userObject = user;
			let userRef = db.collection("users").doc(user.uid);
			userRef.get().then((userEntry) => {
				if (userEntry.exists) {
					auth.confirmed = true;
					if (user.emailVerified) {
						listen();
					}
					loading.value = false;
				} else {
					auth.confirmed = false;
				}
			}).catch(() => {
				auth.confirmed = false;
			});
		} else {
			if (auth.confirmed) {
				unlisten();
			}
			auth.user = '';
			auth.userObject = null;
		}
		auth.ready = true;
	});
});
</script>
