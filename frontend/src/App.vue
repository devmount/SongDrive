<template>
	<div class="bg-blade-100 text-blade-600 dark:bg-blade-850 dark:text-blade-300 overflow-x-hidden">
		<!-- Loading screen -->
		<div
			v-if="!ready"
			class="w-screen h-screen flex justify-center items-center text-spring-600"
		>
			<icon-loader2 class="w-16 h-16 stroke-1.5 animate-spin" />
		</div>
		<!-- Logged in, confirmed and verified -->
		<div v-else-if="authenticated" class="lg:flex min-h-screen">
			<!-- menu toggle button -->
			<button
				class="
					fixed lg:hidden transition-all top-2 right-2 lg:top-4 lg:right-4 px-2 py-1 z-10 flex items-center rounded
					bg-blade-100/75 dark:bg-blade-850/75
				"
				:class="{ 'right-64 mr-4': open }"
				@click="open = true"
			>
				<icon-menu2 class="w-8 h-8 stroke-2" />
			</button>

			<!-- menu sidebar -->
			<div
				class="fixed shrink-0 -right-64 lg:left-0 lg:right-auto top-0 transition-all z-30 min-h-screen w-64 flex flex-col px-2 py-8 bg-blade-200 dark:bg-blade-900"
				:class="{ 'right-0!': open }"
			>
				<router-link :to="{ name: 'dashboard' }" class="flex flex-col w-max mx-auto mb-4 no-active">
					<logo :featured="false" :show-version="true" />
				</router-link>
				<div class="flex flex-col gap-1 mt-1">
					<router-link
						:to="{ name: 'dashboard' }"
						class="px-3 py-2 flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
						@click="open = false"
					>
						<icon-layout-grid class="w-5 h-5 stroke-1.5" />
						<span class="uppercase">{{ t('page.dashboard') }}</span>
					</router-link>
					<router-link
						:to="{ name: 'songs' }"
						class="px-3 py-2 flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
						@click="open = false"
					>
						<icon-music class="w-5 h-5 stroke-1.5" />
						<span class="uppercase">{{ t('page.songs', songs.length) }}</span>
						<div class="flex items-center gap-4 ml-auto">
							<div class="font-bold">{{ songs.length }}</div>
							<secondary-button
								v-if="can('createSongs', user.roles)"
								class="p-1!"
								:title="t('tooltip.songAdd')"
								@click.stop.prevent="createNewSong"
							>
								<icon-plus class="w-5 h-5 stroke-1.5" />
							</secondary-button>
						</div>
					</router-link>
					<router-link
						:to="{ name: 'setlists' }"
						class="px-3 py-2 flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
						@click="open = false"
					>
						<icon-playlist class="w-5 h-5 stroke-1.5" />
						<span class="uppercase">{{ t('page.setlists', setlists.length) }}</span>
						<div class="flex items-center gap-4 ml-auto">
							<label class="font-bold">{{ setlists.length }}</label>
							<secondary-button
								v-if="can('createSetlists', user.roles)"
								class="p-1!"
								:title="t('tooltip.setlistAdd')"
								@click.stop.prevent="createNewSetlist"
							>
								<icon-plus class="w-5 h-5 stroke-1.5" />
							</secondary-button>
						</div>
					</router-link>
					<divider-horizontal :label="t('divider.account')" />
					<router-link
						:to="{ name: 'profile' }"
						class="px-3 py-2 flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
						@click="open = false"
					>
						<user-avatar :photo-url="''" :name="user.name" size="md" />
						<div class="flex flex-col">
							<div class="leading-5 uppercase">{{ user.name }}</div>
							<div class="text-gray-500 text-sm">
								{{ t('role.' + user.roles[0]) }}
							</div>
						</div>
					</router-link>
					<secondary-button class="mt-2" @click="logout">
						{{ t('button.signOut') }}
						<icon-logout class="w-6 h-6 stroke-1.5" />
					</secondary-button>
					<divider-horizontal :label="t('divider.info')" />
					<router-link
						:to="{ name: 'shortcuts' }"
						class="px-3 py-2 flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
						@click="open = false"
					>
						<icon-bulb class="w-5 h-5 stroke-1.5" />
						<span class="uppercase">{{ t('page.shortcuts') }}</span>
					</router-link>
					<router-link
						:to="{ name: 'documentation' }"
						class="px-3 py-2 flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
						@click="open = false"
					>
						<icon-book class="w-5 h-5 stroke-1.5" />
						<span class="uppercase">{{ t('page.docu') }}</span>
					</router-link>
					<a
						href="https://github.com/devmount/SongDrive"
						class="px-3 py-2 flex items-center gap-3 hover:bg-blade-100 dark:hover:bg-blade-750"
						target="_blank"
					>
						<icon-brand-github class="w-5 h-5 stroke-1.5" />
						<span class="uppercase">{{ t('page.github') }}</span>
						<icon-external-link class="w-5 h-5 ml-auto" />
					</a>
				</div>
				<footer class="mt-auto text-sm text-blade-500">
					<div class="flex justify-center items-center gap-1">
						<span>{{ t('app.created.0') }}</span>
						<icon-heart class="w-5 h-5 stroke-1.5" />
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
						<icon-license class="w-5 h-5 fill-transparent stroke-1.5 stroke-current" />
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
					@add-song="createNewSong"
					@edit-song="editExistingSong"
					@add-setlist="createNewSetlist"
					@edit-setlist="editExistingSetlist"
				/>
			</div>
		</div>

		<!-- Login screen -->
		<div v-else>
			<login-form
				v-model:email="email"
				v-model:password="password"
				v-model:stay-logged-in="stayLoggedIn"
				:auth-failed="authFailed"
				@sign-in="login"
				@sign-up="showModal.signup = true"
				@reset-password="showModal.passwordreset = true"
			/>
		</div>

		<!-- notifications -->
		<notifications position="bottom right" :duration="5000" width="">
			<template #body="props">
				<div
					class="mb-1 mx-1 xs:mb-2 xs:mx-2 py-2 px-3 rounded-xs text-white"
					:class="{
						'bg-spring-700': props.item.type === 'primary',
						'bg-rose-700': props.item.type === 'error',
					}"
				>
					<div class="flex justify-between">
						<div class="text-lg font-semibold">{{ props.item.title }}</div>
						<button aria-label="Close" @click="props.close">
							<icon-x class="w-6 h-6" />
						</button>
					</div>
					<div>{{ props.item.text }}</div>
				</div>
			</template>
		</notifications>
	</div>
	<!-- modals -->
	<song-set
		:active="showModal.songset"
		:existing="songSetModalData.existing"
		:initial-song="songSetModalData.song"
		:id="songSetModalData.id"
		:songs="songs"
		:setlists="setlists"
		:tags="tags"
		:languages="languages"
		:ready="ready"
		@closed="showModal.songset = false"
	/>
	<setlist-set
		:active="showModal.setlistset"
		:existing="setlistSetModalData.existing"
		:initial-setlist="setlistSetModalData.setlist"
		:id="setlistSetModalData.id"
		:user="user"
		:songs="songs"
		:setlists="setlists"
		:tags="tags"
		:languages="languages"
		:ready="ready"
		@closed="showModal.setlistset = false"
	/>
	<sign-up
		:active="showModal.signup"
		@closed="showModal.signup = false"
		@submitted="doSignUp"
	/>
	<password-reset
		:active="showModal.passwordreset"
		@closed="showModal.passwordreset = false"
		@submitted="sendPasswordReset"
	/>
