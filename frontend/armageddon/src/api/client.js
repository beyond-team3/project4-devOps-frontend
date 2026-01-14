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

const toQueryString = (params = {}) => {
    return Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&')
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

    let url = `${API_BASE_URL}${endpoint}`

// GET 요청이면 params를 query string으로 붙임
    if (options.method?.toUpperCase() === 'GET' && options.params) {
        const qs = toQueryString(options.params)
        url += qs ? `?${qs}` : ''
    }

// fetch에서 url 변수를 사용해야 함
    const response = await fetch(url, {
        ...options,
        headers
    })

  // 401 에러 시 토큰 갱신 시도
  if (response.status === 401) {
    // refreshToken이 있고 아직 재시도하지 않은 경우 갱신 시도
    if (tokens?.refreshToken && !options.isRetry) {
      try {
        const refreshed = await refreshAccessToken(tokens.refreshToken)
        if (refreshed) {
          // 토큰 갱신 성공, 원래 요청 재시도
          return apiRequest(endpoint, { ...options, isRetry: true })
        }
      } catch {
        // 갱신 중 예외 발생 - 아래에서 처리
      }
    }
    // refreshToken이 없거나 갱신 실패한 경우 로그인 페이지로 리다이렉트
    clearTokens()
    window.location.href = '/login'
    throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.')
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
