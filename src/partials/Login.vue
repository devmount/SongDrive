<template>
	<div class="h-screen flex justify-center items-center">
		<!-- heading -->
		<div class="column col-12">
			<Logo class="featured hide-version" />
		</div>
		<!-- login -->
		<div>
			<div class="panel mb-5">
				<div class="panel-header">
					<div class="panel-title text-center">{{ $t('text.signInToSongDrive') }}</div>
				</div>
				<div class="panel-body">
					<input
						type="email"
						v-model="email"
						class="form-input mb-1"
						:placeholder="$t('field.email')"
						@keydown.enter="$emit('signIn', email, password)"
					/>
					<input
						type="password"
						v-model="password"
						class="form-input"
						:placeholder="$t('field.password')"
						@keydown.enter="$emit('signIn', email, password)"
					/>
				</div>
				<div class="panel-footer mt-3">
					<button class="btn btn-primary btn-block" @click="$emit('signIn', email, password)">
						{{ $t('button.signIn') }} <ion-icon :icon="logInOutline" class="icon-right"></ion-icon>
					</button>
				</div>
			</div>
			<div class="px-4">
				{{ $t('text.newToSongDrive') }}
				<button class="btn btn-link" @click="$emit('signUp')">{{ $t('text.createAnAccount') }}</button>.
			</div>
			<div class="px-4">
				{{ $t('text.forgotPassword') }}
				<button class="btn btn-link" @click="$emit('resetPassword')">{{ $t('text.resetIt') }}</button>.
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue';
import Logo from '@/partials/Logo';
import { logInOutline } from 'ionicons/icons';

// reactive data
const email    = ref('');
const password = ref('');
</script>

<style>
.login {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
.login .panel {
  height: auto;
}
.login .btn-link {
  margin: 0;
  padding: 0;
  border: none;
  line-height: inherit;
  height: auto;
  vertical-align: initial;
}
</style>
