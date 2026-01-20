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
  <div class="top-list">
    <h3 class="title">상위 지출 항목</h3>

    <ul>
      <li v-for="item in expenses" :key="item.id" class="item">
        <div class="left">
          <div class="category">{{ item.category }}</div>
          <div class="title-text">{{ item.title }}</div>
        </div>

        <div class="right">
          <div class="amount">-₩ {{ item.amount.toLocaleString() }}</div>
          <div class="date">{{ item.date }}</div>
        </div>
      </li>
    </ul>
  </div>
</template>



<style scoped>
.top-list {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.title {
  font-weight: 700;
  margin-bottom: 10px;
}

ul {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

/* 🔥 아이템을 가로 카드화 */
.item {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  padding: 10px 12px;
  border-radius: 12px;
  background: #f9fafb;
}

/* 왼쪽 */
.left .category {
  font-size: 12px;
  opacity: 0.7;
}

.left .title-text {
  font-weight: 600;
}

/* 오른쪽 */
.right {
  text-align: right;
}

.amount {
  color: #ef4444;
  font-weight: 700;
}

.date {
  font-size: 12px;
  opacity: 0.6;
}

</style>
