<template>
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
					<ion-icon :icon="personOutline" class="w-8 h-8 mb-2" />
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
								<ion-icon :icon="checkmarkOutline" /> {{ t('text.verified') }}
							</span>
							<span v-else class="flex items-center gap-1 text-rose-500">
								<ion-icon :icon="closeOutline" /> {{ t('text.unverified') }}
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
								<ion-icon v-if="!verificationResend" :icon="sendOutline" />
								<ion-icon v-else :icon="checkmarkOutline" />
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
					<ion-icon :icon="saveOutline" class="w-6 h-6" />
				</secondary-button>
			</panel>
			<!-- SongDrive UI -->
			<panel v-if="ready.languages">
				<div class="flex flex-col items-center">
					<ion-icon :icon="colorPaletteOutline" class="w-8 h-8 mb-2" />
					<div class="text-xl uppercase font-light tracking-widest">{{ t('widget.appearance') }}</div>
					<div class="text-blade-500">{{ t('text.customizeUi') }}</div>
				</div>
				<div class="flex flex-col gap-2">
					<label class="flex flex-col gap-1">
						{{ t('field.language') }}
						<select v-model="locale">
							<option v-for="(label, key) in uiLanguages" :key="key" :value="key">
								{{ label }}
							</option>
						</select>
					</label>
				</div>
			</panel>
			<!-- account -->
			<panel>
				<div class="flex flex-col items-center">
					<ion-icon :icon="keyOutline" class="w-8 h-8 mb-2" />
					<div class="text-xl uppercase font-light tracking-widest">{{ t('divider.account') }}</div>
					<div class="text-blade-500">{{ t('text.changeAccount') }}</div>
				</div>
				<div class="flex flex-col gap-8">
					<div>
						<div>{{ t('button.changePassword') }}</div>
						<div class="text-blade-500">{{ t('text.renewYourPassword') }}</div>
						<secondary-button @click="modal.passwordchange = true" class="mt-2">
							{{ t('button.changePassword') }}
							<ion-icon :icon="keyOutline" class="w-6 h-6" />
						</secondary-button>
					</div>
					<zone-danger :label="t('text.dangerZone')">
						<div>
							<div>{{ t('button.changeEmail') }}</div>
							<div class="text-blade-500">{{ t('text.changeToAnotherEmail') }}</div>
							<secondary-button @click="modal.emailchange = true" type="danger" class="mt-2">
								{{ t('button.changeEmail') }}
								<ion-icon :icon="keyOutline" class="w-6 h-6" />
							</secondary-button>
						</div>
						<div>
							<div>{{ t('button.deleteAccount') }}</div>
							<div class="text-blade-500">{{ t('text.deleteYourAccount') }}</div>
							<secondary-button @click="modal.accountdelete = true" type="danger" class="mt-2">
								{{ t('button.deleteAccount') }}
								<ion-icon :icon="trashOutline" class="w-6 h-6" />
							</secondary-button>
						</div>
					</zone-danger>
				</div>
			</panel>
		</div>
		<!-- administration settings -->
		<div class="text-3xl uppercase font-thin tracking-wider">
			{{ t('page.administration') }}
		</div>
		<div
			v-if="ready.users && ready.permissions && user && userObject && role > 1"
			class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
		>
			<!-- user administration -->
			<panel>
				<div class="relative flex flex-col items-center">
					<ion-icon :icon="peopleOutline" class="w-8 h-8 mb-2" />
					<div class="text-xl uppercase font-light tracking-widest">{{ Object.keys(users).length }} {{ t('widget.users') }}</div>
					<div class="text-blade-500">{{ t('text.manageConfirmedUsers') }}</div>
					<secondary-button
						class="absolute top-0 right-0"
						:title="t('modal.addUser')"
						@click="
							active.userId = '';
							active.user = { name: '', email: '', password: '' };
							active.role = 'reader';
							active.state = 'new';
							modal.userset = true;
						"
					>
						<ion-icon :icon="addOutline" class="w-6 h-6" />
					</secondary-button>
				</div>
				<div class="flex flex-col">
					<div
						v-for="(u, k) in users" :key="k"
						class="flex gap-2 p-2 hover:bg-blade-200 dark:hover:bg-blade-800"
					>
						<avatar class="shrink-0" :photo-url="u.photo" :name="u.name" size="md" />
						<div class="flex flex-col overflow-hidden mr-auto">
							<div class="-mt-1 truncate">{{ u.name }}</div>
							<div class="text-sm text-blade-500 -mt-1 truncate">{{ u.email }}</div>
						</div>
						<div v-if="permissions[k]" class="self-center rounded-sm bg-blade-300 dark:bg-blade-700 py-0.5 px-1.5">
							{{ t('role.' + permissions[k].role) }}
						</div>
						<a
							:href="'mailto:' + u.email + '?' + confirmationMail(u.name)"
							class="flex items-center text-spring-600 hover:bg-opacity-80"
							:title="t('tooltip.sendConfirmationMail')"
						>
							<ion-icon :icon="mailOutline" class="w-5 h-5" />
						</a>
						<button
							class="flex items-center text-spring-600 hover:bg-opacity-80"
							:title="t('modal.editUser')"
							@click.prevent="
								active.userId = k;
								active.user = u;
								active.role = permissions[k].role;
								active.state = 'confirmed';
								modal.userset = true;
							"
						>
							<ion-icon :icon="createOutline" class="w-5 h-5" />
						</button>
						<button
							v-if="numberOfUsers > 1"
							class="flex items-center text-rose-600 hover:bg-opacity-80"
							:title="t('modal.deleteUser')"
							@click.prevent="active.user=u; active.key=k; active.approved=true; modal.userdelete=true"
						>
							<ion-icon :icon="personRemoveOutline" class="w-5 h-5" />
						</button>
					</div>
				</div>
				<div v-if="Object.keys(registrations).length == 0" class="flex flex-col justify-center items-center gap-2">
					<ion-icon :icon="checkboxOutline" class="text-blade-500 w-12 h-12" />
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
							@click.prevent="
								active.userId = k;
								active.user = r;
								active.role = 'reader';
								active.state = 'registered';
								modal.userset = true;
							"
						>
							<ion-icon :icon="personAddOutline" class="w-5 h-5" />
						</button>
						<button
							class="flex items-center text-rose-600 hover:bg-opacity-80"
							:title="t('modal.deleteUser')"
							@click.prevent="active.user=r; active.key=k; active.approved=false; modal.userdelete=true"
						>
							<ion-icon :icon="personRemoveOutline" class="w-5 h-5" />
						</button>
					</div>
				</div>
			</panel>
			<!-- language administration -->
			<panel>
				<div class="relative flex flex-col items-center">
					<ion-icon :icon="languageOutline" class="w-8 h-8 mb-2" />
					<div class="text-xl uppercase font-light tracking-widest">
						{{ t('widget.languages', numberOfLanguages, [numberOfLanguages]) }}
					</div>
					<div class="text-blade-500">{{ t('text.manageLanguages') }}</div>
					<secondary-button
						class="absolute top-0 right-0"
						:title="t('modal.addLanguage')"
						@click="active.language={ label: '' }; active.key=''; active.existing=false; modal.languageset=true"
					>
						<ion-icon :icon="addOutline" class="w-6 h-6" />
					</secondary-button>
				</div>
				<div class="flex flex-col">
					<div
						v-for="(l, key) in languages" :key="key"
						class="flex gap-2 p-2 hover:bg-blade-200 dark:hover:bg-blade-800"
					>
						<figure
							class="flex justify-center items-center bg-blade-300 dark:bg-blade-700 font-semibold py-1 px-2"
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
							<ion-icon :icon="createOutline" class="w-5 h-5" />
						</button>
						<button
							class="flex items-center text-rose-600 hover:bg-opacity-80"
							:title="t('modal.deleteLanguage')"
							@click="active.language=l; active.key=key; modal.languagedelete=true;"
						>
							<ion-icon :icon="trashOutline" class="w-5 h-5" />
						</button>
					</div>
				</div>
			</panel>
			<!-- tag administration -->
			<panel>
				<div class="relative flex flex-col items-center">
					<ion-icon :icon="pricetagsOutline" class="w-8 h-8 mb-2" />
					<div class="text-xl uppercase font-light tracking-widest">
						{{ t('widget.tags', numberOfTags, [numberOfTags]) }}
					</div>
					<div class="text-blade-500">{{ t('text.manageTags') }}</div>
					<secondary-button
						class="absolute top-0 right-0"
						:title="t('modal.addTag')"
						@click="active.tag={ key: '' }; active.key=''; active.existing=false; modal.tagset=true"
					>
						<ion-icon :icon="addOutline" class="w-6 h-6" />
					</secondary-button>
				</div>
				<div class="flex flex-wrap justify-start items-center gap-2">
					<div
						v-for="tag in tags" :key="tag.key"
						class="cursor-pointer rounded flex items-center bg-blade-300 dark:bg-blade-750 hover:bg-spring-700 gap-2 py-0.5 px-2"
						@click="active.tag=tag; active.key=tag.key; active.existing=true; modal.tagset=true"
					>
						<ion-icon :icon="pricetagOutline" class="w-4 h-4" />
						{{ tag[locale] ? tag[locale] : tag.key }}
					</div>
				</div>
			</panel>
			<!-- configuration -->
			<panel>
				<div class="relative flex flex-col items-center">
					<ion-icon :icon="cogOutline" class="w-8 h-8 mb-2" />
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
					<ion-icon :icon="saveOutline" class="w-6 h-6" />
				</secondary-button>
			</panel>
				<!-- backup administration -->
				<div class="column col-4 col-xl-6 col-md-12 mt-4">
					<div class="panel mb-4">
						<div class="panel-header text-center">
							<ion-icon :icon="fileTrayOutline" class="icon-2x" />
							<div class="panel-title h5 mt-1">{{ t('widget.backup') }}</div>
							<div class="panel-subtitle text-gray">{{ t('text.exportImportData') }}</div>
						</div>
						<div class="panel-body">
							<div class="mt-2">
								<div>{{ t('text.exportData') }}</div>
								<div class="text-gray">{{ t('text.saveAll')}}</div>
								<button class="btn btn-secondary text-uppercase mt-2" @click="exportDb">
									<ion-icon :icon="archiveOutline" class="w-6 h-6" /> {{ t('button.export') }}
								</button>
							</div>
							<div class="zone zone-danger" data-title="Danger Zone">
								<div>{{ t('text.importData') }}</div>
								<div class="text-gray">{{ t('text.importAndOverwrite')}}</div>
								<button class="btn btn-error-secondary text-uppercase mt-2" @click="modal.importdata=true">
									<ion-icon :icon="downloadOutline" class="w-6 h-6" /> {{ t('button.import') }}
								</button>
							</div>
							
						</div>
					</div>
				</div>
		</div>
		<!-- modal: change password -->
		<password-change
			v-if="modal.passwordchange"
			:active="modal.passwordchange"
			@closed="modal.passwordchange = false"
		/>
		<!-- modal: change email -->
		<email-change
			v-if="modal.emailchange"
			:active="modal.emailchange"
			@closed="modal.emailchange = false"
		/>
		<!-- modal: delete own account -->
		<account-delete
			v-if="modal.accountdelete"
			:active="modal.accountdelete"
			@closed="modal.accountdelete = false"
		/>
		<!-- modal: set user -->
		<user-set
			v-if="modal.userset"
			:active="modal.userset"
			:userId="active.userId"
			:initialUser="active.user"
			:role="active.role"
			:state="active.state"
			@started="emit('started')"
			@closed="modal.userset = false"
		/>
		<!-- modal: delete user -->
		<user-delete
			v-if="modal.userdelete"
			:active="modal.userdelete"
			:userName="active.user.name"
			:userKey="active.key"
			:approved="active.approved"
			:users="users"
			:setlists="setlists"
			@closed="modal.userdelete = false"
		/>
		<!-- modal: set language -->
		<language-set
			v-if="modal.languageset"
			:active="modal.languageset"
			:existing="active.existing"
			:initialLanguage="active.language"
			:languageKey="active.key"
			@closed="modal.languageset = false"
		/>
		<!-- modal: delete language -->
		<language-delete
			v-if="modal.languagedelete"
			:active="modal.languagedelete"
			:languageName="active.language.label"
			:languageKey="active.key"
			:songs="songs"
			@closed="modal.languagedelete = false"
		/>
		<!-- modal: set tag -->
		<tag-set
			v-if="modal.tagset"
			:active="modal.tagset"
			:existing="active.existing"
			:initialTag="active.tag"
			:tagKey="active.key"
			:uiLanguages="uiLanguages"
			@closed="modal.tagset = false"
		/>
		<!-- modal: import data -->
		<import-data
			v-if="modal.importdata"
			:active="modal.importdata"
			@closed="modal.importdata = false"
		/>
	</div>
