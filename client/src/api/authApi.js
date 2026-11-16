import axios from 'axios'

const API_URL = import.meta.env.VITE_API_BASE_URL

export const register = (data) => axios.post(`${API_URL}/auth/register`, data)
export const login = (data) => axios.post(`${API_URL}/auth/login`, data)
