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
					<mail-icon class="w-6 h-6 stroke-1.5" :title="t('field.email')" />
					<div>{{ users[user].email }}</div>
				</div>
				<div v-if="users[user].photo" class="flex items-center gap-2">
					<camera-icon class="w-6 h-6 stroke-1.5" :title="t('field.photo')" />
					<div class="truncate">{{ users[user].photo }}</div>
				</div>
				<link-button v-if="role" @click="router.push({ name: 'settings' })">
					{{ t('widget.showAllSettings') }}
					<arrow-right-icon class="ml-4 stroke-1.5" />
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
	</div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from "vue-i18n";
import { useRouter } from 'vue-router';
import Avatar from '@/elements/Avatar.vue';
import LinkButton from '@/elements/LinkButton.vue';
import Panel from '@/elements/Panel.vue';

// icons
import {
	ArrowRightIcon,
	CameraIcon,
	MailIcon
} from "vue-tabler-icons";

// component constants
const router = useRouter();
const { t } = useI18n();

// component properties
const props = defineProps({
  setlists: Object,
  user:     String,
  users:    Object,
  role:     Number,
  roleName: String,
  ready:    Object,
});

// number of setlists owned by current user
const setlistsFromUser = computed(() => Object.filter(props.setlists, s => s.creator == props.user));

// number of songs on those setlists
const songsFromUser = computed(() => {
	let list = setlistsFromUser.value;
	return Object.keys(list).reduce((previous, key) => previous + list[key].songs.length, 0);
});
</script>
