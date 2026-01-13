import axios from 'axios'

const api = axios.create({
    baseURL: '/api',
})

// 토큰 인터셉터
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export function fetchSummaryStatistics(params) {
    return api.get('/statistics/summary', {
        params,
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
    })
}