</template>

<script setup>
import Panel from '@/elements/Panel';
import ZoneDanger from '@/elements/ZoneDanger';
import SecondaryButton from '@/elements/SecondaryButton';
import { ref, reactive, computed, watch, inject, onMounted } from 'vue';
import { useI18n } from "vue-i18n";
import { notify } from '@kyvg/vue3-notification';
import { download, initials, throwError } from '@/utils.js';
import PasswordChange from '@/modals/PasswordChange';
import EmailChange from '@/modals/EmailChange';
import AccountDelete from '@/modals/AccountDelete';
import UserSet from '@/modals/UserSet';
import UserDelete from '@/modals/UserDelete';
import LanguageSet from '@/modals/LanguageSet';
import LanguageDelete from '@/modals/LanguageDelete';
import TagSet from '@/modals/TagSet';
import ImportData from '@/modals/ImportData';
import firebase from 'firebase/compat/app';
import {
	addOutline,
	archiveOutline,
	checkboxOutline,
	checkmarkOutline,
	closeOutline,
	cogOutline,
	colorPaletteOutline,
	createOutline,
	downloadOutline,
	fileTrayOutline,
	keyOutline,
	languageOutline,
	mailOutline,
	peopleOutline,
	person,
	personAddOutline,
	personOutline,
	personRemoveOutline,
	pricetagOutline,
	pricetagsOutline,
	saveOutline,
	sendOutline,
	trashOutline
} from 'ionicons/icons';
import Avatar from '@/elements/Avatar.vue';
const { t, locale, availableLocales } = useI18n({ useScope: 'global' });

