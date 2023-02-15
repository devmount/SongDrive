<template>
	<modal :active="active" :title="t('modal.signUp')" @closed="emit('closed')">
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
			<primary-button class="grow" @click="signUp">
				{{ $t('button.signUp') }}
				<user-plus-icon class="w-6 h-6 stroke-1.5" />
			</primary-button>
		</div>
	</modal>
</template>

<script setup>
import { randomString } from '@/utils.js';
import { reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Modal from '@/elements/Modal';
import PrimaryButton from '@/elements/PrimaryButton';

// icons
import { UserPlusIcon } from 'vue-tabler-icons';

// component constants
const { t } = useI18n();
const examplePassword = randomString(8);

// inherited properties
const props = defineProps({
	active: Boolean // state of modal display, true to show modal
});

// input data
const auth = reactive({
	name: '',
	email: '',
	password: '',
	repeat: '',
});

// emits
const emit = defineEmits(['submitted', 'closed']);

// possible form errors
const error = reactive({
	name: false,
	email: false,
	password: {
		missing: false,
		mismatch: false,
		tooshort: false,
	}
});
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

// sign current user up
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
