import { apiRequest } from './client'

export const fetchSummaryStatistics = (params) => {
    return apiRequest('/api/statistics/summary', {
        method: 'GET',
        params,
    })
}


export const fetchTopExpenses = (params) => {
    return apiRequest('/api/statistics/expense/top', {
        method: 'GET',
        params,
    })
}

export const fetchCategoryExpenseStatistics = (params) => {
    return apiRequest('/api/statistics/expense/categories', {
        method: 'GET',
        params,
    })
}

export const fetchExpenseTrend = (params) => {
    return apiRequest('/api/statistics/expense/trend', {
        method: 'GET',
        params,
    });
}