</template>

<script setup>
// import { collection, onSnapshot, getDoc, doc, setDoc } from 'firebase/firestore';
// import {
// 	getAuth,
// 	signInWithEmailAndPassword,
// 	signOut as fbSignOut,
// 	createUserWithEmailAndPassword,
// 	sendEmailVerification,
// 	sendPasswordResetEmail,
// 	onAuthStateChanged,
// 	updateProfile
// } from "firebase/auth";
import { notify } from '@kyvg/vue3-notification';
import { ref, reactive, computed, provide, onMounted } from 'vue';
import { useActiveElement, useMagicKeys } from '@vueuse/core';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { userRoles, throwError } from '@/utils.js';
import UserAvatar from '@/elements/UserAvatar.vue';
import DividerHorizontal from '@/elements/DividerHorizontal.vue';
import LoginForm from '@/partials/LoginForm.vue';
import Logo from '@/partials/Logo.vue';
import PasswordReset from '@/modals/PasswordReset.vue';
import SecondaryButton from '@/elements/SecondaryButton.vue';
import SetlistSet from '@/modals/SetlistSet.vue';
import SignUp from '@/modals/SignUp.vue';
import SongSet from '@/modals/SongSet.vue';
import { amberClient } from 'amber-client';
import { SongTag, can } from "@backend/definitions";

