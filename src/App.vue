<template>
	<div class="bg-blade-100 text-blade-600 dark:bg-blade-850 dark:text-blade-300 overflow-x-hidden">
		<!-- logged in, confirmed and verified -->
		<div
			v-if="auth.ready && auth.user && auth.userObject.emailVerified && ready.users && c.users[auth.user] && ready.permissions && c.permissions[auth.user] && !loading"
			class="lg:flex min-h-screen"
		>
			<!-- menu toggle button -->
			<button class="fixed lg:hidden transition-all top-2 right-2 lg:top-4 lg:right-4 px-2 py-1 z-10 flex items-center" :class="{ 'right-64 mr-4': open }" @click="open = true">
				<menu2-icon class="w-8 h-8 stroke-2" />
			</button>

			<!-- menu sidebar -->
			<div
				class="fixed shrink-0 -right-64 lg:left-0 lg:right-auto top-0 transition-all z-30 min-h-screen w-64 flex flex-col px-2 py-8 bg-blade-200 dark:bg-blade-900"
				:class="{ '!right-0': open }"
			>
				<router-link to="/" class="flex flex-col w-max mx-auto mb-4 no-active">
					<logo :featured="false" :show-version="true" />
				</router-link>
				<div class="flex flex-col gap-1 mt-1">
					<router-link
						to="/"
						class="px-3 py-1.5 flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
						@click="open = false"
					>
						<layout-grid-icon class="w-5 h-5 stroke-1.5" />
						<span class="mb-0.5 uppercase">{{ t('page.dashboard') }}</span>
					</router-link>
					<router-link
						to="/songs"
						class="px-3 py-1.5 flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
						@click="open = false"
					>
						<music-icon class="w-5 h-5 stroke-1.5" />
						<span class="mb-0.5 uppercase">{{ t('page.songs', Object.keys(c.songs)?.length) }}</span>
						<div class="flex items-center gap-4 ml-auto">
							<div v-if="ready.songs" class="font-bold">{{ Object.keys(c.songs).length }}</div>
							<secondary-button
								v-if="userRoles[c.permissions[auth.user].role] > 2"
								class="!p-1 tooltip tooltip-left"
								:data-tooltip="t('tooltip.songAdd')"
								@click="modal.addsong = true"
							>
								<plus-icon class="w-5 h-5 stroke-1.5" />
							</secondary-button>
						</div>
					</router-link>
					<router-link
						to="/setlists"
						class="px-3 py-1.5 flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
						@click="open = false"
					>
						<playlist-icon class="w-5 h-5 stroke-1.5" />
						<span class="mb-0.5 uppercase">{{ t('page.setlists', setlistCount) }}</span>
						<div class="flex items-center gap-4 ml-auto">
							<label v-if="ready.setlists" class="font-bold">{{ setlistCount }}</label>
							<secondary-button
								v-if="userRoles[c.permissions[auth.user].role] > 1"
								class="!p-1 tooltip tooltip-left"
								:data-tooltip="t('tooltip.setlistAdd')"
								@click="modal.addsetlist = true"
							>
								<plus-icon class="w-5 h-5 stroke-1.5" />
							</secondary-button>
						</div>
					</router-link>
					<divider-horizontal :label="t('divider.account')" />
					<router-link
						to="/profile"
						class="px-3 py-1.5 flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
						@click="open = false"
					>
						<avatar :photo-url="c.users[auth.user].photo" :name="userName" size="md" />
						<div class="flex flex-col">
							<div class="leading-5 uppercase">{{ userName }}</div>
							<div class="text-gray-500 text-sm">
								{{ t('role.' + c.permissions[auth.user].role) }}
							</div>
						</div>
					</router-link>
					<router-link
						to="/settings"
						class="px-3 py-1.5 flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
						@click="open = false"
					>
						<settings-icon class="w-5 h-5 stroke-1.5" />
						<span class="mb-0.5 uppercase">{{ t('page.settings') }}</span>
						<indicator-pulse v-if="registrationsExist && userRoles[c.permissions[auth.user].role] > 3" class="ml-auto" />
					</router-link>
					<secondary-button class="mt-2" @click="signOut">
						{{ t('button.signOut') }}
						<logout-icon class="w-6 h-6 stroke-1.5" />
					</secondary-button>
					<divider-horizontal :label="t('divider.info')" />
					<router-link
						to="/shortcuts"
						class="px-3 py-1.5 flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
						@click="open = false"
					>
						<bulb-icon class="w-5 h-5 stroke-1.5" />
						<span class="mb-0.5 uppercase">{{ t('page.shortcuts') }}</span>
					</router-link>
					<router-link
						to="/documentation"
						class="px-3 py-1.5 flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
						@click="open = false"
					>
						<book-icon class="w-5 h-5 stroke-1.5" />
						<span class="mb-0.5 uppercase">{{ t('page.docu') }}</span>
					</router-link>
					<a
						href="https://github.com/devmount/SongDrive"
						class="px-3 py-1.5 flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
						target="_blank"
					>
						<brand-github-icon class="w-5 h-5 stroke-1.5" />
						<span class="mb-0.5 uppercase">{{ t('page.github') }}</span>
						<external-link-icon class="w-5 h-5 ml-auto" />
					</a>
				</div>
				<footer class="mt-auto text-sm text-blade-500">
					<div class="flex justify-center items-center gap-1">
						<span>{{ t('app.created.0') }}</span>
						<heart-icon class="w-5 h-5 stroke-1.5" />
						<span>{{ t('app.created.1') }}</span>
						<a href="https://devmount.de" target="_blank">
							<svg class="w-6 h-6 fill-transparent stroke-10 stroke-current" viewBox="0 0 234 234">
								<path d="M6.9,140.6L87.1,40.2l78.2,77.6" />
								<path d="M40.4,193.8l62.1-77.8l35.9,35.4l48.8-60.6l39.8,39.5" />
							</svg>
						</a>
					</div>
					<div class="flex justify-center items-center gap-1">
						<span>2016–{{ (new Date()).getFullYear() }}</span>
						<license-icon class="w-5 h-5 fill-transparent stroke-1.5 stroke-current" />
						<a href="https://github.com/devmount/SongDrive/blob/main/LICENSE" target="_blank">
							{{ t('app.license') }}
						</a>
					</div>
				</footer>
			</div>
			<div
				class="fixed top-0 left-0 z-20 w-screen h-screen bg-blade-800/50 lg:hidden"
				:class="{ 'hidden': !open }"
				@click="open = false"
			></div>

			<!-- off-screen content -->
			<div class="w-full p-3 sm:p-6 lg:ml-64">
				<router-view
					:key="route.fullPath"
					:user="auth.user"
					:user-object="auth.userObject"
					:role="userRoles[c.permissions[auth.user].role]"
					:role-name="c.permissions[auth.user].role"
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
		<div
			v-if="!auth.ready || ((!auth.user || auth.confirmed === null) && loading)"
			class="w-screen h-screen flex justify-center items-center"
		>
			<div class="animate-spin w-16 h-16 rounded-full border-4 border-transparent border-t-spring-600"></div>
		</div>

		<!-- modals -->
		<song-set
			v-if="modal.addsong"
			:active="modal.addsong"
			:existing="false"
			:initial-song="newSong"
			song-key=""
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
			:initial-setlist="newSetlist"
			setlist-key=""
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
				<div
					class="mb-2 mr-2 py-2 px-3 rounded-sm text-white"
					:class="{
						'bg-spring-700': props.item.type === 'primary',
						'bg-rose-700': props.item.type === 'error',
					}"
				>
					<div class="flex justify-between">
						<div class="text-lg font-semibold">{{ props.item.title }}</div>
						<button aria-label="Close" @click="props.close">
							<x-icon class="w-6 h-6" />
						</button>
					</div>
					<div v-html="props.item.text"></div>
				</div>
			</template>
		</notifications>
	</div>
