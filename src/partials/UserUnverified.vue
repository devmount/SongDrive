<template>
	<div class="h-screen flex flex-col justify-center items-center gap-12 px-2">
		<!-- heading -->
		<logo :featured="true" :show-version="false" />
		<!-- unverified message -->
		<panel class="max-w-sm w-full flex flex-col gap-6">
			<div class="text-2xl text-center">{{ $t('text.waitingForVerification') }}</div>
			<p>{{ $t('text.notVerifiedYet') }}</p>
			<p
				v-if="ready.config && config.contact.email"
				v-html="$t('text.unverifiedHelp', [config.contact.email])"
			></p>
			<secondary-button v-if="!resend" @click="resendVerification()">
				{{ $t('tooltip.resendVerification') }}
				<ion-icon :icon="sendOutline" class="w-6 h-6" />
			</secondary-button>
			<p v-else>
				{{ $t('toast.verficationSentText') }}
			</p>
			<div class="flex gap-4">
				<secondary-button @click="$router.go()">
					{{ $t('button.recheck') }}
					<ion-icon :icon="refreshOutline" class="w-6 h-6" />
				</secondary-button>
				<secondary-button @click="$emit('signOut')">
					{{ $t('button.signOut') }}
					<ion-icon :icon="logOutOutline" class="w-6 h-6" />
				</secondary-button>
			</div>
		</panel>
	</div>
</template>

<script setup>
import Logo from '@/partials/Logo';
import Panel from '@/elements/Panel';
import SecondaryButton from '@/elements/SecondaryButton';
import { ref } from 'vue';
import { sendOutline, refreshOutline, logOutOutline } from 'ionicons/icons';

const props = defineProps({
  ready: Object,
  config: Object,
});
const emit = defineEmits();

// reactive data
const resend = ref(false);

// methods
const resendVerification = () => {
	resend.value = true;
	emit('resendEmailVerification');
}
</script>
