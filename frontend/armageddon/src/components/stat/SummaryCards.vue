<script setup>
const props = defineProps({
  totalIncome: {
    type: Number,
    required: true,
  },
  totalExpense: {
    type: Number,
    required: true,
  },
  netProfit: {
    type: Number,
    required: true,
  },
  avgExpense: {
    type: Number,
    required: true,
  },
})

const formatCurrency = (value) => {
  if (typeof value !== 'number') return '-'
  return value.toLocaleString('ko-KR') + '원'
}
</script>

<template>
  <div class="summary-cards">
    <!-- 총 수입 -->
    <div class="card income">
      <p class="label">총 수입</p>
      <p class="value">{{ formatCurrency(totalIncome) }}</p>
    </div>

    <!-- 총 지출 -->
    <div class="card expense">
      <p class="label">총 지출</p>
      <p class="value">{{ formatCurrency(totalExpense) }}</p>
    </div>

    <!-- 순수익 -->
    <div class="card profit">
      <p class="label">순수익</p>
      <p class="value">{{ formatCurrency(netProfit) }}</p>
    </div>

    <!-- 평균 지출 -->
    <div class="card avg">
      <p class="label">평균 지출</p>
      <p class="value">{{ formatCurrency(avgExpense) }}</p>
    </div>
  </div>
</template>

<style scoped>
.summary-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 16px;
}

.card {
  padding: 20px;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.label {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
}

.value {
  font-size: 22px;
  font-weight: 700;
}

/* 색상 포인트 */
.income .value {
  color: #2563eb;
}

.expense .value {
  color: #dc2626;
}

.profit .value {
  color: #16a34a;
}

.avg .value {
  color: #7c3aed;
}

/* 반응형 */
@media (max-width: 1024px) {
  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .summary-cards {
    grid-template-columns: 1fr;
  }
}
</style>
