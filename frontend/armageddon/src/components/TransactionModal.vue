<script setup>
import {ref, computed, watch} from 'vue'
import {X, Plus, Trash2, ArrowLeft} from 'lucide-vue-next'
import {useAppStore} from '../stores/app'

const props = defineProps({
  isOpen: Boolean,
  selectedDate: String, // 'YYYY-MM-DD'
  initialTransactions: {
    type: Array,
    default: () => []
  },
  initialEditData: { // 최근 거래 내역에서 바로 수정 모드로 열 때 사용
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])
const store = useAppStore()

// Modes: 'list' | 'add' | 'edit'
const mode = ref('list')
const categories = ['식비', '교통', '쇼핑', '주거', '통신', '의료', '여가', '교육', '저축', '경조사', '기타']

// Form Data
const formData = ref({
  id: null,
  type: 'expense', // 'income' | 'expense'
  date: '',
  amount: '',
  category: '기타',
  title: '',
  memo: ''
})

// 삭제 모달 상태
const deleteConfirm = ref(false)

// Watchers
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.initialEditData) {
      setEditMode(props.initialEditData)
    } else {
      mode.value = 'list'
    }
  }
})

// Computed
const isExpense = computed(() => formData.value.type === 'expense')

// Methods
const setAddMode = () => {
  mode.value = 'add'
  formData.value = {
    id: null,
    type: 'expense',
    date: props.selectedDate,
    amount: '',
    category: '식비',
    title: '',
    memo: ''
  }
}

const setEditMode = async (txn) => {
  mode.value = 'edit'
  // 기본 데이터로 먼저 채움 (빠른 UI 반응)
  formData.value = {
    ...txn,
    amount: String(txn.amount),
    memo: txn.memo || '' // 1차적으로 있는거 씀
  }

  // 상세 데이터 비동기 로드 (Memo가 없을 수 있으므로)
  if (txn.id) {
    const detail = await store.fetchTransactionDetail(txn.id)
    if (detail) {
      formData.value = {
        ...formData.value,
        memo: detail.memo || ''
      }
    }
  }
}

const goBackToList = () => {
  if (props.initialEditData) {
    emit('close')
  } else {
    mode.value = 'list'
  }
}

const handleSubmit = async () => {
  if (!formData.value.title || !formData.value.amount) {
    alert('내용과 금액을 입력해주세요.')
    return
  }

  const payload = {
    ...formData.value,
    amount: parseInt(formData.value.amount, 10),
    date: formData.value.date
  }

  let success = false
  if (mode.value === 'add') {
    success = await store.addTransaction(payload)
  } else if (mode.value === 'edit' && formData.value.id) {
    success = await store.updateTransaction(formData.value.id, payload)
  }

  if (success) {
    if (props.initialEditData) {
      emit('close')
    } else {
      mode.value = 'list'
    }
  } else {
    alert('저장 중 오류가 발생했습니다.')
  }
}

// 삭제 처리: 모달 열기
const handleDelete = () => {
  deleteConfirm.value = true
}

// 삭제 확정
const handleDeleteConfirm = async () => {
  if (!formData.value.id) return
  const success = await store.deleteTransaction(formData.value.id)
  if (success) {
    deleteConfirm.value = false
    if (props.initialEditData) {
      emit('close')
    } else {
      mode.value = 'list'
    }
  } else {
    alert('삭제 중 오류가 발생했습니다.')
  }
}

