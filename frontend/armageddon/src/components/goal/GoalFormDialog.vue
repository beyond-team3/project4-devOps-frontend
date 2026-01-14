<script setup>
import { ref, watch, computed } from 'vue'
import { CATEGORY_META } from '../../constants/category'
import { toast } from 'vue-sonner'

const props = defineProps({
  isOpen: Boolean,
  initialGoal: Object // null for add, object (with details) for edit
})

const emit = defineEmits(['close', 'submit'])

const categoryOptions = Object.keys(CATEGORY_META)
  .filter(key => key !== 'SAVING') 
  .map(key => ({
    value: key,
    label: CATEGORY_META[key].label
  }))

const formType = ref('savings')
const formTitle = ref('')
const formTargetAmount = ref('')
const formBudgetLimit = ref('')
const formCategory = ref('FOOD') // Default
const formStartDate = ref(new Date().toISOString().split('T')[0])
const formEndDate = ref('')

const resetForm = () => {
  formType.value = 'savings'
  formTitle.value = ''
  formTargetAmount.value = ''
  formBudgetLimit.value = ''
  formCategory.value = 'FOOD'
  formStartDate.value = new Date().toISOString().split('T')[0]
  formEndDate.value = ''
}

watch(() => props.isOpen, (newVal) => {
    if (newVal) {
        if (props.initialGoal) {
            const goal = props.initialGoal
            const type = goal.type // 'savings' or 'spending' (mapped in store)
            
            formType.value = type
            formTitle.value = goal.title
            
            // Dates
            if (goal.startDate && goal.startDate !== '-') formStartDate.value = goal.startDate
            if (goal.endDate && goal.endDate !== '-') formEndDate.value = goal.endDate

            if (type === 'savings') {
                formTargetAmount.value = goal.targetAmount
            } else {
                formBudgetLimit.value = goal.targetAmount
                // category: Enum Key? or Korean?
                // Store maps backend 'category' (Enum) to this field.
                const cat = goal.category
                formCategory.value = cat || 'FOOD'
            }
        } else {
            resetForm()
        }
    }
})

const handleSubmit = () => {
  if (!formTitle.value) {
    toast.error('목표 제목을 입력해주세요.')
    return
  }

  const payload = {
      type: formType.value,
      title: formTitle.value,
      startDate: formStartDate.value,
      endDate: formEndDate.value,
  }

  if (formType.value === 'savings') {
     if (!formTargetAmount.value || !formEndDate.value) {
       toast.error('목표 금액과 종료일을 입력해주세요.')
       return
     }
     payload.targetAmount = parseFloat(formTargetAmount.value)
     payload.currentAmount = 0
  } else {
    // Spending
    if (!formBudgetLimit.value || !formEndDate.value) {
        toast.error('예산과 종료일을 입력해주세요.')
        return
    }
    payload.targetAmount = parseFloat(formBudgetLimit.value)
    payload.category = formCategory.value // Send Enum Key
    // Backend expects 'category' as Enum
    // Backend expects 'category' as Enum
  }

  emit('submit', payload)
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-semibold mb-4">
          {{ initialGoal ? '목표 수정' : '목표 추가' }}
        </h3>

        <div class="space-y-4">
          <!-- Type Toggles -->
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

          <!-- Title -->
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

          <!-- Saving Fields -->
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

          <!-- Expense Fields -->
          <template v-else>
            <div class="space-y-2">
              <label for="category" class="label">카테고리</label>
              <select v-model="formCategory" class="input" style="border: 2px solid #95B1EE">
                <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
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
          <button @click="$emit('close')" class="btn btn-outline flex-1">
            취소
          </button>
          <button
            @click="handleSubmit"
            class="btn btn-primary flex-1"
          >
            {{ initialGoal ? '수정' : '추가' }}
          </button>
        </div>
    </div>
  </div>
</template>
