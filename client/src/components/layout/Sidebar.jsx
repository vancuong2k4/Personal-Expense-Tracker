import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const navItems = [
  { to: '/dashboard',    icon: '📊', label: 'Tổng quan' },
  { to: '/wallets',      icon: '👛', label: 'Ví của tôi' },
  { to: '/transactions', icon: '💸', label: 'Giao dịch' },
  { to: '/budgets',      icon: '🎯', label: 'Ngân sách' },
  { to: '/recurring',    icon: '🔁', label: 'Định kỳ' },
  { to: '/categories',   icon: '🏷️', label: 'Danh mục' },
  { to: '/profile',      icon: '⚙️', label: 'Tài khoản' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💰</span>
          <span className="font-bold text-gray-800 text-lg">FinTracker</span>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User info + Logout */}
      <div className="px-4 py-4 border-t border-gray-100">
        <NavLink
          to="/profile"
          className="flex items-center gap-3 px-2 py-1.5 mb-2 rounded-lg hover:bg-gray-50 transition-colors group"
        >
          <div className="w-8 h-8 bg-blue-100 group-hover:bg-blue-200 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm transition-colors">
            {user?.email?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">{user?.full_name || 'Tài khoản'}</p>
            <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
          </div>
        </NavLink>
        <button
          onClick={logout}
          className="w-full text-left px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium flex items-center gap-2"
        >
          <span>🚪</span> Đăng xuất
        </button>
      </div>
    </aside>
  )
}
