import { apiRequest, setTokens, clearTokens, getTokens } from './client'

// 회원가입
export const signup = async (loginId, password, email, nickname) => {
  const response = await apiRequest('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ loginId, password, email, nickname }),
    skipAuth: true
  })
  return response
}

// 로그인
export const login = async (loginId, password) => {
  const response = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ loginId, password }),
    skipAuth: true
  })

  if (response.result === 'SUCCESS' && response.data) {
    setTokens(response.data)
  }

  return response
}

// 로그아웃
export const logout = async () => {
  const tokens = getTokens()
  if (tokens?.refreshToken) {
    try {
      await apiRequest('/api/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: tokens.refreshToken })
      })
    } catch {
      // 로그아웃 실패해도 로컬 토큰은 삭제
    }
  }
  clearTokens()
}

// 이메일 인증 요청
export const requestEmailVerification = async (email) => {
  const response = await apiRequest('/api/auth/email/verify/request', {
    method: 'POST',
    body: JSON.stringify({ email }),
    skipAuth: true
  })
  return response
}

// 이메일 인증 확인
export const confirmEmailVerification = async (email, code) => {
  const response = await apiRequest('/api/auth/email/verify/confirm', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
    skipAuth: true
  })
  return response
}

// 비밀번호 재설정 요청
export const requestPasswordReset = async (loginId, email) => {
  const response = await apiRequest('/api/auth/password/reset/request', {
    method: 'POST',
    body: JSON.stringify({ loginId, email }),
    skipAuth: true
  })
  return response
}

// 비밀번호 재설정 확인
export const confirmPasswordReset = async (loginId, code, newPassword) => {
  const response = await apiRequest('/api/auth/password/reset/confirm', {
    method: 'POST',
    body: JSON.stringify({ loginId, code, newPassword }),
    skipAuth: true
  })
  return response
}
