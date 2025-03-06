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
					<icon-brand-youtube class="shrink-0 w-4 h-4 stroke-1.5" />
					{{ t('field.youtube') }}
					<icon-external-link class="shrink-0 w-4 h-4 stroke-1.5" />
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
					<icon-external-link class="shrink-0 w-4 h-4 stroke-1.5" />
				</tag>
			</a>
			<!-- tags -->
			<div class="flex flex-wrap gap-1">
				<router-link
					v-for="tag in sortedTags" :key="tag.key"
					:to="{ name: 'songs', params: { tag: tag.key }}"
				>
					<tag :tag="tag" />
				</router-link>
			</div>
		</div>
		<div v-if="song.year || song.publisher" class="text-sm text-blade-500">
			&copy; {{ song.year }} {{ song.publisher }}
		</div>
		<div v-if="song.note">{{ song.note }}</div>
	</footer>
</template>

<script setup>
import { computed } from 'vue';
import { sortTags } from '@/utils.js';
import { useI18n } from 'vue-i18n';
import Tag from '@/elements/Tag.vue';

// icons
import {
	IconBrandYoutube,
	IconExternalLink
} from '@tabler/icons-vue';

// component constants
const { t, locale } = useI18n();
const loc = locale.value.substring(0, 2);

// component properties
const props = defineProps({
	song: Object,
	tags: Object,
});

// sort tag list
const sortedTags = computed(() => {
	const songTags = props.song.tags.map(t => props.tags[t]);
	return sortTags(songTags, loc);
});
</script>
