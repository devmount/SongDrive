<template>
	<div class="user-unverified">
		<!-- heading -->
		<div class="column col-12 text-center">
			<img class="logo" src="@/assets/logo.svg" alt="SongDrive Song Management Tool" />
			<h2 class="text-primary weight-normal mt-4">{{ $t('app.name') }}</h2>
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
export default {
	name: 'user-unverified',
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
	gap: 2rem;
	justify-content: center;
	align-items: center;
	height: 100vh;

	.logo {
		margin: 0 auto;
		max-width: 150px;
		width: 100%;
	}
	.message {
		max-width: 400px;

		h3 {
			text-align: center;
		}
	}
}
</style>
