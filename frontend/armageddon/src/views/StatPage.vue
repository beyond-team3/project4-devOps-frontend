<script setup>
import { ref } from 'vue'
import { onMounted } from 'vue'
import PeriodSelector from '@/components/stat/PeriodSelector.vue'
import SummaryCards from '@/components/stat/SummaryCards.vue'
import { fetchSummaryStatistics } from '@/api/statistics'
const loading = ref(false)

onMounted(() => {
  onPeriodChange({ startDate: null, endDate: null })
})

const summaryData = ref({
  totalIncome: 0,
  totalExpense: 0,
  netProfit: 0,
  avgExpense: 0,
})


const error = ref(null)

const onPeriodChange = async ({ startDate, endDate }) => {
  loading.value = true
  error.value = null

  try {
    const params = {}
    if (startDate) params.startDate = startDate.toISOString().slice(0, 10)
    if (endDate) params.endDate = endDate.toISOString().slice(0, 10)

    const { data } = await fetchSummaryStatistics(params)

    summaryData.value = {
      totalIncome: data?.totalIncome ?? 0,
      totalExpense: data?.totalExpense ?? 0,
      netProfit: data?.netProfit ?? 0,
      avgExpense: data?.averageExpense ?? 0,
    }
  } catch (e) {
    console.error(e)
    error.value = '요약 통계를 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <PeriodSelector @change="onPeriodChange" />

  <div v-if="loading">로딩중...</div>
  <div v-else-if="error">{{ error }}</div>

  <SummaryCards
      v-else
      :totalIncome="summaryData.totalIncome"
      :totalExpense="summaryData.totalExpense"
      :netProfit="summaryData.netProfit"
      :avgExpense="summaryData.avgExpense"
  />
</template>

<style scoped>
</style>
