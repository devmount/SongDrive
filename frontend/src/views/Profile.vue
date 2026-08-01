<template>
	<div class="flex flex-col gap-6 w-full">
		<!-- page heading -->
		<div class="text-3xl uppercase font-thin tracking-wider">
			{{ t('page.account') }}
		</div>
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
			<!-- Profile card -->
			<panel-box>
				<div class="flex flex-col justify-center items-center">
					<user-avatar :photo-url="user.photo ?? undefined" :name="user.name" size="lg" />
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
			</panel-box>
			<!-- User stats -->
			<panel-box v-if="can('createSetlists', user.roles)">
				<div class="flex flex-col items-center">
					<icon-chart-bar class="w-8 h-8 stroke-1.5 mb-2" />
					<div class="text-xl uppercase font-light tracking-widest">{{ t('widget.stats') }}</div>
					<div class="text-blade-500">{{ t('text.myContributions') }}</div>
				</div>
				<div class="flex justify-evenly gap-2 mt-2">
					<!-- stored setlists count -->
					<div class="flex flex-col items-center">
						<div class="text-2xl sm:text-5xl font-thin">
							{{ setlistsFromUser.length }}
						</div>
						<div class="text-blade-600 dark:text-blade-400 flex gap-2">
							{{ t('widget.setlistsCreatedByMe') }}
						</div>
					</div>
					<!-- performed songs count -->
					<div class="flex flex-col items-center">
						<div class="text-2xl sm:text-5xl font-thin">
							<span class="text-blade-500">~</span>{{ songsFromUser }}
						</div>
						<div class="text-blade-600 dark:text-blade-400 flex gap-2">
							{{ t('widget.songsPerformedByMe') }}
						</div>
					</div>
				</div>
				<link-button class="mt-auto" @click="router.push({ name: 'setlists', params: { creator: user.id } })">
					{{ t('widget.mySetlists') }}
					<icon-arrow-right class="w-5 h-5 stroke-1.5" />
				</link-button>
			</panel-box>
			<!-- SongDrive UI -->
			<panel-box>
				<div class="flex flex-col items-center">
					<icon-palette class="w-8 h-8 stroke-1.5 mb-2" />
					<div class="text-xl uppercase font-light tracking-widest">{{ t('widget.appearance') }}</div>
					<div class="text-blade-500">{{ t('text.customizeUi') }}</div>
				</div>
				<div class="flex flex-col gap-2">
					<label class="flex flex-col gap-1">
						{{ t('field.language') }}
						<select v-model="lang">
							<option v-for="key in availableLocales" :key="key" :value="key">
								{{ t(`language.${key}`) }}
							</option>
						</select>
					</label>
					<label class="flex flex-col gap-1">
						{{ t('field.colorScheme') }}
						<select v-model="theme">
							<option v-for="scheme in ColorScheme" :key="scheme" :value="scheme">
								{{ t('option.' + scheme) }}
							</option>
						</select>
					</label>
				</div>
			</panel-box>
			<!-- Account -->
			<panel-box>
				<div class="flex flex-col items-center">
					<icon-key class="w-8 h-8 stroke-1.5 mb-2" />
					<div class="text-xl uppercase font-light tracking-widest">{{ t('divider.account') }}</div>
					<div class="text-blade-500">{{ t('text.renewYourPassword') }}</div>
				</div>
				<secondary-button @click="showPasswordChange = true" class="self-start">
					{{ t('button.changePassword') }}
					<icon-key class="w-6 h-6 stroke-1.5" />
				</secondary-button>
				<div class="mt-auto flex flex-col gap-2">
					<div class="text-blade-500">{{ t('text.amberAccountHint') }}</div>
					<a href="/amber/ui/userprofile" target="_blank" class="self-stretch text-center">
						<link-button>
							{{ t('widget.amberAccount') }}
							<icon-external-link class="w-5 h-5 stroke-1.5" />
						</link-button>
					</a>
				</div>
			</panel-box>
		</div>
	</div>
	<password-change :active="showPasswordChange" @closed="showPasswordChange = false" />
</template>

<script setup lang="ts">
import { injectStrict, setlistsKey, userKey } from '@/keys';
import { ColorScheme } from '@/definitions';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { can } from "@backend/definitions";
import UserAvatar from '@/elements/UserAvatar.vue';
import LinkButton from '@/elements/LinkButton.vue';
import PanelBox from '@/elements/PanelBox.vue';
import PasswordChange from '@/modals/PasswordChange.vue';
import SecondaryButton from '@/elements/SecondaryButton.vue';

// icons
import {
	IconArrowRight,
	IconCamera,
	IconChartBar,
	IconExternalLink,
	IconKey,
	IconMail,
	IconPalette,
} from '@tabler/icons-vue';

// component constants
const { t, locale, availableLocales } = useI18n({ useScope: 'global' });
const loc = locale.value.substring(0, 2);
const router = useRouter();

// component injects
const setlists = injectStrict(setlistsKey);
const user = injectStrict(userKey);

// password change modal state
const showPasswordChange = ref(false);

// number of setlists owned by current user
const setlistsFromUser = computed(() => setlists.value.filter(s => s.entity.createdBy == user.value.id));

// number of songs on those setlists
const songsFromUser = computed(() => {
	return setlistsFromUser.value.reduce((p, c) => p + c.entity.songs.length, 0);
});

// Handle UI language code and names
const initLang: string = !('lang' in localStorage) ? loc : (localStorage.getItem('lang') ?? loc);
const lang = ref(initLang);
watch(lang, (newValue) => {
	locale.value = newValue;
	localStorage.setItem('lang', newValue.substring(0, 2));
});

// handle theme mode
const initialTheme = (localStorage.getItem('theme') as ColorScheme | null) ?? ColorScheme.Auto;
const theme = ref<ColorScheme>(initialTheme);
watch(theme, (newValue) => {
	switch (newValue) {
		case ColorScheme.Dark:
			localStorage.theme = 'dark';
			document.documentElement.classList.add('dark');
			break;
		case ColorScheme.Light:
			localStorage.theme = 'light';
			document.documentElement.classList.remove('dark');
			break;
		case ColorScheme.Auto:
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
</script>
