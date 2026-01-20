<script setup>
import { computed } from 'vue'
import { Target, Wallet, Pencil, Trash2, TrendingUp, AlertTriangle, CheckCircle, XCircle } from 'lucide-vue-next'
import { CATEGORY_META } from '../../constants/category'

const props = defineProps({
  goal: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete', 'detail'])

const borderColor = computed(() => {
  switch (props.goal.status) {
    case 'EXCEEDED': return '#ED1C24'
    case 'FAILED': return '#ED1C24' // Failure is red
    case 'COMPLETED': return '#22B14C'
    case 'SUCCESS': return '#22B14C'
    case 'ACTIVE':
      return props.goal.goalType === 'SAVING' ? '#22B14C' : '#6AA6DA'
    default:
      return '#6AA6DA'
  }
})

const backgroundColor = computed(() => {
    if (props.goal.status === 'COMPLETED' || props.goal.status === 'SUCCESS') return '#F0F9F4'
    if (props.goal.goalType === 'SAVING') return '#fff'
    return 'white'
})

const categoryLabel = computed(() => {
  return CATEGORY_META[props.goal.category]?.label || props.goal.category
})

const statusIcon = computed(() => {
    switch (props.goal.status) {
        case 'COMPLETED': return CheckCircle
        case 'SUCCESS': return CheckCircle
        case 'FAILED': return XCircle
        case 'EXCEEDED': return AlertTriangle
        case 'ACTIVE': return TrendingUp
        default: return TrendingUp
    }
})

const statusColor = computed(() => {
    switch (props.goal.status) {
        case 'COMPLETED': return '#22B14C'
        case 'SUCCESS': return '#22B14C'
        case 'FAILED': return '#ED1C24'
        case 'EXCEEDED': return '#ED1C24'
        case 'ACTIVE': return '#6AA6DA'
        default: return '#6AA6DA'
    }
})

const remainingAmount = computed(() => {
    return props.goal.targetAmount - props.goal.currentAmount
})
</script>

<template>
  <div
    class="card shadow-md border-l-4 cursor-pointer transition-transform hover:scale-[1.02]"
    :style="{ borderLeftColor: borderColor, backgroundColor: backgroundColor }"
    @click="$emit('detail', goal.goalId)"
  >
    <div class="card-header">
      <div class="card-title flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Target v-if="goal.goalType === 'SAVING'" class="size-5" style="color: #22B14C" />
          <Wallet v-else class="size-5" style="color: #364C84" />
          <span class="text-base">{{ goal.title }}</span>
        </div>
        <div class="flex gap-1">
          <button class="btn btn-ghost btn-sm" @click.stop="$emit('edit', goal)">
            <Pencil class="size-4" />
          </button>
          <button class="btn btn-ghost btn-sm" @click.stop="$emit('delete', goal.goalId)">
            <Trash2 class="size-4" style="color: #ED1C24" />
          </button>
        </div>
      </div>
    </div>
    <div class="card-content space-y-4">
      <!-- SAVING: 저축 목표 -->
      <template v-if="goal.goalType === 'SAVING'">
        <div>
          <div class="flex items-center justify-between text-sm mb-2">
            <span>목표 금액</span>
            <span>{{ goal.targetAmount.toLocaleString() }}원</span>
          </div>
          <div class="flex items-center justify-between text-sm mb-2">
            <span>현재 모은 금액</span>
            <span style="color: #22B14C">{{ goal.currentAmount.toLocaleString() }}원</span>
          </div>
          <div class="w-full bg-gray-200 rounded h-2">
            <div
              class="h-2 rounded"
              :style="{ width: `${Math.min(goal.progressRate, 100)}%`, backgroundColor: '#22B14C' }"
            />
          </div>
          <div class="text-sm text-right mt-1">{{ goal.progressRate }}%</div>
        </div>
      </template>

      <!-- EXPENSE: 지출 목표 -->
      <template v-else>
        <div>
          <div class="flex items-center justify-between text-sm mb-2">
            <span>카테고리</span>
            <span class="px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold">{{ categoryLabel }}</span>
          </div>
          <div class="flex items-center justify-between text-sm mb-2">
            <span>예산</span>
            <span>{{ goal.targetAmount.toLocaleString() }}원</span>
          </div>
          <div class="flex items-center justify-between text-sm mb-2">
            <span>사용</span>
            <span :style="{ color: goal.status === 'EXCEEDED' ? '#ED1C24' : '#333'}">{{ goal.currentAmount.toLocaleString() }}원</span>
          </div>
          <div class="w-full bg-gray-200 rounded h-2">
            <div
              class="h-2 rounded"
              :style="{
                width: `${Math.min(goal.progressRate, 100)}%`,
                backgroundColor: goal.status === 'EXCEEDED' ? '#ED1C24' : '#6AA6DA'
              }"
            />
          </div>
          <div class="text-sm text-right mt-1">{{ goal.progressRate }}%</div>
        </div>
        <div>
          <div class="text-sm">
            남은 예산:
            <span :style="{ color: remainingAmount >= 0 ? '#22B14C' : '#ED1C24' }">
              {{ remainingAmount.toLocaleString() }}원
            </span>
          </div>
        </div>
      </template>
      
      <!-- Status Message Area (Single Source of Truth) -->
      <div class="flex items-center gap-2 text-sm mt-3 pt-3 border-t">
          <component :is="statusIcon" class="size-4" :style="{ color: statusColor }" />
          <span :style="{ color: statusColor }">{{ goal.statusMessage }}</span>
      </div>

      <div class="text-xs text-muted-foreground mt-1">
        {{ goal.startDate }} ~ {{ goal.endDate }}
      </div>
    </div>
  </div>
</template>
