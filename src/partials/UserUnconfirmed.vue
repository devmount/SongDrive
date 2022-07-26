<template>
	<div class="user-unconfirmed">
		<!-- heading -->
		<div class="column col-12">
			<Logo class="featured hide-version" />
		</div>
		<!-- unconfirmed message -->
		<div class="message">
			<h3>{{ $t('text.waitingForApproval') }}</h3>
			<p>{{ $t('text.notApprovedYet') }}</p>
			<p v-if="ready.config && config.contact.email" v-html="$t('text.unconfirmedMistake', [config.contact.email])"></p>
			<button class="btn btn-secondary d-block stretch mt-4" @click="$emit('signOut')">
				{{ $t('button.signOut') }} <ion-icon name="log-out-outline" class="icon-right"></ion-icon>
			</button>
		</div>
	</div>
</template>

<script>
import { defineComponent } from 'vue';

// get components
import Logo from '@/partials/Logo';

export default defineComponent({
	name: 'user-unconfirmed',
	components: {
		Logo
	},
	props: ['ready', 'config']
});
</script>

<style lang="scss">
.user-unconfirmed {
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
