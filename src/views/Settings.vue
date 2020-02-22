<template>
	<div class="settings">
		<div class="container no-sidebar">
			<div v-if="ready.users && user && userObject" class="columns">
				<!-- heading -->
				<div class="column col-12">
					<h2 class="view-title">
						{{ $t('page.settings') }}
					</h2>
				</div>
				<div class="column col-4 col-xl-6 col-md-12">
					<div class="panel mt-4">
						<div class="panel-header text-center">
							<ion-icon name="person-outline" class="icon-2x"></ion-icon>
							<div class="panel-title h5 mt-1">{{ $t('page.profile') }}</div>
							<div class="panel-subtitle text-gray">{{ $t('text.customizeProfile') }}</div>
						</div>
						<div class="panel-body">
							<div class="form-group">
								<label class="form-label" for="name">{{ $t('field.name') }}</label>
								<input v-model="profile.displayName" class="form-input" id="name" type="text" placeholder="john doe" />
							</div>
							<div class="form-group">
								<label class="form-label" for="role">{{ $t('field.role') }}</label>
								<input v-model="profile.role" class="form-input" id="role" type="text" placeholder="reader" disabled />
							</div>
							<div class="form-group">
								<label class="form-label" for="email">{{ $t('field.email') }}</label>
								<input v-model="profile.email" class="form-input" id="email" type="text" placeholder="john@doe.com" disabled />
							</div>
							<div class="form-group mb-3">
								<label class="form-label" for="photo">{{ $t('field.photo') }}</label>
								<input v-model="profile.photoURL" class="form-input" id="photo" type="text" placeholder="https://your-photo.link/image.png" />
							</div>
							<label for="preview" class="mr-4">{{ $t('label.preview') }}:</label>
							<figure v-if="profile.photoURL" id="preview" class="avatar avatar-xxl mb-2">
								<img :src="profile.photoURL" alt="Avatar" />
							</figure>
							<figure v-else-if="profile.displayName" id="preview" class="avatar avatar-xxl" :data-initial="profile.displayName.substring(0,2).toUpperCase()"></figure>
						</div>
						<div class="panel-footer mt-5">
							<button class="btn btn-primary btn-block text-uppercase" @click="updateProfile">
								<ion-icon name="save-outline" class="icon-left"></ion-icon> {{ $t('button.saveProfile') }}
							</button>
						</div>
					</div>
				</div>
				<div v-if="role > 3" class="column col-4 col-xl-6 col-md-12">
					<div class="panel mt-4">
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
									<button class="btn btn-link btn-action" @click.prevent="active.user=u; active.key=k; active.existing=true; modal.userset=true">
										<ion-icon name="create-outline"></ion-icon>
									</button>
									<button class="btn btn-link btn-action text-error" @click.prevent="active.user=u; active.key=k; modal.userdelete=true">
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
							<div class="panel-title h5 mt-1 text-center">{{ Object.keys(registrations).length }} {{ $t('widget.registrations') }}</div>
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
									<button class="btn btn-link btn-action" @click.prevent="active.user=r; active.key=k; active.existing=false; modal.userset=true">
										<ion-icon name="person-add-outline"></ion-icon>
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div v-if="role > 3" class="column col-4 col-xl-6 col-md-12">
					<div class="panel mt-4">
						<div class="panel-header text-center">
							<ion-icon name="pricetags-outline" class="icon-2x"></ion-icon>
							<div class="panel-title h5 mt-1">{{ Object.keys(tags).length }} {{ $t('widget.tags') }}</div>
							<div class="panel-subtitle text-gray">{{ $t('text.manageTags') }}</div>
						</div>
						<div class="panel-body">
							<router-link v-for="tag in tags" :key="tag.key" :to="{ name: 'songs-tag', params: { tag: tag.key }}" class="mr-2">
								<span class="label px-2 py-1 my-1">
									<ion-icon name="pricetag-outline" class="icon-sm mr-1"></ion-icon>
									{{ tag.key }}
								</span>
							</router-link>
						</div>
					</div>
				</div>
				<div v-if="role > 3" class="column col-4 col-xl-6 col-md-12">
					<div class="panel mt-4">
						<div class="panel-header text-center">
							<ion-icon name="file-tray-outline" class="icon-2x"></ion-icon>
							<div class="panel-title h5 mt-1">{{ $t('widget.backup') }}</div>
							<div class="panel-subtitle text-gray">{{ $t('text.exportImportData') }}</div>
						</div>
						<div class="panel-footer mt-5">
							<button class="btn btn-primary btn-block text-uppercase" @click="exportDb">
								<ion-icon name="download-outline" class="icon-left"></ion-icon> {{ $t('button.export') }}
							</button>
						</div>
					</div>
				</div>
			</div>
			<!-- modal: set user -->
			<UserSet
				v-if="modal.userset"
				:db="db"
				:active="modal.userset"
				:existing="active.existing"
				:initialUser="active.user"
				:userKey="active.key"
				@closed="modal.userset = false"
			/>
			<!-- modal: delete user -->
			<UserDelete
				v-if="modal.userdelete"
				:db="db"
				:active="modal.userdelete"
				:userName="active.user.name"
				:userKey="active.key"
				@closed="modal.userdelete = false"
			/>
		</div>
	</div>
</template>

<script>
// get basic program parameters
import basics from '@/basics.js'
// get components
import UserSet from '@/components/UserSet.vue'
import UserDelete from '@/components/UserDelete.vue'

export default {
	name: 'settings',
	components: {
		UserSet,
		UserDelete,
	},
	props: ['db', 'user', 'userObject', 'ready', 'roleName', 'role', 'users', 'registrations', 'tags', 'songs', 'setlists'],
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
			},
			active: {
				user: {},
				key: '',
				existing: true,
			}
		}
	},
	methods: {
		updateProfile () {
			let self = this
			this.userObject.updateProfile(this.profile).then(function() {
				self.db.collection('users').doc(self.userObject.uid).update({
					name: self.profile.displayName,
					email: self.profile.email
				}).then(function() {
					// Profile updated successfully!
					self.$notify({ title: self.$t('toast.userUpdated'), text: self.$t('toast.userUpdatedText'), type: 'primary' })
				}).catch((error) => self.$notify({ title: error.code, text: error.message, type: 'error' }))
			}, function(error) {
				// An error happened.
				self.$notify({ title: error.code, text: error.message, type: 'error' })
			});
		},
		updateTags () {
			// TODO
		},
		exportDb () {
			let data = {
				'songs': this.songs,
				'setlists': this.setlists,
				'users': this.users,
				'tags': this.tags
			}
			basics.download(JSON.stringify(data), (new Date().toJSON().slice(0,10).replace(/-/g, '')) + '_songdrive.json')
			// toast success message
			this.$notify({ title: this.$t('toast.databaseExported'), text: this.$t('toast.databaseExportedText'), type: 'primary' })
		},
	}
}
</script>

<style lang="scss">

</style>