// icons
import {
	IconBook,
	IconBrandGithub,
	IconBulb,
	IconExternalLink,
	IconHeart,
	IconLayoutGrid,
	IconLicense,
	IconLoader2,
	IconLogout,
	IconMenu2,
	IconMusic,
	IconPlaylist,
	IconPlus,
	IconX,
} from '@tabler/icons-vue';

// hotkeys
const {
	arrowdown,
	arrowleft,
	arrowright,
	arrowup,
	ctrl_b,
	ctrl_f,
	ctrl_i,
	ctrl_l,
	ctrl_k,
	ctrl_p,
	ctrl_r,
	ctrl_s,
	enter,
	escape,
} = useMagicKeys({
	passive: false,
	onEventFired: (e) => {
		if (e.ctrlKey && ['f','k','p','r','i','l','s','b'].includes(e.key) && e.type === 'keydown') {
			e.preventDefault();
		}
	},
});
const activeElement = useActiveElement();
const noActiveInput = computed(() =>
	activeElement.value?.tagName !== 'INPUT'
	&& activeElement.value?.tagName !== 'TEXTAREA',
);
provide('hkBack',    arrowleft );
provide('hkCancel',  escape    );
provide('hkChords',  ctrl_k    );
provide('hkDown',    arrowdown );
provide('hkForward', arrowright);
provide('hkGo',      enter     );
provide('hkHide',    ctrl_b    );
provide('hkInfo',    ctrl_i    );
provide('hkPresent', ctrl_p    );
provide('hkReset',   ctrl_r    );
provide('hkSearch',  ctrl_f    );
provide('hkSync',    ctrl_s    );
provide('hkTheme',   ctrl_l    );
provide('hkUp',      arrowup   );
provide('noActiveInput', noActiveInput);

// component constants
const { t } = useI18n();
const route = useRoute();

// global properties
// const fb = inject('firebaseApp');
// const db = inject('db');
// const fbAuth = getAuth(fb);

// db table collections
// const c = reactive({
// 	languages: {},
// 	setlists: {},
// 	songs: {},
// 	tags: {},
// 	users: {},
// });

// // db table ready state
// const ready = reactive({
// 	config: false,
// 	languages: false,
// 	permissions: false,
// 	registrations: false,
// 	setlists: false,
// 	songs: false,
// 	tags: false,
// 	users: false,
// });

// // db table listeners
// const listener = reactive({
// 	config: null,
// 	languages: null,
// 	permissions: null,
// 	registrations: null,
// 	setlists: null,
// 	songs: null,
// 	tags: null,
// 	users: null,
// });

// mobile menu state
const open = ref(false);

// setlist object
const initialSetlist = {
	title: '',
	private: false,
	date: '',
	songs: [],
};

// song object
const initialSong = {
	authors:      '',
	ccli:         '',
	content:      '',
	language:     '',
	note:         '', // deprecated
	publisher:    '',
	subtitle:     '',
	tags:         [],
	title:        '',
	translations: [],
	tuning:       '', // rename to 'key'
	year:         '',
	youtube:      '',
};

// modals
const showModal = reactive({
	songset:       false,
	setlistset:    false,
	signup:        false,
	passwordreset: false,
});
const noActiveModal = computed(() => {
	return !showModal.songset && !showModal.setlistset && !showModal.signup && !showModal.passwordreset;
});
provide('noActiveModal', noActiveModal);

// add and edit songs
const songSetModalData = reactive({
	song:     structuredClone(initialSong),
	existing: false,
	id:       null,
});
const createNewSong = () => {
	songSetModalData.song     = structuredClone(initialSong);
	songSetModalData.existing = false;
	songSetModalData.id       = null;
	showModal.songset         = true;
};
const editExistingSong = ({data, id, exists}) => {
	songSetModalData.song     = data;
	songSetModalData.existing = exists;
	songSetModalData.id       = id;
	showModal.songset         = true;
};

// add and edit setlists
const setlistSetModalData = reactive({
	setlist:  structuredClone(initialSetlist),
	existing: false,
	id:       null,
});
const createNewSetlist = () => {
	setlistSetModalData.setlist  = structuredClone(initialSetlist);
	setlistSetModalData.existing = false;
	setlistSetModalData.id       = null;
	showModal.setlistset         = true;
};
const editExistingSetlist = ({data, id, exists}) => {
	setlistSetModalData.setlist  = data;
	setlistSetModalData.existing = exists;
	setlistSetModalData.id       = id;
	showModal.setlistset         = true;
};

