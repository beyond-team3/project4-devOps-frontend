<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from './stores/app'
import { Toaster } from 'vue-sonner'
import { User, Home, FileText, BarChart3, Target } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const store = useAppStore()

const isAuthenticated = computed(() => store.isAuthenticated)
const currentRouteName = computed(() => route.name)

const navItems = [
  { name: 'dashboard', label: '대시보드', icon: Home, to: '/dashboard' },
  { name: 'stat', label: '통계', icon: BarChart3, to: '/stat' },
  { name: 'goal', label: '목표', icon: Target, to: '/goal' },
  { name: 'settings', label: '설정', icon: User, to: '/settings' }
]

const isActive = (name) => currentRouteName.value === name
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Top Navigation (only when authenticated) -->
    <header
        v-if="isAuthenticated"
        class="shadow-sm"
        style="background-color: #FBFBF8; border-bottom: 1px solid #DBE3E9"
    >
      <div class="flex items-center justify-between px-6 py-4">
        <h1 class="text-2xl" style="color: #000000">Armageddon</h1>
        <nav class="flex items-center gap-2">
          <router-link
              v-for="item in navItems"
              :key="item.name"
              :to="item.to"
              class="btn"
              :class="isActive(item.name) ? '' : 'btn-ghost'"
              :style="isActive(item.name)
              ? { backgroundColor: '#6AA6DA', color: '#FBFBF8' }
              : { color: '#000000' }
            "
          >
            <component :is="item.icon" class="size-4 mr-2" />
            {{ item.label }}
          </router-link>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1">
      <router-view />
    </main>

    <!-- Toast notifications -->
    <Toaster position="top-right" />
  </div>
</template>
