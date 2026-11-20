import api from './axiosInstance'

export const getRecurring       = ()       => api.get('/recurring')
export const createRecurring    = (data)   => api.post('/recurring', data)
export const toggleRecurring    = (id)     => api.patch(`/recurring/${id}/toggle`)
export const executeRecurring   = (id)     => api.post(`/recurring/${id}/execute`)
export const deleteRecurring    = (id)     => api.delete(`/recurring/${id}`)
