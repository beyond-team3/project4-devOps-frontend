<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '../stores/app'
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Wallet } from 'lucide-vue-next'

const store = useAppStore()
const currentDate = ref(new Date())
const selectedDate = ref(null)

const totals = computed(() => {
  const income = store.transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  const expense = store.transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
  return {
    income,
    expense,
    balance: income - expense
  }
})

const recentTransactions = computed(() => {
  return [...store.transactions]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5)
})

const year = computed(() => currentDate.value.getFullYear())
const month = computed(() => currentDate.value.getMonth())

const calendarData = computed(() => {
  const firstDay = new Date(year.value, month.value, 1)
  const lastDay = new Date(year.value, month.value + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  return { daysInMonth, startingDayOfWeek }
})

const transactionsByDate = computed(() => {
  const grouped = {}
  store.transactions.forEach(t => {
    if (!grouped[t.date]) {
      grouped[t.date] = []
    }
    grouped[t.date].push(t)
  })
  return grouped
})

const getDayTotals = (dateStr) => {
  const dayTransactions = transactionsByDate.value[dateStr] || []
  const income = dayTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  const expense = dayTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
  return { income, expense }
}

const getDateString = (day) => {
  return `${year.value}-${String(month.value + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

const prevMonth = () => {
  currentDate.value = new Date(year.value, month.value - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(year.value, month.value + 1, 1)
}

const handleDayClick = (dateStr) => {
  const { income, expense } = getDayTotals(dateStr)
  if (income > 0 || expense > 0) {
    selectedDate.value = dateStr
  }
}

const selectedDayTransactions = computed(() => {
  return selectedDate.value ? (transactionsByDate.value[selectedDate.value] || []) : []
})

const closeModal = () => {
  selectedDate.value = null
}
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Top Summary Section -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="card shadow-md border-l-4" style="border-left-color: #6AA6DA">
        <div class="card-header pb-2">
          <h3 class="card-title text-sm flex items-center gap-2">
            <Wallet class="size-4" style="color: #6AA6DA" />
            총 잔액
          </h3>
        </div>
        <div class="card-content">
          <div class="text-2xl" style="color: #000000">
            {{ totals.balance.toLocaleString() }}원
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
            {{ totals.expense.toLocaleString() }}원
          </div>
        </div>
      </div>

      <div class="card shadow-md">
        <div class="card-header pb-2">
          <h3 class="card-title text-sm flex items-center gap-2">
            <TrendingUp class="size-4" style="color: #22B14C" />
            총 수입
          </h3>
        </div>
        <div class="card-content">
          <div class="text-2xl" style="color: #22B14C">
            {{ totals.income.toLocaleString() }}원
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Calendar -->
      <div class="card lg:col-span-2 shadow-md">
        <div class="card-header">
          <div class="flex items-center justify-between">
            <h3 class="card-title">{{ year }}년 {{ month + 1 }}월</h3>
            <div class="flex gap-2">
              <button @click="prevMonth" class="btn btn-outline btn-sm">
                <ChevronLeft class="size-4" />
              </button>
              <button @click="nextMonth" class="btn btn-outline btn-sm">
                <ChevronRight class="size-4" />
              </button>
            </div>
          </div>
        </div>
        <div class="card-content">
          <div class="grid grid-cols-7 gap-2">
            <div
              v-for="day in ['일', '월', '화', '수', '목', '금', '토']"
              :key="day"
              class="text-center text-sm py-2"
              style="color: #364C84"
            >
              {{ day }}
            </div>
            <div
              v-for="i in calendarData.startingDayOfWeek"
              :key="'empty-' + i"
              class="aspect-square"
            />
            <button
              v-for="day in calendarData.daysInMonth"
              :key="day"
              @click="handleDayClick(getDateString(day))"
              :class="[
                'aspect-square rounded-lg p-1 flex flex-col items-center justify-start transition-all',
                getDayTotals(getDateString(day)).income > 0 || getDayTotals(getDateString(day)).expense > 0
                  ? 'cursor-pointer hover:shadow-md hover:scale-105 bg-white'
                  : 'cursor-default bg-gray-50'
              ]"
              :style="{
                border: (getDayTotals(getDateString(day)).income > 0 || getDayTotals(getDateString(day)).expense > 0) ? '1px solid #DBE3E9' : 'none'
              }"
            >
              <div class="text-sm" style="color: #000000">{{ day }}</div>
              <div
                v-if="getDayTotals(getDateString(day)).expense > 0"
                class="text-xs mt-0.5"
                style="color: #ED1C24"
              >
                -{{ getDayTotals(getDateString(day)).expense.toLocaleString() }}
              </div>
              <div
                v-if="getDayTotals(getDateString(day)).income > 0"
                class="text-xs"
                style="color: #22B14C"
              >
                +{{ getDayTotals(getDateString(day)).income.toLocaleString() }}
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Recent Transactions -->
      <div class="card shadow-md">
        <div class="card-header">
          <h3 class="card-title">최근 거래</h3>
        </div>
        <div class="card-content">
          <div class="space-y-3">
            <div
              v-if="recentTransactions.length === 0"
              class="text-center text-muted-foreground py-8"
            >
              거래 내역이 없습니다
            </div>
            <div
              v-else
              v-for="txn in recentTransactions"
              :key="txn.id"
              class="flex items-center justify-between py-2 border-b"
            >
              <div class="flex-1">
                <div class="text-sm">{{ txn.title }}</div>
                <div class="text-xs text-muted-foreground">{{ txn.date }}</div>
              </div>
              <div
                class="text-sm"
                :style="{ color: txn.type === 'expense' ? '#ED1C24' : '#22B14C' }"
              >
                {{ txn.type === 'expense' ? '-' : '+' }}{{ txn.amount.toLocaleString() }}원
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Daily Transaction Modal -->
    <div
      v-if="selectedDate"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <h3 class="text-lg font-semibold mb-4">{{ selectedDate }} 거래 내역</h3>
        <div class="space-y-3">
          <div
            v-for="txn in selectedDayTransactions"
            :key="txn.id"
            class="flex items-center justify-between py-2 border-b"
          >
            <div class="flex-1">
              <div>{{ txn.title }}</div>
              <div v-if="txn.category" class="text-sm text-muted-foreground">
                {{ txn.category }}
              </div>
            </div>
            <div :style="{ color: txn.type === 'expense' ? '#ED1C24' : '#22B14C' }">
              {{ txn.type === 'expense' ? '-' : '+' }}{{ txn.amount.toLocaleString() }}원
            </div>
          </div>
        </div>
        <button @click="closeModal" class="btn btn-primary w-full mt-4">
          닫기
        </button>
      </div>
    </div>
  </div>
</template>
