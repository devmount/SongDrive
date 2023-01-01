<template>
	<div
		class="transition-all fixed top-0 z-10 w-screen h-screen bg-blade-750/50 dark:bg-black/50"
		:class="{ 'hidden': !active }"
		@click.prevent="emit('closed')"
	>
		<div
			class="
				fixed z-20 position-center rounded-sm w-full max-w-sm bg-blade-100 p-4 flex flex-col gap-4
				dark:bg-blade-850
			"
			@click.stop="null"
		>
			<div class="flex justify-between">
				<div class="text-lg uppercase font-medium">{{ t('modal.resetPassword') }}</div>
				<button aria-label="Close" @click="emit('closed')">
					<ion-icon :icon="closeOutline" class="w-6 h-6" />
				</button>
			</div>
			<div>{{ t('text.sendPasswordResetEmail') }}</div>
			<div class="flex flex-col gap-1">
				<label for="email">
					{{ t('field.email') }} <span class="text-rose-600">*</span>
				</label>
				<input
					id="email"
					type="email"
					v-model="authEmail"
					:class="{ '!border-rose-600': errorEmail }"
				/>
				<p v-if="errorEmail" class="text-rose-600">{{ t('error.requiredEmail') }}</p>
			</div>
			<div class="flex flex-col justify-end items-center gap-4 mt-4 2xs:flex-row">
				<button class="px-3 py-1 text-blade-500" aria-label="Cancel" @click.prevent="emit('closed')">
					{{ t('button.cancel') }}
				</button>
				<Primary-button class="grow" @click="passwordReset">
					{{ $t('button.sendPasswordResetEmail') }}
					<ion-icon :icon="sendOutline" class="w-6 h-6" />
				</primary-button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from "vue-i18n";
import { closeOutline, sendOutline } from 'ionicons/icons';
import PrimaryButton from '@/elements/PrimaryButton.vue';
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
