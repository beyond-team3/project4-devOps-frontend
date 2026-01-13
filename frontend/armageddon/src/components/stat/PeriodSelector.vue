<script setup>
import { ref, watch } from 'vue'

/**
 * props
 * - periodType: 'day' | 'week' | 'month'
 */
const props = defineProps({
  periodType: {
    type: String,
    default: 'month'
  }
})

const emit = defineEmits(['change'])

const selectedType = ref(props.periodType)
const startDate = ref('')
const endDate = ref('')

/**
 * 기본값: 이번 달
 */
const setDefaultMonth = () => {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  startDate.value = firstDay.toISOString().slice(0, 10)
  endDate.value = lastDay.toISOString().slice(0, 10)
}

/**
 * 기간 타입 변경 시
 */
const onChangeType = (type) => {
  selectedType.value = type

  if (type === 'month') {
    setDefaultMonth()
  }

  emitChange()
}

/**
 * 부모로 emit
 */
const emitChange = () => {
  emit('change', {
    type: selectedType.value,
    startDate: startDate.value ? new Date(startDate.value) : null,
    endDate: endDate.value ? new Date(endDate.value) : null
  })
}

/**
 * 최초 진입 시
 */
setDefaultMonth()
emitChange()

watch([startDate, endDate], () => {
  emitChange()
})
</script>

<template>
  <div class="period-selector">
    <!-- 기간 타입 선택 -->
    <div class="type-buttons">
      <button
          v-for="type in ['day', 'week', 'month']"
          :key="type"
          :class="{ active: selectedType === type }"
          @click="onChangeType(type)"
      >
        {{ type === 'day' ? '일별' : type === 'week' ? '주별' : '월별' }}
      </button>
    </div>

    <!-- 날짜 선택 -->
    <div class="date-picker">
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
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.type-buttons {
  display: flex;
  gap: 8px;
}

.type-buttons button {
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: #f9f9f9;
  cursor: pointer;
}

.type-buttons button.active {
  background: #4f46e5;
  color: white;
  border-color: #4f46e5;
}

.date-picker {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
