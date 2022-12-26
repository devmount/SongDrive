<template>
	<footer v-if="song">
		<div class="column col-6 col-md-12 text-small">
			<p>{{ song.authors }}</p>
			<p>
				<!-- youtube -->
				<a
					v-if="song.youtube"
					:href="'https://youtu.be/' + song.youtube"
					class="mr-2"
					target="_blank"
				>
					<span class="label px-2 py-1">
						<ion-icon :icon="logoYoutube" class="icon-sm mr-1" />
						{{ t('field.youtube') }}
						<ion-icon :icon="openOutline" class="icon-sm ml-1" />
					</span>
				</a>
				<!-- ccli -->
				<a
					v-if="song.ccli"
					:href="'https://songselect.ccli.com/Songs/' + song.ccli"
					class="mr-4"
					target="_blank"
				>
					<span class="label px-2 py-1">
						{{ t('field.ccli') }}
						<ion-icon :icon="openOutline" class="icon-sm ml-1" />
					</span>
				</a>
				<!-- tags -->
				<router-link
					v-for="tag in song.tags"
					:key="tag"
					:to="{ name: 'songs-tag', params: { tag: tag }}"
					class="mr-2"
				>
					<span class="label px-2 py-1">
						<ion-icon :icon="pricetagOutline" class="icon-sm mr-1" />
						{{ tags[tag][locale] ? tags[tag][locale] : tag }}
					</span>
				</router-link>
			</p>
			<p class="text-gray text-breaks">&copy; {{ song.year }} {{ song.publisher }}</p>
		</div>
		<div v-if="song.note" class="column col-6 col-md-12 text-breaks">{{ song.note }}</div>
	</footer>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import { logoYoutube, openOutline, pricetagOutline } from 'ionicons/icons';
const { t, locale } = useI18n();

const props = defineProps({
	song: Object,
	tags: Object,
});
</script>
