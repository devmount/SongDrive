<template>
	<div class="login">
		<!-- heading -->
		<div class="column col-12 text-center">
			<img class="logo" src="@/assets/logo.svg" alt="SongDrive Song Management Tool" />
			<h2 class="text-primary weight-normal mt-4">{{ $t('app.name') }}</h2>
		</div>
		<!-- login -->
		<div class="form-group">
			<input
				type="text"
				v-model="email"
				class="form-input mb-1"
				:placeholder="$t('field.email')"
				@keydown.enter="$emit('signIn', email, password)"
			/>
			<input
				type="password"
				v-model="password"
				class="form-input mb-2"
				:placeholder="$t('field.password')"
				@keydown.enter="$emit('signIn', email, password)"
			/>
			<button class="btn btn-primary d-block stretch mb-2" @click="$emit('signIn', email, password)">
				{{ $t('button.signIn') }} <ion-icon name="log-in-outline" class="icon-right"></ion-icon>
			</button>
			<button
				class="btn d-block stretch btn-secondary"
				@click="$emit('signUp')"
			>
				{{ $t('button.signUp') }} <ion-icon name="person-add-outline" class="icon-right"></ion-icon>
			</button>
		</div>
	</div>
</template>

<script>
export default {
	name: 'login',
	data () {
		return {
			email: '',
			password: ''
		};
	}
}
</script>

<style lang="scss">
.login {
	display: flex;
	flex-direction: column;
	gap: 3rem;
	justify-content: center;
	align-items: center;
	height: 100vh;

	.logo {
		margin: 0 auto;
		max-width: 150px;
		width: 100%;
	}
}
</style>
