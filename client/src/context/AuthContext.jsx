import { createContext, useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  // Khi app khởi động: nếu có token trong localStorage → decode lấy user
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token)
        // Kiểm tra token chưa hết hạn (exp tính bằng giây)
        if (decoded.exp * 1000 < Date.now()) {
          logout() // Token hết hạn → logout
        } else {
          setUser({ id: decoded.id, email: decoded.email })
        }
      } catch {
        logout() // Token lỗi → logout
      }
    }
    setLoading(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = (userData, accessToken) => {
    setUser(userData)
    setToken(accessToken)
    localStorage.setItem('token', accessToken)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
  }

  const updateUser = (newUserData) => {
    setUser((prev) => ({ ...prev, ...newUserData }))
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
