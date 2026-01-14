<script setup>
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { CATEGORY_META } from '@/constants/category'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
})

const chartData = computed(() => ({
  labels: props.data.map(d =>
      CATEGORY_META[d.category]?.label ?? d.category
  ),
  datasets: [
    {
      data: props.data.map(d => d.totalExpense),
      backgroundColor: props.data.map(
          d => CATEGORY_META[d.category]?.color ?? '#9ca3af'
      ),
      borderWidth: 0,
    },
  ],
}))

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'right',
      labels: {
        boxWidth: 12,
        padding: 16,
      },
    },
    tooltip: {
      callbacks: {
        label: (ctx) => {
          const value = ctx.raw.toLocaleString()
          return `₩ ${value}`
        },
      },
    },
  },
}
</script>

<template>
  <div class="card">
    <h3 class="title">카테고리별 지출</h3>

    <div v-if="!data.length" class="empty">
      데이터가 없습니다
    </div>

    <Doughnut v-else :data="chartData" :options="options" />
  </div>
</template>

<style scoped>
.card {
  background: #fff;
  padding: 16px;
  border-radius: 12px;
}

.title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}

.empty {
  text-align: center;
  color: #9ca3af;
  padding: 40px 0;
}
</style>
