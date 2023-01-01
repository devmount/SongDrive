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
				<div class="text-lg uppercase font-medium">{{ t('modal.signUp') }}</div>
				<button aria-label="Close" @click="emit('closed')">
					<ion-icon :icon="closeOutline" class="w-6 h-6" />
				</button>
			</div>
			<div>{{ t('text.createNewAccount') }}</div>
			<div class="flex flex-col gap-2">
				<label class="flex flex-col gap-1">
					<span>{{ t('field.name') }} <span class="text-rose-600">*</span></span>
					<input
						type="text"
						v-model="auth.name"
						:class="{ '!border-rose-600': error.name }"
						:placeholder="t('placeholder.exampleUserName')"
					/>
				</label>
				<div v-if="error.name" class="text-rose-600">{{ t('error.requiredName') }}</div>
				<label class="flex flex-col gap-1">
					<span>{{ t('field.email') }} <span class="text-rose-600">*</span></span>
					<input
						type="email"
						v-model="auth.email"
						:class="{ '!border-rose-600': error.email }"
						:placeholder="t('placeholder.exampleUserEmail')"
					/>
				</label>
				<div v-if="error.email" class="text-rose-600">{{ t('error.requiredEmail') }}</div>
				<label class="flex flex-col gap-1">
					<span class="flex justify-between">
						<span>{{ t('field.password') }} <span class="text-rose-600">*</span></span>
						<span :class="{ 'text-rose-600': auth.password.length < 8 }">
							{{ auth.password.length }}<span v-if="auth.password.length < 8"> / 8</span>
						</span>
					</span>
					<input
						type="password"
						v-model="auth.password"
						:class="{ '!border-rose-600': errorsPassword }"
						:placeholder="t('placeholder.examplePassword', { p: examplePassword })"
					/>
					<input
						type="password"
						v-model="auth.repeat"
						:class="{ '!border-rose-600': errorsPassword }"
						:placeholder="t('placeholder.repeatPassword')"
					/>
				</label>
				<div
					v-if="errorsPassword"
					class="text-rose-600"
				>
					<span v-if="error.password.missing">{{ t('error.requiredPassword') }}&nbsp;</span>
					<span v-if="error.password.mismatch">{{ t('error.passwordsDontMatch') }}&nbsp;</span>
					<span v-if="error.password.tooshort">{{ t('error.passwordTooShort') }}</span>
				</div>
			</div>
			<div class="flex flex-col justify-end items-center gap-4 mt-4 2xs:flex-row">
				<button class="px-3 py-2 text-blade-500" aria-label="Cancel" @click.prevent="emit('closed')">
					{{ t('button.cancel') }}
				</button>
				<Primary-button class="grow" @click="signUp">
					{{ $t('button.signUp') }}
					<ion-icon :icon="personAddOutline" class="w-6 h-6" />
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
import PrimaryButton from '@/elements/PrimaryButton.vue';
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
const errorsPassword = computed(() => (
	error.password.missing ||
	error.password.mismatch ||
	error.password.tooshort
));
const errors = computed(() => (
	error.name ||
	error.email ||
	errorsPassword.value
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
