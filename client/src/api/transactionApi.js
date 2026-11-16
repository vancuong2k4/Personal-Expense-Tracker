import axios from 'axios'

const API_URL = import.meta.env.VITE_API_BASE_URL

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
})

export const getTransactions = (params) =>
  axios.get(`${API_URL}/transactions`, { ...getAuthHeader(), params })
export const createTransaction = (data) =>
  axios.post(`${API_URL}/transactions`, data, getAuthHeader())
export const updateTransaction = (id, data) =>
  axios.put(`${API_URL}/transactions/${id}`, data, getAuthHeader())
export const deleteTransaction = (id) =>
  axios.delete(`${API_URL}/transactions/${id}`, getAuthHeader())
