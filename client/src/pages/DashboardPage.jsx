import { useEffect, useState } from 'react'
import { Link }                  from 'react-router-dom'
import { useAuth }               from '../hooks/useAuth'
import { useStats }              from '../hooks/useStats'
import { useWallets }            from '../hooks/useWallets'
import MonthlyChart              from '../components/charts/MonthlyChart'
import CategoryChart             from '../components/charts/CategoryChart'
import LoadingSpinner            from '../components/common/LoadingSpinner'
import { formatCurrency }        from '../utils/formatCurrency'

const CURRENT_MONTH = new Date().toISOString().slice(0, 7) // 'YYYY-MM'

export default function DashboardPage() {
  const { user }                                             = useAuth()
  const { wallets, loading: wLoading, fetchWallets }         = useWallets()
  const { overview, monthlySummary, categorySummary,
          loading: sLoading, fetchAll, fetchCategoryByType } = useStats()

  const [catType,  setCatType]  = useState('expense')
  const [catMonth, setCatMonth] = useState(CURRENT_MONTH)

  // Greeting
  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'
  const firstName = user?.email?.split('@')[0] || 'bạn'

  useEffect(() => {
    fetchWallets()
    fetchAll({ type: catType, month: catMonth })
  }, []) // eslint-disable-line

  // Re-fetch category chart when type or month changes
  const handleCatTypeChange = (type) => {
    setCatType(type)
    fetchCategoryByType(type, catMonth)
  }
  const handleCatMonthChange = (month) => {
    setCatMonth(month)
    fetchCategoryByType(catType, month)
  }

  const loading = sLoading || wLoading

  // Build month options (last 12 months)
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - i)
    return {
      value: d.toISOString().slice(0, 7),
      label: d.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }),
    }
  })

  return (
    <div className="max-w-6xl">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-800">
          {greeting}, {firstName} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* ── Overview cards ─────────────────────────────────── */}
      {loading && !overview
        ? <LoadingSpinner />
        : overview && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Tổng tài sản',  value: overview.total_balance, color: 'blue',   icon: '🏦' },
              { label: 'Thu tháng này', value: overview.income,        color: 'green',  icon: '💚' },
              { label: 'Chi tháng này', value: overview.expense,       color: 'red',    icon: '❤️' },
              { label: 'Chênh lệch',    value: overview.net,           color: overview.net >= 0 ? 'indigo' : 'orange', icon: overview.net >= 0 ? '📈' : '📉' },
            ].map(card => (
              <div key={card.label} className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500">{card.label}</span>
                  <span className="text-lg">{card.icon}</span>
                </div>
                <p className={`text-lg font-bold ${
                  card.value < 0 ? 'text-red-500' : 'text-gray-800'
                }`}>
                  {card.value >= 0 ? '' : '−'}{formatCurrency(Math.abs(card.value))}
                </p>
                {card.label === 'Thu tháng này' && (
                  <p className="text-xs text-gray-400 mt-0.5">{overview.transaction_count} giao dịch</p>
                )}
              </div>
            ))}
          </div>
        )
      }

      {/* ── Monthly Bar Chart ───────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-semibold text-gray-800">Thu chi 6 tháng gần nhất</h2>
            <p className="text-xs text-gray-400 mt-0.5">So sánh thu nhập và chi tiêu theo tháng</p>
          </div>
          <Link to="/transactions" className="text-xs text-blue-600 hover:underline">
            Xem giao dịch →
          </Link>
        </div>
        {sLoading
          ? <div className="h-64 flex items-center justify-center"><LoadingSpinner text="Đang tải biểu đồ..." /></div>
          : <MonthlyChart data={monthlySummary} />
        }
      </div>

      {/* ── Category Pie Chart ──────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="font-semibold text-gray-800">Phân bổ theo danh mục</h2>
            <p className="text-xs text-gray-400 mt-0.5">Tỷ lệ từng danh mục trong kỳ chọn</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Type toggle */}
            <div className="flex rounded-lg overflow-hidden border border-gray-200 text-sm">
              {[
                { value: 'expense', label: '❤️ Chi' },
                { value: 'income',  label: '💚 Thu' },
              ].map(opt => (
                <button key={opt.value}
                  onClick={() => handleCatTypeChange(opt.value)}
                  className={`px-3 py-1.5 font-medium transition-colors ${
                    catType === opt.value ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
            {/* Month picker */}
            <select value={catMonth} onChange={e => handleCatMonthChange(e.target.value)}
              className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {monthOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
        {sLoading
          ? <div className="h-56 flex items-center justify-center"><LoadingSpinner text="Đang tải biểu đồ..." /></div>
          : <CategoryChart data={categorySummary} />
        }
      </div>

      {/* ── Wallet balances ─────────────────────────────────── */}
      {!wLoading && wallets.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-800">Số dư các ví</h2>
            <Link to="/wallets" className="text-xs text-blue-600 hover:underline">Quản lý ví →</Link>
          </div>
          <div className="space-y-3">
            {wallets.map(w => (
              <div key={w.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{w.type === 'cash' ? '💵' : w.type === 'bank' ? '🏦' : '💳'}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{w.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{w.type}</p>
                  </div>
                </div>
                <span className={`font-semibold text-sm ${parseFloat(w.balance) < 0 ? 'text-red-500' : 'text-gray-800'}`}>
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
