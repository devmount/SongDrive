<template>
	<div class="flex flex-col gap-6 w-full">
		<!-- page heading -->
		<div class="text-3xl uppercase font-thin tracking-wider">
				{{ t('page.account') }}
		</div>
		<div
			v-if="ready.users && user"
			class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
		>
			<!-- profile card -->
			<panel>
				<div class="flex flex-col justify-center items-center">
					<avatar :photo-url="users[user].photo" :name="users[user].name" size="lg" />
					<div v-if="users[user].name" class="text-xl uppercase font-light mt-4">
						{{ users[user].name }}
					</div>
					<div v-if="roleName" class="text-blade-500">
						{{ t('role.' + roleName) }}
					</div>
				</div>
				<div v-if="users[user].email" class="flex items-center gap-2">
					<ion-icon :icon="mailOutline" class="w-6 h-6" :title="t('field.email')" />
					<div>{{ users[user].email }}</div>
				</div>
				<div v-if="users[user].photo" class="flex items-center gap-2">
					<ion-icon :icon="cameraOutline" class="w-6 h-6" :title="t('field.photo')" />
					<div class="truncate">{{ users[user].photo }}</div>
				</div>
				<link-button v-if="role" @click="router.push({ name: 'settings' })">
					{{ t('widget.showAllSettings') }}
					<ion-icon :icon="arrowForward" class="ml-4" />
				</link-button>
			</panel>
			<div v-if="role > 1" class="flex flex-wrap gap-8 w-full justify-evenly col-span-2">
				<!-- stored setlists count -->
				<div class="flex flex-col items-center">
					<div class="text-4xl sm:text-6xl font-thin">
						{{ Object.keys(setlistsFromUser).length }}
					</div>
					<div class="text-xl text-blade-600 dark:text-blade-400 flex gap-2">
						{{ t('widget.mySetlists') }}
					</div>
				</div>
				<!-- performed songs count -->
				<div class="flex flex-col items-center">
					<div class="text-4xl sm:text-6xl font-thin">
						<span class="text-blade-500">~</span>{{ songsFromUser }}
					</div>
					<div class="text-xl text-blade-600 dark:text-blade-400 flex gap-2">
						{{ t('widget.mySongsPerformed') }}
					</div>
				</div>
			</div>
		</div>
		<!-- not logged in -->
		<div v-if="ready.users && !user" class="columns">
			<div class="column col-">
				<div class="empty">
					<div class="empty-icon">
						<ion-icon :icon="eyeOffOutline" class="icon-4x" />
					</div>
					<p class="empty-title h5">{{ t('text.pageNotAvailable') }}</p>
					<p class="empty-subtitle">{{ t('text.signInForAccess') }}</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import Panel from '@/elements/Panel.vue';
import LinkButton from '@/elements/LinkButton.vue';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from "vue-i18n";
import { initials } from '@/utils.js';
import { 
	arrowForward,
	cameraOutline,
	eyeOffOutline,
	mailOutline,
	person
} from 'ionicons/icons';
import Avatar from '@/elements/Avatar.vue';
const router = useRouter();
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
