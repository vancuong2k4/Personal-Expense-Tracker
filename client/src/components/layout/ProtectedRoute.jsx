import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

// Nếu chưa đăng nhập → redirect về /login
export default function ProtectedRoute() {
  const { token, loading } = useAuth()
  if (loading) return <div>Loading...</div>
  return token ? <Outlet /> : <Navigate to="/login" replace />
}
