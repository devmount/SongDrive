<template>
	<div class="flex flex-col">
		<h2 v-if="title" class="flex-initial text-center">
			{{ title }}
		</h2>
		<div v-if="description" class="flex-initial text-blade-500 text-center">
			{{ description }}
		</div>
		<div class="relative flex-auto">
			<canvas :id="id"></canvas>
		</div>
	</div>
</template>

<script setup>
import { computed, watch, onMounted } from 'vue';
import { Chart, transparentGradientBar } from '@/chart.config.js';

// inherited properties
const props = defineProps({
	title:       String,  // chart title to print as heading if set
	description: String,  // chart descriptional text to print between heading and chart if set
	labels:      Array,   // chart data labels (mandatory)
	datasets:    Array,   // chart datasets (mandatory)
	horizontal:  Boolean, // true if bars should be horizontal instead of vertical
	ordinate:    Boolean, // true if ordinate axis should be shown
});

// non-reactive data
const id = Math.random().toString(36).substring(7);
let chart = null;

// computed: bring given datasets in chart.js readable format
const processedDatasets = computed(() => {
	let datasets = props.datasets;
	datasets.map(d => {
		d.backgroundColor = context => {
			const { ctx, chartArea } = context.chart;
			if (!chartArea) return null;
			return transparentGradientBar(
				ctx,
				chartArea,
				Array.isArray(d.borderColor) ? d.borderColor[context.dataIndex] : d.borderColor,
				props.horizontal
			);
		}
	})
	return datasets;
});

// create chart
const draw = () => {
	chart = new Chart(id, {
		type: "bar",
		data: {
			datasets: processedDatasets.value,
			labels: props.labels,
		},
		options: {
			indexAxis: props.horizontal ? 'y' : 'x',
			responsive: true,
			maintainAspectRatio: false,
			maxBarThickness: 50,
			datasets: {
				bar: {
					borderWidth: props.horizontal ? { right: 2 } : { top: 2 },
					barPercentage: 1,
					categoryPercentage: .6,
				}
			},
			plugins: {
				tooltip: {
					displayColors: true,
					intersect: true,
					position: 'nearest',
					callbacks: {
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
			},
			scales: {
				x: {
					stacked: false,
					grid: {
						display: false,
						drawBorder: false,
					},
					ticks: {
						maxRotation: 0,
						padding: props.horizontal ? 0 : 10,
					},
					beginAtZero: true
				},
				y: {
					display: props.horizontal || props.ordinate,
					stacked: false,
					grid: {
						display: false,
						drawBorder: false,
					},
					ticks: {
						maxRotation: 0,
						padding: props.horizontal ? 0 : 10,
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
	chart.update();
});
// update chart if ordinate is toggeled
watch (() => props.ordinate, (newValue) => {
	chart.options.scales.y.display = props.horizontal || newValue;
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
