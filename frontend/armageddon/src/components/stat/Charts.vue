<script setup>
import { ref, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps({
  chartData: { type: Object, required: true },
  chartType: { type: String, default: 'doughnut' }
})

const chartRef = ref(null)
let chartInstance = null

onMounted(() => {
  if (chartRef.value) {
    chartInstance = new Chart(chartRef.value.getContext('2d'), {
      type: props.chartType,
      data: props.chartData,
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: { enabled: true }
        },
        scales: props.chartType === 'line' || props.chartType === 'bar' ? { y: { beginAtZero: true } } : {}
      }
    })
  }
})

watch(() => props.chartData, (newData) => {
  if (chartInstance && newData) {
    chartInstance.data = newData
    chartInstance.update()
  }
}, { deep: true })
</script>

<template>
  <canvas ref="chartRef"></canvas>
</template>
