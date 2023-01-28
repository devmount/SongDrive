<template>
	<footer v-if="song" class="flex flex-col gap-4">
		<div class="text-sm">{{ song.authors }}</div>
		<div class="flex flex-wrap gap-2">
			<!-- youtube -->
			<a
				v-if="song.youtube"
				:href="'https://youtu.be/' + song.youtube"
				target="_blank"
			>
				<tag>
					<brand-youtube-icon class="shrink-0 w-4 h-4 stroke-1.5" />
					{{ t('field.youtube') }}
					<external-link-icon class="shrink-0 w-4 h-4 stroke-1.5" />
				</tag>
			</a>
			<!-- ccli -->
			<a
				v-if="song.ccli"
				:href="'https://songselect.ccli.com/Songs/' + song.ccli"
				target="_blank"
			>
				<tag>
					{{ t('field.ccli') }}
					<external-link-icon class="shrink-0 w-4 h-4 stroke-1.5" />
				</tag>
			</a>
			<!-- tags -->
			<div class="flex flex-wrap gap-1">
				<router-link
					v-for="tag in song.tags" :key="tag"
					:to="{ name: 'songs-tag', params: { tag: tag }}"
				>
					<tag :tag="tags[tag]" />
				</router-link>
			</div>
		</div>
		<div class="text-sm text-blade-500">
			&copy; {{ song.year }} {{ song.publisher }}
		</div>
		<div v-if="song.note">{{ song.note }}</div>
	</footer>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import Tag from '@/elements/Tag';

// icons
import {
	BrandYoutubeIcon,
	ExternalLinkIcon
} from "vue-tabler-icons";

// component constants
const { t } = useI18n();

const props = defineProps({
	song: Object,
	tags: Object,
});
</script>
