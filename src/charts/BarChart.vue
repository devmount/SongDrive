<template>
<div class="chart">
	<canvas :id='id'></canvas>
</div>
</template>

<script>
/* eslint no-undef: 0 */
export default {
	props: {
		labels: Array,
		datasets: Array,
	},
	data () {
		return {
			id: Math.random().toString(36).substring(7)
		}
	},
	mounted () {
		if (this.labels.length>0 && this.datasets.length>0) {
			let datasets = []
			for (let i = 0; i < this.datasets.length; i++) {
				const dataset = this.datasets[i]
				datasets.push({
					label: dataset.label,
					data: dataset.data,
					backgroundColor: dataset.bcolor,
					borderWidth: { top: 3 },
					borderColor: dataset.color,
					barPercentage: 1,
					categoryPercentage: .6,
				})
			}
			new Chart(this.id, {
				type: 'bar',
				data: {
					datasets: datasets,
					labels: this.labels,
				},
				options: {
					scales: {
						xAxes: [{
							stacked: false,
							gridLines: {
								display: false,
							},
							ticks: {
								maxRotation: 0,
								autoSkipPadding: 10,
							}
						}],
						yAxes: [{
							display: false,
							stacked: false,
							gridLines: {
								display: false,
							}
						}]
					}
				}
			})
		}
	}
}
</script>