// // authentication
// const auth = reactive({
// 	confirmed: null,
// 	ready: false,
// 	user: '',
// 	userObject: null,
// });

// Tenant
const tenant = reactive({
	name: 'default',
	connected: false,
});

// Auth
const ready = ref(false);
const amberUser = ref(null);
const client = ref(null);
const authenticated = ref(true);
const authFailed = ref(false);
const authCallback = ref(() => {});

// Login
const email = ref('');
const password = ref('');
const stayLoggedIn = ref(true);

// Data
const songs = ref([]);
const setlists = ref([]);
const users = ref({}); // { [user id]: user info object }
const tags = Object.values(SongTag);

// computed: get user name either from user object or from users db collection
const user = computed(() => ({
	id: amberUser.value?.user.id,
	name: amberUser.value?.user.name ?? '',
	email: amberUser.value?.user.email ?? '',
	roles: amberUser.value?.roles,
	photo: null, // TODO
}));
// computed: check if at least one registration exists
const registrationsExist = false; // TODO

// Provide data for other views
provide('user', user);
provide('ready', ready);
provide('setlists', setlists);
provide('songs', songs);
provide('tags', tags);
provide('users', users);

// Collections from Amberbase
let collectionApi = null;
let songsCollection = null;
let setlistCollection = null;

const init = async () => {
	client.value = amberClient()
		.withPath('/amber')
		.withTenant(tenant.name)
		.withCredentialsProvider((failed) => {
			// Login failed
			authFailed.value = failed;

			// Initially access is forbidden
			authenticated.value = false;
			
			// Get login callback
			return new Promise((resolve)=>{
				// loginCallback ist eine variable die das resolve callback deinem UI zur Verfügung stellt. 
				authenticated.value = false;
				authFailed.value = failed;
				authCallback.value = resolve;
				ready.value = true;
			})
		})
		.start();
	
	amberUser.value = await client.value.userInTenant();

	if (authenticated.value) {
		collectionApi = client.value.getCollectionsApi();
		songsCollection = collectionApi.getCollection('songs');
		setlistCollection = collectionApi.getCollection('setlists');
	
		songsCollection.subscribe(0, (doc) => {
			let existing = songs.value.find(s => s.id === doc.id);
			if (existing) {
				existing.entity = doc.data;
				existing.changeNumber = doc.change_number;
			} else {
				songs.value.push({ id: doc.id, entity: doc.data, changeNumber: doc.change_number });
			}
	
		}, (docDeletedId) => {
			songs.value = songs.value.filter(s => s.id !== docDeletedId);
		});
	
		setlistCollection.subscribe(0, (doc) => {
			let existing = setlists.value.find(s => s.id === doc.id);
			if (existing) {
				existing.entity = doc.data;
				existing.changeNumber = doc.change_number;
			} else {
				setlists.value.push({ id: doc.id, entity: doc.data, changeNumber: doc.change_number });
			}
	
		}, (docDeletedId) => {
			setlists.value = setlists.value.filter(s => s.id !== docDeletedId);
		});
	
		await collectionApi.connect();
		collectionApi.onConnectionChanged((connected) => {
			tenant.connected = connected;
		});
	
		const usersResponse = await client.value.getAmberApi()?.getUsers();
		users.value = usersResponse?.reduce((p, c) => ({ ...p, [c.id]: c}), {})  || {};
	}

	ready.value = true;
};

const login = () => {
	authCallback.value({ email: email.value, pw: password.value, stayLoggedIn: stayLoggedIn.value });
	authenticated.value = true;
};
const logout = async () => {
	await client.value?.loginManager.logout();
	authenticated.value = false;
	authFailed.value = false;
	amberUser.value = null;
	email.value = '';
	password.value = '';

	notify({ title: t('toast.signedOut'), text: t('toast.signedOutText'), type: 'primary' });
};

onMounted(async () => await init());

// // add listeners for changes on each db collection
// const listen = () => {
// 	for (const table in listener) {
// 		listener[table] = onSnapshot(collection(db, table), (snapshot) => {
// 			snapshot.docChanges().forEach(change => {
// 				if (change.type === "added" || change.type === "modified") {
// 					c[table][change.doc.id] = change.doc.data();
// 				}
// 				if (change.type === "removed") {
// 					delete c[table][change.doc.id];
// 				}
// 			});
// 			ready[table] = true;
// 		});
// 	}
// };
// // remove listeners for changes on each db table
// const unlisten = () => {
// 	for (const table in listener) {
// 		let unsubscribe = listener[table];
// 		if (typeof unsubscribe === "function") unsubscribe();
// 	}
// };
// // loads configuration without listener
// const loadConfig = () => {
// 	getDoc(doc(db, "config/contact")).then(doc => {
// 		if (doc.exists) {
// 			c.config.contact = doc.data();
// 			ready.config = true;
// 		}
// 	}).catch((error) => throwError(error));
// };

