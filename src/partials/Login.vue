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
					<ion-icon :icon="logInOutline" class="w-6 h-6"></ion-icon>
				</primary-button>
			</div>
		</panel>
		<div class="flex flex-col text-sm">
			<div>
				{{ t('text.newToSongDrive') }}
				<button class="text-spring-400" @click="emit('signUp')">{{ t('text.createAnAccount') }}</button>.
			</div>
			<div>
				{{ t('text.forgotPassword') }}
				<button class="text-spring-400" @click="emit('resetPassword')">{{ t('text.resetIt') }}</button>.
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue';
import Logo from '@/partials/Logo';
import { logInOutline } from 'ionicons/icons';
import Panel from '@/elements/panel.vue';
import PrimaryButton from '@/elements/primaryButton.vue';
import { useI18n } from "vue-i18n";
const { t } = useI18n();

// emits
const emit = defineEmits(['signIn', 'signUp', 'resetPassword']);

// reactive data
const email    = ref('');
const password = ref('');
</script>
