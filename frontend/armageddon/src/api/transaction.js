import { apiRequest } from './client'

// 카테고리 매핑 (한글 -> 영문)
const categoryToEnum = {
    '식비': 'FOOD',
    '교통': 'TRANSPORT',
    '쇼핑': 'SHOPPING',
    '주거': 'HOUSING',
    '통신': 'COMMUNICATION',
    '의료': 'MEDICAL',
    '여가': 'LEISURE',
    '교육': 'EDUCATION',
    '저축': 'SAVING',
    '경조사': 'EVENT',
    '기타': 'ETC'
}

// 카테고리 매핑 (영문 -> 한글)
const enumToCategory = {
    'FOOD': '식비',
    'TRANSPORT': '교통',
    'SHOPPING': '쇼핑',
    'HOUSING': '주거',
    'COMMUNICATION': '통신',
    'MEDICAL': '의료',
    'LEISURE': '여가',
    'EDUCATION': '교육',
    'SAVING': '저축',
    'EVENT': '경조사',
    'ETC': '기타'
}

// 타입 매핑
const typeToEnum = {
    'expense': 'EXPENSE',
    'income': 'INCOME'
}

const enumToType = {
    'EXPENSE': 'expense',
    'INCOME': 'income'
}

// 거래 추가
export const createTransaction = async (transaction) => {
    const body = {
        title: transaction.title,
        memo: transaction.memo || '',
        amount: transaction.amount,
        date: transaction.date,
        type: typeToEnum[transaction.type]
    }

    if (transaction.type === 'expense') {
        body.category = categoryToEnum[transaction.category] ?? 'ETC'
    }

    return await apiRequest('/transaction/write', {
        method: 'POST',
        body: JSON.stringify(body)
    })
}

// 거래 수정
export const updateTransaction = async (transactionId, transaction) => {
    const body = {
        title: transaction.title,
        memo: transaction.memo || '',
        amount: transaction.amount,
        date: transaction.date,
        type: typeToEnum[transaction.type]
    }

    if (transaction.type === 'expense') {
        body.category = categoryToEnum[transaction.category] ?? 'ETC'
    }

    return await apiRequest(`/transaction/edit/${transactionId}`, {
        method: 'PUT',
        body: JSON.stringify(body)
    })
}

// 거래 삭제
export const deleteTransaction = async (transactionId) => {
    return await apiRequest(`/transaction/delete/${transactionId}`, { method: 'DELETE' })
}

// 거래 조회 (기간별)
export const getTransactions = async (startDate, endDate) => {
    const queryParams = new URLSearchParams({ startDate, endDate }).toString()
    const response = await apiRequest(`/transaction/list?${queryParams}`, { method: 'GET' })

    if (response.result === 'SUCCESS' && Array.isArray(response.data)) {
        return {
            ...response,
            data: response.data.map(transformTransaction)
        }
    }

    return { result: 'FAIL', data: [] }
}

export const getTransaction = async (transactionId) => {
    const response = await apiRequest(`/transaction/modal?transactionId=${transactionId}`, { method: 'GET' })
    if (response.result === 'SUCCESS' && response.data) {
        // 백엔드가 List 형태로 반환하므로 첫 번째 요소를 사용해야 함
        const data = Array.isArray(response.data) ? response.data[0] : response.data
        if (data) {
            return transformTransaction(data)
        }
    }
    return null
}

// 월간 요약
export const getMonthlySummary = async (year, month) => {
    return await apiRequest(`/transaction/monthly?year=${year}&month=${month}`, { method: 'GET' })
}

// 일간 거래
export const getDailyTransactions = async (date) => {
    // console.log(`[API] getDailyTransactions fetching: ${date}`)
    const response = await apiRequest(`/transaction/daily?date=${date}`, { method: 'GET' })
    if (response.result === 'SUCCESS' && Array.isArray(response.data)) {
        // console.log(`[API] getDailyTransactions success (${date}):`, response.data.length, 'items')
        // 백엔드가 date 필드를 안 주므로 수동으로 추가
        return {
            ...response,
            data: response.data.map(item => transformTransaction({ ...item, date }))
        }
    }
    console.warn(`[API] getDailyTransactions fail or invalid (${date}):`, response)
    return { result: 'FAIL', data: [] }
}

// 날짜 정규화 함수 (YYYY-MM-DD)
const normalizeDate = (dateStr) => {
    console.log('[normalizeDate] 입력:', dateStr, 'Type:', typeof dateStr)
    if (!dateStr) {
        console.log('[normalizeDate] 빈 값 -> 빈 문자열 반환')
        return ''
    }
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) {
        console.log('[normalizeDate] 파싱 실패 -> 원본 반환:', dateStr)
        return dateStr
    }

    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const result = `${year}-${month}-${day}`
    console.log('[normalizeDate] 결과:', result)
    return result
}

// API -> 프론트용 변환
export const transformTransaction = (apiTransaction) => {
    console.log('[transformTransaction] 백엔드 응답:', apiTransaction)
    const type = enumToType[apiTransaction.type] || 'expense'

    // date가 없으면 생성일로 대체 시도
    let finalDate = apiTransaction.date
    console.log('[transformTransaction] apiTransaction.date:', apiTransaction.date)
    if (!finalDate && apiTransaction.createdAt) {
        finalDate = new Date(apiTransaction.createdAt).toISOString().split('T')[0]
        console.log('[transformTransaction] createdAt 사용:', finalDate)
    }

    return {
        id: apiTransaction.id,
        title: apiTransaction.title,
        amount: apiTransaction.amount,
        type,
        // 수입이면 '수입', 지출이면 category 매핑
        category: type === 'income'
            ? '수입'
            : enumToCategory[apiTransaction.category] || '기타',
        date: normalizeDate(finalDate),
        memo: apiTransaction.memo ?? apiTransaction.MEMO ?? '',
        createdAt: apiTransaction.createdAt || Date.now()
    }
}

// 헬퍼 내보내기
export { categoryToEnum, enumToCategory, typeToEnum, enumToType }
