<template>
	<modal :active="active" :title="t('modal.resetPassword')" @closed="emit('closed')">
		<div>{{ t('text.sendPasswordResetEmail') }}</div>
		<div class="flex flex-col gap-2">
			<label class="flex flex-col gap-1">
				<span>{{ t('field.email') }} <span class="text-rose-600">*</span></span>
				<input
					type="email"
					v-model="authEmail"
					:class="{ '!border-rose-600': errorEmail }"
					:placeholder="t('placeholder.exampleUserEmail')"
				/>
			</label>
			<div v-if="errorEmail" class="text-rose-600">{{ t('error.requiredEmail') }}</div>
		</div>
		<div class="flex flex-col justify-end items-center gap-4 mt-4 2xs:flex-row">
			<button class="px-3 py-2 text-blade-500" aria-label="Cancel" @click.prevent="emit('closed')">
				{{ t('button.cancel') }}
			</button>
			<primary-button class="grow" @click="passwordReset">
				{{ $t('button.sendPasswordResetEmail') }}
				<icon-send class="w-6 h-6 stroke-1.5" />
			</primary-button>
		</div>
	</modal>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import PrimaryButton from '@/elements/PrimaryButton.vue';
import Modal from '@/elements/Modal.vue';

// icons
import { IconSend } from '@tabler/icons-vue';

// component constants
const { t } = useI18n();

// cocmponent properties
defineProps({
	active: Boolean // state of modal display, true to show modal
});

// input data
const authEmail  = ref('');

// possible form errors
const errorEmail = ref(false);

// emits
const emit = defineEmits(['submitted', 'closed']);

// send password reset to current user
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
