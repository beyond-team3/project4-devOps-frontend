<script setup>
import { CATEGORY_META } from '@/constants/category'

const props = defineProps({
  expenses: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const getCategory = (category) =>
    CATEGORY_META[category] ?? { label: category, icon: '❓' }

const formatAmount = (amount) =>
    amount.toLocaleString()

const formatDate = (date) =>
    new Date(date).toLocaleDateString('ko-KR')
</script>

<template>
  <div class="card">
    <h3 class="title">상위 지출 항목</h3>

    <div v-if="loading" class="center">로딩중...</div>

    <ul v-else class="list">
      <li
          v-for="expense in expenses"
          :key="expense.transactionId"
          class="item"
      >
        <div class="left">
          <div class="category">
            {{ getCategory(expense.category).icon }}
            {{ getCategory(expense.category).label }}
          </div>
          <div class="name">{{ expense.title }}</div>
          <div class="date">{{ formatDate(expense.date) }}</div>
        </div>

        <div class="amount">
          -₩ {{ formatAmount(expense.amount) }}
        </div>
      </li>
    </ul>
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

.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-radius: 10px;
  background: #f9fafb;
}

.left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category {
  font-size: 13px;
  color: #6b7280;
}

.name {
  font-weight: 500;
}

.date {
  font-size: 12px;
  color: #9ca3af;
}

.amount {
  font-weight: 700;
  color: #ef4444;
}

.center {
  text-align: center;
  color: #6b7280;
}
</style>
