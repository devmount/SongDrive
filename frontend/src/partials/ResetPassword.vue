<template>
	<div class="h-screen flex flex-col justify-center items-center gap-12 px-2">
		<!-- heading -->
		<logo :featured="true" :show-version="false" />
		<!-- reset panel -->
		<panel-box class="max-w-xs w-full">
			<!-- no token in the link at all -->
			<template v-if="!token">
				<div class="text-center text-rose-600">{{ t('text.resetLinkInvalid') }}</div>
				<primary-button class="w-full mt-3" @click="backToLogin">
					{{ t('button.signIn') }}
					<icon-login class="w-6 h-6 stroke-1.5" />
				</primary-button>
			</template>
			<!-- password successfully changed -->
			<template v-else-if="done">
				<div class="text-center">{{ t('toast.userUpdatedText') }}</div>
				<primary-button class="w-full mt-3" @click="backToLogin">
					{{ t('button.signIn') }}
					<icon-login class="w-6 h-6 stroke-1.5" />
				</primary-button>
			</template>
			<!-- set new password form -->
			<template v-else>
				<div class="text-center">{{ t('text.setNewPassword') }}</div>
				<div v-if="invalidToken" class="text-rose-600 text-center">{{ t('text.resetLinkInvalid') }}</div>
				<div class="flex flex-col gap-1">
					<span class="flex justify-between">
						<span>{{ t('field.newPassword') }}</span>
						<span :class="{ 'text-rose-600': password.length < 8 }">
							{{ password.length }}<span v-if="password.length < 8"> / 8</span>
						</span>
					</span>
					<input
						type="password"
						v-model="password"
						:class="{ 'border-rose-600!': error.missing || error.mismatch || error.tooshort }"
						:placeholder="t('placeholder.examplePassword', { p: examplePassword })"
					/>
					<input
						type="password"
						v-model="repeat"
						:class="{ 'border-rose-600!': error.missing || error.mismatch }"
						:placeholder="t('placeholder.repeatPassword')"
					/>
				</div>
				<div
					v-if="error.missing || error.mismatch || error.tooshort"
					class="text-rose-600"
				>
					<span v-if="error.missing">{{ t('error.requiredPassword') }}&nbsp;</span>
					<span v-if="error.mismatch">{{ t('error.passwordsDontMatch') }}&nbsp;</span>
					<span v-if="error.tooshort">{{ t('error.passwordTooShort') }}</span>
				</div>
				<primary-button class="w-full mt-3" @click="submit">
					{{ t('button.changePassword') }}
					<icon-loader2 v-if="busy" class="w-6 h-6 stroke-1.5 animate-spin" />
					<icon-device-floppy v-else class="w-6 h-6 stroke-1.5" />
				</primary-button>
			</template>
		</panel-box>
	</div>
</template>

<script setup lang="ts">
import { injectStrict, clientKey } from '@/keys';
import { notify } from '@kyvg/vue3-notification';
import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { randomString } from '@/utils.js';
import Logo from '@/partials/Logo.vue';
import PanelBox from '@/elements/PanelBox.vue';
import PrimaryButton from '@/elements/PrimaryButton.vue';

// icons
import {
	IconDeviceFloppy,
	IconLoader2,
	IconLogin,
} from '@tabler/icons-vue';

// component constants
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const client = injectStrict(clientKey);
const examplePassword = randomString(8);
const token = typeof route.query.token === 'string' ? route.query.token : '';

// input data
const password = ref('');
const repeat = ref('');

// available form errors
const error = reactive({
	missing: false,
	mismatch: false,
	tooshort: false,
});

// state
const busy = ref(false);
const invalidToken = ref(false);
const done = ref(false);

// set new password using the reset token from the link
const submit = async () => {
	error.missing = password.value === '';
	error.mismatch = password.value !== repeat.value;
	error.tooshort = password.value.length < 8;
	if (error.missing || error.mismatch || error.tooshort || !client.value) return;

	busy.value = true;
	const success = await client.value.loginManager.getAmberUserApi().changePasswordWithToken(token, password.value);
	busy.value = false;

	if (success) {
		done.value = true;
		notify({ title: t('toast.userUpdated'), text: t('toast.userUpdatedText'), type: 'primary' });
	} else {
		invalidToken.value = true;
		notify({ title: t('toast.resetLinkInvalid'), text: t('text.resetLinkInvalid'), type: 'error' });
	}
};

// leave the reset page and return to the regular login screen
const backToLogin = () => router.push({ path: '/' });
</script>
