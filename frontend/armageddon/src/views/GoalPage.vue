<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '../stores/app'
import { Plus } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import GoalList from '../components/goal/GoalList.vue'
import GoalFormDialog from '../components/goal/GoalFormDialog.vue'
import GoalDeleteDialog from '../components/goal/GoalDeleteDialog.vue'
import GoalDetailModal from '../components/goal/GoalDetailModal.vue'

const store = useAppStore()

const isAddDialogOpen = ref(false)
const selectedGoal = ref(null)
const deleteConfirmId = ref(null)
const detailGoalId = ref(null)
const activeTab = ref('active') // 'active' or 'finished'

const goalStats = computed(() => store.goals)

const activeGoals = computed(() => goalStats.value
  .filter(g => !['COMPLETED', 'FAILED'].includes(g.rawStatus))
  .sort((a, b) => {
    // Savings first
    if (a.type === 'savings' && b.type !== 'savings') return -1
    if (a.type !== 'savings' && b.type === 'savings') return 1
    return 0
  })
)

const finishedGoals = computed(() => goalStats.value.filter(g => 
    ['COMPLETED', 'FAILED'].includes(g.rawStatus)
))

const handleAddClick = () => {
  selectedGoal.value = null
  isAddDialogOpen.value = true
}

const handleEditClick = async (goal) => {
  const detail = await store.fetchGoalDetail(goal.id)
  if (!detail) {
    toast.error('목표 정보를 불러오는데 실패했습니다.')
    return
  }
  selectedGoal.value = { ...goal, ...detail }
  isAddDialogOpen.value = true
}

const handleFormSubmit = async (payload) => {
  try {
    // Frontend Validation for Duplicates
    if (payload.type === 'savings') {
        // 저축 목표 중복 체크
        // If editing, exclude self.
        const duplicate = activeGoals.value.find(g => 
            g.type === 'savings' && 
            (!selectedGoal.value || g.id !== selectedGoal.value.id)
        )
        if (duplicate) {
            toast.error('이미 진행 중인 저축 목표가 있습니다.')
            return
        }
    } else {
        // 지출 목표 중복 체크 (카테고리별 1개)
        const duplicate = activeGoals.value.find(g => {
            if (g.type !== 'spending') return false
            if (selectedGoal.value && g.id === selectedGoal.value.id) return false
            
            // Category Matching
            const goalCat = g.category
            const payloadCat = payload.category

            if (goalCat === payloadCat) return true
            
            return false
        })
        
        if (duplicate) {
             toast.error('해당 카테고리에 이미 진행 중인 지출 목표가 있습니다.')
             return
        }
    }

    if (selectedGoal.value) {
      await store.updateGoal(selectedGoal.value.id, payload)
      toast.success('목표가 수정되었습니다.')
    } else {
      await store.addGoal(payload)
      toast.success('목표가 추가되었습니다.')
    }
    isAddDialogOpen.value = false
    selectedGoal.value = null
  } catch (e) {
    toast.error(e.message || '오류가 발생했습니다.')
    console.error(e)
  }
}

const handleDeleteClick = (id) => {
  deleteConfirmId.value = id
}

const handleDeleteConfirm = async () => {
  if (deleteConfirmId.value) {
    await store.deleteGoal(deleteConfirmId.value)
    toast.success('목표가 삭제되었습니다.')
    deleteConfirmId.value = null
    deleteConfirmId.value = null
  }
}

const handleDetailClick = (id) => {
  detailGoalId.value = id
}

onMounted(() => {
  store.fetchGoals()
})
</script>

<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <h1 style="color: #000000">목표</h1>
      <button
        @click="handleAddClick"
        class="btn btn-primary"
      >
        <Plus class="size-4 mr-2" />
        새 목표 추가
      </button>
    </div>

    <!-- Tabs -->
    <div class="flex border-b border-gray-200">
        <button 
            @click="activeTab = 'active'"
            class="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
            :class="activeTab === 'active' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'"
        >
            진행 중인 목표
        </button>
        <button 
            @click="activeTab = 'finished'"
            class="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
            :class="activeTab === 'finished' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'"
        >
            종료된 목표
        </button>
    </div>

    <GoalList
      v-if="activeTab === 'active'"
      :goals="activeGoals"
      @edit="handleEditClick"
      @delete="handleDeleteClick"
      @detail="handleDetailClick"
    />

    <GoalList
      v-else
      :goals="finishedGoals"
      @edit="handleEditClick"
      @delete="handleDeleteClick"
      @detail="handleDetailClick"
    />

    <GoalFormDialog
      :is-open="isAddDialogOpen"
      :initial-goal="selectedGoal"
      @close="isAddDialogOpen = false"
      @submit="handleFormSubmit"
    />

    <GoalDeleteDialog
      :is-open="!!deleteConfirmId"
      @close="deleteConfirmId = null"
      @confirm="handleDeleteConfirm"
    />

    <GoalDetailModal
      :is-open="!!detailGoalId"
      :goal-id="detailGoalId"
      @close="detailGoalId = null"
    />
  </div>
</template>
