<template>
	<div class="profile">
		<div class="container no-sidebar">
			<div class="columns">
				<!-- heading -->
				<div class="column">
					<h2 class="view-title">
						{{ t('page.profile') }}
					</h2>
				</div>
			</div>
			<div v-if="ready.users && user" class="columns">
				<div class="column col-4 col-xl-6 col-sm-12 mt-4">
					<div class="panel">
						<div class="panel-header text-center">
							<div class="mb-3">
								<figure v-if="users[user].photo" id="preview" class="avatar avatar-xxl">
									<img :src="users[user].photo" alt="Avatar" />
								</figure>
								<figure
									v-else-if="users[user].name"
									id="preview"
									class="avatar avatar-xxl"
									:data-initial="initials(users[user].name)"
								></figure>
								<span v-else class="avatar avatar-xxl flex-center">
									<ion-icon :icon="person" class="icon-2x"></ion-icon>
								</span>
							</div>
							<div v-if="users[user].name" class="panel-title h5">{{ users[user].name }}</div>
							<div v-if="roleName" class="panel-subtitle text-gray">{{ t('role.' + roleName) }}</div>
						</div>
						<div class="panel-body">
							<div v-if="users[user].email" class="tile tile-centered mb-2">
								<div class="tile-content">
									<div class="tile-title text-bold">{{ t('field.email') }}</div>
									<div class="tile-subtitle text-gray">{{ users[user].email }}</div>
								</div>
								<div class="tile-icon text-gray">
									<ion-icon :icon="mailOutline" class="icon-1-5x"></ion-icon>
								</div>
							</div>
							<div v-if="users[user].photo" class="tile tile-centered mb-2">
								<div class="tile-content">
									<div class="tile-title text-bold">{{ t('field.photo') }}</div>
									<div class="tile-subtitle text-gray">{{ users[user].photo.substr(0,40) }}...</div>
								</div>
								<div class="tile-icon text-gray">
									<ion-icon :icon="cameraOutline" class="icon-1-5x"></ion-icon>
								</div>
							</div>
						</div>
						<div v-if="role" class="panel-link mt-4">
							<router-link to="/settings" class="btn btn-link btn-block">
								{{ t('widget.goToSettings') }}
								<ion-icon :icon="arrowForward" class="ml-4"></ion-icon>
							</router-link>
						</div>
					</div>
				</div>
				<div v-if="role > 1" class="column col-4 col-xl-6 col-sm-12 mt-4">
					<div class="columns">
						<div class="column col-12">
							<div class="panel">
								<div class="panel-body text-center pb-3">
									<div v-if="!ready.setlists" class="loading loading-xl d-block text-huge">&nbsp;</div>
									<div v-else class="text-huge">{{ Object.keys(setlistsFromUser).length }}</div>
									<div class="panel-title h5">
										<ion-icon :icon="list" class="mr-2"></ion-icon>
										{{ t('widget.setlistsCreated')}}
									</div>
								</div>
							</div>
						</div>
						<div class="column col-12 mt-4">
							<div class="panel">
								<div class="panel-body text-center pb-3">
									<div v-if="!ready.setlists" class="loading loading-xl d-block text-huge">&nbsp;</div>
									<div v-else class="text-huge">
										<span class="text-gray">~</span>{{ songsFromUser }}<span class="text-transparent">~</span>
									</div>
									<div class="panel-title h5">
										<ion-icon :icon="musicalNotes" class="mr-2"></ion-icon>
										{{ t('widget.songsPerformed') }}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<!-- not logged in -->
			<div v-if="ready.users && !user" class="columns">
				<div class="column col-">
					<div class="empty">
						<div class="empty-icon">
							<ion-icon :icon="eyeOffOutline" class="icon-4x"></ion-icon>
						</div>
						<p class="empty-title h5">{{ t('text.pageNotAvailable') }}</p>
						<p class="empty-subtitle">{{ t('text.signInForAccess') }}</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from "vue-i18n";
import { initials } from '@/utils.js';
import { 
	arrowForward,
	cameraOutline,
	eyeOffOutline,
	list,
	mailOutline,
	musicalNotes,
	person
} from 'ionicons/icons';
const { t } = useI18n();

// inherited properties
const props = defineProps({
  setlists: Object,
  user:     String,
  users:    Object,
  role:     Number,
  roleName: String,
  ready:    Object,
});

// computed
const setlistsFromUser = computed(() => Object.filter(props.setlists, s => s.creator == props.user));
const songsFromUser = computed(() => {
	let list = setlistsFromUser.value;
	return Object.keys(list).reduce((previous, key) => previous + list[key].songs.length, 0);
});
</script>
