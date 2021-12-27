<template>
	<div class="settings">
		<div class="container no-sidebar">
			<div class="columns">
				<!-- heading -->
				<div class="column">
					<h2 class="view-title">
						{{ $t('page.settings') }}
					</h2>
				</div>
			</div>
			<div v-if="ready.users && user" class="columns">
				<!-- profile -->
				<div class="column col-4 col-xl-6 col-md-12 mt-4">
					<div class="panel">
						<div class="panel-header text-center">
							<ion-icon name="person-outline" class="icon-2x"></ion-icon>
							<div class="panel-title h5 mt-1">{{ $t('page.profile') }}</div>
							<div class="panel-subtitle text-gray">{{ $t('text.customizeProfile') }}</div>
						</div>
						<div class="panel-body">
							<div class="form-group">
								<label class="form-label" for="name">{{ $t('field.name') }}</label>
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
									<span class="mr-4">{{ $t('field.email') }}</span>
									<span v-if="userObject.emailVerified" class="text-success">
										<ion-icon name="checkmark-outline"></ion-icon> {{ $t('text.verified') }}
									</span>
									<span v-else class="text-error">
										<ion-icon name="close-outline"></ion-icon> {{ $t('text.unverified') }}
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
										:data-tooltip="!verificationResend ? $t('tooltip.resendVerification') : $t('tooltip.verificationAlreadySent')"
										@click="!verificationResend ? resendEmailVerification() : null"
									>
										<ion-icon v-if="!verificationResend" name="checkmark-outline"></ion-icon>
										<ion-icon v-else name="checkmark-done-outline"></ion-icon>
									</button>
								</div>
							</div>
							<div class="form-group mb-3">
								<div class="d-flex gap-4">
									<div class="flex-grow">
										<label class="form-label" for="photo">{{ $t('field.photo') }}</label>
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
											<ion-icon class="icon-2x" name="person"></ion-icon>
										</span>
									</div>
								</div>
							</div>
						</div>
						<div class="panel-footer mt-5">
							<button class="btn btn-primary btn-block text-uppercase" @click="updateProfile">
								<ion-icon name="save-outline" class="icon-left"></ion-icon> {{ $t('button.saveProfile') }}
							</button>
						</div>
					</div>
				</div>
				<!-- SongDrive UI -->
				<div class="column col-4 col-xl-6 col-md-12 mt-4">
					<div class="panel" v-if="ready.languages">
						<div class="panel-header text-center">
							<ion-icon name="color-palette-outline" class="icon-2x"></ion-icon>
							<div class="panel-title h5 mt-1">{{ $t('widget.appearance') }}</div>
							<div class="panel-subtitle text-gray">{{ $t('text.customizeUi') }}</div>
						</div>
						<div class="panel-body">
							<div class="form-group mb-1">
								<label class="form-label" for="language">{{ $t('field.language') }}</label>
								<select v-model="$i18n.locale" class="form-select" id="language">
									<option v-for="(label, key) in uiLanguages" :value="key">
										{{ label }}
									</option>
								</select>
							</div>
						</div>
						<div class="panel-footer mt-5">
						</div>
					</div>
				</div>
			</div>
			<!-- administration area -->
			<div v-if="ready.users && ready.permissions && user && userObject && role > 1" class="columns mt-4 pt-4">
				<div class="column col-12">
					<h2>
						{{ $t('page.administration') }}
					</h2>
				</div>
				<!-- user administration -->
				<div class="column col-4 col-xl-6 col-md-12 mt-4">
					<div class="panel">
						<div class="panel-header text-center pos-relative">
							<ion-icon name="people-outline" class="icon-2x"></ion-icon>
							<div class="panel-title h5 mt-1">{{ Object.keys(users).length }} {{ $t('widget.users') }}</div>
							<div class="panel-subtitle text-gray">{{ $t('text.manageConfirmedUsers') }}</div>
							<div class="pos-absolute-tr">
								<button
									class="btn btn-secondary tooltip px-3 m-3"
									:data-tooltip="$t('modal.addUser')"
									@click="
										active.userId = '';
										active.user = { name: '', email: '', password: '' };
										active.role = 'reader';
										active.state = 'new';
										modal.userset = true;
									"
								>
									<ion-icon name="add-outline"></ion-icon>
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
										<ion-icon name="person"></ion-icon>
									</span>
								</div>
								<div class="tile-content">
									<span v-if="permissions[k]" class="label float-right py-1 px-2">{{ $t('role.' + permissions[k].role) }}</span>
									<div class="tile-title">{{ u.name }}</div>
									<div class="tile-subtitle text-gray text-small">{{ u.email }}</div>
								</div>
								<div class="tile-action">
									<a
										:href="'mailto:' + u.email + '?' + confirmationMail(u.name)"
										class="btn btn-link btn-action tooltip"
										:data-tooltip="$t('tooltip.sendConfirmationMail')"
									>
										<ion-icon name="mail-outline"></ion-icon>
									</a>
									<button
										class="btn btn-link btn-action tooltip"
										:data-tooltip="$t('modal.editUser')"
										@click.prevent="
											active.userId = k;
											active.user = u;
											active.role = permissions[k].role;
											active.state = 'confirmed';
											modal.userset = true;
										"
									>
										<ion-icon name="create-outline"></ion-icon>
									</button>
									<button
										class="btn btn-link btn-action tooltip text-error"
										:data-tooltip="$t('modal.deleteUser')"
										@click.prevent="active.user=u; active.key=k; active.approved=true; modal.userdelete=true"
									>
										<ion-icon name="person-remove-outline"></ion-icon>
									</button>
								</div>
							</div>
						</div>
						<div v-if="Object.keys(registrations).length == 0" class="empty">
							<div class="empty-icon">
								<ion-icon name="checkbox-outline" class="icon-4x"></ion-icon>
							</div>
							<p class="empty-title h5">{{ $t('text.noUnconfirmedUsers') }}</p>
							<p class="empty-subtitle">{{ $t('text.goodWork') }}</p>
						</div>
						<div v-else class="panel-footer mt-5">
							<div class="panel-title h5 mt-1 text-center">
								{{ Object.keys(registrations).length }} {{ $t('widget.registrations') }}
							</div>
							<div class="panel-subtitle mb-4 text-gray text-center">{{ $t('text.manageUnconfirmedUsers') }}</div>
							<div
								v-for="(r, k) in registrations" :key="k"
								class="tile tile-centered tile-hover p-2"
							>
								<div class="tile-icon">
									<div class="avatar bg-dark flex-center">
										<ion-icon name="person-outline"></ion-icon>
									</div>
								</div>
								<div class="tile-content">
									<span class="label float-right py-1 px-2">{{ $t('role.unconfirmed') }}</span>
									<div class="tile-title">{{ r.name }}</div>
									<div class="tile-subtitle text-gray text-small">{{ r.email }}</div>
								</div>
								<div class="tile-action">
									<button
										class="btn btn-link btn-action tooltip"
										:data-tooltip="$t('tooltip.approveUser')"
										@click.prevent="
											active.userId = k;
											active.user = r;
											active.role = 'reader';
											active.state = 'registered';
											modal.userset = true;
										"
									>
										<ion-icon name="person-add-outline"></ion-icon>
									</button>
									<button
										class="btn btn-link btn-action tooltip text-error"
										:data-tooltip="$t('modal.deleteUser')"
										@click.prevent="active.user=r; active.key=k; active.approved=false; modal.userdelete=true"
									>
										<ion-icon name="person-remove-outline"></ion-icon>
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
							<ion-icon name="language-outline" class="icon-2x"></ion-icon>
							<div class="panel-title h5 mt-1">{{ $tc('widget.languages', numberOfLanguages, [numberOfLanguages]) }}</div>
							<div class="panel-subtitle text-gray">{{ $t('text.manageLanguages') }}</div>
							<div class="pos-absolute-tr">
								<button
									class="btn btn-secondary tooltip px-3 m-3"
									:data-tooltip="$t('modal.addLanguage')"
									@click="active.language={ label: '' }; active.key=''; active.existing=false; modal.languageset=true"
								>
									<ion-icon name="add-outline"></ion-icon>
								</button>
							</div>
						</div>
						<div class="panel-body">
							<div
								v-for="(l, key) in languages"
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
										:data-tooltip="$t('modal.editLanguage')"
										@click="active.language=l; active.key=key; active.existing=true; modal.languageset=true"
									>
										<ion-icon name="create-outline"></ion-icon>
									</button>
									<button
										class="btn btn-link btn-action tooltip text-error"
										:data-tooltip="$t('modal.deleteLanguage')"
										@click="active.language=l; active.key=key; modal.languagedelete=true;"
									>
										<ion-icon name="trash-outline"></ion-icon>
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
							<ion-icon name="pricetags-outline" class="icon-2x"></ion-icon>
							<div class="panel-title h5 mt-1">{{ $tc('widget.tags', numberOfTags, [numberOfTags]) }}</div>
							<div class="panel-subtitle text-gray">{{ $t('text.manageTags') }}</div>
							<div class="pos-absolute-tr">
								<button
									class="btn btn-secondary tooltip px-3 m-3"
									:data-tooltip="$t('modal.addTag')"
									@click="active.tag={ key: '' }; active.key=''; active.existing=false; modal.tagset=true"
								>
									<ion-icon name="add-outline"></ion-icon>
								</button>
							</div>
						</div>
						<div class="panel-body">
							<a
								v-for="tag in tags"
								class="mr-2"
								@click="active.tag=tag; active.key=tag.key; active.existing=true; modal.tagset=true"
							>
								<span class="label px-2 py-1 my-1">
									<ion-icon name="pricetag-outline" class="icon-sm mr-1"></ion-icon>
									{{ tag[$i18n.locale] ? tag[$i18n.locale] : tag.key }}
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
							<ion-icon name="cog-outline" class="icon-2x"></ion-icon>
							<div class="panel-title h5 mt-1">{{ $t('widget.configuration') }}</div>
							<div class="panel-subtitle text-gray">{{ $t('text.configureApp') }}</div>
						</div>
						<div class="panel-body">
							<div v-if="ready.config" class="form-group">
								<label class="form-label" for="supportEmail">{{ $t('field.supportEmail') }}</label>
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
							<button class="btn btn-primary btn-block text-uppercase" @click="updateConfig">
								<ion-icon name="save-outline" class="icon-left"></ion-icon> {{ $t('button.saveConfig') }}
							</button>
						</div>
					</div>
				</div>
				<!-- backup administration -->
				<div class="column col-4 col-xl-6 col-md-12 mt-4">
					<div class="panel">
						<div class="panel-header text-center">
							<ion-icon name="file-tray-outline" class="icon-2x"></ion-icon>
							<div class="panel-title h5 mt-1">{{ $t('widget.backup') }}</div>
							<div class="panel-subtitle text-gray">{{ $t('text.exportImportData') }}</div>
						</div>
						<div class="panel-footer mt-5">
							<button class="btn btn-primary btn-block text-uppercase mb-2" @click="exportDb">
								<ion-icon name="archive-outline" class="icon-left"></ion-icon> {{ $t('button.export') }}
							</button>
							<button class="btn btn-error btn-block text-uppercase" @click="modal.importdata=true">
								<ion-icon name="download-outline" class="icon-left"></ion-icon> {{ $t('button.import') }}
							</button>
						</div>
					</div>
				</div>
			</div>
			<!-- modal: set user -->
			<UserSet
				v-if="modal.userset"
				:active="modal.userset"
				:userId="active.userId"
				:initialUser="active.user"
				:role="active.role"
				:state="active.state"
				@started="$emit('started')"
				@closed="modal.userset = false"
			/>
			<!-- modal: delete user -->
			<UserDelete
				v-if="modal.userdelete"
				:active="modal.userdelete"
				:userName="active.user.name"
				:userKey="active.key"
				:approved="active.approved"
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