</template>

<script setup>
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { collection, onSnapshot } from "firebase/firestore";
import { notify } from '@kyvg/vue3-notification';
import { ref, reactive, computed, inject, onMounted } from 'vue';
import { useI18n } from "vue-i18n";
import { useRoute } from 'vue-router';
import { userRoles, throwError } from '@/utils.js';
import Avatar from './elements/Avatar.vue';
import DividerHorizontal from '@/elements/DividerHorizontal';
import firebase from 'firebase/compat/app';
import IndicatorPulse from '@/elements/IndicatorPulse';
import Login from '@/partials/Login';
import Logo from '@/partials/Logo';
import PasswordReset from '@/modals/PasswordReset';
import SecondaryButton from '@/elements/SecondaryButton';
import SetlistSet from '@/modals/SetlistSet';
import SignUp from '@/modals/SignUp';
import SongSet from '@/modals/SongSet';
import UserUnconfirmed from '@/partials/UserUnconfirmed';
import UserUnverified from '@/partials/UserUnverified';

// icons
import {
	BookIcon,
	BrandGithubIcon,
	BulbIcon,
	ExternalLinkIcon,
	HeartIcon,
	LayoutGridIcon,
	LicenseIcon,
	LogoutIcon,
	Menu2Icon,
	MusicIcon,
	PlaylistIcon,
	PlusIcon,
	SettingsIcon,
	XIcon,
} from "vue-tabler-icons";

// component constants
const { t } = useI18n();
const route = useRoute();

// global properties
const db = inject('db');

// db table collections
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
// authentication
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

// initially check authentication
onMounted(() => {
	// add listener for authentication state
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
