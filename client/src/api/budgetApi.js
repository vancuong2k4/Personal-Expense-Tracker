import api from './axiosInstance'

export const getBudgets    = (month) => api.get('/budgets', { params: { month } })
export const setBudget     = (data)  => api.post('/budgets', data)
export const deleteBudget  = (id)    => api.delete(`/budgets/${id}`)
