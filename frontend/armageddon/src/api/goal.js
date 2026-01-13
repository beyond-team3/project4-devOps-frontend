import { apiRequest } from './client'

export const getGoals = () => {
    return apiRequest('/goals')
}

export const createGoal = (data) => {
    return apiRequest('/goals', {
        method: 'POST',
        body: JSON.stringify(data)
    })
}

export const updateGoal = (id, data) => {
    return apiRequest(`/goals/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    })
}

export const deleteGoal = (id) => {
    return apiRequest(`/goals/${id}`, {
        method: 'DELETE'
    })
}
