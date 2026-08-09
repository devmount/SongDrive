<template>
	<div
		class="w-full flex flex-wrap "
		:class="{
			'flex-row gap-8': !presentation,
			'flex-col xs:flex-row gap-7 xs:gap-0 pb-10 xs:pb-0': presentation
		}"
	>
		<div
			v-for="(parts, i) in parsedContent(content, keyOffset, chords, true)" :key="i"
			class="flex flex-col gap-7 items-start"
			:class="{ 'present w-full xs:w-1/2 overflow-x-visible': presentation }"
		>
			<pre
				v-for="(part, j) in parts" :key="j"
				:part="String(part.number)"
				class="relative overflow-visible"
				:class="{
					'relative before:absolute before:top-1 before:font-fira before:font-light before:content-[attr(part)] before:w-12 before:-left-6 before:text-right': part.class === 'verse' && Number(part.number) > 0,
					'font-fira text-2xl': !chords,
					'pl-8 before:text-4xl': !presentation,
					'inline-block leading-[1.4] pl-6 md:pl-8 before:text-3xl md:before:text-4xl before:-left-8 md:before:-left-6': presentation,
					'pl-0!': part.class === 'chorus',
				}"
			><div
				v-for="(line, l) in part.content.split('\n')" :key="l"
				:class="{ 'text-spring-600 -mb-1': isChordLine(line) }"
			>{{ line }}</div></pre>
		</div>
	</div>
</template>

<script setup lang="ts">
import { isChordLine, parsedContent } from '@/utils.js';

const props = defineProps({
	content:      { type: String, default: '' },  // actual song content to display
	chords:       Boolean, // true if chords shall be rendered
	keyOffset:    { type: Number, default: 0 },  // semitone offset from the song's base key to present it in
	presentation: Boolean, // flag if song is displayed in presentation mode
});
</script>
