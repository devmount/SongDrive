<template>
	<div class="user-unconfirmed">
		<!-- heading -->
		<div class="column col-12 text-center">
			<img class="logo" src="@/assets/logo.svg" alt="SongDrive Song Management Tool" />
			<h2 class="text-primary weight-normal mt-4">{{ $t('app.name') }}</h2>
		</div>
		<!-- unconfirmed message -->
		<div class="message">
			<h3>{{ $t('text.waitingForApproval') }}</h3>
			<p>{{ $t('text.notApprovedYet') }}</p>
			<p v-html="$t('text.unconfirmedMistake', ['yo@songdrive.de'])"></p>
			<button class="btn btn-secondary d-block stretch mt-4" @click="$emit('signOut')">
				{{ $t('button.signOut') }} <ion-icon name="log-out-outline" class="icon-right"></ion-icon>
			</button>
		</div>
	</div>
</template>

<script>
export default {
	name: 'user-unconfirmed'
}
</script>

<style lang="scss">
.user-unconfirmed {
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
