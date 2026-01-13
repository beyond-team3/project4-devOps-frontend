<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import { toast } from 'vue-sonner'

const router = useRouter()
const store = useAppStore()

const loginId = ref('')
const email = ref('')
const verificationCode = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const step = ref(1)

const handleSubmit = async () => {
  if (step.value === 1) {
    if (!loginId.value) {
      toast.error('아이디를 입력해주세요.')
      return
    }
    if (!email.value) {
      toast.error('이메일을 입력해주세요.')
      return
    }
    const success = await store.requestPasswordReset(loginId.value, email.value)
    if (success) {
      toast.success('인증 코드가 이메일로 전송되었습니다.')
      step.value = 2
    } else {
      toast.error(store.error || '이메일 전송에 실패했습니다.')
    }
  } else if (step.value === 2) {
    if (!verificationCode.value) {
      toast.error('인증 코드를 입력해주세요.')
      return
    }
    // 코드 확인 후 다음 단계로
    step.value = 3
  } else if (step.value === 3) {
    if (newPassword.value !== confirmPassword.value) {
      toast.error('비밀번호가 일치하지 않습니다.')
      return
    }

    if (newPassword.value.length < 8 || newPassword.value.length > 20) {
      toast.error('비밀번호는 8-20자 사이여야 합니다.')
      return
    }

    const success = await store.confirmPasswordReset(
      loginId.value,
      verificationCode.value,
      newPassword.value
    )

    if (success) {
      toast.success('비밀번호가 재설정되었습니다.')
      router.push('/login')
    } else {
      toast.error(store.error || '비밀번호 재설정에 실패했습니다.')
    }
  }
}

const getDescription = () => {
  if (step.value === 1) return '아이디와 이메일을 입력하세요'
  if (step.value === 2) return '이메일로 전송된 코드를 입력하세요'
  return '새로운 비밀번호를 입력하세요'
}

const getButtonText = () => {
  if (store.loading) return '처리 중...'
  if (step.value === 1) return '인증 코드 전송'
  if (step.value === 2) return '코드 확인'
  return '비밀번호 변경'
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="card w-full max-w-md shadow-lg">
      <div class="card-header text-center">
        <h1 class="text-3xl" style="color: #000000">비밀번호 재설정</h1>
        <p class="card-description">{{ getDescription() }}</p>
      </div>
      <div class="card-content">
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div v-if="step === 1" class="space-y-4">
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
              <label for="email" class="label">이메일</label>
              <input
                id="email"
                type="email"
                v-model="email"
                required
                class="input"
                :disabled="store.loading"
              />
            </div>
          </div>

          <div v-if="step === 2" class="space-y-2">
            <label for="verificationCode" class="label">인증 코드</label>
            <input
              id="verificationCode"
              type="text"
              v-model="verificationCode"
              required
              class="input"
              :disabled="store.loading"
            />
          </div>

          <template v-if="step === 3">
            <div class="space-y-2">
              <label for="newPassword" class="label">새 비밀번호 (8-20자)</label>
              <input
                id="newPassword"
                type="password"
                v-model="newPassword"
                required
                class="input"
                minlength="8"
                maxlength="20"
                :disabled="store.loading"
              />
            </div>
            <div class="space-y-2">
              <label for="confirmPassword" class="label">비밀번호 확인</label>
              <input
                id="confirmPassword"
                type="password"
                v-model="confirmPassword"
                required
                class="input"
                :disabled="store.loading"
              />
            </div>
          </template>

          <button
            type="submit"
            class="btn btn-primary w-full"
            :disabled="store.loading"
          >
            {{ getButtonText() }}
          </button>
        </form>

        <div class="mt-6 text-center text-sm">
          <router-link
            to="/login"
            class="hover:underline"
            style="color: #6AA6DA"
          >
            로그인으로 돌아가기
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
