<template>
	<div>
		<div class="flex flex-col gap-6 w-full">
			<!-- normal user settings -->
			<div class="text-3xl uppercase font-thin tracking-wider">
				{{ t('page.settings') }}
			</div>
			<div
				v-if="ready.users && user"
				class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
			>
				<!-- profile -->
				<panel>
					<div class="flex flex-col items-center">
						<icon-user class="w-8 h-8 stroke-1.5 mb-2" />
						<div class="text-xl uppercase font-light tracking-widest">{{ t('page.profile') }}</div>
						<div class="text-blade-500">{{ t('text.customizeProfile') }}</div>
					</div>
					<div class="flex flex-col gap-2">
						<label class="flex flex-col gap-1">
							<span>{{ t('field.name') }}</span>
							<input
								type="text"
								v-model="profile.name"
								placeholder="john doe"
							/>
						</label>
						<label class="flex flex-col gap-1">
							<div class="flex gap-4">
								<span>{{ t('field.email') }}</span>
								<span v-if="userObject.emailVerified" class="flex items-center gap-1 text-spring-600">
									<icon-check class="w-5 h-5 stroke-1.5" /> {{ t('text.verified') }}
								</span>
								<span v-else class="flex items-center gap-1 text-rose-500">
									<icon-x class="w-5 h-5 stroke-1.5" /> {{ t('text.unverified') }}
								</span>
							</div>
							<div class="flex">
								<input
									type="text"
									v-model="profile.email"
									class="grow"
									placeholder="john@doe.com"
									disabled
								/>
								<secondary-button
									v-if="!userObject.emailVerified"
									:class="{ disabled: verificationResend }"
									:title="!verificationResend ? t('tooltip.resendVerification') : t('tooltip.verificationAlreadySent')"
									@click="!verificationResend ? resendEmailVerification() : null"
								>
									{{ t('button.verify') }}
									<icon-send v-if="!verificationResend" class="w-5 h-5 stroke-1.5" />
									<icon-check v-else class="w-5 h-5 stroke-1.5" />
								</secondary-button>
							</div>
						</label>
						<label class="flex flex-col gap-1">
							{{ t('field.photo') }}
							<div class="flex items-center gap-2">
								<input
									type="text"
									v-model="profile.photo"
									class="grow"
									placeholder="https://your-photo.link/image.png"
								/>
								<avatar :photo-url="profile.photo" :name="profile.name" size="md" />
							</div>
						</label>
					</div>
					<secondary-button @click="updateProfile" class="mt-auto self-start">
						{{ t('button.saveProfile') }}
						<icon-loader2 v-if="busy.profile" class="w-6 h-6 stroke-1.5 animate-spin" />
						<icon-device-floppy v-else class="w-6 h-6 stroke-1.5" />
					</secondary-button>
				</panel>
				<!-- SongDrive UI -->
				<panel v-if="ready.languages">
					<div class="flex flex-col items-center">
						<icon-palette class="w-8 h-8 stroke-1.5 mb-2" />
						<div class="text-xl uppercase font-light tracking-widest">{{ t('widget.appearance') }}</div>
						<div class="text-blade-500">{{ t('text.customizeUi') }}</div>
					</div>
					<div class="flex flex-col gap-2">
						<label class="flex flex-col gap-1">
							{{ t('field.language') }}
							<select v-model="lang">
								<option v-for="(label, key) in uiLanguages" :key="key" :value="key">
									{{ label }}
								</option>
							</select>
						</label>
						<label class="flex flex-col gap-1">
							{{ t('field.colorScheme') }}
							<select v-model="theme">
								<option v-for="(key, label) in colorSchemes" :key="key" :value="key">
									{{ t('option.' + label) }}
								</option>
							</select>
						</label>
					</div>
				</panel>
				<!-- account -->
				<panel>
					<div class="flex flex-col items-center">
						<icon-key class="w-8 h-8 stroke-1.5 mb-2" />
						<div class="text-xl uppercase font-light tracking-widest">{{ t('divider.account') }}</div>
						<div class="text-blade-500">{{ t('text.changeAccount') }}</div>
					</div>
					<div class="flex flex-col gap-8">
						<div>
							<div>{{ t('button.changePassword') }}</div>
							<div class="text-blade-500">{{ t('text.renewYourPassword') }}</div>
							<secondary-button @click="modal.passwordchange = true" class="mt-2">
								{{ t('button.changePassword') }}
								<icon-key class="w-6 h-6 stroke-1.5" />
							</secondary-button>
						</div>
						<zone-danger :label="t('text.dangerZone')">
							<div>
								<div>{{ t('button.changeEmail') }}</div>
								<div class="text-blade-500">{{ t('text.changeToAnotherEmail') }}</div>
								<secondary-button @click="modal.emailchange = true" type="danger" class="mt-2">
									{{ t('button.changeEmail') }}
									<icon-key class="w-6 h-6 stroke-1.5" />
								</secondary-button>
							</div>
							<div>
								<div>{{ t('button.deleteAccount') }}</div>
								<div class="text-blade-500">{{ t('text.deleteYourAccount') }}</div>
								<secondary-button @click="modal.accountdelete = true" type="danger" class="mt-2">
									{{ t('button.deleteAccount') }}
									<icon-trash class="w-6 h-6 stroke-1.5" />
								</secondary-button>
							</div>
						</zone-danger>
					</div>
				</panel>
			</div>
			<!-- administration settings -->
			<div v-if="isAdmin" class="text-3xl uppercase font-thin tracking-wider">
				{{ t('page.administration') }}
			</div>
			<div
				v-if="isAdmin"
				class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
			>
				<!-- user administration -->
				<panel>
					<div class="relative flex flex-col items-center">
						<icon-users class="w-8 h-8 stroke-1.5 mb-2" />
						<div class="text-xl uppercase font-light tracking-widest">{{ Object.keys(users).length }} {{ t('widget.users') }}</div>
						<div class="text-blade-500">{{ t('text.manageConfirmedUsers') }}</div>
						<secondary-button
							class="absolute top-0 right-0"
							:title="t('modal.addUser')"
							@click="addUser"
						>
							<icon-plus class="w-6 h-6 stroke-1.5" />
						</secondary-button>
					</div>
					<div class="flex flex-col">
						<div
							v-for="u in sortedUsers" :key="u.id"
							class="flex gap-2 p-2 hover:bg-blade-200 dark:hover:bg-blade-800"
						>
							<avatar class="shrink-0" :photo-url="u.photo" :name="u.name" size="md" />
							<div class="flex flex-col overflow-hidden mr-auto">
								<div class="-mt-1 truncate">{{ u.name }}</div>
								<div class="text-sm text-blade-500 -mt-1 truncate">{{ u.email }}</div>
							</div>
							<div v-if="permissions[u.id]" class="self-center rounded-sm bg-blade-300 dark:bg-blade-700 py-0.5 px-1.5">
								{{ t('role.' + permissions[u.id].role) }}
							</div>
							<a
								:href="'mailto:' + u.email + '?' + confirmationMail(u.name)"
								class="flex items-center text-spring-600 hover:bg-opacity-80"
								:title="t('tooltip.sendConfirmationMail')"
							>
								<icon-mail class="w-5 h-5 stroke-1.5" />
							</a>
							<button
								class="flex items-center text-spring-600 hover:bg-opacity-80"
								:title="t('modal.editUser')"
								@click.prevent="editUser(u)"
							>
								<icon-edit class="w-5 h-5 stroke-1.5" />
							</button>
							<button
								v-if="numberOfUsers > 1"
								class="flex items-center text-rose-600 hover:bg-opacity-80"
								:title="t('modal.deleteUser')"
								@click.prevent="active.user=u; active.key=u.id; active.approved=true; modal.userdelete=true"
							>
								<icon-user-minus class="w-5 h-5 stroke-1.5" />
							</button>
						</div>
					</div>
					<div v-if="Object.keys(registrations).length == 0" class="flex flex-col justify-center items-center gap-2">
						<icon-checkbox class="text-blade-500 w-12 h-12 stroke-1" />
						<p class="text-xl uppercase font-light tracking-widest">{{ t('text.noUnconfirmedUsers') }}</p>
						<p class="text-blade-500">{{ t('text.goodWork') }}</p>
					</div>
					<div v-else class="flex flex-col items-center">
						<div class="text-xl uppercase font-light tracking-widest">
							{{ Object.keys(registrations).length }} {{ t('widget.registrations') }}
						</div>
						<div class="text-blade-500">{{ t('text.manageUnconfirmedUsers') }}</div>
					</div>
					<div class="flex flex-col">
						<div
							v-for="(r, k) in registrations" :key="k"
							class="flex gap-2 p-2 hover:bg-blade-200 dark:hover:bg-blade-800"
						>
							<avatar class="shrink-0" size="md" />
							<div class="flex flex-col overflow-hidden mr-auto">
								<div class="-mt-1 truncate">{{ r.name }}</div>
								<div class="text-sm text-blade-500 -mt-1 truncate">{{ r.email }}</div>
							</div>
							<div class="self-center rounded-sm bg-blade-300 dark:bg-blade-700 py-0.5 px-1.5">
								{{ t('role.unconfirmed') }}
							</div>
							<button
								class="flex items-center text-spring-600 hover:bg-opacity-80"
								:title="t('tooltip.approveUser')"
								@click.prevent="addRegistration(r, k)"
							>
								<icon-user-plus class="w-5 h-5 stroke-1.5" />
							</button>
							<button
								class="flex items-center text-rose-600 hover:bg-opacity-80"
								:title="t('modal.deleteUser')"
								@click.prevent="active.user=r; active.key=k; active.approved=false; modal.userdelete=true"
							>
								<icon-user-minus class="w-5 h-5 stroke-1.5" />
							</button>
						</div>
					</div>
				</panel>
				<!-- language administration -->
				<panel>
					<div class="relative flex flex-col items-center">
						<icon-language class="w-8 h-8 stroke-1.5 mb-2" />
						<div class="text-xl uppercase font-light tracking-widest">
							{{ t('widget.languages', numberOfLanguages, [numberOfLanguages]) }}
						</div>
						<div class="text-blade-500">{{ t('text.manageLanguages') }}</div>
						<secondary-button
							class="absolute top-0 right-0"
							:title="t('modal.addLanguage')"
							@click="active.language={ label: '' }; active.key=''; active.existing=false; modal.languageset=true"
						>
							<icon-plus class="w-6 h-6 stroke-1.5" />
						</secondary-button>
					</div>
					<div class="flex flex-col">
						<div
							v-for="(l, key) in languages" :key="key"
							class="flex gap-2 p-2 hover:bg-blade-200 dark:hover:bg-blade-800"
						>
							<figure
								class="flex justify-center items-center bg-blade-300 dark:bg-blade-700 font-mono py-1 px-2"
								alt="Avatar"
							>
								{{ key.substring(0,2).toUpperCase()}}
							</figure>
							<div class="self-center flex flex-col overflow-hidden mr-auto">
								<div class="truncate">{{ l.label }}</div>
							</div>
							<button
								class="flex items-center text-spring-600 hover:bg-opacity-80"
								:title="t('modal.editLanguage')"
								@click="active.language=l; active.key=key; active.existing=true; modal.languageset=true"
							>
								<icon-edit class="w-5 h-5 stroke-1.5" />
							</button>
							<button
								class="flex items-center text-rose-600 hover:bg-opacity-80"
								:title="t('modal.deleteLanguage')"
								@click="active.language=l; active.key=key; modal.languagedelete=true;"
							>
								<icon-trash class="w-5 h-5 stroke-1.5" />
							</button>
						</div>
					</div>
				</panel>
				<!-- tag administration -->
				<panel>
					<div class="relative flex flex-col items-center">
						<icon-tags class="w-8 h-8 stroke-1.5 mb-2" />
						<div class="text-xl uppercase font-light tracking-widest">
							{{ t('widget.tags', numberOfTags, [numberOfTags]) }}
						</div>
						<div class="text-blade-500">{{ t('text.manageTags') }}</div>
						<secondary-button
							class="absolute top-0 right-0"
							:title="t('modal.addTag')"
							@click="active.tag={ key: '' }; active.key=''; active.existing=false; modal.tagset=true"
						>
							<icon-plus class="w-6 h-6 stroke-1.5" />
						</secondary-button>
					</div>
					<div class="flex flex-wrap justify-start items-center gap-2">
						<tag
							v-for="tag in sortTags(tags, locale)" :key="tag.key"
							:tag="tag"
							class="cursor-pointer hover:bg-spring-400 hover:dark:!bg-spring-700"
							@click="active.tag=tag; active.key=tag.key; active.existing=true; modal.tagset=true"
						/>
					</div>
				</panel>
				<!-- configuration -->
				<panel>
					<div class="relative flex flex-col items-center">
						<icon-settings class="w-8 h-8 stroke-1.5 mb-2" />
						<div class="text-xl uppercase font-light tracking-widest">{{ t('widget.configuration') }}</div>
						<div class="text-blade-500">{{ t('text.configureApp') }}</div>
					</div>
					<div v-if="ready.config" class="flex flex-col gap-2">
						<label class="flex flex-col gap-1">
							<span>{{ t('field.supportEmail') }}</span>
							<input
								type="text"
								v-model="configuration.contact.email"
								placeholder="support@domain.tld"
							/>
						</label>
					</div>
					<secondary-button @click="updateConfig" class="mt-auto self-start">
						{{ t('button.saveConfig') }}
						<icon-loader2 v-if="busy.config" class="w-6 h-6 stroke-1.5 animate-spin" />
						<icon-device-floppy v-else class="w-6 h-6 stroke-1.5" />
					</secondary-button>
				</panel>
				<!-- backup administration -->
				<panel>
					<div class="flex flex-col items-center">
						<icon-server-bolt class="w-8 h-8 stroke-1.5 mb-2" />
						<div class="text-xl uppercase font-light tracking-widest">{{ t('widget.backup') }}</div>
						<div class="text-blade-500">{{ t('text.exportImportData') }}</div>
					</div>
					<div class="flex flex-col gap-8">
						<div>
							<div>{{ t('text.exportData') }}</div>
							<div class="text-blade-500">{{ t('text.saveAll')}}</div>
							<secondary-button @click="exportDb" class="mt-2">
								{{ t('button.export') }}
								<icon-loader2 v-if="busy.export" class="w-6 h-6 stroke-1.5 animate-spin" />
								<icon-archive v-else class="w-6 h-6 stroke-1.5" />
							</secondary-button>
						</div>
						<zone-danger :label="t('text.dangerZone')">
							<div>
								<div>{{ t('text.importData') }}</div>
								<div class="text-blade-500">{{ t('text.importAndOverwrite')}}</div>
								<secondary-button @click="modal.importdata=true" type="danger" class="mt-2">
									{{ t('button.import') }}
									<icon-download class="w-6 h-6 stroke-1.5" />
								</secondary-button>
							</div>
						</zone-danger>
					</div>
				</panel>
			</div>
		</div>
		<!-- modal: change password -->
		<password-change
			:active="modal.passwordchange"
			@closed="modal.passwordchange = false"
		/>
		<!-- modal: change email -->
		<email-change
			:active="modal.emailchange"
			@closed="modal.emailchange = false"
		/>
		<!-- modal: delete own account -->
		<account-delete
			:active="modal.accountdelete"
			@closed="modal.accountdelete = false"
		/>
		<!-- modal: set user -->
		<user-set
			:active="modal.userset"
			:user-id="active.userId"
			:initial-user="active.user"
			:role="active.role"
			:state="active.state"
			@started="emit('started')"
			@closed="modal.userset = false"
		/>
		<!-- modal: delete user -->
		<user-delete
			:active="modal.userdelete"
			:user-name="active.user.name"
			:user-key="active.key"
			:approved="active.approved"
			:users="users"
			:setlists="setlists"
			@closed="modal.userdelete = false"
		/>
		<!-- modal: set language -->
		<language-set
			:active="modal.languageset"
			:existing="active.existing"
			:initial-language="active.language"
			:language-key="active.key"
			@closed="modal.languageset = false"
		/>
		<!-- modal: delete language -->
		<language-delete
			:active="modal.languagedelete"
			:language-name="active.language.label"
			:language-key="active.key"
			:songs="songs"
			@closed="modal.languagedelete = false"
		/>
		<!-- modal: set tag -->
		<tag-set
			:active="modal.tagset"
			:existing="active.existing"
			:initial-tag="active.tag"
			:tag-key="active.key"
			:ui-languages="uiLanguages"
			@closed="modal.tagset = false"
		/>
		<!-- modal: import data -->
		<import-data
			:active="modal.importdata"
			@closed="modal.importdata = false"
		/>
	</div>
