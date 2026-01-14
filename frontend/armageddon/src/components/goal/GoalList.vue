<script setup>
import GoalCard from './GoalCard.vue'

defineProps({
  goals: {
    type: Array,
    required: true
  }
})

defineEmits(['edit', 'delete', 'detail'])
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <div
      v-if="goals.length === 0"
      class="card col-span-full shadow-md"
    >
      <div class="card-content py-12 text-center text-muted-foreground">
        목표가 없습니다. 첫 번째 목표를 추가해보세요!
      </div>
    </div>

    <GoalCard
      v-else
      v-for="goal in goals"
      :key="goal.id"
      :goal="goal"
      @edit="$emit('edit', $event)"
      @delete="$emit('delete', $event)"
      @detail="$emit('detail', $event)"
    />
  </div>
</template>
