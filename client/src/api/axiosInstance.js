import axios from 'axios'

// Tạo axios instance với baseURL từ .env
// Lợi ích: không phải lặp lại baseURL ở mọi nơi
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

// Request Interceptor: tự động gắn token vào mọi request
// Thay vì phải gọi getAuthHeader() thủ công ở từng API function
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response Interceptor: nếu token hết hạn (401) → tự logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
