<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '../stores/app'
import { Plus, Target, Wallet, Pencil, Trash2, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const store = useAppStore()

const EXPENSE_CATEGORIES = [
  '식비', '교통', '쇼핑', '주거', '통신',
  '의료', '여가', '교육', '저축', '경조사', '기타'
]

const isAddDialogOpen = ref(false)
const selectedGoal = ref(null)
const deleteConfirmId = ref(null)

const formType = ref('savings')
const formTitle = ref('')
const formTargetAmount = ref('')
const formBudgetLimit = ref('')
const formCategory = ref('기타')
const formPeriod = ref('monthly')
const formStartDate = ref(new Date().toISOString().split('T')[0])
const formEndDate = ref('')

const resetForm = () => {
  formType.value = 'savings'
  formTitle.value = ''
  formTargetAmount.value = ''
  formBudgetLimit.value = ''
  formCategory.value = '기타'
  formPeriod.value = 'monthly'
  formStartDate.value = new Date().toISOString().split('T')[0]
  formEndDate.value = ''
}

const handleAdd = () => {
  if (!formTitle.value) {
    toast.error('목표 제목을 입력해주세요.')
    return
  }

  if (formType.value === 'savings') {
    if (!formTargetAmount.value || !formEndDate.value) {
      toast.error('목표 금액과 종료일을 입력해주세요.')
      return
    }
    store.addGoal({
      type: 'savings',
      title: formTitle.value,
      targetAmount: parseFloat(formTargetAmount.value),
      startDate: formStartDate.value,
      endDate: formEndDate.value,
      currentAmount: 0
    })
  } else {
    if (!formBudgetLimit.value || !formEndDate.value) {
      toast.error('예산과 종료일을 입력해주세요.')
      return
    }
    store.addGoal({
      type: 'spending',
      title: formTitle.value,
      category: formCategory.value,
      budgetLimit: parseFloat(formBudgetLimit.value),
      period: formPeriod.value,
      startDate: formStartDate.value,
      endDate: formEndDate.value
    })
  }

  toast.success('목표가 추가되었습니다.')
  isAddDialogOpen.value = false
  resetForm()
}

const handleEdit = (goal) => {
  selectedGoal.value = goal
  formType.value = goal.type
  formTitle.value = goal.title
  formStartDate.value = goal.startDate
  formEndDate.value = goal.endDate

  if (goal.type === 'savings') {
    formTargetAmount.value = goal.targetAmount.toString()
  } else {
    formBudgetLimit.value = goal.budgetLimit.toString()
    formCategory.value = goal.category
    formPeriod.value = goal.period
  }
}

const handleUpdate = () => {
  if (!selectedGoal.value || !formTitle.value) {
    toast.error('목표 제목을 입력해주세요.')
    return
  }

  if (formType.value === 'savings') {
    if (!formTargetAmount.value || !formEndDate.value) {
      toast.error('목표 금액과 종료일을 입력해주세요.')
      return
    }
    store.updateGoal(selectedGoal.value.id, {
      title: formTitle.value,
      targetAmount: parseFloat(formTargetAmount.value),
      startDate: formStartDate.value,
      endDate: formEndDate.value
    })
  } else {
    if (!formBudgetLimit.value || !formEndDate.value) {
      toast.error('예산과 종료일을 입력해주세요.')
      return
    }
    store.updateGoal(selectedGoal.value.id, {
      title: formTitle.value,
      category: formCategory.value,
      budgetLimit: parseFloat(formBudgetLimit.value),
      period: formPeriod.value,
      startDate: formStartDate.value,
      endDate: formEndDate.value
    })
  }

  toast.success('목표가 수정되었습니다.')
  selectedGoal.value = null
  resetForm()
}

const handleDelete = (id) => {
  store.deleteGoal(id)
  toast.success('목표가 삭제되었습니다.')
  deleteConfirmId.value = null
}

const closeDialog = () => {
  isAddDialogOpen.value = false
  selectedGoal.value = null
  resetForm()
}

const goalStats = computed(() => {
  return store.goals.map(goal => {
    if (goal.type === 'savings') {
      const savedAmount = store.transactions
        .filter(t => t.type === 'income' && t.date >= goal.startDate && t.date <= goal.endDate)
        .reduce((sum, t) => sum + t.amount, 0)

      const progress = (savedAmount / goal.targetAmount) * 100

      return {
        ...goal,
        currentAmount: savedAmount,
        progress: Math.min(progress, 100),
        status: progress >= 100 ? 'achieved' : progress >= 75 ? 'on-track' : 'needs-effort'
      }
    } else {
      const spentAmount = store.transactions
        .filter(
          t =>
            t.type === 'expense' &&
            t.category === goal.category &&
            t.date >= goal.startDate &&
            t.date <= goal.endDate
        )
        .reduce((sum, t) => sum + t.amount, 0)

      const usageRate = (spentAmount / goal.budgetLimit) * 100
      const remaining = goal.budgetLimit - spentAmount

      return {
        ...goal,
        spentAmount,
        usageRate: Math.min(usageRate, 100),
        remaining,
        status: usageRate >= 100 ? 'exceeded' : usageRate >= 80 ? 'warning' : 'safe'
      }
    }
  })
})
</script>

<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <h1 style="color: #000000">목표</h1>
      <button
        @click="isAddDialogOpen = true"
        class="btn btn-primary"
      >
        <Plus class="size-4 mr-2" />
        새 목표 추가
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-if="goalStats.length === 0"
        class="card col-span-full shadow-md"
      >
        <div class="card-content py-12 text-center text-muted-foreground">
          목표가 없습니다. 첫 번째 목표를 추가해보세요!
        </div>
      </div>

      <div
        v-else
        v-for="goal in goalStats"
        :key="goal.id"
        class="card shadow-md border-l-4"
        :style="{
          borderLeftColor:
            goal.type === 'savings'
              ? '#22B14C'
              : goal.status === 'exceeded'
              ? '#ED1C24'
              : goal.status === 'warning'
              ? '#E1E5AC'
              : '#6AA6DA'
        }"
      >
        <div class="card-header">
          <div class="card-title flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Target v-if="goal.type === 'savings'" class="size-5" style="color: #22B14C" />
              <Wallet v-else class="size-5" style="color: #364C84" />
              <span class="text-base">{{ goal.title }}</span>
            </div>
            <div class="flex gap-1">
              <button class="btn btn-ghost btn-sm" @click="handleEdit(goal)">
                <Pencil class="size-4" />
              </button>
              <button class="btn btn-ghost btn-sm" @click="deleteConfirmId = goal.id">
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
                  :style="{ width: `${goal.progress}%`, backgroundColor: '#22B14C' }"
                />
              </div>
              <div class="text-sm text-right mt-1">{{ goal.progress.toFixed(0) }}%</div>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <template v-if="goal.status === 'achieved'">
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
                  {{ goal.category }}
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
    </div>

    <!-- Add/Edit Dialog -->
    <div
      v-if="isAddDialogOpen || selectedGoal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="closeDialog"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-semibold mb-4">
          {{ selectedGoal ? '목표 수정' : '목표 추가' }}
        </h3>

        <div class="space-y-4">
          <div class="flex gap-2">
            <button
              type="button"
              @click="formType = 'savings'"
              class="btn flex-1"
              :style="{
                backgroundColor: formType === 'savings' ? '#22B14C' : '#e5e7eb',
                color: formType === 'savings' ? 'white' : '#6b7280'
              }"
            >
              저축 목표
            </button>
            <button
              type="button"
              @click="formType = 'spending'"
              class="btn flex-1"
              :style="{
                backgroundColor: formType === 'spending' ? '#ED1C24' : '#e5e7eb',
                color: formType === 'spending' ? 'white' : '#6b7280'
              }"
            >
              지출 목표
            </button>
          </div>

          <div class="space-y-2">
            <label for="title" class="label">목표 제목</label>
            <input
              id="title"
              v-model="formTitle"
              placeholder="목표 제목을 입력하세요"
              class="input"
              style="border: 2px solid #95B1EE"
            />
          </div>

          <template v-if="formType === 'savings'">
            <div class="space-y-2">
              <label for="targetAmount" class="label">목표 금액</label>
              <input
                id="targetAmount"
                type="number"
                v-model="formTargetAmount"
                placeholder="0"
                class="input"
                style="border: 2px solid #95B1EE"
              />
            </div>
          </template>

          <template v-else>
            <div class="space-y-2">
              <label for="category" class="label">카테고리</label>
              <select v-model="formCategory" class="input" style="border: 2px solid #95B1EE">
                <option v-for="cat in EXPENSE_CATEGORIES" :key="cat" :value="cat">
                  {{ cat }}
                </option>
              </select>
            </div>

            <div class="space-y-2">
              <label for="budgetLimit" class="label">예산</label>
              <input
                id="budgetLimit"
                type="number"
                v-model="formBudgetLimit"
                placeholder="0"
                class="input"
                style="border: 2px solid #95B1EE"
              />
            </div>

            <div class="space-y-2">
              <label for="period" class="label">기간</label>
              <select v-model="formPeriod" class="input" style="border: 2px solid #95B1EE">
                <option value="daily">일간</option>
                <option value="weekly">주간</option>
                <option value="monthly">월간</option>
              </select>
            </div>
          </template>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label for="startDate" class="label">시작일</label>
              <input
                id="startDate"
                type="date"
                v-model="formStartDate"
                class="input"
                style="border: 2px solid #95B1EE"
              />
            </div>
            <div class="space-y-2">
              <label for="endDate" class="label">종료일</label>
              <input
                id="endDate"
                type="date"
                v-model="formEndDate"
                class="input"
                style="border: 2px solid #95B1EE"
              />
            </div>
          </div>
        </div>

        <div class="flex gap-2 mt-6">
          <button @click="closeDialog" class="btn btn-outline flex-1">
            취소
          </button>
          <button
            @click="selectedGoal ? handleUpdate() : handleAdd()"
            class="btn btn-primary flex-1"
          >
            {{ selectedGoal ? '수정' : '추가' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <div
      v-if="deleteConfirmId"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="deleteConfirmId = null"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-sm">
        <h3 class="text-lg font-semibold mb-2">목표를 삭제하시겠습니까?</h3>
        <p class="text-muted-foreground mb-4">이 작업은 되돌릴 수 없습니다.</p>
        <div class="flex gap-2">
          <button @click="deleteConfirmId = null" class="btn btn-outline flex-1">
            취소
          </button>
          <button
            @click="handleDelete(deleteConfirmId)"
            class="btn btn-destructive flex-1"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
