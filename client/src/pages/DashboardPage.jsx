import { useAuth } from '../hooks/useAuth'

export default function DashboardPage() {
  const { user } = useAuth()
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        Xin chào, {user?.email} 👋
      </h1>
      <p className="text-gray-500">Dashboard sẽ được xây dựng ở Bước 6 (Thống kê & Biểu đồ)</p>
    </div>
  )
}
