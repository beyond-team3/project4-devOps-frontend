<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '../stores/app'
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const store = useAppStore()

const EXPENSE_CATEGORIES = [
  '식비', '교통', '쇼핑', '주거', '통신',
  '의료', '여가', '교육', '저축', '경조사', '기타'
]

const isDialogOpen = ref(false)
const selectedTransaction = ref(null)
const deleteConfirmId = ref(null)

const formType = ref('expense')
const formDate = ref(new Date().toISOString().split('T')[0])
const formTitle = ref('')
const formAmount = ref('')
const formCategory = ref('기타')

const resetForm = () => {
  formType.value = 'expense'
  formDate.value = new Date().toISOString().split('T')[0]
  formTitle.value = ''
  formAmount.value = ''
  formCategory.value = '기타'
}

const handleAdd = () => {
  if (!formTitle.value || !formAmount.value) {
    toast.error('제목과 금액을 입력해주세요.')
    return
  }

  store.addTransaction({
    type: formType.value,
    title: formTitle.value,
    amount: parseFloat(formAmount.value),
    date: formDate.value,
    category: formType.value === 'expense' ? formCategory.value : undefined
  })

  toast.success('거래가 추가되었습니다.')
  isDialogOpen.value = false
  resetForm()
}

const handleEdit = (transaction) => {
  selectedTransaction.value = transaction
  formType.value = transaction.type
  formDate.value = transaction.date
  formTitle.value = transaction.title
  formAmount.value = transaction.amount.toString()
  formCategory.value = transaction.category || '기타'
}

const handleUpdate = () => {
  if (!selectedTransaction.value || !formTitle.value || !formAmount.value) {
    toast.error('제목과 금액을 입력해주세요.')
    return
  }

  store.updateTransaction(selectedTransaction.value.id, {
    type: formType.value,
    title: formTitle.value,
    amount: parseFloat(formAmount.value),
    date: formDate.value,
    category: formType.value === 'expense' ? formCategory.value : undefined
  })

  toast.success('거래가 수정되었습니다.')
  selectedTransaction.value = null
  resetForm()
}

const handleDelete = (id) => {
  store.deleteTransaction(id)
  toast.success('거래가 삭제되었습니다.')
  deleteConfirmId.value = null
}

const closeDialog = () => {
  isDialogOpen.value = false
  selectedTransaction.value = null
  resetForm()
}

const sortedTransactions = computed(() => {
  return [...store.transactions].sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date)
    return b.createdAt - a.createdAt
  })
})
</script>

<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <h1 style="color: #000000">거래 내역</h1>
      <button
        @click="isDialogOpen = true"
        class="btn btn-primary"
      >
        <Plus class="size-4 mr-2" />
        새 거래 추가
      </button>
    </div>

    <div class="card shadow-md">
      <div class="card-header">
        <h2 class="card-title">전체 거래</h2>
      </div>
      <div class="card-content">
        <div class="space-y-2">
          <div
            v-if="sortedTransactions.length === 0"
            class="text-center py-12 text-muted-foreground"
          >
            거래 내역이 없습니다. 첫 거래를 추가해보세요!
          </div>
          <div
            v-else
            v-for="txn in sortedTransactions"
            :key="txn.id"
            class="flex items-center justify-between p-3 rounded-lg border hover:shadow-md transition-shadow"
          >
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span>{{ txn.title }}</span>
                <span
                  v-if="txn.category"
                  class="text-xs px-2 py-0.5 rounded"
                  style="background-color: #E1E5AC; color: #000000"
                >
                  {{ txn.category }}
                </span>
              </div>
              <div class="text-sm text-muted-foreground">{{ txn.date }}</div>
            </div>
            <div class="flex items-center gap-4">
              <div
                class="text-lg"
                :style="{ color: txn.type === 'expense' ? '#ED1C24' : '#22B14C' }"
              >
                {{ txn.type === 'expense' ? '-' : '+' }}{{ txn.amount.toLocaleString() }}원
              </div>
              <div class="flex gap-2">
                <button
                  class="btn btn-ghost btn-sm"
                  @click="handleEdit(txn)"
                >
                  <Pencil class="size-4" />
                </button>
                <button
                  class="btn btn-ghost btn-sm"
                  @click="deleteConfirmId = txn.id"
                >
                  <Trash2 class="size-4" style="color: #ED1C24" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Dialog -->
    <div
      v-if="isDialogOpen || selectedTransaction"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="closeDialog"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4">
          {{ selectedTransaction ? '거래 수정' : '거래 추가' }}
        </h3>

        <div class="space-y-4">
          <div class="flex gap-2">
            <button
              type="button"
              @click="formType = 'expense'"
              class="btn flex-1"
              :style="{
                backgroundColor: formType === 'expense' ? '#ED1C24' : '#e5e7eb',
                color: formType === 'expense' ? 'white' : '#6b7280'
              }"
            >
              지출
            </button>
            <button
              type="button"
              @click="formType = 'income'"
              class="btn flex-1"
              :style="{
                backgroundColor: formType === 'income' ? '#22B14C' : '#e5e7eb',
                color: formType === 'income' ? 'white' : '#6b7280'
              }"
            >
              수입
            </button>
          </div>

          <div class="space-y-2">
            <label for="date" class="label">날짜</label>
            <input
              id="date"
              type="date"
              v-model="formDate"
              class="input"
            />
          </div>

          <div class="space-y-2">
            <label for="title" class="label">제목</label>
            <input
              id="title"
              v-model="formTitle"
              placeholder="거래 제목을 입력하세요"
              class="input"
            />
          </div>

          <div class="space-y-2">
            <label for="amount" class="label">금액</label>
            <input
              id="amount"
              type="number"
              v-model="formAmount"
              placeholder="0"
              class="input"
            />
          </div>

          <div v-if="formType === 'expense'" class="space-y-2">
            <label for="category" class="label">카테고리</label>
            <select v-model="formCategory" class="input">
              <option v-for="cat in EXPENSE_CATEGORIES" :key="cat" :value="cat">
                {{ cat }}
              </option>
            </select>
          </div>
        </div>

        <div class="flex gap-2 mt-6">
          <button @click="closeDialog" class="btn btn-outline flex-1">
            취소
          </button>
          <button
            @click="selectedTransaction ? handleUpdate() : handleAdd()"
            class="btn btn-primary flex-1"
          >
            {{ selectedTransaction ? '수정' : '추가' }}
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
        <h3 class="text-lg font-semibold mb-2">거래를 삭제하시겠습니까?</h3>
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
