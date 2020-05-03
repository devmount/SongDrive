<template>
	<div class="content song-content columns">
		<div
			class="column col-6"
			:class="{ 'present': presentation, 'text': !chords, 'col-2x-12': !presentation }"
			v-for="(parts, i) in parsedContent"
			:key="i"
		>
			<pre v-for="(part, j) in parts" :key="j" :class="part.class"><span v-for="(line, l) in part.content.split('\n')" :key="l" :class="{ chords: isChordLine(line) }">{{ line }}</span></pre>
		</div>
	</div>
</template>

<script>
// get basic program parameters
import basics from '@/basics'

export default {
	name: 'song-content',
	props: {
		content: String,
		chords: Boolean,
		tuning: Number,
		presentation: Boolean
	},
	data () {
		return {
			tunes: basics.tunes,
			margin: 40
		}
	},
	methods: {
		isChordLine(line) {
			return basics.isChordLine(line)
		},
		maximizeFontsize() {
			// all parent elements
			for (let a of document.querySelectorAll('.present')) {
				// all child elements
				for (let b of a.querySelectorAll('pre')) {
					let fontSize = parseInt(getComputedStyle(b).fontSize.match(/\d+/)[0])
					// increase font size as long as the child is still smaller than the parent with a max of 100 iterations
					let n1 = 100
					while (b.offsetWidth < a.offsetWidth*.9 && n1 > 0) {
						fontSize += 4
						b.style.fontSize = fontSize + 'px'
						n1--
					}
					// decrease font size if the child width exceeds the parents width with a max of 100 iterations
					let n2 = 100
					while (b.offsetWidth > a.offsetWidth*.9 && n2 > 0) {
						b.style.fontSize = (fontSize--) + 'px'
						n2--
					}
				}
			}
			// decrease font size of parts with greatest font size first if it doesnt fit into viewport height
			let vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)-85
			// handle both columns
			for (let c of document.querySelectorAll('.present')) {
				let parts = []
				for (let d of c.querySelectorAll('pre')) {
					parts.push({
						part: d,
						size: parseInt(getComputedStyle(d).fontSize.match(/\d+/)[0]),
						height: d.offsetHeight+this.margin
					})
				}
				// decrease font size of parts in columns with a greater height than viewport
				// as long as the sum of the heights of the parts is greater than the viewport height with a max of 50 iterations
				let n = 50
				while (parts.map(o=>o.height).reduce((p,c)=>p+c) > vh && n > 0) {
					parts.sort(function(a, b) { return b.size - a.size; })
					if (parts.length > 0) {
						parts[0].part.style.fontSize = (parts[0].size - 5) + 'px'
						parts[0].size = parseInt(getComputedStyle(parts[0].part).fontSize.match(/\d+/)[0])
						parts[0].height = parts[0].part.offsetHeight+this.margin
					}
					n--
				}
			}
		}
	},
	computed: {
		// parse song content
		parsedContent() {
			return basics.parsedContent(this.content, this.tuning, this.chords, true)
		}
	}
}
</script>
