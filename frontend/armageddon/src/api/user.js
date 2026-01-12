import { apiRequest } from './client'

// 사용자 정보 수정
export const updateUser = async (loginId, email, nickname) => {
  const response = await apiRequest('/api/users/update', {
    method: 'PUT',
    body: JSON.stringify({ loginId, email, nickname })
  })
  return response
}

// 계정 삭제
export const deleteAccount = async () => {
  const response = await apiRequest('/api/users/delete', {
    method: 'DELETE'
  })
  return response
}
