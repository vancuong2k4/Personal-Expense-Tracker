import api from './axiosInstance'

export const getOverview        = ()       => api.get('/stats/overview')
export const getMonthlySummary  = (months) => api.get('/stats/monthly', { params: { months } })
export const getCategorySummary = (params) => api.get('/stats/by-category', { params })
