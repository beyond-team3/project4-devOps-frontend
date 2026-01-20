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
  averageExpense: 0,
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

    //  요약 통계
    const summaryRes = await fetchSummaryStatistics(params)
    summaryData.value = {
      totalIncome: summaryRes.totalIncome,
      totalExpense: summaryRes.totalExpense,
      netProfit: summaryRes.netProfit,
      avgExpense: summaryRes.averageExpense,
    }

    //  상위 지출
    const topRes = await fetchTopExpenses(params)
    topExpenses.value = topRes

    // 카테고리별 도넛
    const categoryRes = await fetchCategoryExpenseStatistics(params)
    categoryExpenses.value = categoryRes

    // 지출 추이
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
  <!-- 기간 선택 -->
  <PeriodSelector @change="onPeriodChange" />

  <!-- 상태 -->
  <div v-if="loading" class="state">로딩중...</div>
  <div v-else-if="error" class="state error">{{ error }}</div>

  <!-- 본문 -->
  <div v-else class="stat-page">
    <!-- 요약 카드 -->
    <SummaryCards
        class="summary"
        :totalIncome="summaryData.totalIncome"
        :totalExpense="summaryData.totalExpense"
        :netProfit="summaryData.netProfit"
        :avgExpense="summaryData.avgExpense"
    />

    <!-- 하단 3분할 -->
    <section class="detail-grid">
      <!-- 상위 지출 -->
      <div class="card top">
        <TopExpenseList :expenses="topExpenses" />
      </div>

      <!-- 도넛 -->
      <div class="card donut">
        <CategoryDonutChart :data="categoryExpenses" />
      </div>

      <!-- 추이 그래프 -->
      <div class="card trend">
        <ExpenseTrendChart
            :data="trendData"
            :unit="trendUnit"
        />
      </div>
    </section>
  </div>
</template>


<style scoped>
.stat-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ===== GRID ===== */
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 2fr;
  gap: 16px;
  align-items: stretch;
}
/* 왼쪽: 상위 지출 (2행) */
.card.top {
  grid-row: 1 / span 2;
}

/* 가운데: 도넛 (1행만) */
.card.donut {
  grid-row: 1;
}

/* 오른쪽: 추이 (2행) */
.card.trend {
  grid-row: 1 / span 2;
  padding: 10px 14px 8px;
}

/* 공통 카드 */
.card {
  background: #fff;
  border-radius: 14px;
  padding: 14px;
  height: 430px;
  overflow: hidden;
}

/* ===== 반응형 ===== */
@media (max-width: 1200px) {
  .detail-grid {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto auto;
  }

  .card.top,
  .card.donut,
  .card.trend {
    grid-row: auto;
  }
}

@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
