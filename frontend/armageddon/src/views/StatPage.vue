<script setup>
import { ref, onMounted } from 'vue'

import PeriodSelector from '@/components/stat/PeriodSelector.vue'
import SummaryCards from '@/components/stat/SummaryCards.vue'
import TopExpenseList from '@/components/stat/TopExpenseList.vue'
import CategoryDonutChart from '@/components/stat/CategoryDonutChart.vue'
import ExpenseTrendChart from '@/components/stat/ExpenseTrendChart.vue';

import {
  fetchSummaryStatistics,
  fetchTopExpenses,
  fetchCategoryExpenseStatistics,
  fetchExpenseTrend
} from '@/api/statistics'

/* =====================
   state
===================== */
const loading = ref(false)
const error = ref(null)

const summaryData = ref({
  totalIncome: 0,
  totalExpense: 0,
  netProfit: 0,
  avgExpense: 0,
})

const topExpenses = ref([])
const categoryExpenses = ref([])

//추이관련
const trendData = ref([]) // 차트에 들어갈 데이터
const trendUnit = ref('DAY') // 기본 DAY

/* =====================
   lifecycle
===================== */
onMounted(() => {
  onPeriodChange({ startDate: null, endDate: null })
})

/* =====================
   functions
===================== */
const onPeriodChange = async ({ startDate, endDate }) => {
  loading.value = true
  error.value = null

  try {
    const params = {}
    if (startDate) params.startDate = startDate.toISOString().slice(0, 10)
    if (endDate) params.endDate = endDate.toISOString().slice(0, 10)

    // 1️⃣ 요약 통계
    const summaryRes = await fetchSummaryStatistics(params)
    summaryData.value = {
      totalIncome: summaryRes.totalIncome,
      totalExpense: summaryRes.totalExpense,
      netProfit: summaryRes.netProfit,
      avgExpense: summaryRes.averageExpense,
    }

    // 2️⃣ 상위 지출
    const topRes = await fetchTopExpenses(params)
    topExpenses.value = topRes

    // 3️⃣ 카테고리별 도넛
    const categoryRes = await fetchCategoryExpenseStatistics(params)
    categoryExpenses.value = categoryRes

    // 4️⃣ 지출 추이
    const trendParams = { ...params, unit: trendUnit.value }
    const trendRes = await fetchExpenseTrend(trendParams)
    trendData.value = trendRes.data // { label, amount } 배열

    console.log('🔥 summary:', summaryRes)
    console.log('🔥 top expenses:', topRes)
    console.log('🔥 category expenses:', categoryRes)
    console.log('🔥 trend data:', trendRes)
  } catch (e) {
    console.error(e)
    error.value = '통계 데이터를 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

</script>


<template>
  <PeriodSelector @change="onPeriodChange" />

  <div v-if="loading">로딩중...</div>
  <div v-else-if="error">{{ error }}</div>

  <template v-else>
    <SummaryCards
        class="summary-cards"
        :totalIncome="summaryData.totalIncome"
        :totalExpense="summaryData.totalExpense"
        :netProfit="summaryData.netProfit"
        :avgExpense="summaryData.avgExpense"
    />

    <div class="grid">
      <TopExpenseList :expenses="topExpenses" />
      <CategoryDonutChart :data="categoryExpenses" />
    </div>

    <div class="expense-trend-wrapper">
      <ExpenseTrendChart :data="trendData" :unit="trendUnit" />
    </div>
  </template>
</template>

<style scoped>

.expense-trend-wrapper{
  margin: 10px;
}

.summary-cards {
  margin: 10px;
}
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin: 10px;
}
</style>
