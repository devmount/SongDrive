<template>
	<div class="modal modal-sm" :class="{ active: active }">
		<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="emit('closed')"></a>
		<div class="modal-container">
			<div class="modal-header">
				<a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="emit('closed')"></a>
				<div class="modal-title h5">{{ t('modal.resetPassword') }}</div>
			</div>
			<div class="modal-body">
				<div class="content">
					<p>{{ t('text.sendPasswordResetEmail') }}</p>
					<label class="form-label" for="email">
						{{ t('field.email') }} <span class="text-error">*</span>
					</label>
					<input
						id="email"
						type="email"
						v-model="authEmail"
						class="form-input mb-1"
						:class="{ 'is-error': errorEmail }"
					/>
					<p v-if="errorEmail" class="form-input-hint">{{ t('error.requiredEmail') }}</p>
				</div>
			</div>
			<div class="modal-footer">
				<a class="btn btn-link btn-gray" href="#" aria-label="Cancel" @click.prevent="emit('closed')">
					{{ t('button.cancel') }}
				</a>
				<button class="btn btn-primary ml-2" @click="passwordReset">{{ t('button.sendPasswordResetEmail') }}</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from "vue-i18n";
const { t } = useI18n();

// inherited properties
const props = defineProps({
	active: Boolean // state of modal display, true to show modal
});

// reactive data
const authEmail  = ref('');
const errorEmail = ref(false);

// emits
const emit = defineEmits(['submitted', 'closed']);

// send password reset
const passwordReset = () => {
	// first check for form errors
	errorEmail.value = authEmail.value == '';
	// no errors: send submitted auth data and close modal
	if (!errorEmail.value) {
		emit('submitted', authEmail.value);
		emit('closed');
	}
}
</script>
