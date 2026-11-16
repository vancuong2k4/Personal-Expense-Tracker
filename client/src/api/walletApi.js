import axios from 'axios'

const API_URL = import.meta.env.VITE_API_BASE_URL

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
})

export const getWallets = () => axios.get(`${API_URL}/wallets`, getAuthHeader())
export const createWallet = (data) => axios.post(`${API_URL}/wallets`, data, getAuthHeader())
export const updateWallet = (id, data) => axios.put(`${API_URL}/wallets/${id}`, data, getAuthHeader())
export const deleteWallet = (id) => axios.delete(`${API_URL}/wallets/${id}`, getAuthHeader())
