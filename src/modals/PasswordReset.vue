<template>
	<div class="modal modal-sm" :class="{ active: active }">
		<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="$emit('closed')"></a>
		<div class="modal-container">
			<div class="modal-header">
				<a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="$emit('closed')"></a>
				<div class="modal-title h5">{{ $t('modal.resetPassword') }}</div>
			</div>
			<div class="modal-body">
				<div class="content">
					<p>{{ $t('text.sendPasswordResetEmail') }}</p>
					<label class="form-label" for="email">
						{{ $t('field.email') }} <span class="text-error">*</span>
					</label>
					<input
						id="email"
						type="email"
						v-model="auth.email"
						class="form-input mb-1"
						:class="{ 'is-error': error.email }"
					/>
					<p v-if="error.email" class="form-input-hint">{{ $t('error.requiredEmail') }}</p>
				</div>
			</div>
			<div class="modal-footer">
				<a class="btn btn-link btn-gray" href="#" aria-label="Cancel" @click.prevent="$emit('closed')">
					{{ $t('button.cancel') }}
				</a>
				<button class="btn btn-primary ml-2" @click="passwordReset">{{ $t('button.sendPasswordResetEmail') }}</button>
			</div>
		</div>
	</div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'password-reset',
	props: {
		active: Boolean,
	},
	data () {
		return {
			auth: {
				email: '',
			},
			error: {
				email: false,
			},
		}
	},
	methods: {
		passwordReset() {
			// first check for form errors
			this.error.email = this.auth.email == '';
			// no errors: send submitted auth data and close modal
			if (!this.error.email) {
				this.$emit('submitted', this.auth.email);
				this.$emit('closed');
			}
		}
	}
});
</script>
