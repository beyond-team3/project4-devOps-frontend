<script setup>
import { ref, computed, watch } from 'vue'

const emit = defineEmits(['change'])

/* =====================
   state
===================== */
const mode = ref('MONTH') // WEEK | MONTH | CUSTOM

const today = new Date()
const year = ref(today.getFullYear())
const month = ref(today.getMonth()) // 0-based
const weekOffset = ref(0)

const startDate = ref('')
const endDate = ref('')

/* =====================
   utils
===================== */
const formatDate = (d) => d.toISOString().slice(0, 10)

const getWeekRange = () => {
  const base = new Date()
  base.setDate(base.getDate() + weekOffset.value * 7)

  const day = base.getDay() || 7
  const start = new Date(base)
  start.setDate(base.getDate() - day + 1)

  const end = new Date(start)
  end.setDate(start.getDate() + 6)

  return { start, end }
}

const weekLabel = computed(() => {
  const { start, end } = getWeekRange()

  const format = (d) =>
      `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(
          d.getDate()
      ).padStart(2, '0')}`

  return `${format(start)} ~ ${format(end)}`
})


const getMonthRange = () => {
  const start = new Date(year.value, month.value, 1)
  const end = new Date(year.value, month.value + 1, 0)
  return { start, end }
}

/* =====================
   emitters
===================== */
const emitRange = (s, e) => {
  emit('change', { startDate: s, endDate: e })
}

/* =====================
   watchers
===================== */
watch([weekOffset, mode], () => {
  if (mode.value !== 'WEEK') return
  const { start, end } = getWeekRange()
  emitRange(start, end)
})

watch([year, month, mode], () => {
  if (mode.value !== 'MONTH') return
  const { start, end } = getMonthRange()
  emitRange(start, end)
})

watch([startDate, endDate], () => {
  if (mode.value === 'CUSTOM' && startDate.value && endDate.value) {
    emitRange(new Date(startDate.value), new Date(endDate.value))
  }
})

/* =====================
   init
===================== */
emitRange(
    new Date(today.getFullYear(), today.getMonth(), 1),
    new Date(today.getFullYear(), today.getMonth() + 1, 0)
)
</script>

<template>
  <div class="period-selector">
    <!-- 모드 -->
    <div class="tabs">
      <button :class="{ active: mode === 'WEEK' }" @click="mode='WEEK'">주별</button>
      <button :class="{ active: mode === 'MONTH' }" @click="mode='MONTH'">월별</button>
      <button :class="{ active: mode === 'CUSTOM' }" @click="mode='CUSTOM'">사용자지정</button>
    </div>

    <!-- WEEK -->
    <div v-if="mode === 'WEEK'" class="nav">
      <button @click="weekOffset--">◀</button>
      <span>{{ weekLabel }}</span>
      <button @click="weekOffset++">▶</button>
    </div>

    <!-- MONTH -->
    <div v-if="mode === 'MONTH'" class="nav">
      <button @click="month--">◀</button>
      <span>{{ year }}년 {{ month + 1 }}월</span>
      <button @click="month++">▶</button>
    </div>

    <!-- CUSTOM -->
    <div v-if="mode === 'CUSTOM'" class="range">
      <input type="date" v-model="startDate" />
      <span>~</span>
      <input type="date" v-model="endDate" />
    </div>
  </div>
</template>

<style scoped>
.period-selector {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 10px;
  margin-left: 5px;
}

.tabs button {
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
}

.tabs button.active {
  background: #2563eb;
  color: white;
}

.nav {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav span {
  font-weight: 600;
}

.range {
  display: flex;
  gap: 6px;
}
</style>
