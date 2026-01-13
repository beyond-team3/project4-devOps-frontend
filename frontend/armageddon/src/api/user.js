import { apiRequest } from './client'

// 사용자 정보 조회
export const getMe = async () => {
  const response = await apiRequest('/api/users/me', {
    method: 'GET'
  })
  return response
}

// 사용자 정보 수정
export const updateUser = async ({ loginId, email, nickname, currentPassword }) => {
  const body = { currentPassword }
  if (loginId) body.loginId = loginId
  if (email) body.email = email
  if (nickname) body.nickname = nickname

  const response = await apiRequest('/api/users/update', {
    method: 'PUT',
    body: JSON.stringify(body)
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
