<template>
	<div class="user-unverified">
		<!-- heading -->
		<div class="column col-12">
			<Logo class="featured hide-version" />
		</div>
		<!-- unverified message -->
		<div class="message">
			<h3>{{ $t('text.waitingForVerification') }}</h3>
			<p>{{ $t('text.notVerifiedYet') }}</p>
			<p v-if="ready.config && config.contact.email" v-html="$t('text.unverifiedHelp', [config.contact.email])"></p>
			<button v-if="!resend" class="btn btn-primary d-block stretch mt-4" @click="resendVerification()">
				{{ $t('tooltip.resendVerification') }} <ion-icon :icon="sendOutline" class="icon-right" />
			</button>
			<p v-else>
				{{ $t('toast.verficationSentText') }}
			</p>
			<div class="d-flex g-4 mt-4">
				<button class="btn btn-secondary d-block" @click="$router.go()">
					{{ $t('button.recheck') }} <ion-icon :icon="refreshOutline" class="icon-right" />
				</button>
				<button class="btn btn-secondary d-block" @click="$emit('signOut')">
					{{ $t('button.signOut') }} <ion-icon :icon="logOutOutline" class="icon-right" />
				</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue';
import Logo from '@/partials/Logo';
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

<style>
.user-unverified {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
.user-unverified .message {
  max-width: 400px;
}
.user-unverified .message h3 {
  text-align: center;
}
</style>
