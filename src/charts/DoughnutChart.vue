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

<script setup>
import { watch, onMounted } from 'vue';
import { Chart } from '@/chart.config';

// inherited properties
const props = defineProps({
	title:       String,  // chart title to print as heading if set
	description: String,  // chart descriptional text to print between heading and chart if set
	info:        Object,  // chart info holding a featured number and corresponding label to show inside doughnut
	labels:      Array,   // chart data labels (mandatory)
	datasets:    Array,   // chart datasets (mandatory)
});

// non-reactive data
const id = Math.random().toString(36).substring(7);
let chart = null;

// update chart if new data arrives
watch (() => props.datasets, (newDatasets) => {
	chart.data.labels = props.labels;
	chart.data.datasets = colorize(newDatasets);
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
						title: context => context[0].label,
						label: context => ' ' + context.formattedValue + ' ' + context.dataset.label,
						labelColor: context => {
							return {
								borderWidth: 2,
								borderColor: context.dataset.borderColor,
								backgroundColor: context.dataset.borderColor + '33',
							};
						}
					}
				}
			}
		}
	});
};
// paint every segment depending on its data
const colorize = (datasets) => {
	datasets.map(d => {
		d.backgroundColor = dataColors(d.data, d.color);
		d.borderColor = d.color;
	});
	return datasets;
};
// calculate list of background colors for each data arc
const dataColors = (data, color) => {
	const colors = [];
	const max = Math.max(...data);
	data.forEach(d => colors.push(color + opacity(d, max)));
	return colors;
};
// calculate opacity as two digit hex for given value based on max value
const opacity = (value, max) => {
	if (max == 0) return '00';
	return Math.round(255*value/max).toString(16).padStart(2, "0");
};
</script>
