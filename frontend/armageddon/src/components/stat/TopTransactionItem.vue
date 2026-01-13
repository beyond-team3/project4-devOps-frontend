<template>
  <div class="flex items-center justify-between p-3 rounded-lg border border-gray-200">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-full flex items-center justify-center bg-yellow-200 text-black font-semibold">
        {{ rank }}
      </div>
      <div>
        <div class="font-medium">{{ title }}</div>
        <div class="text-sm text-gray-500">{{ date }} {{ category ? `· ${category}` : '' }}</div>
      </div>
    </div>
    <div class="text-lg text-red-500">{{ amount.toLocaleString() }}원</div>
  </div>
</template>

<script setup>
const props = defineProps({
  rank: Number,
  title: String,
  date: String,
  category: String,
  amount: Number
})
</script>
