// API 기본 설정
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

// 토큰 관리
const TOKEN_KEY = 'armageddon_tokens'

export const getTokens = () => {
  const stored = localStorage.getItem(TOKEN_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return null
    }
  }
  return null
}

export const setTokens = (tokens) => {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens))
}

export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY)
}

// API 요청 헬퍼
export const apiRequest = async (endpoint, options = {}) => {
  const tokens = getTokens()

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }

  // 인증이 필요한 요청에 토큰 추가
  if (tokens?.accessToken && !options.skipAuth) {
    headers['Authorization'] = `Bearer ${tokens.accessToken}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  })

  // 401 에러 시 토큰 갱신 시도
  if (response.status === 401 && tokens?.refreshToken && !options.isRetry) {
    try {
      const refreshed = await refreshAccessToken(tokens.refreshToken)
      if (refreshed) {
        // 토큰 갱신 성공, 원래 요청 재시도
        return apiRequest(endpoint, { ...options, isRetry: true })
      }
    } catch {
      clearTokens()
      window.location.href = '/login'
    }
  }

  const data = await response.json()

  if (!response.ok) {
    const errorMessage = data?.error?.message || data?.message || 'API request failed'
    throw new Error(errorMessage)
  }

  return data
}

// 토큰 갱신
const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    })

    if (!response.ok) return false

    const data = await response.json()
    if (data.success && data.data) {
      setTokens(data.data)
      return true
    }
    return false
  } catch {
    return false
  }
}
