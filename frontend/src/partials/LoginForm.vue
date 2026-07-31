<template>
	<div class="h-screen flex flex-col justify-center items-center gap-12 px-2">
		<!-- heading -->
		<logo :featured="true" :show-version="false" />
		<!-- login panel -->
		<panel-box class="max-w-xs w-full">
			<div class="text-center">{{ t('text.signInToSongDrive') }}</div>
			<div v-if="authFailed" class="text-rose-600 text-center">{{ t('text.authFailed') }}</div>
			<div class="flex flex-col gap-1">
				<input
					type="email"
					v-model="email"
					:class="{ 'border-rose-600!': error.email }"
					:placeholder="t('field.email')"
					autocomplete="email"
					required
				/>
				<input
					type="password"
					v-model="password"
					:class="{ 'border-rose-600!': error.password }"
					:placeholder="t('field.password')"
					required
				/>
				<label class="flex items-center gap-3 mt-4">
					<input type="checkbox" v-model="stayLoggedIn" class="w-6 h-6" />
					{{ t('text.stayLoggedIn') }}
				</label>
			</div>
			<div class="mt-3">
				<primary-button class="w-full" @click="signIn">
					{{ t('button.signIn') }}
					<icon-login class="w-6 h-6 stroke-1.5" />
				</primary-button>
			</div>
		</panel-box>
		<div class="flex flex-col text-sm">
			<div>
				{{ t('text.newToSongDrive') }}
				<a :href="inviteMailto" class="text-spring-600 hover:text-black dark:hover:text-white">{{ t('text.askAnAdmin') }}</a>
				{{ t('text.contactAdminForInvite') }}
			</div>
			<div>
				{{ t('text.forgotPassword') }}
				<a :href="resetMailto" class="text-spring-600 hover:text-black dark:hover:text-white">{{ t('text.askAnAdmin') }}</a>
				{{ t('text.contactAdminForReset') }}
			</div>
		</div>
	</div>
</template>

<script setup>
import { logicAnd } from '@vueuse/math';
import { inject, reactive, computed } from 'vue';
import { whenever } from '@vueuse/core';
import { useI18n } from 'vue-i18n';
import Logo from '@/partials/Logo.vue';
import PanelBox from '@/elements/PanelBox.vue';
import PrimaryButton from '@/elements/PrimaryButton.vue';

// icons
import { IconLogin } from '@tabler/icons-vue';

// component constants
const { t } = useI18n();
const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;

// prefilled mailto links to request an invitation or a password reset
const mailto = (subject, body) => `mailto:${adminEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
const inviteMailto = computed(() => mailto(t('text.inviteMailSubject'), t('text.inviteMailBody')));
const resetMailto = computed(() => mailto(t('text.resetMailSubject'), t('text.resetMailBody')));

// emits
const emit = defineEmits(['signIn']);

// props
defineProps({
  authFailed: Boolean,
})

// input data
const email = defineModel('email');
const password = defineModel('password');
const stayLoggedIn = defineModel('stayLoggedIn');

// check if form errors occured
const error = reactive({
	email: false,
	password: false,
});
const errors = computed(() => {
	return (error.email || error.password);
});
// check sign in data
const signIn = () => {
	error.email = email.value == '';
	error.password = password.value == '';
	if (!errors.value) {
		emit('signIn')
	}
};

// component shortcuts
const hkGo = inject('hkGo');
const noActiveModal = inject('noActiveModal');
whenever(logicAnd(hkGo, noActiveModal), () => signIn());
</script>
