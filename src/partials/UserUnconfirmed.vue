<template>
	<div class="h-screen flex flex-col justify-center items-center gap-12 px-2">
		<!-- heading -->
		<logo :featured="true" :show-version="false" />
		<!-- unconfirmed message -->
		<panel class="max-w-sm w-full flex flex-col gap-6">
			<div class="text-2xl text-center">{{ t('text.waitingForApproval') }}</div>
			<div>{{ t('text.notApprovedYet') }}</div>
			<div v-if="hasContact">
				{{ t('text.unconfirmedMistake') }}
			</div>
			<div class="flex gap-2 w-full">
				<secondary-button v-if="hasContact" @click="mailto(config.contact.email)" class="grow">
					{{ t('button.contactUs') }}
					<icon-send class="w-6 h-6 stroke-1.5" />
				</secondary-button>
				<secondary-button @click="emit('signOut')" class="grow">
					{{ t('button.signOut') }}
					<icon-logout class="w-6 h-6 stroke-1.5" />
				</secondary-button>
			</div>
		</panel>
	</div>
</template>

<script setup>
import { computed } from 'vue';
import { mailto } from '@/utils.js';
import { useI18n } from 'vue-i18n';
import Logo from '@/partials/Logo.vue';
import Panel from '@/elements/Panel.vue';
import SecondaryButton from '@/elements/SecondaryButton.vue';

// icons
import { IconLogout, IconSend } from '@tabler/icons-vue';

// component constants
const { t } = useI18n();

// emits
const emit = defineEmits(['signOut']);

// component properties
const props = defineProps({
  ready: Object,
  config: Object,
});

// check if contact email address is configured and ready
const hasContact = computed(() => props.ready.config && props.config?.contact?.email);
</script>
