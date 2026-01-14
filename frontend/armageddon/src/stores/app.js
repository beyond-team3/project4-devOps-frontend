import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { authApi, userApi, transactionApi, getTokens, clearTokens } from '../api'

const STORAGE_KEY = 'armageddon_data'

export const useAppStore = defineStore('app', () => {
    // State
    const user = ref(null)
    const transactions = ref([])
    const goals = ref([])
    const loading = ref(false)
    const error = ref(null)
    const monthlySummary = ref(null)
    const dailyTransactions = ref([])
    const selectedDate = ref(null)

    // Load from localStorage (for goals - 백엔드에 Goal API가 없으므로 로컬 저장)
    const loadFromStorage = () => {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            try {
                const data = JSON.parse(stored)
                goals.value = data.goals || []
                // 토큰이 있으면 사용자 정보 복원
                const tokens = getTokens()
                if (tokens && data.user) {
                    user.value = data.user
                }
            } catch {
                goals.value = []
            }
        }
    }

    // Save to localStorage
    const saveToStorage = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            user: user.value,
            goals: goals.value
        }))
    }

    // Watch for changes and save
    watch([user, goals], saveToStorage, { deep: true })

    // ============ Auth Actions ============

    // 로그인
    const login = async (loginId, password) => {
        loading.value = true
        error.value = null
        try {
            const response = await authApi.login(loginId, password)
            if (response.result === 'SUCCESS') {
                // 토큰은 API에서 자동 저장됨
                // 사용자 정보 설정 (JWT에서 추출하거나 별도 API 호출 필요)
                user.value = {
                    loginId,
                    email: '',
                    nickname: loginId,
                    createdAt: Date.now()
                }
                return true
            }
            return false
        } catch (err) {
            error.value = err.message
            return false
        } finally {
            loading.value = false
        }
    }

    // 회원가입
    const signup = async (loginId, password, email, nickname) => {
        loading.value = true
        error.value = null
        try {
            const response = await authApi.signup(loginId, password, email, nickname)
            if (response.result === 'SUCCESS') {
                // 회원가입 후 자동 로그인
                return await login(loginId, password)
            }
            return false
        } catch (err) {
            error.value = err.message
            return false
        } finally {
            loading.value = false
        }
    }

    // 로그아웃
    const logout = async () => {
        loading.value = true
        try {
            await authApi.logout()
        } catch {
            // 에러 무시
        } finally {
            user.value = null
            transactions.value = []
            clearTokens()
            loading.value = false
        }
    }

    // 계정 삭제
    const deleteAccount = async () => {
        loading.value = true
        error.value = null
        try {
            await userApi.deleteAccount()
            user.value = null
            transactions.value = []
            goals.value = []
            clearTokens()
            return true
        } catch (err) {
            error.value = err.message
            return false
        } finally {
            loading.value = false
        }
    }

    // 사용자 정보 조회
    const fetchUserInfo = async () => {
        loading.value = true
        error.value = null
        try {
            const response = await userApi.getMe()
            if (response.result === 'SUCCESS' && response.data) {
                user.value = {
                    ...user.value,
                    id: response.data.id,
                    loginId: response.data.loginId,
                    email: response.data.email,
                    nickname: response.data.nickname
                }
                return true
            }
            return false
        } catch (err) {
            error.value = err.message
            return false
        } finally {
            loading.value = false
        }
    }

    // 사용자 정보 수정
    const updateUserProfile = async ({ loginId, email, nickname, currentPassword }) => {
        loading.value = true
        error.value = null
        try {
            const response = await userApi.updateUser({ loginId, email, nickname, currentPassword })
            if (response.result === 'SUCCESS') {
                // 성공 시 사용자 정보 업데이트
                if (loginId) user.value.loginId = loginId
                if (email) user.value.email = email
                if (nickname) user.value.nickname = nickname
                return true
            }
            return false
        } catch (err) {
            error.value = err.message
            return false
        } finally {
            loading.value = false
        }
    }

    // 이메일 인증 요청
    const requestEmailVerification = async (email) => {
        loading.value = true
        error.value = null
        try {
            const response = await authApi.requestEmailVerification(email)
            return response.result === 'SUCCESS'
        } catch (err) {
            error.value = err.message
            return false
        } finally {
            loading.value = false
        }
    }

    // 이메일 인증 확인
    const confirmEmailVerification = async (email, code) => {
        loading.value = true
        error.value = null
        try {
            const response = await authApi.confirmEmailVerification(email, code)
            return response.result === 'SUCCESS'
        } catch (err) {
            error.value = err.message
            return false
        } finally {
            loading.value = false
        }
    }

    // 비밀번호 재설정 요청
    const requestPasswordReset = async (loginId, email) => {
        loading.value = true
        error.value = null
        try {
            const response = await authApi.requestPasswordReset(loginId, email)
            return response.result === 'SUCCESS'
        } catch (err) {
            error.value = err.message
            return false
        } finally {
            loading.value = false
        }
    }

    // 비밀번호 재설정 확인
    const confirmPasswordReset = async (loginId, code, newPassword) => {
        loading.value = true
        error.value = null
        try {
            const response = await authApi.confirmPasswordReset(loginId, code, newPassword)
            return response.result === 'SUCCESS'
        } catch (err) {
            error.value = err.message
            return false
        } finally {
            loading.value = false
        }
    }

    // ============ Transaction Actions ============

    // 거래 추가
    const addTransaction = async (transaction) => {
        loading.value = true
        error.value = null
        try {
            const response = await transactionApi.createTransaction(transaction)
            if (response.result === 'SUCCESS') {
                // 로컬 상태에도 추가 (서버에서 ID 반환 시 사용)
                const newTransaction = {
                    ...transaction,
                    id: response.data || `txn-${Date.now()}`,
                    createdAt: Date.now()
                }
                transactions.value.push(newTransaction)
                return true
            }
            return false
        } catch (err) {
            error.value = err.message
            // API 실패 시 로컬에만 저장 (오프라인 지원)
            const newTransaction = {
                ...transaction,
                id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                createdAt: Date.now(),
                synced: false
            }
            transactions.value.push(newTransaction)
            return true
        } finally {
            loading.value = false
        }
    }

    // 거래 수정
    const updateTransaction = async (id, updates) => {
        loading.value = true
        error.value = null
        try {
            // 숫자 ID인 경우에만 API 호출
            if (typeof id === 'number' || !id.toString().startsWith('txn-')) {
                await transactionApi.updateTransaction(id, updates)
            }
            // 로컬 상태 업데이트
            const index = transactions.value.findIndex(t => t.id === id)
            if (index !== -1) {
                transactions.value[index] = { ...transactions.value[index], ...updates }
            }
            return true
        } catch (err) {
            error.value = err.message
            // API 실패해도 로컬 상태는 업데이트
            const index = transactions.value.findIndex(t => t.id === id)
            if (index !== -1) {
                transactions.value[index] = { ...transactions.value[index], ...updates, synced: false }
            }
            return true
        } finally {
            loading.value = false
        }
    }

    // 거래 삭제
    const deleteTransactionById = async (id) => {
        loading.value = true
        error.value = null
        try {
            // 숫자 ID인 경우에만 API 호출
            if (typeof id === 'number' || !id.toString().startsWith('txn-')) {
                await transactionApi.deleteTransaction(id)
            }
            // 로컬 상태에서 제거
            transactions.value = transactions.value.filter(t => t.id !== id)
            return true
        } catch (err) {
            error.value = err.message
            // API 실패해도 로컬에서 제거
            transactions.value = transactions.value.filter(t => t.id !== id)
            return true
        } finally {
            loading.value = false
        }
    }

