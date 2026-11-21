import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme'

export default function Sidebar() {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const { t, i18n } = useTranslation()

  const navItems = [
    { to: '/dashboard',    icon: '📊', label: t('nav.dashboard') },
    { to: '/wallets',      icon: '👛', label: t('nav.wallets') },
    { to: '/transactions', icon: '💸', label: t('nav.transactions') },
    { to: '/budgets',      icon: '🎯', label: t('nav.budgets') },
    { to: '/recurring',    icon: '🔁', label: t('nav.recurring') },
    { to: '/categories',   icon: '🏷️', label: t('nav.categories') },
    { to: '/profile',      icon: '⚙️', label: t('nav.profile') },
  ]

  const switchLanguage = (lang) => {
    i18n.changeLanguage(lang)
    localStorage.setItem('language', lang)
  }

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen fixed left-0 top-0 transition-colors">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💰</span>
          <span className="font-bold text-gray-800 dark:text-gray-100 text-lg">FinTracker</span>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 font-semibold'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Quick controls: Dark Mode & i18n Switcher */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          <span>{isDark ? '☀️' : '🌙'}</span>
          <span>{isDark ? t('common.themeLight') : t('common.themeDark')}</span>
        </button>

        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-md">
          <button
            onClick={() => switchLanguage('vi')}
            className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
              i18n.language === 'vi'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            VI
          </button>
          <button
            onClick={() => switchLanguage('en')}
            className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
              i18n.language === 'en'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            EN
          </button>
        </div>
      </div>

      {/* User info + Logout */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
        <NavLink
          to="/profile"
          className="flex items-center gap-3 px-2 py-1.5 mb-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
        >
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/60 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-300 font-semibold text-sm transition-colors">
            {user?.email?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{user?.full_name || t('nav.profile')}</p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{user?.email}</p>
          </div>
        </NavLink>
        <button
          onClick={logout}
          className="w-full text-left px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors font-medium flex items-center gap-2"
        >
          <span>🚪</span> {t('nav.logout')}
        </button>
      </div>
    </aside>
  )
}
