<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '../stores/app'
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Wallet } from 'lucide-vue-next'
import TransactionModal from '../components/TransactionModal.vue'

const store = useAppStore()
const currentDate = ref(new Date())
const selectedDate = ref(null)
const selectedTransaction = ref(null) // For editing direct from recent list
const isModalOpen = ref(false)
const loading = ref(false)

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
      .sort((a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id) // 날짜 내림차순 정렬 강화
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
  if (store.transactions.length > 0) {
      // console.log('[MainDashboard] First txn date:', store.transactions[0].date, 'Type:', typeof store.transactions[0].date)
  }
  
  store.transactions.forEach(t => {
    // 날짜 매칭 디버깅을 위해 정규화 한번 더 보장 (안전장치)
    const rawDate = t.date
    // 혹시 모를 공백 제거
    const simpleDate = rawDate ? String(rawDate).trim().split('T')[0] : ''
    
    if (!grouped[simpleDate]) {
      grouped[simpleDate] = []
    }
    grouped[simpleDate].push(t)
  })
  
  // console.log('[MainDashboard] Grouped keys:', Object.keys(grouped))
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

const loadMonthlyData = async () => {
  loading.value = true
  try {
    await store.fetchMonthlyData(year.value, month.value)
    // 우선 빠르게 5개라도 보여줌
    await store.fetchTransactions(year.value, month.value)
  } finally {
    loading.value = false
  }
  
  // 이후 전체 날짜 전수 조사 (백그라운드에서 실행, await 없이)
  // 백엔드 제약을 우회하여 캘린더를 채우기 위함
  store.fetchAllDaysInMonth(year.value, month.value)
}

const prevMonth = () => {
  currentDate.value = new Date(year.value, month.value - 1, 1)
  loadMonthlyData()
}

const nextMonth = () => {
  currentDate.value = new Date(year.value, month.value + 1, 1)
  loadMonthlyData()
}

const handleDayClick = async (dateStr) => {
  console.log('[MainDashboard] 날짜 클릭:', dateStr)
  selectedDate.value = dateStr
  selectedTransaction.value = null
  
  // 사용자 요청: 클릭 시 API 호출하여 최신 데이터 가져오기
  console.log('[MainDashboard] fetchDailyTransactions 호출 전')
  const result = await store.fetchDailyTransactions(dateStr)
  console.log('[MainDashboard] fetchDailyTransactions 결과:', result)
  console.log('[MainDashboard] store.dailyTransactions:', store.dailyTransactions)
  console.log('[MainDashboard] selectedDayTransactions:', selectedDayTransactions.value)
  
  isModalOpen.value = true
}

// 최근 내역에서 클릭 시
const handleTransactionClick = (txn) => {
  selectedDate.value = txn.date
  selectedTransaction.value = txn
  isModalOpen.value = true
}

const selectedDayTransactions = computed(() => {
  console.log('[selectedDayTransactions] selectedDate:', selectedDate.value)
  console.log('[selectedDayTransactions] dailyTransactions:', store.dailyTransactions)
  
  // 날짜 클릭 후 API 호출했다면 dailyTransactions를 우선 사용
  if (selectedDate.value && store.dailyTransactions.length > 0) {
    console.log('[selectedDayTransactions] dailyTransactions 사용:', store.dailyTransactions.length, '건')
    return store.dailyTransactions
  }
  
  // 아니면 기존 로직(전체 리스트에서 필터링) 사용 (Fallback)
  const fallback = selectedDate.value ? (transactionsByDate.value[selectedDate.value] || []) : []
  console.log('[selectedDayTransactions] Fallback 사용:', fallback.length, '건')
  return fallback
})

const closeModal = () => {
  isModalOpen.value = false
  selectedDate.value = null
  selectedTransaction.value = null
}

onMounted(() => {
  loadMonthlyData() // 초기 데이터 로드
})
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
                v-for="(dayName, index) in ['일', '월', '화', '수', '목', '금', '토']"
                :key="dayName"
                class="text-center text-sm py-2 font-bold"
                :style="{
                  color: index === 0 ? '#ED1C24' : index === 6 ? '#0b39b4' : '#000000'
                }"
            >
              {{ dayName }}
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
                class="aspect-square rounded-lg p-1 flex flex-col items-center transition-all cursor-pointer hover:shadow-md hover:scale-105 bg-[var(--bt-bg)] border border-transparent hover:border-blue-200"
                :class="{
    'bg-white': getDayTotals(getDateString(day)).income > 0 || getDayTotals(getDateString(day)).expense > 0
  }"
                :style="{
    border: (getDayTotals(getDateString(day)).income > 0 || getDayTotals(getDateString(day)).expense > 0) ? '1px solid #DBE3E9' : ''
  }"
            >
              <!-- 날짜와 금액 사이만 간격 -->
              <div class="text-sm font-medium mb-3" style="color: #000000">{{ day }}</div>

              <!-- 수입 -->
              <div v-if="getDayTotals(getDateString(day)).income > 0" class="text-xs" style="color: #22B14C">
                +{{ getDayTotals(getDateString(day)).income.toLocaleString() }}
              </div>

              <!-- 지출 -->
              <div v-if="getDayTotals(getDateString(day)).expense > 0" class="text-xs" style="color: #ED1C24">
                -{{ getDayTotals(getDateString(day)).expense.toLocaleString() }}
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
                @click="handleTransactionClick(txn)"
                class="flex items-center justify-between py-2 border-b cursor-pointer hover:bg-gray-50 px-2 rounded transition-colors"
            >
              <div class="flex-1 min-w-0 pr-2">
                <div class="text-sm font-medium truncate">{{ txn.title }}</div>
                <div class="text-xs text-muted-foreground">{{ txn.date }}</div>
              </div>
              <div
                  class="text-sm whitespace-nowrap"
                  :style="{ color: txn.type === 'expense' ? '#ED1C24' : '#22B14C' }"
              >
                {{ txn.type === 'expense' ? '-' : '+' }}{{ txn.amount.toLocaleString() }}원
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Transaction Modal -->
    <TransactionModal
        :is-open="isModalOpen"
        :selected-date="selectedDate"
        :initial-transactions="selectedDayTransactions"
        :initial-edit-data="selectedTransaction"
        @close="closeModal"
    />
  </div>
</template>