// 월간 거래 + 요약 동시 로드
    const fetchMonthlyData = async (year, month) => {
        loading.value = true
        error.value = null
        try {
            const startDate = `${year}-${String(month + 1).padStart(2,'0')}-01`
            const endDate = `${year}-${String(month + 1).padStart(2,'0')}-${new Date(year, month+1,0).getDate()}`

            // 월간 거래 가져오기
            const txnRes = await transactionApi.getTransactions(startDate, endDate)
            if (txnRes.result === 'SUCCESS') {
                const newTxns = txnRes.data.map(transformTransaction)
                // 기존 다른 월 거래는 유지
                const existingOthers = transactions.value.filter(t => t.date < startDate || t.date > endDate)
                transactions.value = [...existingOthers, ...newTxns]
            }

            // 월간 요약 가져오기
            const summaryRes = await transactionApi.getMonthlySummary(year, month+1)
            monthlySummary.value = summaryRes
            return true
        } catch (err) {
            error.value = err.message
            return false
        } finally { loading.value = false }
    }

    // 일간 거래
    const fetchDailyTransactions = async (date) => {
        loading.value = true
        error.value = null
        try {
            const res = await transactionApi.getDailyTransactions(date)
            dailyTransactions.value = res.data.map(transformTransaction)
            selectedDate.value = date
            return true
        } catch (err) {
            error.value = err.message
            return false
        } finally { loading.value = false }
    }
    const fetchTransactions = async (year, month) => {
        const startDate = `${year}-${String(month+1).padStart(2,'0')}-01`
        const endDate = `${year}-${String(month+1).padStart(2,'0')}-${new Date(year, month+1,0).getDate()}`
        const res = await transactionApi.getTransactions(startDate, endDate)
        if (res.result === 'SUCCESS') {
            transactions.value = res.data
            return true
        }
        return false
    }

    // ============ Goal Actions (로컬 저장소만 사용) ============

    const addGoal = (goal) => {
        const newGoal = {
            ...goal,
            id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: Date.now()
        }
        goals.value.push(newGoal)
    }

    const updateGoal = (id, updates) => {
        const index = goals.value.findIndex(g => g.id === id)
        if (index !== -1) {
            goals.value[index] = { ...goals.value[index], ...updates }
        }
    }

    const deleteGoal = (id) => {
        goals.value = goals.value.filter(g => g.id !== id)
    }

    // ============ Computed ============
    const isAuthenticated = computed(() => !!user.value || !!getTokens())

    // ============ Initialize ============
    loadFromStorage()

    return {
        // State
        user,
        transactions,
        goals,
        loading,
        error,
        monthlySummary,
        dailyTransactions,
        selectedDate,
        // Computed
        isAuthenticated,
        // Auth actions
        login,
        signup,
        logout,
        deleteAccount,
        fetchUserInfo,
        updateUserProfile,
        requestEmailVerification,
        confirmEmailVerification,
        requestPasswordReset,
        confirmPasswordReset,
        // Transaction actions
        addTransaction,
        updateTransaction,
        deleteTransaction: deleteTransactionById,
        fetchMonthlyData,
        fetchDailyTransactions,
        // Goal actions
        addGoal,
        updateGoal,
        deleteGoal,
        fetchTransactions
    }

})