</template>

<script setup>
import { download, throwError, sortTags } from '@/utils.js';
import { notify } from '@kyvg/vue3-notification';
import { ref, reactive, computed, watch, inject, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import AccountDelete from '@/modals/AccountDelete.vue';
import Avatar from '@/elements/Avatar.vue';
import EmailChange from '@/modals/EmailChange.vue';
import { updateDoc, doc, setDoc } from 'firebase/firestore';
import { getAuth, sendEmailVerification, updateProfile as fbUpdateProfile } from "firebase/auth";
import ImportData from '@/modals/ImportData.vue';
import LanguageDelete from '@/modals/LanguageDelete.vue';
import LanguageSet from '@/modals/LanguageSet.vue';
import Panel from '@/elements/Panel.vue';
import PasswordChange from '@/modals/PasswordChange.vue';
import SecondaryButton from '@/elements/SecondaryButton.vue';
import Tag from '@/elements/Tag.vue';
import TagSet from '@/modals/TagSet.vue';
import UserDelete from '@/modals/UserDelete.vue';
import UserSet from '@/modals/UserSet.vue';
import ZoneDanger from '@/elements/ZoneDanger.vue';

// icons
import {
	IconArchive,
	IconCheckbox,
	IconCheck,
	IconDeviceFloppy,
	IconDownload,
	IconEdit,
	IconKey,
	IconLanguage,
	IconLoader2,
	IconMail,
	IconPalette,
	IconPlus,
	IconSend,
	IconServerBolt,
	IconSettings,
	IconTags,
	IconTrash,
	IconUser,
	IconUserMinus,
	IconUserPlus,
	IconUsers,
	IconX,
} from '@tabler/icons-vue';

// component constants
const { t, locale, availableLocales } = useI18n({ useScope: 'global' });

// global properties
const fb = inject('firebaseApp');
const db = inject('db');
const fbAuth = getAuth(fb);

// component properties
const props = defineProps({
  user:           String,
  userObject:     Object,
  ready:          Object,
  role:           Number,
  config:         Object,
  languages:      Object,
  permissions:    Object,
  registrations:  Object,
  setlists:       Object,
  songs:          Object,
  tags:           Object,
  users:          Object,
});

// remember when verification was already send
const verificationResend = ref(false);

// profile input data
const profile = reactive({
	name: null,
	email: null,
	photo: null
});

// permission input data
const permission = reactive({
	role: null,
});

// configuration input data
const configuration = reactive({
	contact: {
		email: props.config?.contact?.email
	}
});

// modal display state
const modal = reactive({
	passwordchange: false,
	emailchange: false,
	accountdelete: false,
	userset: false,
	userdelete: false,
	languageset: false,
	languagedelete: false,
	tagset: false,
	importdata: false,
});

// modal input data
const active = reactive({
	userId: '',
	user: {},
	role: '',
	state: '',
	language: {},
	tag: {},
	key: '',
	existing: true,
	approved: true
});

// busy indicators
const busy = reactive({
	profile: false,
	config: false,
	export: false,
});

// emits
const emit = defineEmits(['started']);

// initially load profile data
onMounted(() => {
	loadProfile();
});

// check user role
const isAdmin = computed(() => {
	return props.ready.users && props.ready.permissions && props.user && props.userObject && props.role === 4
});

// load profile data
const loadProfile = () => {
	if (props.ready.users && props.user) {
		profile.name = props.users[props.user].name;
		profile.email = props.users[props.user].email;
		profile.photo = props.users[props.user].photo;
		permission.role = props.permissions[props.user].role;
	}
};

// resend email with verification link to currently logged in user
const resendEmailVerification = () => {
	sendEmailVerification(fbAuth.currentUser).then(() => {
		notify({
			title: t('toast.verficationSent'),
			text: t('toast.verficationSentText'),
			type: 'primary'
		});
		verificationResend.value = true;
	}).catch((error) => throwError(error));
};

// save profile data
const updateProfile = () => {
	busy.profile = true;
	fbUpdateProfile(props.userObject, {
			displayName: profile.name,
			photoUrl: profile.photo,
	}).then(() => {
		// update user object
		updateDoc(doc(db, `users/${props.user}`), profile).then(() => {
			// updated successfully
			notify({
				title: t('toast.userUpdated'),
				text: t('toast.userUpdatedText'),
				type: 'primary'
			});
			busy.profile = false;
		}).catch((error) => throwError(error));
	}, (error) => throwError(error));
};

// save configration
const updateConfig = () => {
	busy.config = true;
	setDoc(doc(db, `config/contact`), { email: configuration.contact.email }).then(() => {
		// Config updated successfully!
		notify({
			title: t('toast.configUpdated'),
			text: t('toast.configUpdatedText'),
			type: 'primary'
		});
		busy.config = false;
	}).catch((error) => throwError(error));
};

// provoke confirmation mail mailto
const confirmationMail = (name) => {
	return 'subject=' + encodeURIComponent(t('text.confirmationSubject'))
		+ '&body=' + encodeURIComponent(t('text.confirmationBody', [name, window.location.origin]))
};

// show modal to add user
const addUser = () => {
	active.userId = '';
	active.user.name = '';
	active.user.email = '';
	active.role = 'reader';
	active.state = 'new';
	modal.userset = true;
};

// show modal to edit user
const editUser = (user) => {
	active.userId = user.id;
	active.user.name = user.name;
	active.user.email = user.email;
	active.role = props.permissions[user.id].role;
	active.state = 'confirmed';
	modal.userset = true;
};

// show modal to add new registration
const addRegistration = (user, id) => {
	active.userId = id;
	active.user.name = user.name;
	active.user.email = user.email;
	active.role = 'reader';
	active.state = 'registered';
	modal.userset = true;
};

// show modal to export database colections
const exportDb = () => {
	busy.export = true;
	let data = {
		'config': configuration,
		'songs': props.songs,
		'setlists': props.setlists,
		'users': props.users,
		'registrations': props.registrations,
		'tags': props.tags,
		'languages': props.languages
	};
	download(JSON.stringify(data), (new Date().toJSON().slice(0,10).replace(/-/g, '')) + '_songdrive.json');
	// toast success message
	notify({
		title: t('toast.databaseExported'),
		text: t('toast.databaseExportedText'),
		type: 'primary'
	});
	busy.export = false;
};

// get ui language code and names
const uiLanguages = computed(() => {
	let uiLanguages = {};
	availableLocales.forEach(key => {
		if (props.languages[key]) {
			uiLanguages[key] = props.languages[key].label;
		}
	});
	return uiLanguages;
});
const initLang = !('lang' in localStorage) ? locale.value : localStorage.getItem('lang');
const lang = ref(initLang);
watch(lang, (newValue) => {
	locale.value = newValue;
	localStorage.setItem('lang', newValue);
});

// handle theme mode
const colorSchemes = {
	auto:  1,
	dark:  2,
	light: 3,
};
const initialTheme = !('theme' in localStorage) ? colorSchemes.auto : colorSchemes[localStorage.theme]
const theme = ref(initialTheme);
watch(theme, (newValue) => {
	switch (newValue) {
		case colorSchemes.dark:
			localStorage.theme = 'dark';
			document.documentElement.classList.add('dark');
			break;
		case colorSchemes.light:
			localStorage.theme = 'light';
			document.documentElement.classList.remove('dark');
			break;
		case colorSchemes.auto:
			localStorage.removeItem('theme');
			if (!window.matchMedia('(prefers-color-scheme: dark)').matches) {
				document.documentElement.classList.remove('dark');
			} else {
				document.documentElement.classList.add('dark');
			}
			break;
		default:
			break;
	}
});

// total number of song tags
const numberOfTags = computed(() => {
	return Object.keys(props.tags).length;
});

// total number of song languages
const numberOfLanguages = computed(() => {
	return Object.keys(props.languages).length;
});

// total number of users
const numberOfUsers = computed(() => {
	return Object.keys(props.users).length;
});

// sort user list by name
const sortedUsers = computed(() => {
	const users = [];
	for (const id in props.users) {
		if (Object.hasOwnProperty.call(props.users, id)) {
			users.push({ id: id, ...props.users[id] });
		}
	}
	users.sort((a,b) => a.name > b.name);
	return users;
});

// update configuration
watch(
	() => props.config,
	() => { configuration.contact.email = props.config.contact.email; }
)
</script>
