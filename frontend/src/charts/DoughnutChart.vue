<template>
	<div class="flex flex-col">
		<h2 v-if="title" class="flex-initial text-center">
			{{ title }}
		</h2>
		<div v-if="description" class="flex-initial text-blade-500 text-center">
			{{ description }}
		</div>
		<div class="relative flex-auto">
			<canvas :id="id" :style="{ maxHeight: '180px' }"></canvas>
			<div v-if="info" class="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
				<div class="text-5xl leading-10 font-medium">
					{{ info.number }}
				</div>
				<div class="text-blade-500">
					{{ info.label }}
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { watch, onMounted, type PropType } from 'vue';
import { Chart } from '@/chart.config.js';
import type { ChartConfiguration, TooltipItem } from 'chart.js';

// a chart.js doughnut dataset, loosely typed: this component mutates arbitrary
// extra fields (e.g. `color`) onto dataset objects at runtime, which doesn't
// fit chart.js's strict per-type ChartDataset shape
type DoughnutDataset = Record<string, unknown>;

// inherited properties
const props = defineProps({
	title:       String,  // chart title to print as heading if set
	description: String,  // chart descriptional text to print between heading and chart if set
	info:        Object as PropType<{ number: number | string; label: string }>,  // chart info holding a featured number and corresponding label to show inside doughnut
	labels:      { type: Array as PropType<unknown[]>, required: true },   // chart data labels (mandatory)
	datasets:    { type: Array as PropType<DoughnutDataset[]>, required: true },   // chart datasets (mandatory)
});

// non-reactive data
const id = Math.random().toString(36).substring(7);
let chart: Chart<'doughnut'> | null = null;

// update chart if new data arrives
watch (() => props.datasets, (newDatasets) => {
	if (!chart) return;
	chart.data.labels = props.labels;
	chart.data.datasets = colorize(newDatasets) as unknown as ChartConfiguration<'doughnut'>['data']['datasets'];
	chart.update();
});

// handle mount hooks
onMounted(() => {
	// draw chart when component is ready
	if (props.labels && props.datasets) {
		draw();
	}
});

// create chart
const draw = () => {
	chart = new Chart(id, {
		type: "doughnut",
		data: {
			datasets: colorize(props.datasets),
			labels: props.labels,
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			borderWidth: 0,
			cutout: '60%',
			circumference: 180,
			rotation: -90,
			plugins: {
				tooltip: {
					intersect: true,
					position: 'nearest',
					callbacks: {
						title: (context: TooltipItem<'doughnut'>[]) => context[0].label,
						label: (context: TooltipItem<'doughnut'>) => ' ' + context.formattedValue + ' ' + context.dataset.label,
						labelColor: (context: TooltipItem<'doughnut'>) => {
							const color = String(context.dataset.borderColor);
							return {
								borderWidth: 2,
								borderColor: color,
								backgroundColor: color + '33',
							};
						}
					}
				}
			}
		}
	} as unknown as ChartConfiguration<'doughnut'>);
};
// paint every segment depending on its data
const colorize = (datasets: DoughnutDataset[]) => {
	datasets.map(d => {
		d.backgroundColor = dataColors(d.data as number[], d.color as string);
		d.borderColor = d.color;
	});
	return datasets;
};
// calculate list of background colors for each data arc
const dataColors = (data: number[], color: string) => {
	const colors: string[] = [];
	const max = Math.max(...data);
	data.forEach(d => colors.push(color + opacity(d, max)));
	return colors;
};
// calculate opacity as two digit hex for given value based on max value
const opacity = (value: number, max: number) => {
	if (max == 0) return '00';
	return Math.round(255*value/max).toString(16).padStart(2, "0");
};
</script>
