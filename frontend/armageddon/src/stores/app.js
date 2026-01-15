import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { authApi, userApi, transactionApi, goalApi, getTokens, clearTokens } from '../api'

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
    // const loadFromStorage = () => {
    //     const stored = localStorage.getItem(STORAGE_KEY)
    //     if (stored) {
    //         try {
    //             const data = JSON.parse(stored)
    //             goals.value = data.goals || []
    //             // 토큰이 있으면 사용자 정보 복원
    //             const tokens = getTokens()
    //             if (tokens && data.user) {
    //                 user.value = data.user
    //             }
    //         } catch {
    //             goals.value = []
    //         }
    //     }
    // }

    // Save to localStorage
    // const saveToStorage = () => {
    //   localStorage.setItem(STORAGE_KEY, JSON.stringify({
    //     user: user.value,
    //     goals: goals.value
    //   }))
    // }

    // Watch for changes and save
    // watch([user, goals], saveToStorage, { deep: true })

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
                await fetchGoals()
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
                // 저장 성공 후, 해당 날짜의 일간 내역을 다시 불러와서 ID를 동기화
                await fetchDailyTransactions(transaction.date)

                if (dailyTransactions.value && dailyTransactions.value.length > 0) {
                    const mergedMap = new Map()

                    // 기존 데이터 유지
                    transactions.value.forEach(t => mergedMap.set(t.id, t))

                    // 일간 데이터 병합 (최신값 우선)
                    dailyTransactions.value.forEach(t => mergedMap.set(t.id, t))

                    const mergedList = Array.from(mergedMap.values())
                    mergedList.sort((a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id)

                    transactions.value = mergedList
                }
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

    // 거래 상세 조회 (Memo 필드 등 가져오기 위함)
    const fetchTransactionDetail = async (id) => {
        try {
            // 임시 ID이면 조회 불가
            if (typeof id === 'string' && id.startsWith('txn-')) return null

            const detail = await transactionApi.getTransaction(id)
            return detail
        } catch (err) {
            console.error(err)
            return null
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
            const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
            const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`

            // 월간 거래 가져오기
            const txnRes = await transactionApi.getTransactions(startDate, endDate)
            if (txnRes.result === 'SUCCESS') {
                const newTxns = txnRes.data

                // [수정] 기존 로직(해당 월 데이터 삭제 후 5개 대체) 제거 -> 병합(Merge) 로직 적용
                const mergedMap = new Map()

                // 1. 기존 데이터 전체 매핑
                transactions.value.forEach(t => mergedMap.set(t.id, t))

                // 2. 새로운 데이터(5개) 업데이트
                newTxns.forEach(t => mergedMap.set(t.id, t))

                // 3. 리스트 변환 및 정렬
                const mergedList = Array.from(mergedMap.values())
                mergedList.sort((a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id)

                transactions.value = mergedList
            }

            // 월간 요약 가져오기
            const summaryRes = await transactionApi.getMonthlySummary(year, month + 1)
            monthlySummary.value = summaryRes
            return true
        } catch (err) {
            error.value = err.message
            return false
        } finally { loading.value = false }
    }

    // 일간 거래
    const fetchDailyTransactions = async (date) => {
        console.log('[Store] fetchDailyTransactions 호출:', date)
        loading.value = true
        error.value = null
        try {
            const res = await transactionApi.getDailyTransactions(date)
            console.log('[Store] API 응답:', res)
            console.log('[Store] 받은 데이터 개수:', res.data?.length || 0)
            if (res.data && res.data.length > 0) {
                console.log('[Store] 첫 번째 데이터:', res.data[0])
            }
            dailyTransactions.value = res.data
            selectedDate.value = date
            console.log('[Store] dailyTransactions 업데이트 완료:', dailyTransactions.value.length, '건')
            return true
        } catch (err) {
            console.error('[Store] fetchDailyTransactions 에러:', err)
            error.value = err.message
            return false
        } finally { loading.value = false }
    }
    const fetchTransactions = async (year, month) => {
        const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
        const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`

        // 로컬 초기화 방지: 기존 데이터를 유지하면서 병합할 준비
        // (월 이동 시에는 초기화가 맞지만, 같은 월 안에서 갱신될 때는 날아가면 안 됨

        const res = await transactionApi.getTransactions(startDate, endDate)
        if (res.result === 'SUCCESS') {
            const newTxns = res.data

            const mergedMap = new Map()

            // 1. 기존 데이터 매핑
            transactions.value.forEach(t => mergedMap.set(t.id, t))

            // 2. 새로운 데이터 덮어쓰기 또는 추가
            newTxns.forEach(t => mergedMap.set(t.id, t))

            // 3. 배열로 변환 및 정렬
            const mergedList = Array.from(mergedMap.values())
            mergedList.sort((a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id)

            transactions.value = mergedList
            // 5개만 가져오는 걸로는 부족하므로 전체 일자 조회 트리거 (비동기)
            // fetchTransactions가 끝난 후 호출하거나, 아예 loadMonthlyData에서 호출하도록 설계
            return true
        }
        return false
    }

    // [신규] 월간 데이터 전수 조사 (백엔드 5개 제한 우회)
    // 해당 월의 모든 날짜에 대해 일간 조회를 수행하여 데이터를 긁어옴
    const fetchAllDaysInMonth = async (year, month) => {

        try {
            console.log(`[fetchAllDaysInMonth] Start fetching for ${year}-${month + 1} (Sequential)`)
            const lastDay = new Date(year, month + 1, 0).getDate()

            const mergedMap = new Map()
            // 1. 기존 데이터 유지
            if (transactions.value && transactions.value.length > 0) {
                transactions.value.forEach(t => {
                    if (t && t.id) mergedMap.set(t.id, t)
                })
            }

            let successCount = 0
            let totalItemsFound = 0

            for (let day = 1; day <= lastDay; day++) {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                try {
                    // 순차 호출로 백엔드 부하 방지 및 디버깅 용이성 확보
                    const res = await transactionApi.getDailyTransactions(dateStr)

                    if (res && res.result === 'SUCCESS') {
                        successCount++
                        if (Array.isArray(res.data) && res.data.length > 0) {
                            console.log(`[DailyFetch] Found ${res.data.length} items on ${dateStr}`)
                            totalItemsFound += res.data.length
                            res.data.forEach(t => {
                                if (t && t.id) mergedMap.set(t.id, t)
                            })
                        }
                    } else {
                        // console.warn(`[DailyFetch] ${dateStr} returned invalid/fail`)
                    }
                } catch (err) {
                    console.error(`[DailyFetch] Error on ${dateStr}:`, err)
                }
            }

            console.log(`[fetchAllDaysInMonth] Finished. Success: ${successCount}/${lastDay}, Items Found: ${totalItemsFound}`)

            const mergedList = Array.from(mergedMap.values())
            // 최신순 정렬
            mergedList.sort((a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id)

            console.log(`[fetchAllDaysInMonth] Final count updated to store: ${mergedList.length}`)
            transactions.value = mergedList
            return true
        } catch (err) {
            console.error('Failed to fetch all days:', err)
            return false
        }
    }

    // ============ Goal Actions ============

    const fetchGoals = async () => {
        try {
            loading.value = true
            const res = await goalApi.getGoals()
            if (res.result === 'SUCCESS') {
                goals.value = res.data.map(g => {
                    // Map backend fields to frontend model
                    const type = g.goalType === 'SAVING' ? 'savings' : 'spending'
                    const isSavings = type === 'savings'

                    // Calculate derived fields if missing in summary
                    const currentAmount = g.targetAmount * (g.progressRate / 100)

                    return {
                        id: g.goalId,
                        type: type,
                        title: g.title,
                        status: mapStatus(g.status), // Helper needed or inline
                        // Savings fields
                        targetAmount: g.targetAmount,
                        currentAmount: currentAmount,
                        progressRate: g.progressRate,
                        progress: g.progressRate, // Frontend uses both?
                        // Spending fields
                        category: g.category || '기타',
                        budgetLimit: g.targetAmount,
                        spentAmount: currentAmount,
                        usageRate: g.progressRate,
                        remaining: g.targetAmount - currentAmount,
                        // Common
                        startDate: g.startDate,
                        endDate: g.endDate,
                        rawStatus: g.status
                    }
                })
            }
        } catch (err) {
            console.error(err)
        } finally {
            loading.value = false
        }
    }

    const fetchGoalDetail = async (id) => {
        try {
            const res = await goalApi.getGoalDetail(id)
            if (res.result === 'SUCCESS') {
                return res.data
            }
        } catch (err) {
            console.error(err)
        }
        return null
    }

    const mapStatus = (backendStatus) => {
        // Backend: COMPLETED, ACTIVE?
        // Frontend expects: COMPLETED, on-track, warning, exceeded
        if (backendStatus === 'COMPLETED') return 'COMPLETED'
        // Default to on-track or simple mapping if generic
        return 'on-track'
    }

    const addGoal = async (goal) => {
        if (goal.type === 'savings') {
            await goalApi.createSavingGoal(goal)
        } else {
            await goalApi.createExpenseGoal(goal)
        }
        await fetchGoals()
    }

    const updateGoal = async (id, updates) => {
        await goalApi.updateGoal(id, updates)
        await fetchGoals()
    }

    const deleteGoal = async (id) => {
        await goalApi.deleteGoal(id)
        await fetchGoals()
    }


    // ============ Computed ============
    const isAuthenticated = computed(() => !!user.value || !!getTokens())

    // ============ Initialize ============
    // loadFromStorage()

    return {
        // State
        user,
        transactions,
        goals,
        loading,
        error,
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
        monthlySummary,
        dailyTransactions,
        selectedDate,
        addTransaction,
        updateTransaction,
        deleteTransaction: deleteTransactionById,
        fetchMonthlyData,
        fetchDailyTransactions,
        fetchTransactions,
        fetchTransactionDetail,
        fetchAllDaysInMonth,
        // Goal actions
        fetchGoals,
        fetchGoalDetail,
        addGoal,
        updateGoal,
        deleteGoal
    }
})