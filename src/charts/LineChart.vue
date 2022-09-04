<template>
<div class="chart">
	<h2 v-if="title" class="text-center">{{ title }}</h2>
	<p v-if="description" class="text-gray text-center">{{ description }}</p>
	<div
		class="chart-container"
		:style="{
			width: width ? width : 'auto',
			height: height ? height : 'auto'
		}"
	>
		<canvas :id="id"></canvas>
	</div>
</div>
</template>

<script setup>
import { computed, watch, onMounted } from 'vue';
import { Chart, transparentGradientLine } from '../chart.config'

// inherited properties
const props = defineProps({
	title:       String,  // chart title to print as heading if set
	description: String,  // chart descriptional text to print between heading and chart if set
	labels:      Array,   // chart data labels (mandatory)
	datasets:    Array,   // chart datasets (mandatory)
	abscissa:    Boolean, // true if abscissa axis should be shown
	ordinate:    Boolean, // true if ordinate axis should be shown
	tooltips: {           // true if tooltips should be shown
		type: Boolean,
		default: true
	},
	thickness: {          // chart line width
		type: Number,
		default: 2
	},
	unfinished: {         // true if last segment should be drawn with a dashed line
		type: Boolean,
		default: true
	},
	width: String,        // chart width value with unit
	height: String,       // chart height value with unit
});

// non-reactive data
const id = Math.random().toString(36).substring(7);
let chart = null;

// computed: bring given datasets in chart.js readable format
const processedDatasets = computed(() => {
	let datasets = props.datasets;
	datasets.map(d => {
		// gradient for background
		d.backgroundColor = context => {
			const { ctx, chartArea } = context.chart;
			if (!chartArea) return null;
			return transparentGradientLine(ctx, chartArea, d.borderColor);
		};
		// dashed line for last segment
		d.segment = {
			borderDash: ctx => this.unfinished && ctx.p0?.parsed.x == d.data.length-2 ? [10, 5] : undefined
		};
	})
	return datasets;
});

// create chart
const draw = () => {
	chart = new Chart(id, {
		type: "line",
		data: {
			datasets: processedDatasets.value,
			labels: props.labels,
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			fill: true,
			datasets: {
				line: {
					borderWidth: props.thickness,
					tension: 0.15,
					pointRadius: props.labels.length == 1 ? 5 : 0
				}
			},
			plugins: {
				tooltip: {
					enabled: props.tooltips,
					callbacks: {
						label: context => ' ' + context.formattedValue + ' ' + context.dataset.label,
						labelColor: context => {
							return {
								borderWidth: 2,
								borderColor: context.dataset.borderColor,
								backgroundColor: context.dataset.borderColor + '33',
							};
						},
					}
				},
			},
			scales: {
				x: {
					display: props.abscissa,
					alignToPixels: true,
					stacked: false,
					grid: {
						display: false,
						drawBorder: false,
					},
					ticks: {
						maxRotation: 0,
						autoSkipPadding: 10,
					},
					beginAtZero: true
				},
				y: {
					display: props.ordinate,
					stacked: false,
					grid: {
						display: false,
						drawBorder: false,
					},
					beginAtZero: true
				}
			}
		}
	});
};

// update chart if new data arrives
watch (() => props.datasets, () => {
	chart.data.labels = props.labels;
	chart.data.datasets = processedDatasets.value;
	// show points if only one data column exists and therefore no line can be drawn
	chart.options.datasets.line.pointRadius = props.labels.length == 1 ? 5 : 0;
	chart.update();
});
// update chart if ordinate is toggeled
watch (() => props.ordinate, (newValue) => {
	chart.options.scales.y.display = newValue;
	chart.update();
});

// handle mount hooks
onMounted(() => {
	// draw chart when component is ready
	if (props.labels && props.datasets) {
		draw();
	}
});
</script>

<style lang="scss">
.chart {
	display: flex;
	flex-flow: column;
	&>h2, &>p {
		flex: 0 1 auto;
	}
	&>.chart-container {
		position: relative;
		flex: 1 1 auto;
	}
}
</style>
