<template>
	<div class="h-screen flex flex-col justify-center items-center gap-12 px-2">
		<!-- heading -->
		<logo :featured="true" :show-version="false" />
		<!-- unconfirmed message -->
		<panel class="max-w-sm w-full flex flex-col gap-6">
			<div class="text-2xl text-center">{{ $t('text.waitingForApproval') }}</div>
			<p>{{ $t('text.notApprovedYet') }}</p>
			<p
				v-if="ready.config && config.contact.email"
				v-html="$t('text.unconfirmedMistake', [config.contact.email])"
			></p>
			<secondary-button @click="$emit('signOut')">
				{{ $t('button.signOut') }}
				<ion-icon :icon="logOutOutline" class="w-6 h-6" />
			</secondary-button>
		</panel>
	</div>
</template>

<script setup>
import Logo from '@/partials/Logo';
import Panel from '@/elements/Panel';
import SecondaryButton from '@/elements/SecondaryButton';
import { logOutOutline } from 'ionicons/icons';

const props = defineProps({
  ready: Object,
  config: Object,
});
</script>
