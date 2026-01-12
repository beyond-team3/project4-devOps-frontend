<script setup>
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import { toast } from 'vue-sonner'

const router = useRouter()
const store = useAppStore()

const handleDeleteAccount = () => {
  store.deleteAccount()
  toast.success('계정이 삭제되었습니다.')
  router.push('/login')
}

const handleLogout = () => {
  store.logout()
  toast.success('로그아웃되었습니다.')
  router.push('/login')
}
</script>

<template>
  <div class="max-w-2xl mx-auto p-6 space-y-6">
    <h1 style="color: #000000">계정 설정</h1>

    <div class="card shadow-md">
      <div class="card-header">
        <h2 class="card-title">사용자 정보</h2>
        <p class="card-description">현재 로그인된 계정 정보</p>
      </div>
      <div class="card-content space-y-4">
        <div>
          <label class="label">아이디</label>
          <p class="text-sm mt-1">{{ store.user?.loginId }}</p>
        </div>
        <div>
          <label class="label">이메일</label>
          <p class="text-sm mt-1">{{ store.user?.email }}</p>
        </div>
        <div>
          <label class="label">닉네임</label>
          <p class="text-sm mt-1">{{ store.user?.nickname }}</p>
        </div>
      </div>
    </div>

    <div class="card shadow-md">
      <div class="card-header">
        <h2 class="card-title">계정 관리</h2>
        <p class="card-description">로그아웃 또는 계정 삭제</p>
      </div>
      <div class="card-content space-y-4">
        <button
          @click="handleLogout"
          class="btn btn-outline w-full"
          style="border-color: #6AA6DA; color: #6AA6DA"
        >
          로그아웃
        </button>
        <button
          @click="handleDeleteAccount"
          class="btn btn-destructive w-full"
        >
          계정 삭제
        </button>
      </div>
    </div>
  </div>
</template>
