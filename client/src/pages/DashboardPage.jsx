import { useEffect }   from 'react'
import { Link }         from 'react-router-dom'
import { useAuth }      from '../hooks/useAuth'
import { useWallets }   from '../hooks/useWallets'
import { formatCurrency } from '../utils/formatCurrency'
import LoadingSpinner   from '../components/common/LoadingSpinner'

export default function DashboardPage() {
  const { user }                          = useAuth()
  const { wallets, loading, fetchWallets } = useWallets()

  useEffect(() => { fetchWallets() }, [fetchWallets])

  const totalBalance = wallets.reduce((s, w) => s + parseFloat(w.balance || 0), 0)
  const hour         = new Date().getHours()
  const greeting     = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          {greeting}, {user?.email?.split('@')[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Đây là tổng quan tài chính của bạn</p>
      </div>

      {/* Total balance */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 mb-6 text-white">
        <p className="text-blue-200 text-sm mb-1">Tổng tài sản</p>
        {loading
          ? <LoadingSpinner text="" />
          : <p className="text-4xl font-bold">{formatCurrency(totalBalance)}</p>
        }
        <p className="text-blue-200 text-sm mt-2">{wallets.length} ví đang hoạt động</p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { to: '/wallets',      icon: '👛', label: 'Quản lý ví',    desc: `${wallets.length} ví`, color: 'blue'   },
          { to: '/transactions', icon: '💸', label: 'Giao dịch',     desc: 'Xem lịch sử',          color: 'green'  },
          { to: '/transactions', icon: '📊', label: 'Thống kê',      desc: 'Sắp ra mắt (Bước 6)',  color: 'purple' },
        ].map(item => (
          <Link key={item.label} to={item.to}
            className={`bg-white border border-gray-100 hover:border-${item.color}-200 hover:shadow-md rounded-xl p-5 flex items-center gap-4 transition-all group`}>
            <div className={`w-12 h-12 bg-${item.color}-50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
              {item.icon}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{item.label}</p>
              <p className="text-sm text-gray-400">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Wallet list preview */}
      {!loading && wallets.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-800">Số dư các ví</h2>
            <Link to="/wallets" className="text-sm text-blue-600 hover:underline">Xem tất cả →</Link>
          </div>
          <div className="space-y-3">
            {wallets.slice(0, 4).map(w => (
              <div key={w.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{w.type === 'cash' ? '💵' : w.type === 'bank' ? '🏦' : '💳'}</span>
                  <span className="text-sm font-medium text-gray-700">{w.name}</span>
                </div>
                <span className={`font-semibold text-sm ${parseFloat(w.balance) >= 0 ? 'text-gray-800' : 'text-red-500'}`}>
                  {formatCurrency(w.balance)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
