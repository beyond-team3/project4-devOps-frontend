<script setup>
import { computed } from 'vue'
import { Target, Wallet, Pencil, Trash2, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-vue-next'
import { CATEGORY_META } from '../../constants/category'

const props = defineProps({
  goal: {
    type: Object,
    required: true
  }
})


const emit = defineEmits(['edit', 'delete', 'detail'])

const borderColor = computed(() => {
  if (props.goal.type === 'savings') return '#22B14C'
  if (props.goal.status === 'exceeded') return '#ED1C24'
  if (props.goal.status === 'warning') return '#E1E5AC'
  return '#6AA6DA'
})

const backgroundColor = computed(() => {
    if (props.goal.type === 'savings') return '#F0F9F4' // Pale green background
    return 'white'
})

const categoryLabel = computed(() => {
  return CATEGORY_META[props.goal.category]?.label || props.goal.category
})
</script>

<template>
  <div
    class="card shadow-md border-l-4 cursor-pointer transition-transform hover:scale-[1.02]"
    :style="{ borderLeftColor: borderColor, backgroundColor: backgroundColor }"
    @click="$emit('detail', goal.id)"
  >
    <div class="card-header">
      <div class="card-title flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Target v-if="goal.type === 'savings'" class="size-5" style="color: #22B14C" />
          <Wallet v-else class="size-5" style="color: #364C84" />
          <span class="text-base">{{ goal.title }}</span>
        </div>
        <div class="flex gap-1">
          <button class="btn btn-ghost btn-sm" @click.stop="$emit('edit', goal)">
            <Pencil class="size-4" />
          </button>
          <button class="btn btn-ghost btn-sm" @click.stop="$emit('delete', goal.id)">
            <Trash2 class="size-4" style="color: #ED1C24" />
          </button>
        </div>
      </div>
    </div>
    <div class="card-content space-y-4">
      <template v-if="goal.type === 'savings'">
        <div>
          <div class="flex items-center justify-between text-sm mb-2">
            <span>목표 금액</span>
            <span>{{ goal.targetAmount.toLocaleString() }}원</span>
          </div>
          <div class="flex items-center justify-between text-sm mb-2">
            <span>현재 금액</span>
            <span style="color: #22B14C">{{ goal.currentAmount.toLocaleString() }}원</span>
          </div>
          <div class="w-full bg-gray-200 rounded h-2">
            <div
              class="h-2 rounded"
              :style="{ width: `${goal.progressRate}%`, backgroundColor: '#22B14C' }"
            />
          </div>
          <div class="text-sm text-right mt-1">{{ goal.progress.toFixed(0) }}%</div>
        </div>
        <div class="flex items-center gap-2 text-sm">
          <template v-if="goal.status === 'COMPLETED'">
            <CheckCircle class="size-4" style="color: #22B14C" />
            <span style="color: #22B14C">목표 달성!</span>
          </template>
          <template v-else-if="goal.status === 'on-track'">
            <TrendingUp class="size-4" style="color: #95B1EE" />
            <span>순조롭게 진행 중</span>
          </template>
          <template v-else>
            <AlertTriangle class="size-4" style="color: #F2F396" />
            <span>더 노력이 필요해요</span>
          </template>
        </div>
        <div class="text-xs text-muted-foreground">
          {{ goal.startDate }} ~ {{ goal.endDate }}
        </div>
      </template>

      <template v-else>
        <div>
          <div class="flex items-center justify-between text-sm mb-2">
            <span>카테고리</span>
            <span class="px-2 py-0.5 rounded text-xs" style="background-color: #F2F396">
              {{ categoryLabel }}
            </span>
          </div>
          <div class="flex items-center justify-between text-sm mb-2">
            <span>예산</span>
            <span>{{ goal.budgetLimit.toLocaleString() }}원</span>
          </div>
          <div class="flex items-center justify-between text-sm mb-2">
            <span>사용</span>
            <span style="color: #ED1C24">{{ goal.spentAmount.toLocaleString() }}원</span>
          </div>
          <div class="w-full bg-gray-200 rounded h-2">
            <div
              class="h-2 rounded"
              :style="{
                width: `${goal.usageRate}%`,
                backgroundColor: goal.status === 'exceeded' ? '#ED1C24' : goal.status === 'warning' ? '#E1E5AC' : '#6AA6DA'
              }"
            />
          </div>
          <div class="text-sm text-right mt-1">{{ goal.usageRate.toFixed(0) }}%</div>
        </div>
        <div>
          <div class="text-sm">
            남은 예산:
            <span :style="{ color: goal.remaining >= 0 ? '#22B14C' : '#ED1C24' }">
              {{ goal.remaining.toLocaleString() }}원
            </span>
          </div>
        </div>
        <div class="flex items-center gap-2 text-sm">
          <template v-if="goal.status === 'exceeded'">
            <AlertTriangle class="size-4" style="color: #ED1C24" />
            <span style="color: #ED1C24">예산 초과!</span>
          </template>
          <template v-else-if="goal.status === 'warning'">
            <AlertTriangle class="size-4" style="color: #F2F396" />
            <span>주의가 필요해요</span>
          </template>
          <template v-else>
            <CheckCircle class="size-4" style="color: #22B14C" />
            <span style="color: #22B14C">안전한 수준입니다</span>
          </template>
        </div>
        <div class="text-xs text-muted-foreground">
          {{ goal.startDate }} ~ {{ goal.endDate }}
        </div>
      </template>
    </div>
  </div>
</template>
