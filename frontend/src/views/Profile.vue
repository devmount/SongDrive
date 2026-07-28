<template>
	<div class="flex flex-col gap-6 w-full">
		<!-- page heading -->
		<div class="text-3xl uppercase font-thin tracking-wider">
				{{ t('page.account') }}
		</div>
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
			<!-- profile card -->
			<panel-box>
				<div class="flex flex-col justify-center items-center">
					<user-avatar :photo-url="user.photo" :name="user.name" size="lg" />
					<div v-if="user.name" class="text-xl uppercase font-light mt-4">
						{{ user.name }}
					</div>
					<div class="text-blade-500">
						{{ t('role.' + user.roles[0]) }}
					</div>
				</div>
				<div v-if="user.email" class="flex items-center gap-2">
					<icon-mail class="w-6 h-6 stroke-1.5" :title="t('field.email')" />
					<div>{{ user.email }}</div>
				</div>
				<div v-if="user.photo" class="flex items-center gap-2">
					<icon-camera class="w-6 h-6 stroke-1.5" :title="t('field.photo')" />
					<div class="truncate">{{ user.photo }}</div>
				</div>
				<link-button @click="router.push({ name: 'settings' })">
					{{ t('widget.showAllSettings') }}
					<icon-arrow-right class="w-6 h-6 stroke-1.5" />
				</link-button>
			</panel-box>
			<div v-if="can('createSetlists', user.roles)" class="flex flex-wrap gap-8 w-full justify-evenly col-span-2">
				<!-- stored setlists count -->
				<div class="flex flex-col items-center">
					<div class="text-4xl sm:text-6xl font-thin">
						{{ setlistsFromUser.length }}
					</div>
					<div class="text-xl text-blade-600 dark:text-blade-400 flex gap-2">
						{{ t('widget.setlistsCreatedByMe') }}
					</div>
					<link-button @click="router.push({ name: 'setlists', params: { creator: user.id } })">
						{{ t('widget.mySetlists') }}
						<icon-arrow-right class="w-6 h-6 stroke-1.5" />
					</link-button>
				</div>
				<!-- performed songs count -->
				<div class="flex flex-col items-center">
					<div class="text-4xl sm:text-6xl font-thin">
						<span class="text-blade-500">~</span>{{ songsFromUser }}
					</div>
					<div class="text-xl text-blade-600 dark:text-blade-400 flex gap-2">
						{{ t('widget.songsPerformedByMe') }}
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { can } from "@backend/definitions";
import UserAvatar from '@/elements/UserAvatar.vue';
import LinkButton from '@/elements/LinkButton.vue';
import PanelBox from '@/elements/PanelBox.vue';

// icons
import {
	IconArrowRight,
	IconCamera,
	IconMail
} from '@tabler/icons-vue';

// component constants
const { t } = useI18n();
const router = useRouter();

// component injects
const setlists = inject('setlists');
const user = inject('user');

// number of setlists owned by current user
const setlistsFromUser = computed(() => setlists.value.filter(s => s.entity.createdBy == user.value.id));

// number of songs on those setlists
const songsFromUser = computed(() => {
	return setlistsFromUser.value.reduce((p, c) => p + c.entity.songs.length, 0);
});
</script>
