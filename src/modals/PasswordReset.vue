<template>
	<div
		class="transition-all fixed top-0 z-10 w-screen h-screen bg-zinc-700/50"
		:class="{ 'hidden': !active }"
		@click.prevent="emit('closed')"
	>
		<div class="fixed z-20 position-center rounded-sm w-full max-w-sm bg-zinc-100 p-4 flex flex-col gap-4" @click.stop="null">
			<div class="flex justify-between">
				<div class="text-lg uppercase font-medium">{{ t('modal.resetPassword') }}</div>
				<button aria-label="Close" @click="emit('closed')">
					<ion-icon :icon="closeOutline" class="w-6 h-6"></ion-icon>
				</button>
			</div>
			<div>{{ t('text.sendPasswordResetEmail') }}</div>
			<div class="flex flex-col gap-1">
				<label for="email">
					{{ t('field.email') }} <span class="text-red-600">*</span>
				</label>
				<input
					id="email"
					type="email"
					v-model="authEmail"
					:class="{ '!border-red-600': errorEmail }"
				/>
				<p v-if="errorEmail" class="text-red-600">{{ t('error.requiredEmail') }}</p>
			</div>
			<div class="flex justify-end items-center gap-4">
				<button class="px-3 py-1 text-zinc-500" aria-label="Cancel" @click.prevent="emit('closed')">
					{{ t('button.cancel') }}
				</button>
				<primary-button class="grow" @click="passwordReset">
					{{ $t('button.sendPasswordResetEmail') }}
					<ion-icon :icon="sendOutline" class="w-6 h-6"></ion-icon>
				</primary-button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from "vue-i18n";
import { closeOutline, sendOutline } from 'ionicons/icons';
import PrimaryButton from '@/elements/primaryButton.vue';
const { t } = useI18n();

// inherited properties
defineProps({
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