// global properties
const db = inject('db');

// inherited properties
const props = defineProps({
  user:           String,
  userObject:     Object,
  ready:          Object,
  roleName:       String,
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

// reactive data
const verificationResend = ref(false);
const profile = reactive({
	name: null,
	email: null,
	photo: null
});
const permission = reactive({
	role: null,
});
const configuration = reactive({
	contact: {
		email: props.config?.contact?.email
	}
});
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

// emits
const emit = defineEmits(['started'])

// mounted
onMounted(() => {
	loadProfile();
});

// methods
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
	firebase.auth().currentUser.sendEmailVerification().then(() => {
		notify({
			title: t('toast.verficationSent'),
			text: t('toast.verficationSentText'),
			type: 'primary'
		});
		verificationResend.value = true;
	}).catch((error) => throwError(error));
};
const updateProfile = () => {
	props.userObject.updateProfile({
			displayName: profile.name,
			email: profile.email
	}).then(() => {
		// first update user object
		db.collection('users').doc(props.user).update(profile).then(() => {
			// then update permissions for this user
			db.collection('permissions').doc(props.user).update(permission).then(() => {
				// updated successfully
				notify({
					title: t('toast.userUpdated'),
					text: t('toast.userUpdatedText'),
					type: 'primary'
				});
			}).catch((error) => throwError(error));
		}).catch((error) => throwError(error));
	}, (error) => throwError(error));
};
const updateConfig = () => {
	db.collection('config').doc('contact').update({
		email: configuration.contact.email
	}).then(() => {
		// Config updated successfully!
		notify({
			title: t('toast.configUpdated'),
			text: t('toast.configUpdatedText'),
			type: 'primary'
		});
	}).catch((error) => throwError(error));
};
const confirmationMail = (name) => {
	return 'subject=' + encodeURIComponent(t('text.confirmationSubject'))
		+ '&body=' + encodeURIComponent(t('text.confirmationBody', [name, window.location.origin]))
};
const exportDb = () => {
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
};

// computed
const uiLanguages = computed(() => {
	let uiLanguages = {};
	availableLocales.forEach(key => {
		if (props.languages[key]) {
			uiLanguages[key] = props.languages[key].label;
		}
	})
	return uiLanguages;
});
const numberOfTags = computed(() => {
	return Object.keys(props.tags).length;
});
const numberOfLanguages = computed(() => {
	return Object.keys(props.languages).length;
});
const numberOfUsers = computed(() => {
	return Object.keys(props.users).length;
});

// watcher
watch(
	() => props.config,
	() => { configuration.contact.email = props.config.contact.email; }
)
</script>
