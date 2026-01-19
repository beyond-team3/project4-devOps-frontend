<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import { toast } from 'vue-sonner'

const router = useRouter()
const store = useAppStore()

const loginId = ref('')
const password = ref('')

const handleSubmit = async () => {
  const success = await store.login(loginId.value, password.value)
  if (success) {
    toast.success('로그인 성공!')
    router.push('/dashboard')
  } else {
    toast.error(store.error || '로그인에 실패했습니다.')
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="card w-full max-w-md shadow-lg">
      <div class="card-header text-center">
        <h1 class="text-3xl" style="color: #000000">Armageddon</h1>
        <p class="card-description">로그인하여 재정 관리를 시작하세요</p>
      </div>
      <div class="card-content">
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="space-y-2">
            <label for="loginId" class="label">아이디</label>
            <input
              id="loginId"
              type="text"
              v-model="loginId"
              required
              class="input"
              :disabled="store.loading"
            />
          </div>
          <div class="space-y-2">
            <label for="password" class="label">비밀번호</label>
            <input
              id="password"
              type="password"
              v-model="password"
              required
              class="input"
              :disabled="store.loading"
            />
          </div>
          <button
            type="submit"
            class="btn btn-primary w-full"
            :disabled="store.loading"
          >
            {{ store.loading ? '로그인 중...' : '로그인' }}
          </button>
        </form>

        <div class="mt-6 flex flex-col gap-2 text-sm text-center">
          <router-link
            to="/reset-password"
            class="hover:underline"
            style="color: #6AA6DA"
          >
            비밀번호를 잊으셨나요?
          </router-link>
          <div>
            <span class="text-muted-foreground">계정이 없으신가요? </span>
            <router-link
              to="/signup"
              class="hover:underline"
              style="color: #6AA6DA"
            >
              회원가입
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
