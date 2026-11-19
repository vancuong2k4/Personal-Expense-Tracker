import api from './axiosInstance'

export const createTransfer = (data)   => api.post('/transfers', data)
export const getTransfers    = (params) => api.get('/transfers', { params })
export const deleteTransfer  = (id)     => api.delete(`/transfers/${id}`)
