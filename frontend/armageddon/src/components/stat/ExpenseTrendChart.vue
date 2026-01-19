<template>
  <div style="width:100%; height:300px;">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import Chart from 'chart.js/auto'

// props 받기
const props = defineProps({
  data: { type: Array, default: () => [] }, // [{label, amount}]
  unit: { type: String, default: 'DAY' }
})

const chartCanvas = ref(null)
let chartInstance = null  // 여기가 안 선언돼서 에러 났던 것

// 차트 렌더링 함수
const renderChart = async () => {
  await nextTick()  // DOM이 렌더링된 후 실행
  if (!chartCanvas.value) return

  const labels = props.data.map(d => d.label)
  const data = props.data.map(d => d.amount)

  if (chartInstance) {
    chartInstance.data.labels = labels
    chartInstance.data.datasets[0].data = data
    chartInstance.update()
  } else {
    chartInstance = new Chart(chartCanvas.value, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: '지출 금액',
          data,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59,130,246,0.2)',
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: val => new Intl.NumberFormat().format(val)
            }
          }
        }
      }
    })
  }
}

// 데이터 변경 시 차트 업데이트
watch(() => props.data, renderChart, { immediate: true })
</script>