// // execute sign in on Firebase backend
// const signIn = (email, password) => {
// 	signInWithEmailAndPassword(fbAuth, email, password).then(() => {
// 		// login successful
// 		const user = fbAuth.currentUser;
// 		auth.user = user.uid;
// 		auth.userObject = user;
// 		// load general app config
// 		loadConfig();
// 		// now add listeners for changes on each db table
// 		if (auth.confirmed && user.emailVerified) {
// 			listen();
// 		}
// 		// toast successful login
// 		notify({
// 			title: t('toast.signedIn'),
// 			text: t('toast.signedInText', { name: auth.userObject.displayName }),
// 			type: 'primary'
// 		});
// 	}).catch((error) => throwError(error));
// };
// // execute sign out on firebase backend
// const signOut = () => {
// 	fbSignOut(fbAuth).then(() => {
// 		// sign-out successful
// 		if (auth.confirmed) {
// 			unlisten();
// 		}
// 		// toast successfoul log out
// 		notify({
// 			title: t('toast.signedOut'),
// 			text: t('toast.signedOutText'),
// 			type: 'primary'
// 		});
// 	}).catch((error) => throwError(error));
// };
// // execute user creation on firebase backend
// const doSignUp = (user) => {
// 	createUserWithEmailAndPassword(fbAuth, user.email, user.password).then(() => {
// 		// sign-up successful
// 		auth.user = fbAuth.currentUser.uid
// 		// load general app config
// 		loadConfig();
// 		// create registration for admin approval
// 		setDoc(doc(db, `registrations/${auth.user}`), { email: user.email, name: user.name }).then(() => {
// 			auth.userObject = fbAuth.currentUser;
// 			updateProfile(auth.userObject, { displayName: user.name });
// 			notify({
// 				title: t('toast.signedUp'),
// 				text: t('toast.signedUpText', { name: user.name }),
// 				type: 'primary'
// 			});
// 		}).catch((error) => throwError(error));
// 		// send verification email
// 		sendEmailVerification(fbAuth.currentUser).then(() => {
// 			// Verification email sent
// 			notify({
// 				title:  t('toast.verficationSent'),
// 				text:  t('toast.verficationSentText'),
// 				type: 'primary'
// 			});
// 		}).catch((error) => throwError(error));
// 	}).catch((error) => throwError(error));
// };
// // resend email with verification link to currently logged in user
// const resendEmailVerification = () => {
// 	sendEmailVerification(fbAuth.currentUser).then(() => {
// 		notify({
// 			title: t('toast.verficationSent'),
// 			text: t('toast.verficationSentText'),
// 			type: 'primary'
// 		});
// 	}).catch((error) => throwError(error));
// };
// // send password reset email
// const sendPasswordReset = (email) => {
// 	sendPasswordResetEmail(fbAuth, email).then(() => {
// 		notify({
// 			title: t('toast.passwordResetSent'),
// 			text: t('toast.passwordResetSentText'),
// 			type: 'primary'
// 		});
// 	}).catch((error) => throwError(error));
// };

// initially check authentication
// onMounted(() => {
	// add listener for authentication state
	// onAuthStateChanged(fbAuth, user => {
	// 	if (user) {
	// 		// load app config on auth change only when not explicitly loading
	// 		if (!loading.value) {
	// 			loadConfig();
	// 		}
	// 		auth.user = user.uid;
	// 		auth.userObject = user;
	// 		getDoc(doc(db, `users/${user.id}`)).then((userEntry) => {
	// 			if (userEntry.exists) {
	// 				auth.confirmed = true;
	// 				if (user.emailVerified) {
	// 					listen();
	// 				}
	// 				loading.value = false;
	// 			} else {
	// 				auth.confirmed = false;
	// 			}
	// 		}).catch(() => {
	// 			auth.confirmed = false;
	// 		});
	// 	} else {
	// 		if (auth.confirmed) {
	// 			unlisten();
	// 		}
	// 		auth.user = '';
	// 		auth.userObject = null;
	// 	}
	// 	auth.ready = true;
	// });
// });
</script>
