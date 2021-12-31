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
				{{ $t('tooltip.resendVerification') }} <ion-icon name="send-outline" class="icon-right"></ion-icon>
			</button>
			<p v-else>
				{{ $t('toast.verficationSentText') }}
			</p>
			<button class="btn btn-secondary d-block stretch mt-4" @click="$emit('signOut')">
				{{ $t('button.signOut') }} <ion-icon name="log-out-outline" class="icon-right"></ion-icon>
			</button>
		</div>
	</div>
</template>

<script>
// get components
import Logo from '@/partials/Logo';

export default {
	name: 'user-unverified',
	components: {
		Logo
	},
	props: ['ready', 'config'],
	data () {
		return {
			resend: false
		}
	},
	methods: {
		resendVerification () {
			this.resend = true;
			this.$emit('resendEmailVerification');
		}
	}
}
</script>

<style lang="scss">
.user-unverified {
	display: flex;
	flex-direction: column;
	gap: 2.5rem;
	justify-content: center;
	align-items: center;
	height: 100vh;

	.message {
		max-width: 400px;

		h3 {
			text-align: center;
		}
	}
}
</style>
