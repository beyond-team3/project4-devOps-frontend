<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '../stores/app'
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-vue-next'

const store = useAppStore()
const period = ref('month')

const stats = computed(() => {
  const now = new Date()
  let filteredTransactions = store.transactions

  if (period.value === 'week') {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    filteredTransactions = store.transactions.filter(t => new Date(t.date) >= weekAgo)
  } else if (period.value === 'month') {
    const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1)
    filteredTransactions = store.transactions.filter(t => new Date(t.date) >= monthAgo)
  }

  const income = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  const expense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
  const netIncome = income - expense

  const days = period.value === 'week' ? 7 : 30
  const avgDaily = expense / days

  const categoryTotals = {}
  filteredTransactions
    .filter(t => t.type === 'expense' && t.category)
    .forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount
    })

  const topSpending = [...filteredTransactions]
    .filter(t => t.type === 'expense')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  return {
    income,
    expense,
    netIncome,
    avgDaily,
    categoryTotals,
    topSpending
  }
})

const categoryData = computed(() => {
  return Object.entries(stats.value.categoryTotals).map(([name, value]) => ({
    name,
    value,
    percentage: stats.value.expense > 0 ? ((value / stats.value.expense) * 100).toFixed(1) : 0
  }))
})

const COLORS = ['#6AA6DA', '#DBE3E9', '#E1E5AC', '#ED1C24', '#22B14C', '#FFB6C1', '#87CEEB', '#DDA0DD', '#F0E68C', '#98FB98', '#FFE4B5']
</script>

<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <h1 style="color: #000000">통계</h1>
      <select v-model="period" class="input w-[180px]">
        <option value="all">전체</option>
        <option value="month">월간</option>
        <option value="week">주간</option>
      </select>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="card shadow-md">
        <div class="card-header pb-2">
          <h3 class="card-title text-sm flex items-center gap-2">
            <TrendingUp class="size-4" style="color: #22B14C" />
            총 수입
          </h3>
        </div>
        <div class="card-content">
          <div class="text-2xl" style="color: #22B14C">
            {{ stats.income.toLocaleString() }}원
          </div>
        </div>
      </div>

      <div class="card shadow-md">
        <div class="card-header pb-2">
          <h3 class="card-title text-sm flex items-center gap-2">
            <TrendingDown class="size-4" style="color: #ED1C24" />
            총 지출
          </h3>
        </div>
        <div class="card-content">
          <div class="text-2xl" style="color: #ED1C24">
            {{ stats.expense.toLocaleString() }}원
          </div>
        </div>
      </div>

      <div class="card shadow-md">
        <div class="card-header pb-2">
          <h3 class="card-title text-sm flex items-center gap-2">
            <DollarSign class="size-4" style="color: #6AA6DA" />
            순수입
          </h3>
        </div>
        <div class="card-content">
          <div
            class="text-2xl"
            :style="{ color: stats.netIncome >= 0 ? '#22B14C' : '#ED1C24' }"
          >
            {{ stats.netIncome.toLocaleString() }}원
          </div>
        </div>
      </div>

      <div class="card shadow-md">
        <div class="card-header pb-2">
          <h3 class="card-title text-sm flex items-center gap-2">
            <Calendar class="size-4" style="color: #6AA6DA" />
            일평균 지출
          </h3>
        </div>
        <div class="card-content">
          <div class="text-2xl" style="color: #000000">
            {{ Math.round(stats.avgDaily).toLocaleString() }}원
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Income vs Expense Chart (Simple Bar) -->
      <div class="card shadow-md">
        <div class="card-header">
          <h3 class="card-title">수입 vs 지출</h3>
        </div>
        <div class="card-content">
          <div class="h-[300px] flex items-end justify-center gap-8">
            <div class="flex flex-col items-center">
              <div
                class="w-20 rounded-t"
                :style="{
                  height: `${Math.min((stats.income / Math.max(stats.income, stats.expense, 1)) * 200, 200)}px`,
                  backgroundColor: '#22B14C'
                }"
              />
              <span class="mt-2 text-sm">수입</span>
              <span class="text-xs text-muted-foreground">{{ stats.income.toLocaleString() }}원</span>
            </div>
            <div class="flex flex-col items-center">
              <div
                class="w-20 rounded-t"
                :style="{
                  height: `${Math.min((stats.expense / Math.max(stats.income, stats.expense, 1)) * 200, 200)}px`,
                  backgroundColor: '#ED1C24'
                }"
              />
              <span class="mt-2 text-sm">지출</span>
              <span class="text-xs text-muted-foreground">{{ stats.expense.toLocaleString() }}원</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Category Breakdown -->
      <div class="card shadow-md">
        <div class="card-header">
          <h3 class="card-title">카테고리별 지출</h3>
        </div>
        <div class="card-content">
          <div v-if="categoryData.length === 0" class="h-[300px] flex items-center justify-center text-muted-foreground">
            지출 내역이 없습니다
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="(item, index) in categoryData"
              :key="item.name"
              class="flex items-center gap-3"
            >
              <div
                class="w-4 h-4 rounded"
                :style="{ backgroundColor: COLORS[index % COLORS.length] }"
              />
              <div class="flex-1">
                <div class="flex justify-between text-sm">
                  <span>{{ item.name }}</span>
                  <span>{{ item.percentage }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded h-2 mt-1">
                  <div
                    class="h-2 rounded"
                    :style="{
                      width: `${item.percentage}%`,
                      backgroundColor: COLORS[index % COLORS.length]
                    }"
                  />
                </div>
              </div>
              <span class="text-sm text-muted-foreground">{{ item.value.toLocaleString() }}원</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Top Spending -->
    <div class="card shadow-md">
      <div class="card-header">
        <h3 class="card-title">최고 지출 내역</h3>
      </div>
      <div class="card-content">
        <div class="space-y-3">
          <div
            v-if="stats.topSpending.length === 0"
            class="text-center py-8 text-muted-foreground"
          >
            지출 내역이 없습니다
          </div>
          <div
            v-else
            v-for="(txn, index) in stats.topSpending"
            :key="txn.id"
            class="flex items-center justify-between p-3 rounded-lg border"
          >
            <div class="flex items-center gap-3">
              <div
                class="size-8 rounded-full flex items-center justify-center"
                style="background-color: #E1E5AC; color: #000000"
              >
                {{ index + 1 }}
              </div>
              <div>
                <div>{{ txn.title }}</div>
                <div class="text-sm text-muted-foreground">
                  {{ txn.date }} {{ txn.category ? `· ${txn.category}` : '' }}
                </div>
              </div>
            </div>
            <div class="text-lg" style="color: #ED1C24">
              {{ txn.amount.toLocaleString() }}원
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
