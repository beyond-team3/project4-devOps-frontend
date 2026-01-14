<script setup>
defineProps({
  isOpen: Boolean
})

defineEmits(['close', 'confirm'])
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-lg p-6 w-full max-w-sm">
      <h3 class="text-lg font-semibold mb-2">목표를 삭제하시겠습니까?</h3>
      <p class="text-muted-foreground mb-4">이 작업은 되돌릴 수 없습니다.</p>
      <div class="flex gap-2">
        <button @click="$emit('close')" class="btn btn-outline flex-1">
          취소
        </button>
        <button
          @click="$emit('confirm')"
          class="btn btn-destructive flex-1"
        >
          삭제
        </button>
      </div>
    </div>
  </div>
</template>
