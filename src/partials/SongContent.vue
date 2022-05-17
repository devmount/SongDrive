<template>
	<div class="content song-content columns">
		<div
			class="column col-6"
			:class="{ 'present': presentation, 'text': !chords, 'col-2x-12': !presentation }"
			v-for="(parts, i) in parsedContent(content, tuning, chords, true)"
			:key="i"
		>
			<pre v-for="(part, j) in parts" :key="j" :class="part.class"><!--
				--><span v-for="(line, l) in part.content.split('\n')" :key="l" :class="{ chords: isChordLine(line) }"><!--
					-->{{ line }}<!--
				--></span><!--
			--></pre>
		</div>
	</div>
</template>

<script>
export default {
	name: 'song-content',
	props: {
		content: String,
		chords: Boolean,
		tuning: Number,
		presentation: Boolean
	},
	methods: {
		maximizeFontsize() {
			// config
			const WIDTH_MARGIN = 40;
			const HEIGHT_MARGIN = 40;
			const MAX_FONTSIZE = 48;
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
				while (parts.map(o => o.height).reduce((p,c) => p + c) > vh && n > 0) {
					parts.sort((a, b) => b.size - a.size);
					if (parts.length > 0) {
						parts[0].part.style.fontSize = (parts[0].size - 3) + 'px';
						parts[0].size = parseInt(getComputedStyle(parts[0].part).fontSize.match(/\d+/)[0]);
						parts[0].height = parts[0].part.offsetHeight + HEIGHT_MARGIN;
					}
					n--;
				}
			}
		}
	}
}
</script>
