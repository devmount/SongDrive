<template>
	<div
		class="w-full flex flex-wrap overflow-y-auto"
		:class="{
			'flex-row gap-8': !presentation,
			'flex-col xs:flex-row gap-7 xs:gap-0 pb-10 xs:pb-0': presentation
		}"
	>
		<div
			v-for="(parts, i) in parsedContent(content, tuning, chords, true)" :key="i"
			class="flex flex-col gap-7 items-start"
			:class="{ 'present w-full xs:w-1/2 overflow-x-visible': presentation }"
		>
			<pre
				v-for="(part, j) in parts" :key="j"
				:part="part.number"
				class="relative overflow-visible"
				:class="{
					'relative before:absolute before:top-1 before:font-fira before:font-light before:content-[attr(part)]': part.class === 'verse' && part.number > 0,
					'font-fira text-2xl': !chords,
					'pl-8 before:text-4xl before:left-1': !presentation,
					'inline-block leading-[1.4] pl-6 md:pl-8 before:left-0 md:before:left-1 before:text-3xl md:before:text-4xl before:-left-0.5': presentation,
				}"
			><div
				v-for="(line, l) in part.content.split('\n')" :key="l"
				:class="{ 'text-spring-600 -mb-1': isChordLine(line) }"
			>{{ line }}</div></pre>
		</div>
	</div>
</template>

<script setup>
import { isChordLine, parsedContent } from '@/utils.js';

const props = defineProps({
	content:      String,  // actual song content to display
	chords:       Boolean, // true if chords shall be rendered
	tuning:       Number,  // key to present song in
	presentation: Boolean, // flag if song is displayed in presentation mode
});

// methods
const maximizeFontsize = () => {
	// config
	const WIDTH_MARGIN  = 20;
	const HEIGHT_MARGIN = 30;
	const MAX_FONTSIZE  = 48;
	// all parent elements
	for (let a of document.querySelectorAll('.present')) {
		// all child elements
		for (let b of a.querySelectorAll('pre')) {
			let fontSize = parseInt(getComputedStyle(b).fontSize.match(/\d+/)[0]);
			// increase font size as long as the child is still smaller than parent and not greater than max fontsize
			let n1 = 100; // max of 100 iterations for performance reasons
			while (b.offsetWidth < a.offsetWidth - WIDTH_MARGIN && n1 > 0 && fontSize <= MAX_FONTSIZE) {
				b.style.fontSize = (fontSize += 2) + 'px';
				n1--;
			}
			// decrease font size if the child width exceeds the parents width
			let n2 = 100; // max of 100 iterations for performance reasons
			while (b.offsetWidth > a.offsetWidth - WIDTH_MARGIN && n2 > 0) {
				b.style.fontSize = (fontSize--) + 'px';
				n2--;
			}
		}
	}
	// decrease font size of parts with greatest font size first if it doesnt fit into viewport height
	let vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - 85;
	// handle both columns
	for (let c of document.querySelectorAll('.present')) {
		let parts = [];
		for (let d of c.querySelectorAll('pre')) {
			parts.push({
				part: d,
				size: parseInt(getComputedStyle(d).fontSize.match(/\d+/)[0]),
				height: d.offsetHeight + HEIGHT_MARGIN
			});
		}
		// decrease font size of parts in columns with a greater height than viewport
		// as long as the sum of the heights of the parts is greater than the viewport height with a max of 50 iterations
		let n = 50;
		while (parts.map(o => o.height).reduce((p,c) => p + c, 0) > vh && n > 0) {
			parts.sort((a, b) => b.size - a.size);
			if (parts.length > 0) {
				parts[0].part.style.fontSize = (parts[0].size - 3) + 'px';
				parts[0].size = parseInt(getComputedStyle(parts[0].part).fontSize.match(/\d+/)[0]);
				parts[0].height = parts[0].part.offsetHeight + HEIGHT_MARGIN;
			}
			n--;
		}
	}
};

defineExpose({ maximizeFontsize })
</script>
