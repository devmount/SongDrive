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
			<div v-if="ready.users && user && userObject" class="columns">
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
									v-model="profile.displayName"
									class="form-input"
									id="name"
									type="text"
									placeholder="john doe"
								/>
							</div>
							<div class="form-group">
								<label class="form-label" for="email">{{ $t('field.email') }}</label>
								<input
									v-model="profile.email"
									class="form-input"
									id="email"
									type="text"
									placeholder="john@doe.com"
									disabled
								/>
							</div>
							<div class="form-group mb-3">
								<label class="form-label" for="photo">{{ $t('field.photo') }}</label>
								<input
									v-model="profile.photoURL"
									class="form-input"
									id="photo"
									type="text"
									placeholder="https://your-photo.link/image.png"
								/>
							</div>
							<label for="preview" class="mr-4">{{ $t('label.preview') }}:</label>
							<figure v-if="profile.photoURL" id="preview" class="avatar avatar-xxl mb-2">
								<img :src="profile.photoURL" alt="Avatar" />
							</figure>
							<figure
								v-else-if="profile.displayName"
								id="preview"
								class="avatar avatar-xxl"
								:data-initial="profile.displayName.substring(0,2).toUpperCase()"
							></figure>
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
							<ion-icon name="cog-outline" class="icon-2x"></ion-icon>
							<div class="panel-title h5 mt-1">{{ $t('app.name') }}</div>
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
			<div v-if="ready.users && user && userObject && role > 3" class="columns mt-4 pt-4">
				<div class="column col-12">
					<h2>
						{{ $t('page.administration') }}
					</h2>
				</div>
				<!-- user administration -->
				<div class="column col-4 col-xl-6 col-md-12 mt-4">
					<div class="panel">
						<div class="panel-header text-center">
							<ion-icon name="people-outline" class="icon-2x"></ion-icon>
							<div class="panel-title h5 mt-1">{{ Object.keys(users).length }} {{ $t('widget.users') }}</div>
							<div class="panel-subtitle text-gray">{{ $t('text.manageConfirmedUsers') }}</div>
						</div>
						<div class="panel-body">
							<div
								v-for="(u, k) in users" :key="k"
								class="tile tile-centered tile-hover p-2"
							>
								<div class="tile-icon">
									<figure v-if="u.photoURL" class="avatar mr-2">
										<img :src="u.photoURL" alt="Avatar" />
									</figure>
									<div v-else class="avatar text-center">
										<ion-icon name="person" class="mt-1"></ion-icon>
									</div>
								</div>
								<div class="tile-content">
									<span class="label float-right py-1 px-2">{{ $t('role.' + u.role) }}</span>
									<div class="tile-title">{{ u.name }}</div>
									<div class="tile-subtitle text-gray text-small">{{ u.email }}</div>
								</div>
								<div class="tile-action">
									<a
										:href="'mailto:' + u.email + '?' + confirmationMail"
										class="btn btn-link btn-action tooltip"
										:data-tooltip="$t('tooltip.sendConfirmationMail')"
									>
										<ion-icon name="mail-outline"></ion-icon>
									</a>
									<button
										class="btn btn-link btn-action tooltip"
										:data-tooltip="$t('modal.editUser')"
										@click.prevent="active.user=u; active.key=k; active.existing=true; modal.userset=true"
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
									<div class="avatar bg-dark text-center">
										<ion-icon name="person-outline" class="mt-1"></ion-icon>
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
										@click.prevent="active.user=r; active.key=k; active.existing=false; modal.userset=true"
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
							<button class="btn btn-primary btn-block text-uppercase" @click="modal.importdata=true">
								<ion-icon name="download-outline" class="icon-left"></ion-icon> {{ $t('button.import') }}
							</button>
						</div>
					</div>
				</div>
			</div>
			<!-- not logged in -->
			<div v-if="ready.users && !user" class="columns">
				<div class="column col-">
					<div class="empty">
						<div class="empty-icon">
							<ion-icon name="eye-off-outline" class="icon-4x"></ion-icon>
						</div>
						<p class="empty-title h5">{{ $t('text.pageNotAvailable') }}</p>
						<p class="empty-subtitle">{{ $t('text.signInForAccess') }}</p>
					</div>
				</div>
			</div>
			<!-- modal: set user -->
			<UserSet
				v-if="modal.userset"
				:active="modal.userset"
				:existing="active.existing"
				:initialUser="active.user"
				:userKey="active.key"
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
		'users',
		'registrations',
		'tags',
		'songs',
		'setlists',
		'languages'
	],
	data () {
		return {
			profile: {
				displayName: this.userObject.displayName,
				role: this.roleName,
				email: this.userObject.email,
				photoURL: this.userObject.photoURL
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
				user: {},
				language: {},
				tag: {},
				key: '',
				existing: true,
				approved: true
			}
		};
	},
	methods: {
		updateProfile () {
			this.userObject.updateProfile(this.profile).then(() => {
				this.$db.collection('users').doc(this.userObject.uid).update({
					name: this.profile.displayName,
					email: this.profile.email
				}).then(() => {
					// Profile updated successfully!
					this.$notify({
						title: this.$t('toast.userUpdated'),
						text: this.$t('toast.userUpdatedText'),
						type: 'primary'
					});
				}).catch((error) => {
					// An error happened.
					this.$notify({ title: error.code, text: error.message, type: 'error' });
				});
			}, (error) => {
				// An error happened.
				this.$notify({ title: error.code, text: error.message, type: 'error' });
			});
		},
		exportDb () {
			let data = {
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
					uiLanguages[key] = this.languages[key].label; // TODO: check if key esists in this.languages
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
		confirmationMail () {
			return 'subject=' + encodeURIComponent(this.$t('text.confirmationSubject'))
				+ '&body=' + encodeURIComponent(this.$t('text.confirmationBody', [this.userObject.displayName, 'https://songdrive.de']))
		}
	},
	watch: {
		userObject () {
			this.profile.displayName = this.userObject.displayName;
			this.profile.email = this.userObject.email;
			this.profile.photoURL = this.userObject.photoURL;
		}
	}
}
</script>
