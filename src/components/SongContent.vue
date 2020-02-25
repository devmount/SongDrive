<template>
	<div class="content columns">
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
			tunes: basics.tunes
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
					var fontSize = parseInt(getComputedStyle(b).fontSize.match(/\d+/)[0])
					// increase font size as long as the child is still smaller than the parent
					while (b.offsetWidth < a.offsetWidth*.9) {
						b.style.fontSize = (fontSize++) + 'px'
					}
					// decrease font size if the child width exceeds the parents width
					while (b.offsetWidth > a.offsetWidth*.9) {
						b.style.fontSize = (fontSize--) + 'px'
					}
				}
			}  
			// decrease font size of parts with greatest font size first if it doesnt fit into viewport height
			const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)-85
			// handle both columns
			for (let c of document.querySelectorAll('.present')) {
				var parts = []
				for (let d of c.querySelectorAll('pre')) {
					parts.push({
						part: d,
						size: parseInt(getComputedStyle(d).fontSize.match(/\d+/)[0]),
						height: d.offsetHeight+40
					})
				}
				// decrease font size of parts in columns with a greater height than viewport
				// as long as the sum of the heights of the parts is greater than the viewport height with a max of 100 iterations
				var n = 100
				while (parts.map(o=>o.height).reduce((p,c)=>p+c) > vh && n > 0) {
					parts.sort(function(a, b) { return b.size - a.size; })
					if (parts.length > 0) {
						parts[0].part.style.fontSize = (parts[0].size - 5) + 'px'
						parts[0].size = parseInt(getComputedStyle(parts[0].part).fontSize.match(/\d+/)[0])
						parts[0].height = parts[0].part.offsetHeight+40
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

<style lang="scss">
$primary-color: #88b544;
$bg-color-light: #1b1e1f;
$bg-color-dark: #293031;

pre {
	position: relative;
	overflow: visible;
	margin-top: 40px;
	margin-bottom: 0;

  &>span {
    display: block;

		&.chords {
			color: $primary-color;
		}
  }
	// prevent short song parts being displayed next to each other
	&::after {
		content: '';
		height: 1px;
		width: 40vw;
		display: block;
	}
}
.present > pre {
	display: inline-block;

	&:first-child {
		margin-top: 20px;
	}
}
.verse {
	border-left: 2px solid $bg-color-dark;
	position: relative;
	padding-left: 1em;
	margin-left: .6em;
}
.verse::before {
	display: inline-block;
	position: absolute;
	background: $bg-color-light;
	left: -.45em;
	top: .35em;
	width: .8em;
	line-height: 1.3em;
	height: 1.15em;
	text-align: center;
	font-size: 2em;
	font-family: "Fira Sans";
	font-weight: 300;
}
.verse.part1::before {
	content: '1';
}
.verse.part2::before {
	content: '2';
}
.verse.part3::before {
	content: '3';
}
.verse.part4::before {
	content: '4';
}
.verse.part5::before {
	content: '5';
}
.verse.part6::before {
	content: '6';
}
.verse.part7::before {
	content: '7';
}
.verse.part8::before {
	content: '8';
}
.verse.part9::before {
	content: '9';
}

.text > pre {
	font-family: Fira Sans;
	font-size: 1.5em;
	margin-bottom: .2em;
}
</style>
