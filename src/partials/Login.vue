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
					:placeholder="t('field.email')"
					@keydown.enter="emit('signIn', email, password)"
				/>
				<input
					type="password"
					v-model="password"
					:placeholder="t('field.password')"
					@keydown.enter="emit('signIn', email, password)"
				/>
			</div>
			<div class="mt-3">
				<primary-button class="w-full" @click="emit('signIn', email, password)">
					{{ t('button.signIn') }}
					<login-icon class="w-6 h-6 stroke-1.5" />
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
import { ref } from 'vue';
import { useI18n } from "vue-i18n";
import LinkButton from '@/elements/LinkButton.vue';
import Logo from '@/partials/Logo';
import Panel from '@/elements/Panel.vue';
import PrimaryButton from '@/elements/PrimaryButton.vue';

// icons
import { LoginIcon } from "vue-tabler-icons";

// component constants
const { t } = useI18n();

// emits
const emit = defineEmits(['signIn', 'signUp', 'resetPassword']);

// input data
const email    = ref('');
const password = ref('');
</script>
