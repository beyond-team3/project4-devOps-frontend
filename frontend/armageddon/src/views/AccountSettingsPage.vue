<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import { toast } from 'vue-sonner'

const router = useRouter()
const store = useAppStore()

// 편집 모드 상태
const isEditing = ref(false)

// 편집용 폼 데이터
const editForm = ref({
  loginId: '',
  nickname: '',
  email: '',
  currentPassword: ''
})

// 이메일 인증 관련 상태
const isEmailChanged = ref(false)
const isEmailVerified = ref(false)
const isCodeSent = ref(false)
const verificationCode = ref('')
const isEmailSending = ref(false)
const isCodeVerifying = ref(false)
const isUpdating = ref(false)

// 페이지 로드 시 사용자 정보 조회
onMounted(async () => {
  await store.fetchUserInfo()
})

// 편집 모드 진입
const startEditing = () => {
  editForm.value = {
    loginId: store.user?.loginId || '',
    nickname: store.user?.nickname || '',
    email: store.user?.email || '',
    currentPassword: ''
  }
  isEditing.value = true
  isEmailChanged.value = false
  isEmailVerified.value = false
  isCodeSent.value = false
  verificationCode.value = ''
}

// 편집 취소
const cancelEditing = () => {
  isEditing.value = false
  isEmailChanged.value = false
  isEmailVerified.value = false
  isCodeSent.value = false
  verificationCode.value = ''
}

// 이메일 변경 감지
const onEmailChange = () => {
  if (editForm.value.email !== store.user?.email) {
    isEmailChanged.value = true
    isEmailVerified.value = false
    isCodeSent.value = false
    verificationCode.value = ''
  } else {
    isEmailChanged.value = false
    isEmailVerified.value = false
  }
}

// 이메일 인증 코드 전송
const handleSendVerification = async () => {
  if (!editForm.value.email) {
    toast.error('이메일을 입력해주세요.')
    return
  }

  isEmailSending.value = true
  const success = await store.requestEmailVerification(editForm.value.email)
  isEmailSending.value = false

  if (success) {
    isCodeSent.value = true
    toast.success('인증 코드가 이메일로 전송되었습니다.')
  } else {
    toast.error(store.error || '이메일 인증 요청에 실패했습니다.')
  }
}

// 이메일 인증 코드 확인
const handleVerifyEmail = async () => {
  if (!verificationCode.value) {
    toast.error('인증 코드를 입력해주세요.')
    return
  }

  isCodeVerifying.value = true
  const success = await store.confirmEmailVerification(editForm.value.email, verificationCode.value)
  isCodeVerifying.value = false

  if (success) {
    isEmailVerified.value = true
    toast.success('이메일이 인증되었습니다.')
  } else {
    toast.error(store.error || '인증 코드가 올바르지 않습니다.')
  }
}

// 프로필 업데이트
const handleSubmit = async () => {
  if (!editForm.value.currentPassword) {
    toast.error('현재 비밀번호를 입력해주세요.')
    return
  }

  // 이메일이 변경되었는데 인증이 안된 경우
  if (isEmailChanged.value && !isEmailVerified.value) {
    toast.error('변경된 이메일 인증을 완료해주세요.')
    return
  }

  // 변경된 항목만 전송
  const updates = {
    currentPassword: editForm.value.currentPassword
  }

  if (editForm.value.loginId !== store.user?.loginId) {
    updates.loginId = editForm.value.loginId
  }
  if (editForm.value.nickname !== store.user?.nickname) {
    updates.nickname = editForm.value.nickname
  }
  if (isEmailChanged.value && isEmailVerified.value) {
    updates.email = editForm.value.email
  }

  isUpdating.value = true
  const success = await store.updateUserProfile(updates)
  isUpdating.value = false

  if (success) {
    toast.success('프로필이 수정되었습니다.')
    isEditing.value = false
  } else {
    toast.error(store.error || '프로필 수정에 실패했습니다.')
  }
}

const handleDeleteAccount = async () => {
  await store.deleteAccount()
  toast.success('계정이 삭제되었습니다.')
  router.push('/login')
}

const handleLogout = async () => {
  await store.logout()
  toast.success('로그아웃되었습니다.')
  router.push('/login')
}
</script>

<template>
  <div class="max-w-2xl mx-auto p-6 space-y-6">
    <h1 style="color: #000000">계정 설정</h1>

    <div class="card shadow-md">
      <div class="card-header flex justify-between items-center">
        <div>
          <h2 class="card-title">사용자 정보</h2>
          <p class="card-description">현재 로그인된 계정 정보</p>
        </div>
        <button
          v-if="!isEditing"
          @click="startEditing"
          class="btn btn-outline p-2"
          style="border-color: #6AA6DA; color: #6AA6DA"
          title="수정"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </div>

      <!-- 조회 모드 -->
      <div v-if="!isEditing" class="card-content space-y-4">
        <div>
          <label class="label">아이디</label>
          <p class="text-sm mt-1">{{ store.user?.loginId || '-' }}</p>
        </div>
        <div>
          <label class="label">닉네임</label>
          <p class="text-sm mt-1">{{ store.user?.nickname || '-' }}</p>
        </div>
        <div>
          <label class="label">이메일</label>
          <p class="text-sm mt-1">{{ store.user?.email || '-' }}</p>
        </div>
      </div>

      <!-- 편집 모드 -->
      <div v-else class="card-content">
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="space-y-2">
            <label for="loginId" class="label">아이디</label>
            <input
              id="loginId"
              type="text"
              v-model="editForm.loginId"
              class="input"
              minlength="4"
              maxlength="20"
              pattern="^[a-zA-Z0-9]*$"
            />
          </div>

          <div class="space-y-2">
            <label for="nickname" class="label">닉네임</label>
            <input
              id="nickname"
              type="text"
              v-model="editForm.nickname"
              class="input"
              minlength="2"
              maxlength="10"
            />
          </div>

          <div class="space-y-2">
            <label for="email" class="label">이메일</label>
            <div class="flex gap-2">
              <input
                id="email"
                type="email"
                v-model="editForm.email"
                @input="onEmailChange"
                class="input flex-1"
                :disabled="isEmailVerified"
              />
              <button
                v-if="isEmailChanged && !isEmailVerified"
                type="button"
                @click="handleSendVerification"
                :disabled="!editForm.email || isEmailSending"
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

          <!-- 이메일 인증 코드 입력 -->
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
            새 이메일이 인증되었습니다.
          </div>

          <hr class="my-4" />

          <div class="space-y-2">
            <label for="currentPassword" class="label">현재 비밀번호 (필수)</label>
            <input
              id="currentPassword"
              type="password"
              v-model="editForm.currentPassword"
              required
              class="input"
              placeholder="변경사항 저장을 위해 현재 비밀번호를 입력하세요"
            />
          </div>

          <div class="flex gap-2">
            <button
              type="submit"
              class="btn btn-primary flex-1 flex items-center justify-center gap-2"
              :disabled="isUpdating"
            >
              <svg v-if="isUpdating" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isUpdating ? '저장 중...' : '저장' }}
            </button>
            <button
              type="button"
              @click="cancelEditing"
              class="btn btn-outline flex-1"
            >
              취소
            </button>
          </div>
        </form>
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
