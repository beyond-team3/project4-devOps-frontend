import axios from 'axios'

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
  const skipAuth = Boolean(options.skipAuth)

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }

  // 인증이 필요한 요청에 토큰 추가
  if (tokens?.accessToken && !skipAuth) {
    headers['Authorization'] = `Bearer ${tokens.accessToken}`
  }

  const config = {
    baseURL: API_BASE_URL,
    url: endpoint,
    method: options.method || 'GET',
    headers,
    params: options.params,
    data: options.body
  }

  try {
    const response = await axios.request(config)
    return response.data
  } catch (err) {
    const status = err?.response?.status

    if (status === 401 && !skipAuth) {
      // refreshToken이 있고 아직 재시도하지 않은 경우 갱신 시도
      if (tokens?.refreshToken && !options.isRetry) {
        try {
          const refreshed = await refreshAccessTokenSingleFlight(tokens.refreshToken)
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

    if (!err?.response) {
      const networkMessage = err?.message || 'Network error'
      throw new Error(networkMessage)
    }

    const errorMessage = err?.response?.data?.error?.message
      || err?.response?.data?.message
      || 'API request failed'
    throw new Error(errorMessage)
  }
}

// 토큰 갱신
const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/auth/refresh`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' } }
    )

    const data = response.data
    if (data.success && data.data) {
      setTokens(data.data)
      return true
    }
    return false
  } catch {
    return false
  }
}

let refreshPromise = null

const refreshAccessTokenSingleFlight = (refreshToken) => {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken(refreshToken)
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}
