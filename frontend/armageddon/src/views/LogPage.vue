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

/* ✅ 기존 formType, formDate ... 전부 제거 */
const emptyForm = () => ({
  type: 'expense',
  date: new Date().toISOString().split('T')[0],
  title: '',
  amount: '',
  category: '기타',
  memo: ''
})

const formData = ref(emptyForm())

const resetForm = () => {
  formData.value = emptyForm()
}

const handleAdd = () => {
  if (!formData.value.title || !formData.value.amount) {
    toast.error('제목과 금액을 입력해주세요.')
    return
  }

  store.addTransaction({
    ...formData.value,
    amount: Number(formData.value.amount),
    category:
        formData.value.type === 'expense'
            ? formData.value.category
            : undefined
  })

  toast.success('거래가 추가되었습니다.')
  isDialogOpen.value = false
  resetForm()
}

const handleEdit = (transaction) => {
  selectedTransaction.value = transaction
  formData.value = {
    ...transaction,
    amount: transaction.amount.toString(),
    memo: transaction.memo ?? ''
  }
}

const handleUpdate = () => {
  if (!formData.value.title || !formData.value.amount) {
    toast.error('제목과 금액을 입력해주세요.')
    return
  }

  store.updateTransaction(selectedTransaction.value.id, {
    ...formData.value,
    amount: Number(formData.value.amount),
    category:
        formData.value.type === 'expense'
            ? formData.value.category
            : undefined
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
      <h1 style="color:#000">거래 내역</h1>
      <button class="btn btn-primary" @click="isDialogOpen = true">
        <Plus class="size-4 mr-2" /> 새 거래 추가
      </button>
    </div>

    <!-- List -->
    <div class="card shadow-md">
      <div class="card-header">
        <h2 class="card-title">전체 거래</h2>
      </div>

      <div class="card-content">
        <div class="space-y-2">
          <!-- ✅ 거래 없을 때 -->
          <div
              v-if="sortedTransactions.length === 0"
              class="text-center py-12 text-muted-foreground"
          >
            거래 내역이 없습니다. 첫 거래를 추가해보세요!
          </div>

          <!-- ✅ 거래 있을 때 -->
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

              <div class="text-sm text-muted-foreground">
                {{ txn.date }}
              </div>
            </div>

            <div class="flex items-center gap-4">
              <div
                  class="text-lg"
                  :style="{ color: txn.type === 'expense' ? '#ED1C24' : '#22B14C' }"
              >
                {{ txn.type === 'expense' ? '-' : '+' }}
                {{ txn.amount.toLocaleString() }}원
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


    <!-- ✅ Add / Edit Dialog (작성 영역 교체됨) -->
    <div
        v-if="isDialogOpen || selectedTransaction"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        @click.self="closeDialog"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4">
          {{ selectedTransaction ? '거래 수정' : '거래 추가' }}
        </h3>

        <!-- 🔥 여기부터 네가 준 템플릿 그대로 -->
        <div class="space-y-4">
          <!-- Type -->
          <div class="flex gap-2">
            <button
                class="btn flex-1"
                :style="{
                backgroundColor: formData.type === 'expense' ? '#ED1C24' : '#e5e7eb',
                color: formData.type === 'expense' ? 'white' : '#6b7280'
              }"
                @click="formData.type = 'expense'"
            >
              지출
            </button>

            <button
                class="btn flex-1"
                :style="{
                backgroundColor: formData.type === 'income' ? '#22B14C' : '#e5e7eb',
                color: formData.type === 'income' ? 'white' : '#6b7280'
              }"
                @click="formData.type = 'income'"
            >
              수입
            </button>
          </div>

          <div class="space-y-2">
            <label class="label">날짜</label>
            <input v-model="formData.date" type="date" class="input" />
          </div>

          <div class="space-y-2">
            <label class="label">제목</label>
            <input v-model="formData.title" class="input" />
          </div>

          <div class="space-y-2">
            <label class="label">금액</label>
            <input v-model="formData.amount" type="number" class="input" />
          </div>

          <div v-if="formData.type === 'expense'" class="space-y-2">
            <label class="label">카테고리</label>
            <select v-model="formData.category" class="input">
              <option v-for="c in EXPENSE_CATEGORIES" :key="c" :value="c">
                {{ c }}
              </option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="label">메모</label>
            <textarea v-model="formData.memo" rows="3" class="input resize-none" />
          </div>

          <div class="flex gap-2 mt-6">
            <button class="btn btn-outline flex-1" @click="closeDialog">
              취소
            </button>
            <button
                class="btn btn-primary flex-1"
                @click="selectedTransaction ? handleUpdate() : handleAdd()"
            >
              {{ selectedTransaction ? '수정' : '추가' }}
            </button>
          </div>
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
          <button class="btn btn-outline flex-1" @click="deleteConfirmId = null">
            취소
          </button>
          <button
              class="btn btn-destructive flex-1"
              @click="handleDelete(deleteConfirmId)"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
