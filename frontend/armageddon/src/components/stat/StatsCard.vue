<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: String,
  value: { type: Number, default: 0 }
})

// 숫자를 표시할 때 안전하게
const displayValue = computed(() => {
  return (props.value ?? 0).toLocaleString()
})
</script>

<template>
  <div class="stats-card">
    <h3>{{ title }}</h3>
    <p>{{ displayValue }}</p>
  </div>
</template>
