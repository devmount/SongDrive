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
					data: dataset.data,
					backgroundColor: dataset.bcolor,
					borderWidth: 2,
					borderColor: dataset.color,
				})
			}
			new Chart(this.id, {
				type: 'doughnut',
				data: {
					datasets: datasets,
					labels: this.labels,
				},
				options: {
				}
			})
		}
	}
}
</script>
