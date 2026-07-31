<template>
	<div class="flex flex-col">
		<h2 v-if="title" class="flex-initial text-center">
			{{ title }}
		</h2>
		<div v-if="description" class="flex-initial text-blade-500 text-center">
			{{ description }}
		</div>
		<div
			class="relative flex-auto"
			:style="{
				width: width ? width : 'auto',
				height: height ? height : 'auto'
			}"
		>
			<canvas :id="id"></canvas>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, type PropType } from 'vue';
import { Chart, transparentGradientLine } from '@/chart.config.js';
import type { ChartConfiguration, TooltipItem, ScriptableContext, ScriptableLineSegmentContext } from 'chart.js';

// a chart.js line dataset, loosely typed: this component mutates arbitrary
// extra fields onto dataset objects at runtime, which doesn't fit chart.js's
// strict per-type ChartDataset shape
type LineDataset = {
	data: unknown[];
	borderColor: string;
	backgroundColor?: unknown;
	segment?: unknown;
	[key: string]: unknown;
};

// inherited properties
const props = defineProps({
	title:       String,  // chart title to print as heading if set
	description: String,  // chart descriptional text to print between heading and chart if set
	labels:      { type: Array as PropType<unknown[]>, required: true },   // chart data labels (mandatory)
	datasets:    { type: Array as PropType<LineDataset[]>, required: true },   // chart datasets (mandatory)
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
let chart: Chart<'line'> | null = null;

// computed: bring given datasets in chart.js readable format
const processedDatasets = computed(() => {
	let datasets = props.datasets;
	datasets.map(d => {
		// gradient for background
		d.backgroundColor = (context: ScriptableContext<'line'>) => {
			const { ctx, chartArea } = context.chart;
			if (!chartArea) return null;
			return transparentGradientLine(ctx, chartArea, d.borderColor);
		};
		// dashed line for last segment
		d.segment = {
			borderDash: (ctx: ScriptableLineSegmentContext) => props.unfinished && ctx.p0.parsed.x == d.data.length-2 ? [10, 5] : undefined
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
						label: (context: TooltipItem<'line'>) => ' ' + context.formattedValue + ' ' + context.dataset.label,
						labelColor: (context: TooltipItem<'line'>) => {
							const color = String(context.dataset.borderColor);
							return {
								borderWidth: 2,
								borderColor: color,
								backgroundColor: color + '33',
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
					},
					beginAtZero: true
				}
			}
		}
	} as unknown as ChartConfiguration<'line'>);
};

// update chart if new data arrives
watch (() => props.datasets, () => {
	if (!chart) return;
	chart.data.labels = props.labels;
	chart.data.datasets = processedDatasets.value as unknown as ChartConfiguration<'line'>['data']['datasets'];
	// show points if only one data column exists and therefore no line can be drawn
	if (chart.options.datasets?.line) {
		chart.options.datasets.line.pointRadius = props.labels.length == 1 ? 5 : 0;
	}
	chart.update();
});
// update chart if ordinate is toggeled
watch (() => props.ordinate, (newValue) => {
	if (!chart?.options.scales?.y) return;
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
