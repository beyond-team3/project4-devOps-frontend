<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import { toast } from 'vue-sonner'

const router = useRouter()
const store = useAppStore()

const loginId = ref('')
const password = ref('')
const confirmPassword = ref('')
const email = ref('')
const verificationCode = ref('')
const nickname = ref('')
const isEmailVerified = ref(false)
const isCodeSent = ref(false)
const isEmailSending = ref(false)
const isCodeVerifying = ref(false)
const isSigningUp = ref(false)

const handleSendVerification = async () => {
  if (!email.value) {
    toast.error('이메일을 입력해주세요.')
    return
  }

  isEmailSending.value = true
  const success = await store.requestEmailVerification(email.value)
  isEmailSending.value = false

  if (success) {
    isCodeSent.value = true
    toast.success('인증 코드가 이메일로 전송되었습니다.')
  } else {
    toast.error(store.error || '이메일 인증 요청에 실패했습니다.')
  }
}

const handleVerifyEmail = async () => {
  if (!verificationCode.value) {
    toast.error('인증 코드를 입력해주세요.')
    return
  }

  isCodeVerifying.value = true
  const success = await store.confirmEmailVerification(email.value, verificationCode.value)
  isCodeVerifying.value = false

  if (success) {
    isEmailVerified.value = true
    toast.success('이메일이 인증되었습니다.')
  } else {
    toast.error(store.error || '인증 코드가 올바르지 않습니다.')
  }
}

const handleSubmit = async () => {
  if (!isEmailVerified.value) {
    toast.error('이메일 인증을 완료해주세요.')
    return
  }

  if (password.value !== confirmPassword.value) {
    toast.error('비밀번호가 일치하지 않습니다.')
    return
  }

  if (password.value.length < 8 || password.value.length > 20) {
    toast.error('비밀번호는 8-20자 사이여야 합니다.')
    return
  }

  isSigningUp.value = true
  const success = await store.signup(loginId.value, password.value, email.value, nickname.value)
  isSigningUp.value = false

  if (success) {
    toast.success('회원가입이 완료되었습니다!')
    router.push('/dashboard')
  } else {
    toast.error(store.error || '회원가입에 실패했습니다.')
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="card w-full max-w-md shadow-lg">
      <div class="card-header text-center">
        <h1 class="text-3xl" style="color: #000000">회원가입</h1>
        <p class="card-description">Armageddon에 오신 것을 환영합니다</p>
      </div>
      <div class="card-content">
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="space-y-2">
            <label for="loginId" class="label">아이디 (4-20자, 영문/숫자)</label>
            <input
              id="loginId"
              type="text"
              v-model="loginId"
              required
              class="input"
              minlength="4"
              maxlength="20"
              pattern="^[a-zA-Z0-9]*$"
              :disabled="store.loading"
            />
          </div>

          <div class="space-y-2">
            <label for="password" class="label">비밀번호 (8-20자)</label>
            <input
              id="password"
              type="password"
              v-model="password"
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

          <div class="space-y-2">
            <label for="email" class="label">이메일</label>
            <div class="flex gap-2">
              <input
                id="email"
                type="email"
                v-model="email"
                required
                class="input flex-1"
                :disabled="isEmailVerified || isEmailSending"
              />
              <button
                type="button"
                @click="handleSendVerification"
                :disabled="isEmailVerified || !email || isEmailSending"
                class="btn btn-primary flex items-center gap-2"
              >
                <svg v-if="isEmailSending" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isEmailSending ? '전송중' : '인증' }}
              </button>
            </div>
          </div>

          <div v-if="isCodeSent && !isEmailVerified" class="space-y-2">
            <label for="verificationCode" class="label">인증 코드</label>
            <div class="flex gap-2">
              <input
                id="verificationCode"
                type="text"
                v-model="verificationCode"
                class="input flex-1"
                :disabled="isCodeVerifying"
              />
              <button
                type="button"
                @click="handleVerifyEmail"
                :disabled="!verificationCode || isCodeVerifying"
                class="btn btn-primary flex items-center gap-2"
              >
                <svg v-if="isCodeVerifying" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isCodeVerifying ? '확인중' : '확인' }}
              </button>
            </div>
          </div>

          <div v-if="isEmailVerified" class="text-sm" style="color: #22B14C">
            이메일이 인증되었습니다.
          </div>

          <div class="space-y-2">
            <label for="nickname" class="label">닉네임 (2-10자)</label>
            <input
              id="nickname"
              type="text"
              v-model="nickname"
              required
              class="input"
              minlength="2"
              maxlength="10"
              :disabled="store.loading"
            />
          </div>

          <button
            type="submit"
            class="btn btn-primary w-full flex items-center justify-center gap-2"
            :disabled="!isEmailVerified || isSigningUp"
          >
            <svg v-if="isSigningUp" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isSigningUp ? '가입 중...' : '회원가입' }}
          </button>
        </form>

        <div class="mt-6 text-center text-sm">
          <span class="text-muted-foreground">이미 계정이 있으신가요? </span>
          <router-link
            to="/login"
            class="hover:underline"
            style="color: #6AA6DA"
          >
            로그인
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