const closeModal = () => {
  emit('close')
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
       @click.self="closeModal">
    <div class="bg-white rounded-lg p-6 w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden">

      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <button v-if="mode !== 'list' && !initialEditData" @click="goBackToList"
                  class="p-1 hover:bg-gray-200 rounded-full transition-colors">
            <ArrowLeft class="size-5 text-gray-600"/>
          </button>
          <h3 class="text-lg font-semibold text-gray-900">
            <span v-if="mode === 'list'">{{ selectedDate }} 거래 내역</span>
            <span v-else-if="mode === 'add'">거래 추가</span>
            <span v-else>거래 수정</span>
          </h3>
        </div>
        <div class="flex items-center gap-2">
          <button v-if="mode === 'list'" @click="setAddMode" class="btn btn-sm btn-primary flex items-center gap-1">
            <Plus class="size-4"/>
            추가
          </button>
          <button @click="closeModal" class="p-1 hover:bg-gray-200 rounded-full transition-colors">
            <X class="size-5 text-gray-500"/>
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto">
        <!-- List View -->
        <div v-if="mode === 'list'" class="space-y-3">
          <div v-if="initialTransactions.length === 0" class="text-center py-10 text-muted-foreground">
            <div class="bg-gray-100 p-4 rounded-full mb-3 inline-block">
              <Plus class="size-8 text-gray-300"/>
            </div>
            <p>거래 내역이 없습니다.</p>
            <p class="text-sm mt-1">우측 상단 '추가' 버튼을 눌러보세요.</p>
          </div>

          <div
              v-else
              v-for="txn in initialTransactions"
              :key="txn.id"
              @click="setEditMode(txn)"
              class="group bg-white p-3 rounded-lg border hover:border-blue-400 hover:shadow-sm cursor-pointer transition-all flex items-center justify-between"
          >
            <div class="flex-1 min-w-0 pr-3">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs px-2 py-0.5 rounded" style="background-color: #E1E5AC; color: #000000">
                  {{ txn.category }}
                </span>
                <span class="font-medium text-gray-900 truncate">{{ txn.title }}</span>
              </div>
              <p v-if="txn.memo" class="text-xs text-gray-500 truncate">{{ txn.memo }}</p>
            </div>
            <!-- 금액: 타입에 따라 색상 적용 -->
            <div class="text-right whitespace-nowrap">
    <span
        class="block font-bold"
        :style="{
        color: txn.type.toLowerCase() === 'expense' ? '#ED1C24' : '#22B14C'
      }"
    >
      {{ txn.type.toLowerCase() === 'expense' ? '-' : '+' }}{{ txn.amount.toLocaleString() }}원
    </span>
            </div>
          </div>
        </div>

        <!-- Form View (Add/Edit) -->
        <div v-else class="space-y-4">
          <!-- Type Toggle -->
          <div class="flex gap-2">
            <button
                type="button"
                @click="formData.type = 'expense'"
                class="btn flex-1"
                :style="{
                backgroundColor: formData.type === 'expense' ? '#ED1C24' : '#e5e7eb',
                color: formData.type === 'expense' ? 'white' : '#6b7280'
              }"
            >
              지출
            </button>
            <button
                type="button"
                @click="formData.type = 'income'"
                class="btn flex-1"
                :style="{
                backgroundColor: formData.type === 'income' ? '#22B14C' : '#e5e7eb',
                color: formData.type === 'income' ? 'white' : '#6b7280'
              }"
            >
              수입
            </button>
          </div>

          <!-- Date -->
          <div class="space-y-2">
            <label class="label">날짜</label>
            <input v-model="formData.date" type="date" class="input"/>
          </div>

          <!-- Title -->
          <div class="space-y-2">
            <label class="label">제목</label>
            <input v-model="formData.title" type="text" placeholder="거래 제목을 입력하세요" class="input"/>
          </div>

          <!-- Amount -->
          <div class="space-y-2">
            <label class="label">금액</label>
            <input v-model="formData.amount" type="number" placeholder="0" class="input"/>
          </div>

          <!-- Category -->
          <div v-if="formData.type === 'expense'" class="space-y-2">
            <label class="label">카테고리</label>
            <select v-model="formData.category" class="input">
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>

          <!-- Memo -->
          <div class="space-y-2">
            <label class="label">메모 (선택)</label>
            <textarea v-model="formData.memo" rows="3" placeholder="상세 내용을 입력하세요" class="input resize-none"></textarea>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div v-if="mode !== 'list'" class="flex gap-2 mt-6">
        <button
            v-if="mode === 'edit'"
            @click="handleDelete"
            class="btn btn-outline border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300"
        >
          <Trash2 class="size-4"/>
        </button>
        <button v-else @click="goBackToList" class="btn btn-outline flex-1">
          취소
        </button>

        <button @click="handleSubmit" class="btn btn-primary flex-1">
          {{ mode === 'add' ? '추가' : '수정' }}
        </button>
      </div>
    </div>

    <!-- Delete Modal -->
    <div
        v-if="deleteConfirm"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="deleteConfirm = false"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-sm">
        <h3 class="text-lg font-semibold mb-2">거래를 삭제하시겠습니까?</h3>
        <p class="text-sm text-gray-500 mb-4">삭제하면 되돌릴 수 없습니다.</p>
        <div class="flex gap-2">
          <button class="btn btn-outline flex-1" @click="deleteConfirm = false">취소</button>
          <button class="btn btn-destructive flex-1" @click="handleDeleteConfirm">삭제</button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type=number] {
  -moz-appearance: textfield;
}

.text-tiny {
  font-size: 0.75rem;
  line-height: 1rem;
}
</style>
