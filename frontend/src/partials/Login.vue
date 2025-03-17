<template>
	<div class="h-screen flex flex-col justify-center items-center gap-12 px-2">
		<!-- heading -->
		<logo :featured="true" :show-version="false" />
		<!-- login panel -->
		<panel class="max-w-xs w-full">
			<div class="text-center">{{ t('text.signInToSongDrive') }}</div>
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
			</div>
			<div class="mt-3">
				<primary-button class="w-full" @click="signIn">
					{{ t('button.signIn') }}
					<icon-login class="w-6 h-6 stroke-1.5" />
				</primary-button>
			</div>
		</panel>
		<div class="flex flex-col text-sm">
			<div>
				{{ t('text.newToSongDrive') }}
				<link-button @click="emit('signUp')">{{ t('text.createAnAccount') }}</link-button>.
			</div>
			<div>
				{{ t('text.forgotPassword') }}
				<link-button @click="emit('resetPassword')">{{ t('text.resetIt') }}</link-button>.
			</div>
		</div>
	</div>
</template>

<script setup>
import { logicAnd } from '@vueuse/math';
import { ref, inject, reactive, computed } from 'vue';
import { whenever } from '@vueuse/core';
import { useI18n } from 'vue-i18n';
import LinkButton from '@/elements/LinkButton.vue';
import Logo from '@/partials/Logo.vue';
import Panel from '@/elements/Panel.vue';
import PrimaryButton from '@/elements/PrimaryButton.vue';

// icons
import { IconLogin } from '@tabler/icons-vue';

// component constants
const { t } = useI18n();

// emits
const emit = defineEmits(['signIn', 'signUp', 'resetPassword']);

// input data
const email    = ref('');
const password = ref('');

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
		emit('signIn', email.value, password.value)
	}
};

// component shortcuts
const hkGo = inject('hkGo');
const noActiveModal = inject('noActiveModal');
whenever(logicAnd(hkGo, noActiveModal), () => signIn());
</script>
