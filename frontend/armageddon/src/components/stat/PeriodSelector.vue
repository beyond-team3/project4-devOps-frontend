<script setup>
import { ref, watch } from 'vue'

const emit = defineEmits(['change'])

/* =====================
   state
===================== */
const periodType = ref('MONTH') // DAY | WEEK | MONTH
const startDate = ref('') // 문자열 'YYYY-MM-DD'
const endDate = ref('')

/* =====================
   utils
===================== */
const today = new Date()

const formatDate = (d) => d.toISOString().slice(0, 10)

const setThisMonth = () => {
  startDate.value = formatDate(new Date(today.getFullYear(), today.getMonth(), 1))
  endDate.value = formatDate(new Date(today.getFullYear(), today.getMonth() + 1, 0))
}

const setThisWeek = () => {
  const day = today.getDay() || 7
  const start = new Date(today)
  start.setDate(today.getDate() - day + 1)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)

  startDate.value = formatDate(start)
  endDate.value = formatDate(end)
}

const setToday = () => {
  const d = formatDate(today)
  startDate.value = d
  endDate.value = d
}

/* =====================
   handlers
===================== */
const applyPeriod = () => {
  if (!startDate.value || !endDate.value) return
  emit('change', {
    startDate: new Date(startDate.value),
    endDate: new Date(endDate.value),
  })
}

const changePeriodType = (type) => {
  periodType.value = type

  if (type === 'MONTH') setThisMonth()
  if (type === 'WEEK') setThisWeek()
  if (type === 'DAY') setToday()

  applyPeriod()
}

const onDateInputChange = () => {
  // input에서 수동 변경 시 바로 emit
  applyPeriod()
}

/* =====================
   init
===================== */
changePeriodType('MONTH')

/* =====================
   watch (기간 버튼 외 수동 입력 대응)
===================== */
watch([startDate, endDate], ([s, e], [oldS, oldE]) => {
  if ((s !== oldS || e !== oldE) && s && e) {
    applyPeriod()
  }
})
</script>

<template>
  <div class="period-selector">
    <!-- 기간 버튼 -->
    <div class="buttons">
      <button
          :class="{ active: periodType === 'DAY' }"
          @click="changePeriodType('DAY')"
      >
        일별
      </button>
      <button
          :class="{ active: periodType === 'WEEK' }"
          @click="changePeriodType('WEEK')"
      >
        주별
      </button>
      <button
          :class="{ active: periodType === 'MONTH' }"
          @click="changePeriodType('MONTH')"
      >
        월별
      </button>
    </div>

    <!-- 기간 직접 선택 -->
    <div class="dates">
      <input type="date" v-model="startDate" @change="onDateInputChange" />
      <span>~</span>
      <input type="date" v-model="endDate" @change="onDateInputChange" />
    </div>
  </div>
</template>

<style scoped>
.period-selector {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.buttons {
  display: flex;
  gap: 8px;
  margin: 10px;
}

button {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
}

button.active {
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
}

.dates {
  display: flex;
  align-items: center;
  gap: 6px;
}

input[type='date'] {
  padding: 4px 6px;
}
</style>
