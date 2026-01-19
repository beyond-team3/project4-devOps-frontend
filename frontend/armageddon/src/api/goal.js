import { apiRequest } from './client'

export const getGoals = () => {
    return apiRequest('/api/goals')
}

export const getGoalDetail = (id) => {
    return apiRequest(`/api/goals/${id}`)
}

export const createSavingGoal = (data) => {
    return apiRequest('/api/goals/saving', {
        method: 'POST',
        body: JSON.stringify(data)
    })
}

export const createExpenseGoal = (data) => {
    return apiRequest('/api/goals/expense', {
        method: 'POST',
        body: JSON.stringify(data)
    })
}

export const updateGoal = (id, data) => {
    return apiRequest(`/api/goals/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    })
}

export const deleteGoal = (id) => {
    return apiRequest(`/api/goals/${id}`, {
        method: 'DELETE'
    })
}
