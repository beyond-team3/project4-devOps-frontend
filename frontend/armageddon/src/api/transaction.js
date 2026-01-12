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
  const response = await apiRequest('/transaction/write', {
    method: 'POST',
    body: JSON.stringify({
      title: transaction.title,
      memo: transaction.memo || '',
      amount: transaction.amount,
      date: transaction.date,
      type: typeToEnum[transaction.type],
      category: transaction.category ? categoryToEnum[transaction.category] : 'ETC'
    })
  })
  return response
}

// 거래 수정
export const updateTransaction = async (transactionId, transaction) => {
  const response = await apiRequest(`/transaction/edit/${transactionId}`, {
    method: 'PUT',
    body: JSON.stringify({
      title: transaction.title,
      memo: transaction.memo || '',
      amount: transaction.amount,
      date: transaction.date,
      type: typeToEnum[transaction.type],
      category: transaction.category ? categoryToEnum[transaction.category] : 'ETC'
    })
  })
  return response
}

// 거래 삭제
export const deleteTransaction = async (transactionId) => {
  const response = await apiRequest(`/transaction/delete/${transactionId}`, {
    method: 'DELETE'
  })
  return response
}

// 응답 데이터 변환 (API -> 프론트엔드)
export const transformTransaction = (apiTransaction) => {
  return {
    id: apiTransaction.id,
    title: apiTransaction.title,
    amount: apiTransaction.amount,
    type: enumToType[apiTransaction.type] || 'expense',
    category: enumToCategory[apiTransaction.category] || '기타',
    date: apiTransaction.date,
    memo: apiTransaction.memo || '',
    createdAt: apiTransaction.createdAt || Date.now()
  }
}

// 카테고리/타입 변환 헬퍼 내보내기
export { categoryToEnum, enumToCategory, typeToEnum, enumToType }
