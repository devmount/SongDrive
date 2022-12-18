<template>
	<div class="settings">
		<div class="container no-sidebar">
			<div class="columns">
				<!-- heading -->
				<div class="column">
					<h2 class="view-title">
						{{ t('page.settings') }}
					</h2>
				</div>
			</div>
			<div v-if="ready.users && user" class="columns">
				<!-- profile -->
				<div class="column col-4 col-xl-6 col-md-12 mt-4">
					<div class="panel">
						<div class="panel-header text-center">
							<ion-icon :icon="personOutline" class="icon-2x"></ion-icon>
							<div class="panel-title h5 mt-1">{{ t('page.profile') }}</div>
							<div class="panel-subtitle text-gray">{{ t('text.customizeProfile') }}</div>
						</div>
						<div class="panel-body">
							<div class="form-group">
								<label class="form-label" for="name">{{ t('field.name') }}</label>
								<input
									v-model="profile.name"
									class="form-input"
									id="name"
									type="text"
									placeholder="john doe"
								/>
							</div>
							<div class="form-group">
								<label class="form-label" for="email">
									<span class="mr-4">{{ t('field.email') }}</span>
									<span v-if="userObject.emailVerified" class="text-success">
										<ion-icon :icon="checkmarkOutline"></ion-icon> {{ t('text.verified') }}
									</span>
									<span v-else class="text-error">
										<ion-icon :icon="closeOutline"></ion-icon> {{ t('text.unverified') }}
									</span>
								</label>
								<div class="input-group">
									<input
										v-model="profile.email"
										class="form-input"
										id="email"
										type="text"
										placeholder="john@doe.com"
										disabled
									/>
									<button
										v-if="!userObject.emailVerified"
										class="btn btn-primary input-group-btn tooltip"
										:class="{ disabled: verificationResend }"
										:data-tooltip="!verificationResend ? t('tooltip.resendVerification') : t('tooltip.verificationAlreadySent')"
										@click="!verificationResend ? resendEmailVerification() : null"
									>
										<ion-icon :icon="checkmarkOutline" v-if="!verificationResend"></ion-icon>
										<ion-icon :icon="checkmarkDoneOutline" v-else></ion-icon>
									</button>
								</div>
							</div>
							<div class="form-group mb-3">
								<div class="d-flex g-4">
									<div class="flex-grow">
										<label class="form-label" for="photo">{{ t('field.photo') }}</label>
										<input
											v-model="profile.photo"
											class="form-input "
											id="photo"
											type="text"
											placeholder="https://your-photo.link/image.png"
										/>
									</div>
									<div>
										<figure v-if="profile.photo" id="preview" class="avatar avatar-xxl">
											<img :src="profile.photo" alt="Avatar" />
										</figure>
										<figure
											v-else-if="profile.name"
											id="preview"
											class="avatar avatar-xxl"
											:data-initial="initials(profile.name)"
										></figure>
										<span v-else class="avatar avatar-xxl flex-center">
											<ion-icon :icon="person" class="icon-2x"></ion-icon>
										</span>
									</div>
								</div>
							</div>
						</div>
						<div class="panel-footer mt-5">
							<button class="btn btn-secondary text-uppercase" @click="updateProfile">
								<ion-icon :icon="saveOutline" class="icon-left"></ion-icon> {{ t('button.saveProfile') }}
							</button>
						</div>
					</div>
				</div>
				<!-- SongDrive UI -->
				<div class="column col-4 col-xl-6 col-md-12 mt-4">
					<div class="panel" v-if="ready.languages">
						<div class="panel-header text-center">
							<ion-icon :icon="colorPaletteOutline" class="icon-2x"></ion-icon>
							<div class="panel-title h5 mt-1">{{ t('widget.appearance') }}</div>
							<div class="panel-subtitle text-gray">{{ t('text.customizeUi') }}</div>
						</div>
						<div class="panel-body">
							<div class="form-group mb-1">
								<label class="form-label" for="language">{{ t('field.language') }}</label>
								<select v-model="locale" class="form-select" id="language">
									<option v-for="(label, key) in uiLanguages" :key="key" :value="key">
										{{ label }}
									</option>
								</select>
							</div>
						</div>
						<div class="panel-footer mt-5">
						</div>
					</div>
				</div>
				<!-- account -->
				<div class="column col-4 col-xl-6 col-md-12 mt-4">
					<div class="panel pb-4">
						<div class="panel-header text-center">
							<ion-icon :icon="keyOutline" class="icon-2x"></ion-icon>
							<div class="panel-title h5 mt-1">{{ t('divider.account') }}</div>
							<div class="panel-subtitle text-gray">{{ t('text.changeAccount') }}</div>
						</div>
						<div class="panel-body">
							<div class="mt-2">
								<div>{{ t('button.changePassword') }}</div>
								<div class="text-gray">{{ t('text.renewYourPassword') }}</div>
								<button class="btn btn-secondary text-uppercase mt-2" @click="modal.passwordchange = true">
									<ion-icon :icon="keyOutline" class="icon-left"></ion-icon> {{ t('button.changePassword') }}
								</button>
							</div>
							<div class="zone zone-danger" :data-title="t('text.dangerZone')">
								<div>{{ t('button.changeEmail') }}</div>
								<div class="text-gray">{{ t('text.changeToAnotherEmail') }}</div>
								<button class="btn btn-error-secondary text-uppercase mt-2" @click="modal.emailchange = true">
									<ion-icon :icon="keyOutline" class="icon-left"></ion-icon> {{ t('button.changeEmail') }}
								</button>
								<div class="mt-5">{{ t('button.deleteAccount') }}</div>
								<div class="text-gray">{{ t('text.deleteYourAccount') }}</div>
								<button class="btn btn-error-secondary text-uppercase mt-2" @click="modal.accountdelete = true">
									<ion-icon :icon="trashOutline" class="icon-left"></ion-icon> {{ t('button.deleteAccount') }}
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
			<!-- administration area -->
			<div v-if="ready.users && ready.permissions && user && userObject && role > 1" class="columns mt-4 pt-4">
				<div class="column col-12">
					<h2>
						{{ t('page.administration') }}
					</h2>
				</div>
				<!-- user administration -->
				<div class="column col-4 col-xl-6 col-md-12 mt-4">
					<div class="panel">
						<div class="panel-header text-center pos-relative">
							<ion-icon :icon="peopleOutline" class="icon-2x"></ion-icon>
							<div class="panel-title h5 mt-1">{{ Object.keys(users).length }} {{ t('widget.users') }}</div>
							<div class="panel-subtitle text-gray">{{ t('text.manageConfirmedUsers') }}</div>
							<div class="pos-absolute-tr">
								<button
									class="btn btn-secondary tooltip px-3 m-3"
									:data-tooltip="t('modal.addUser')"
									@click="
										active.userId = '';
										active.user = { name: '', email: '', password: '' };
										active.role = 'reader';
										active.state = 'new';
										modal.userset = true;
									"
								>
									<ion-icon :icon="addOutline"></ion-icon>
								</button>
							</div>
						</div>
						<div class="panel-body">
							<div
								v-for="(u, k) in users" :key="k"
								class="tile tile-centered tile-hover p-2"
							>
								<div class="tile-icon">
									<figure v-if="u.photo" class="avatar">
										<img :src="u.photo" alt="Avatar" />
									</figure>
									<figure
										v-else-if="u.name"
										class="avatar"
										:data-initial="initials(u.name)"
									></figure>
									<span v-else class="avatar flex-center">
										<ion-icon :icon="person"></ion-icon>
									</span>
								</div>
								<div class="tile-content">
									<span v-if="permissions[k]" class="label float-right py-1 px-2">{{ t('role.' + permissions[k].role) }}</span>
									<div class="tile-title">{{ u.name }}</div>
									<div class="tile-subtitle text-gray text-small">{{ u.email }}</div>
								</div>
								<div class="tile-action">
									<a
										:href="'mailto:' + u.email + '?' + confirmationMail(u.name)"
										class="btn btn-link btn-action tooltip"
										:data-tooltip="t('tooltip.sendConfirmationMail')"
									>
										<ion-icon :icon="mailOutline"></ion-icon>
									</a>
									<button
										class="btn btn-link btn-action tooltip"
										:data-tooltip="t('modal.editUser')"
										@click.prevent="
											active.userId = k;
											active.user = u;
											active.role = permissions[k].role;
											active.state = 'confirmed';
											modal.userset = true;
										"
									>
										<ion-icon :icon="createOutline"></ion-icon>
									</button>
									<button
										v-if="numberOfUsers > 1"
										class="btn btn-link btn-action tooltip text-error"
										:data-tooltip="t('modal.deleteUser')"
										@click.prevent="active.user=u; active.key=k; active.approved=true; modal.userdelete=true"
									>
										<ion-icon :icon="personRemoveOutline"></ion-icon>
									</button>
								</div>
							</div>
						</div>
						<div v-if="Object.keys(registrations).length == 0" class="empty">
							<div class="empty-icon">
								<ion-icon :icon="checkboxOutline" class="icon-4x"></ion-icon>
							</div>
							<p class="empty-title h5">{{ t('text.noUnconfirmedUsers') }}</p>
							<p class="empty-subtitle">{{ t('text.goodWork') }}</p>
						</div>
						<div v-else class="panel-footer mt-5">
							<div class="panel-title h5 mt-1 text-center">
								{{ Object.keys(registrations).length }} {{ t('widget.registrations') }}
							</div>
							<div class="panel-subtitle mb-4 text-gray text-center">{{ t('text.manageUnconfirmedUsers') }}</div>
							<div
								v-for="(r, k) in registrations" :key="k"
								class="tile tile-centered tile-hover p-2"
							>
								<div class="tile-icon">
									<div class="avatar bg-dark flex-center">
										<ion-icon :icon="personOutline"></ion-icon>
									</div>
								</div>
								<div class="tile-content">
									<span class="label float-right py-1 px-2">{{ t('role.unconfirmed') }}</span>
									<div class="tile-title">{{ r.name }}</div>
									<div class="tile-subtitle text-gray text-small">{{ r.email }}</div>
								</div>
								<div class="tile-action">
									<button
										class="btn btn-link btn-action tooltip"
										:data-tooltip="t('tooltip.approveUser')"
										@click.prevent="
											active.userId = k;
											active.user = r;
											active.role = 'reader';
											active.state = 'registered';
											modal.userset = true;
										"
									>
										<ion-icon :icon="personAddOutline"></ion-icon>
									</button>
									<button
										class="btn btn-link btn-action tooltip text-error"
										:data-tooltip="t('modal.deleteUser')"
										@click.prevent="active.user=r; active.key=k; active.approved=false; modal.userdelete=true"
									>
										<ion-icon :icon="personRemoveOutline"></ion-icon>
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
				<!-- language administration -->
				<div class="column col-4 col-xl-6 col-md-12 mt-4">
					<div class="panel">
						<div class="panel-header text-center pos-relative">
							<ion-icon :icon="languageOutline" class="icon-2x"></ion-icon>
							<div class="panel-title h5 mt-1">{{ t('widget.languages', numberOfLanguages, [numberOfLanguages]) }}</div>
							<div class="panel-subtitle text-gray">{{ t('text.manageLanguages') }}</div>
							<div class="pos-absolute-tr">
								<button
									class="btn btn-secondary tooltip px-3 m-3"
									:data-tooltip="t('modal.addLanguage')"
									@click="active.language={ label: '' }; active.key=''; active.existing=false; modal.languageset=true"
								>
									<ion-icon :icon="addOutline"></ion-icon>
								</button>
							</div>
						</div>
						<div class="panel-body">
							<div
								v-for="(l, key) in languages"
								:key="key"
								class="tile tile-centered tile-hover p-2"
							>
								<div class="tile-icon">
									<figure
										class="avatar avatar-secondary"
										:data-initial="key.substring(0,2).toUpperCase()"
										alt="Avatar"
									></figure>
								</div>
								<div class="tile-content">
									<div class="tile-title">{{ l.label }}</div>
								</div>
								<div class="tile-action">
									<button
										class="btn btn-link btn-action tooltip"
										:data-tooltip="t('modal.editLanguage')"
										@click="active.language=l; active.key=key; active.existing=true; modal.languageset=true"
									>
										<ion-icon :icon="createOutline"></ion-icon>
									</button>
									<button
										class="btn btn-link btn-action tooltip text-error"
										:data-tooltip="t('modal.deleteLanguage')"
										@click="active.language=l; active.key=key; modal.languagedelete=true;"
									>
										<ion-icon :icon="trashOutline"></ion-icon>
									</button>
								</div>
							</div>
						</div>
						<div class="panel-footer mt-5">
						</div>
					</div>
				</div>
				<!-- tag administration -->
				<div class="column col-4 col-xl-6 col-md-12 mt-4">
					<div class="panel">
						<div class="panel-header text-center pos-relative">
							<ion-icon :icon="pricetagsOutline" class="icon-2x"></ion-icon>
							<div class="panel-title h5 mt-1">{{ t('widget.tags', numberOfTags, [numberOfTags]) }}</div>
							<div class="panel-subtitle text-gray">{{ t('text.manageTags') }}</div>
							<div class="pos-absolute-tr">
								<button
									class="btn btn-secondary tooltip px-3 m-3"
									:data-tooltip="t('modal.addTag')"
									@click="active.tag={ key: '' }; active.key=''; active.existing=false; modal.tagset=true"
								>
									<ion-icon :icon="addOutline"></ion-icon>
								</button>
							</div>
						</div>
						<div class="panel-body">
							<a
								v-for="tag in tags"
								:key="tag.key"
								class="mr-2"
								@click="active.tag=tag; active.key=tag.key; active.existing=true; modal.tagset=true"
							>
								<span class="label px-2 py-1 my-1">
									<ion-icon :icon="pricetagOutline" class="icon-sm mr-1"></ion-icon>
									{{ tag[locale] ? tag[locale] : tag.key }}
								</span>
							</a>
						</div>
						<div class="panel-footer mt-5">
						</div>
					</div>
				</div>
				<!-- configuration -->
				<div class="column col-4 col-xl-6 col-md-12 mt-4">
					<div class="panel">
						<div class="panel-header text-center">
							<ion-icon :icon="cogOutline" class="icon-2x"></ion-icon>
							<div class="panel-title h5 mt-1">{{ t('widget.configuration') }}</div>
							<div class="panel-subtitle text-gray">{{ t('text.configureApp') }}</div>
						</div>
						<div class="panel-body">
							<div v-if="ready.config" class="form-group">
								<label class="form-label" for="supportEmail">{{ t('field.supportEmail') }}</label>
								<input
									v-model="configuration.contact.email"
									class="form-input"
									id="supportEmail"
									type="text"
									placeholder="support@domain.tld"
								/>
							</div>
						</div>
						<div class="panel-footer mt-5">
							<button class="btn btn-secondary text-uppercase" @click="updateConfig">
								<ion-icon :icon="saveOutline" class="icon-left"></ion-icon> {{ t('button.saveConfig') }}
							</button>
						</div>
					</div>
				</div>
				<!-- backup administration -->
				<div class="column col-4 col-xl-6 col-md-12 mt-4">
					<div class="panel mb-4">
						<div class="panel-header text-center">
							<ion-icon :icon="fileTrayOutline" class="icon-2x"></ion-icon>
							<div class="panel-title h5 mt-1">{{ t('widget.backup') }}</div>
							<div class="panel-subtitle text-gray">{{ t('text.exportImportData') }}</div>
						</div>
						<div class="panel-body">
							<div class="mt-2">
								<div>{{ t('text.exportData') }}</div>
								<div class="text-gray">{{ t('text.saveAll')}}</div>
								<button class="btn btn-secondary text-uppercase mt-2" @click="exportDb">
									<ion-icon :icon="archiveOutline" class="icon-left"></ion-icon> {{ t('button.export') }}
								</button>
							</div>
							<div class="zone zone-danger" data-title="Danger Zone">
								<div>{{ t('text.importData') }}</div>
								<div class="text-gray">{{ t('text.importAndOverwrite')}}</div>
								<button class="btn btn-error-secondary text-uppercase mt-2" @click="modal.importdata=true">
									<ion-icon :icon="downloadOutline" class="icon-left"></ion-icon> {{ t('button.import') }}
								</button>
							</div>
							
						</div>
					</div>
				</div>
			</div>
			<!-- modal: change password -->
			<PasswordChange
				v-if="modal.passwordchange"
				:active="modal.passwordchange"
				@closed="modal.passwordchange = false"
			/>
			<!-- modal: change email -->
			<EmailChange
				v-if="modal.emailchange"
				:active="modal.emailchange"
				@closed="modal.emailchange = false"
			/>
			<!-- modal: delete own account -->
			<AccountDelete
				v-if="modal.accountdelete"
				:active="modal.accountdelete"
				@closed="modal.accountdelete = false"
			/>
			<!-- modal: set user -->
			<UserSet
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
			<UserDelete
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
			<LanguageSet
				v-if="modal.languageset"
				:active="modal.languageset"
				:existing="active.existing"
				:initialLanguage="active.language"
				:languageKey="active.key"
				@closed="modal.languageset = false"
			/>
			<!-- modal: delete language -->
			<LanguageDelete
				v-if="modal.languagedelete"
				:active="modal.languagedelete"
				:languageName="active.language.label"
				:languageKey="active.key"
				:songs="songs"
				@closed="modal.languagedelete = false"
			/>
			<!-- modal: set tag -->
			<TagSet
				v-if="modal.tagset"
				:active="modal.tagset"
				:existing="active.existing"
				:initialTag="active.tag"
				:tagKey="active.key"
				:uiLanguages="uiLanguages"
				@closed="modal.tagset = false"
			/>
			<!-- modal: import data -->
			<ImportData
				v-if="modal.importdata"
				:active="modal.importdata"
				@closed="modal.importdata = false"
			/>
		</div>
	</div>
</template>

<script setup>
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
	checkmarkDoneOutline,
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
	trashOutline
} from 'ionicons/icons';
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
