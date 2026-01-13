<template>
  <div class="space-y-3">
    <div
        v-for="(item, index) in items"
        :key="item.name"
        class="flex items-center gap-3"
    >
      <div class="w-4 h-4 rounded" :style="{ backgroundColor: COLORS[index % COLORS.length] }" />
      <div class="flex-1">
        <div class="flex justify-between text-sm">
          <span>{{ item.name }}</span>
          <span>{{ item.percentage }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded h-2 mt-1">
          <div class="h-2 rounded" :style="{ width: `${item.percentage}%`, backgroundColor: COLORS[index % COLORS.length] }" />
        </div>
      </div>
      <span class="text-sm text-gray-600">{{ item.value.toLocaleString() }}원</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  items: { type: Array, default: () => [] },
  COLORS: { type: Array, default: () => ['#6AA6DA','#DBE3E9','#E1E5AC','#ED1C24','#22B14C','#FFB6C1','#87CEEB','#DDA0DD','#F0E68C','#98FB98','#FFE4B5'] }
})
</script>
