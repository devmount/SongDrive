<template>
	<div class="modal modal-sm" :class="{ active: active }">
		<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="$emit('closed')"></a>
		<div class="modal-container">
			<div class="modal-header">
				<a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="$emit('closed')"></a>
				<div class="modal-title h5">{{ $t('modal.signUp') }}</div>
			</div>
			<div class="modal-body">
				<div class="content">
					<p>{{ $t('text.createNewAccount') }}</p>
					<label class="form-label" for="name">
						{{ $t('field.name') }} <span class="text-error">*</span>
					</label>
					<input
						id="name"
						type="text"
						v-model="auth.name"
						class="form-input mb-1"
						:class="{ 'is-error': error.name }"
						:placeholder="$t('placeholder.exampleUserName')"
					/>
					<p v-if="error.name" class="form-input-hint">{{ $t('error.requiredName') }}</p>
					<label class="form-label" for="email">
						{{ $t('field.email') }} <span class="text-error">*</span>
					</label>
					<input
						id="email"
						type="email"
						v-model="auth.email"
						class="form-input mb-1"
						:class="{ 'is-error': error.email }"
						:placeholder="$t('placeholder.exampleUserEmail')"
					/>
					<p v-if="error.email" class="form-input-hint">{{ $t('error.requiredEmail') }}</p>
					<label class="form-label" for="password">
						{{ $t('field.password') }} <span class="text-error">*</span>
						<span class="float-right" :class="{ 'text-error': auth.password.length < 8 }">
							{{ auth.password.length }}<span v-if="auth.password.length < 8"> / 8</span>
						</span>
					</label>
					<input
						id="password"
						type="password"
						v-model="auth.password"
						class="form-input mb-1"
						:class="{ 'is-error': error.password.missing || error.password.mismatch || error.password.tooshort }"
						:placeholder="$t('placeholder.examplePassword', { p: example.password })"
					/>
					<input
						type="password"
						v-model="auth.repeat"
						class="form-input mb-1"
						:class="{ 'is-error': error.password.missing || error.password.mismatch || error.password.tooshort }"
						:placeholder="$t('placeholder.repeatPassword')"
					/>
					<p
						v-if="error.password.missing || error.password.mismatch || error.password.tooshort"
						class="form-input-hint"
					>
						<span v-if="error.password.missing">{{ $t('error.requiredPassword') }}</span>
						<span v-if="error.password.mismatch"> {{ $t('error.passwordsDontMatch') }}</span>
						<span v-if="error.password.tooshort"> {{ $t('error.passwordTooShort') }}</span>
					</p>
				</div>
			</div>
			<div class="modal-footer">
				<a class="btn btn-link btn-gray" href="#" aria-label="Cancel" @click.prevent="$emit('closed')">
					{{ $t('button.cancel') }}
				</a>
				<button class="btn btn-primary ml-2" @click="signUp">{{ $t('button.signUp') }}</button>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'sing-up',
	props: {
		active: Boolean,
	},
	data () {
		return {
			auth: {
				name: '',
				email: '',
				password: '',
				repeat: '',
			},
			example: {
				password: this.examplePassword(8)
			},
			error: {
				name: false,
				email: false,
				password: {
					missing: false,
					mismatch: false,
					tooshort: false,
				},
			},
		}
	},
	methods: {
		signUp() {
			// first check for form errors
			this.error.name = this.auth.name == '';
			this.error.email = this.auth.email == '';
			this.error.password.missing = this.auth.password == '';
			this.error.password.mismatch = this.auth.password != this.auth.repeat;
			this.error.password.tooshort = this.auth.password.length < 8;
			// no errors: send submitted auth data and close modal
			if (!this.errors) {
				this.$emit('submitted', this.auth);
				this.$emit('closed');
			}
		}
	},
	computed: {
		// calculate wether form errors occured
		errors () {
			return (
				this.error.name ||
				this.error.email ||
				this.error.password.missing ||
				this.error.password.mismatch ||
				this.error.password.tooshort
			);
		}
	}
}
</script>
