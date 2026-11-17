import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import MainLayout from './MainLayout'
import LoadingSpinner from '../common/LoadingSpinner'

export default function ProtectedRoute() {
  const { token, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  if (!token)  return <Navigate to="/login" replace />
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  )
}
