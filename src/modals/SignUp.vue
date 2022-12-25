<template>
	<div
		class="transition-all fixed top-0 z-10 w-screen h-screen bg-zinc-700/50"
		:class="{ 'hidden': !active }"
		@click.prevent="emit('closed')"
	>
		<div class="fixed z-20 position-center rounded-sm w-full max-w-sm bg-zinc-100 p-4 flex flex-col gap-4" @click.stop="null">
			<div class="flex justify-between">
				<div class="text-lg uppercase font-medium">{{ t('modal.signUp') }}</div>
				<button aria-label="Close" @click="emit('closed')">
					<ion-icon :icon="closeOutline" class="w-6 h-6"></ion-icon>
				</button>
			</div>
			<div>{{ t('text.createNewAccount') }}</div>
			<div class="flex flex-col gap-2">
				<label class="flex flex-col gap-1">
					<span>{{ t('field.name') }} <span class="text-red-600">*</span></span>
					<input
						type="text"
						v-model="auth.name"
						:class="{ '!border-red-600': error.name }"
						:placeholder="t('placeholder.exampleUserName')"
					/>
				</label>
				<div v-if="error.name" class="text-red-600">{{ t('error.requiredName') }}</div>
				<label class="flex flex-col gap-1">
					<span>{{ t('field.email') }} <span class="text-red-600">*</span></span>
					<input
						type="email"
						v-model="auth.email"
						:class="{ '!border-red-600': error.email }"
						:placeholder="t('placeholder.exampleUserEmail')"
					/>
				</label>
				<div v-if="error.email" class="text-red-600">{{ t('error.requiredEmail') }}</div>
				<label class="flex flex-col gap-1">
					<span class="flex justify-between">
						<span>{{ t('field.password') }} <span class="text-red-600">*</span></span>
						<span :class="{ 'text-red-600': auth.password.length < 8 }">
							{{ auth.password.length }}<span v-if="auth.password.length < 8"> / 8</span>
						</span>
					</span>
					<input
						type="password"
						v-model="auth.password"
						:class="{ '!border-red-600': error.password.missing || error.password.mismatch || error.password.tooshort }"
						:placeholder="t('placeholder.examplePassword', { p: examplePassword })"
					/>
					<input
						type="password"
						v-model="auth.repeat"
						:class="{ '!border-red-600': error.password.missing || error.password.mismatch || error.password.tooshort }"
						:placeholder="t('placeholder.repeatPassword')"
					/>
				</label>
				<div
					v-if="error.password.missing || error.password.mismatch || error.password.tooshort"
					class="text-red-600"
				>
					<span v-if="error.password.missing">{{ t('error.requiredPassword') }}</span>
					<span v-if="error.password.mismatch"> {{ t('error.passwordsDontMatch') }}</span>
					<span v-if="error.password.tooshort"> {{ t('error.passwordTooShort') }}</span>
				</div>
			</div>
			<div class="flex justify-end items-center gap-4">
				<button class="px-3 py-1 text-zinc-500" aria-label="Cancel" @click.prevent="emit('closed')">
					{{ t('button.cancel') }}
				</button>
				<primary-button class="grow" @click="signUp">
					{{ $t('button.signUp') }}
					<ion-icon :icon="personAddOutline" class="w-6 h-6"></ion-icon>
				</primary-button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { reactive, computed } from 'vue';
import { useI18n } from "vue-i18n";
import { randomString } from '@/utils.js';
import { closeOutline, personAddOutline } from 'ionicons/icons';
import PrimaryButton from '@/elements/primaryButton.vue';
const { t } = useI18n();

// inherited properties
const props = defineProps({
	active: Boolean // state of modal display, true to show modal
});

// non reactive data
const examplePassword = randomString(8);

// reactive data
const auth = reactive({
	name: '',
	email: '',
	password: '',
	repeat: '',
});
const error = reactive({
	name: false,
	email: false,
	password: {
		missing: false,
		mismatch: false,
		tooshort: false,
	}
});

// emits
const emit = defineEmits(['submitted', 'closed']);

// computed: calculate wether form errors occured
const errors = computed(() => (
	error.name ||
	error.email ||
	error.password.missing ||
	error.password.mismatch ||
	error.password.tooshort
));

const signUp = () => {
	// first check for form errors
	error.name = auth.name == '';
	error.email = auth.email == '';
	error.password.missing = auth.password == '';
	error.password.mismatch = auth.password != auth.repeat;
	error.password.tooshort = auth.password.length < 8;
	// no errors: send submitted auth data and close modal
	if (!errors.value) {
		emit('submitted', auth);
		emit('closed');
	}
};
</script>
