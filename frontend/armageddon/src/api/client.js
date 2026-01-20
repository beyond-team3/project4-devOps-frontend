import axios from 'axios'

// API 기본 설정
// http://armageddon.local/api/auth/login << 요청 전송을 위한 변경
const API_BASE_URL = 'http://localhost:8080/';

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

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 토큰 갱신 중복 방지를 위한 변수
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Request Interceptor - 모든 요청에 토큰 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    // skipAuth 플래그가 있으면 토큰 추가 안함
    if (config.skipAuth) {
      delete config.skipAuth
      return config
    }

    const tokens = getTokens()
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor - 401 에러 시 토큰 갱신 및 재시도
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // 401 에러이고, 재시도가 아니며, skipAuth가 아닌 경우
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest._skipAuth) {
      const tokens = getTokens()

      // refreshToken이 없으면 로그인 페이지로
      if (!tokens?.refreshToken) {
        clearTokens()
        window.location.href = '/login'
        return Promise.reject(new Error('인증이 만료되었습니다. 다시 로그인해주세요.'))
      }

      // 이미 토큰 갱신 중이면 큐에 추가
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return apiClient(originalRequest)
        }).catch(err => {
          return Promise.reject(err)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // 토큰 갱신 요청 (인터셉터 우회를 위해 axios 직접 사용)
        const response = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          { refreshToken: tokens.refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        )

        const data = response.data
        if (data.success && data.data) {
          setTokens(data.data)
          const newAccessToken = data.data.accessToken

          // 대기 중인 요청들 처리
          processQueue(null, newAccessToken)

          // 원래 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          return apiClient(originalRequest)
        } else {
          throw new Error('토큰 갱신 실패')
        }
      } catch (refreshError) {
        processQueue(refreshError, null)
        clearTokens()
        window.location.href = '/login'
        return Promise.reject(new Error('인증이 만료되었습니다. 다시 로그인해주세요.'))
      } finally {
        isRefreshing = false
      }
    }

    // 네트워크 에러 처리
    if (!error.response) {
      return Promise.reject(new Error(error.message || 'Network error'))
    }

    // 일반 에러 메시지 추출
    const errorMessage = error.response?.data?.error?.message
      || error.response?.data?.message
      || 'API request failed'
    return Promise.reject(new Error(errorMessage))
  }
)

// API 요청 헬퍼 (기존 API 모듈 호환성 유지)
export const apiRequest = async (endpoint, options = {}) => {
  const config = {
    url: endpoint,
    method: options.method || 'GET',
    params: options.params,
    data: options.body,
    headers: options.headers || {}
  }

  // skipAuth 플래그 전달
  if (options.skipAuth) {
    config.skipAuth = true
    config._skipAuth = true
  }

  const response = await apiClient.request(config)
  return response.data
}

// axios 인스턴스 직접 export (필요시 사용)
export { apiClient }
