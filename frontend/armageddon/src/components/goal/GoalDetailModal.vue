<script setup>
import { ref, watch, computed } from 'vue'
import { getGoalDetail } from '../../api/goal'
import { Target, Wallet, X, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-vue-next'
import { CATEGORY_META } from '../../constants/category'

const props = defineProps({
  isOpen: Boolean,
  goalId: [Number, String]
})

const emit = defineEmits(['close'])

const goalDetail = ref(null)
const loading = ref(false)
const error = ref(null)

const fetchDetail = async () => {
  if (!props.goalId) return
  loading.value = true
  error.value = null
  try {
    const res = await getGoalDetail(props.goalId)
    if (res.result === 'SUCCESS') {
        goalDetail.value = res.data
    } else {
        error.value = res.message || '목표 상세 정보를 불러올 수 없습니다.'
    }
  } catch (e) {
    error.value = '정보를 불러오는데 실패했습니다.'
    console.error(e)
  } finally {
    loading.value = false
  }
}

watch(() => props.isOpen, (newVal) => {
  if (newVal && props.goalId) {
    fetchDetail()
  } else {
    goalDetail.value = null
    error.value = null
  }
})

const borderColor = computed(() => {
  if (!goalDetail.value) return '#ccc'
  const g = goalDetail.value
  if (g.goalType === 'SAVING') return '#22B14C'
  if (g.status === 'DELETED') return '#ccc'
  // Expense logic mapping from backend status
  // Backend: ACTIVE, COMPLETED, FAILED, DELETED
  // We might need to infer warning/exceeded from client logic if backend doesn't send it.
  // But GoalDetailResponse has 'statusMessage'. Maybe we rely on the generic ACTIVE/COMPLETED.
  // GoalCard inferred status from `g.status`.
  // Let's stick to basic colors for now.
  return '#6AA6DA'
})

const categoryLabel = computed(() => {
  if (!goalDetail.value?.category) return '기타'
  return CATEGORY_META[goalDetail.value.category]?.label || goalDetail.value.category
})

const progressColor = computed(() => {
    if (!goalDetail.value) return '#ccc'
    if (goalDetail.value.goalType === 'SAVING') return '#22B14C'
    return goalDetail.value.progressRate > 100 ? '#ED1C24' : '#6AA6DA'
})
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    @click.self="$emit('close')"
  >
    <div 
        class="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto relative shadow-xl border-t-4"
        :style="{ borderTopColor: borderColor }"
    >
        <button class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none" @click="$emit('close')">
            <X class="size-6" />
        </button>

        <div v-if="loading" class="py-12 text-center text-gray-500">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p>상세 정보를 불러오는 중...</p>
        </div>

        <div v-else-if="error" class="py-12 text-center text-red-500">
            <AlertTriangle class="size-10 mx-auto mb-2 opacity-50" />
            <p>{{ error }}</p>
        </div>

        <div v-else-if="goalDetail" class="space-y-6">
            <!-- Header -->
            <div class="flex items-center gap-3">
                 <div class="p-2 rounded-full bg-gray-50">
                     <Target v-if="goalDetail.goalType === 'SAVING'" class="size-8" style="color: #22B14C" />
                     <Wallet v-else class="size-8" style="color: #364C84" />
                 </div>
                <div>
                    <div class="text-sm text-gray-500 font-medium mb-1">
                        {{ goalDetail.goalType === 'SAVING' ? '저축 목표' : '지출 예산' }}
                    </div>
                    <h3 class="text-2xl font-bold text-gray-900">{{ goalDetail.title }}</h3>
                 </div>
            </div>

            <!-- Status Message -->
            <div v-if="goalDetail.statusMessage" class="p-4 rounded-lg bg-blue-50 text-center font-medium text-blue-800 border border-blue-100">
                "{{ goalDetail.statusMessage }}"
            </div>

            <!-- Metrics -->
             <div class="space-y-4">
                <div v-if="goalDetail.goalType === 'SAVING'">
                    <div class="flex justify-between items-end mb-1">
                        <span class="text-sm text-gray-500">달성률</span>
                        <span class="text-2xl font-bold" style="color: #22B14C">{{ goalDetail.progressRate }}%</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-4 mb-4 overflow-hidden">
                        <div
                            class="h-full rounded-full transition-all duration-1000 ease-out relative"
                            :style="{ width: `${Math.min(goalDetail.progressRate || 0, 100)}%`, backgroundColor: '#22B14C' }"
                        >
                            <div class="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                        <div>
                            <div class="text-xs text-gray-500 mb-1">현재 모은 금액</div>
                            <div class="text-lg font-bold text-gray-900">{{ goalDetail.currentAmount?.toLocaleString() }}원</div>
                        </div>
                        <div class="text-right">
                            <div class="text-xs text-gray-500 mb-1">목표 금액</div>
                            <div class="text-lg font-bold text-gray-900">{{ goalDetail.targetAmount?.toLocaleString() }}원</div>
                        </div>
                    </div>

                    <div v-if="goalDetail.expectedAmount" class="mt-4 flex items-center justify-between p-3 border rounded-lg">
                        <span class="text-sm text-gray-600">예상 달성액</span>
                        <span class="font-bold text-blue-600">{{ goalDetail.expectedAmount.toLocaleString() }}원</span>
                    </div>
                </div>

                <div v-else>
                     <!-- Expense -->
                     <div class="flex justify-between items-center mb-4">
                         <span class="text-sm text-gray-500">카테고리</span>
                         <span class="px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold">{{ categoryLabel }}</span>
                     </div>
                     
                    <div class="flex justify-between items-end mb-1">
                        <span class="text-sm text-gray-500">사용률</span>
                        <span class="text-2xl font-bold" :style="{ color: progressColor }">{{ goalDetail.progressRate }}%</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-4 mb-4 overflow-hidden">
                        <div
                            class="h-full rounded-full transition-all duration-1000 ease-out"
                            :style="{
                            width: `${Math.min(goalDetail.progressRate || 0, 100)}%`,
                            backgroundColor: progressColor
                            }"
                        />
                    </div>

                     <div class="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                        <div>
                            <div class="text-xs text-gray-500 mb-1">사용 금액</div>
                            <div class="text-lg font-bold" :style="{ color: progressColor }">{{ goalDetail.currentAmount?.toLocaleString() }}원</div>
                        </div>
                        <div class="text-right">
                            <div class="text-xs text-gray-500 mb-1">예산</div>
                            <div class="text-lg font-bold text-gray-900">{{ goalDetail.targetAmount?.toLocaleString() }}원</div>
                        </div>
                    </div>

                     <div class="mt-4 flex items-center justify-between p-3 border rounded-lg">
                        <span class="text-sm text-gray-600">남은 예산</span>
                        <span 
                            class="font-bold"
                            :class="(goalDetail.targetAmount - goalDetail.currentAmount) < 0 ? 'text-red-500' : 'text-green-600'"
                        >
                            {{ (goalDetail.targetAmount - goalDetail.currentAmount)?.toLocaleString() }}원
                        </span>
                    </div>
                </div>
            </div>

            <!-- Dates & Status -->
            <div class="pt-4 border-t flex items-center justify-between text-sm text-gray-500">
                <div>
                     <span class="block text-xs mb-0.5">기간</span>
                     <span class="font-medium text-gray-700">{{ goalDetail.startDate }} ~ {{ goalDetail.endDate }}</span>
                </div>
                <div class="text-right">
                    <span class="block text-xs mb-0.5">상태</span>
                     <span 
                        class="px-2 py-0.5 rounded text-xs font-bold"
                        :class="goalDetail.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'"
                     >
                        {{ goalDetail.status }}
                    </span>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>
