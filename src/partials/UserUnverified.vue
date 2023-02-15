<template>
	<div class="h-screen flex flex-col justify-center items-center gap-12 px-2">
		<!-- heading -->
		<logo :featured="true" :show-version="false" />
		<!-- unverified message -->
		<panel class="max-w-sm w-full flex flex-col gap-6">
			<div class="text-2xl text-center">{{ t('text.waitingForVerification') }}</div>
			<p>{{ t('text.notVerifiedYet') }}</p>
			<p
				v-if="ready.config && config.contact.email"
				v-html="t('text.unverifiedHelp', [config.contact.email])"
			></p>
			<secondary-button v-if="!resend" @click="resendVerification()">
				{{ t('tooltip.resendVerification') }}
				<send-icon class="w-6 h-6 stroke-1.5" />
			</secondary-button>
			<p v-else>
				{{ t('toast.verficationSentText') }}
			</p>
			<div class="flex gap-4">
				<secondary-button @click="router.go()">
					{{ t('button.recheck') }}
					<refresh-icon class="w-6 h-6 stroke-1.5" />
				</secondary-button>
				<secondary-button @click="emit('signOut')">
					{{ t('button.signOut') }}
					<logout-icon class="w-6 h-6 stroke-1.5" />
				</secondary-button>
			</div>
		</panel>
	</div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router'
import Logo from '@/partials/Logo';
import Panel from '@/elements/Panel';
import SecondaryButton from '@/elements/SecondaryButton';
import { ref } from 'vue';

// icons
import { SendIcon, RefreshIcon, LogoutIcon } from 'vue-tabler-icons';

// component constants
const { t } = useI18n();
const router = useRouter();

// component properties
const props = defineProps({
  ready: Object,
  config: Object,
});

// emits
const emit = defineEmits(['resendEmailVerification', 'signOut']);

// prevent directly sending multiple emails
const resend = ref(false);

// trigger sending verification email
const resendVerification = () => {
	resend.value = true;
	emit('resendEmailVerification');
}
</script>