<script>
import firebase from 'firebase/compat/app';

// get components
import UserSet from '@/modals/UserSet';
import UserDelete from '@/modals/UserDelete';
import LanguageSet from '@/modals/LanguageSet';
import LanguageDelete from '@/modals/LanguageDelete';
import TagSet from '@/modals/TagSet';
import ImportData from '@/modals/ImportData';

export default {
	name: 'settings',
	components: {
		UserSet,
		UserDelete,
		LanguageSet,
		LanguageDelete,
		TagSet,
		ImportData,
	},
	props: [
		'user',
		'userObject',
		'ready',
		'roleName',
		'role',
		'config',
		'languages',
		'permissions',
		'registrations',
		'setlists',
		'songs',
		'tags',
		'users',
	],
	data () {
		return {
			verificationResend: false,
			profile: {
				name: null,
				email: null,
				photo: null
			},
			permission: {
				role: null,
			},
			configuration: {
				contact: {
					email: this.config?.contact?.email
				}
			},
			modal: {
				userset: false,
				userdelete: false,
				languageset: false,
				languagedelete: false,
				tagset: false,
				importdata: false,
			},
			active: {
				userId: '',
				user: {},
				role: '',
				state: '',
				language: {},
				tag: {},
				key: '',
				existing: true,
				approved: true
			}
		};
	},
	mounted () {
		this.loadProfile();
	},
	methods: {
		loadProfile () {
			if (this.ready.users && this.user) {
				this.profile.name = this.users[this.user].name;
				this.profile.email = this.users[this.user].email;
				this.profile.photo = this.users[this.user].photo;
				this.permission.role = this.permissions[this.user].role;
			}
		},
		// resend email with verification link to currently logged in user
		resendEmailVerification () {
			firebase.auth().currentUser.sendEmailVerification().then(() => {
				this.$notify({
					title: this.$t('toast.verficationSent'),
					text: this.$t('toast.verficationSentText'),
					type: 'primary'
				});
				this.verificationResend = true;
			}).catch((error) => this.throwError(error));
		},
		updateProfile () {
			this.userObject.updateProfile({
					displayName: this.profile.name,
					email: this.profile.email
			}).then(() => {
				// first update user object
				this.$db.collection('users').doc(this.user).update(this.profile).then(() => {
					// then update permissions for this user
					this.$db.collection('permissions').doc(this.user).update(this.permission).then(() => {
						// updated successfully
						this.$notify({
							title: this.$t('toast.userUpdated'),
							text: this.$t('toast.userUpdatedText'),
							type: 'primary'
						});
					}).catch((error) => this.throwError(error));
				}).catch((error) => this.throwError(error));
			}, (error) => this.throwError(error));
		},
		updateConfig () {
			this.$db.collection('config').doc('contact').update({
				email: this.configuration.contact.email
			}).then(() => {
				// Config updated successfully!
				this.$notify({
					title: this.$t('toast.configUpdated'),
					text: this.$t('toast.configUpdatedText'),
					type: 'primary'
				});
			}).catch((error) => this.throwError(error));
		},
		confirmationMail (name) {
			return 'subject=' + encodeURIComponent(this.$t('text.confirmationSubject'))
				+ '&body=' + encodeURIComponent(this.$t('text.confirmationBody', [name, window.location.origin]))
		},
		exportDb () {
			let data = {
				'config': this.configuration,
				'songs': this.songs,
				'setlists': this.setlists,
				'users': this.users,
				'registrations': this.registrations,
				'tags': this.tags,
				'languages': this.languages
			};
			this.download(JSON.stringify(data), (new Date().toJSON().slice(0,10).replace(/-/g, '')) + '_songdrive.json');
			// toast success message
			this.$notify({
				title: this.$t('toast.databaseExported'),
				text: this.$t('toast.databaseExportedText'),
				type: 'primary'
			});
		},
	},
	computed: {
		uiLanguages () {
			let uiLanguages = {};
			Object.keys(this.$i18n.messages).forEach(key => {
				if (this.languages[key]) {
					uiLanguages[key] = this.languages[key].label; // TODO: check if key exists in this.languages
				}
			})
			return uiLanguages;
		},
		numberOfTags () {
			return Object.keys(this.tags).length;
		},
		numberOfLanguages () {
			return Object.keys(this.languages).length;
		},
	},
	watch: {
		config () {
			this.configuration.contact.email = this.config.contact.email;
		}
	}
}
</script>
