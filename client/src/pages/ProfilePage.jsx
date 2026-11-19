import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import * as authApi from '../api/authApi'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { formatDate } from '../utils/formatDate'

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth()

  // Profile data
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')

  // Edit profile form
  const [fullName, setFullName] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileError, setProfileError] = useState('')

  // Change password form
  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setLoading(true)
    setPageError('')
    try {
      const res = await authApi.getProfile()
      setProfile(res.data)
      setFullName(res.data.full_name || '')
    } catch (err) {
      setPageError(err.response?.data?.message || 'Không thể tải thông tin tài khoản')
    } finally {
      setLoading(false)
    }
  }

  // Handle update profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess('')
    setProfileLoading(true)

    try {
      const res = await authApi.updateProfile({ full_name: fullName })
      setProfileSuccess('Cập nhật thông tin thành công!')
      setProfile((prev) => ({ ...prev, full_name: res.data.user.full_name }))
      updateUser({ full_name: res.data.user.full_name })
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Cập nhật thất bại')
    } finally {
      setProfileLoading(false)
    }
  }

  // Handle change password
  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (passwords.new_password !== passwords.confirm_password) {
      return setPasswordError('Mật khẩu xác nhận không khớp với mật khẩu mới')
    }
    if (passwords.new_password.length < 6) {
      return setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự')
    }

    setPasswordLoading(true)
    try {
      await authApi.changePassword({
        current_password: passwords.current_password,
        new_password: passwords.new_password,
      })
      setPasswordSuccess('Đổi mật khẩu thành công! Vui lòng ghi nhớ mật khẩu mới.')
      setPasswords({
        current_password: '',
        new_password: '',
        confirm_password: '',
      })
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Đổi mật khẩu thất bại')
    } finally {
      setPasswordLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner text="Đang tải thông tin hồ sơ..." />
  }

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Cài đặt Tài khoản & Bảo mật</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Quản lý thông tin cá nhân và cài đặt bảo mật cho tài khoản của bạn
        </p>
      </div>

      {pageError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
          {pageError}
        </div>
      )}

      {/* Overview Card */}
      {profile && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-md shadow-blue-500/20 flex-shrink-0">
            {profile.full_name?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase() || 'U'}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-gray-800">{profile.full_name || 'Người dùng'}</h2>
            <p className="text-sm text-gray-500">{profile.email}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
              <div>
                📅 Tham gia: <span className="font-semibold text-gray-700">{formatDate(profile.created_at)}</span>
              </div>
              <div>
                👛 <span className="font-semibold text-gray-700">{profile.wallet_count || 0}</span> ví tài khoản
              </div>
              <div>
                💸 <span className="font-semibold text-gray-700">{profile.transaction_count || 0}</span> giao dịch đã ghi chép
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Box 1: Cập nhật thông tin cá nhân */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-gray-800 mb-1">Thông tin cá nhân</h3>
          <p className="text-xs text-gray-400 mb-5">Thay đổi tên hiển thị của bạn</p>

          {profileSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-xs mb-4">
              {profileSuccess}
            </div>
          )}
          {profileError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-xs mb-4">
              {profileError}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Địa chỉ Email (Không thể đổi)
              </label>
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Họ và tên hiển thị *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Nhập họ và tên..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2 rounded-lg text-sm transition-colors shadow-sm"
            >
              {profileLoading ? 'Đang lưu...' : 'Lưu thông tin'}
            </button>
          </form>
        </div>

        {/* Box 2: Đổi mật khẩu */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-gray-800 mb-1">Bảo mật & Mật khẩu</h3>
          <p className="text-xs text-gray-400 mb-5">Đổi mật khẩu định kỳ để bảo vệ tài khoản</p>

          {passwordSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-xs mb-4">
              {passwordSuccess}
            </div>
          )}
          {passwordError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-xs mb-4">
              {passwordError}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Mật khẩu hiện tại *
              </label>
              <input
                type="password"
                value={passwords.current_password}
                onChange={(e) => setPasswords((prev) => ({ ...prev, current_password: e.target.value }))}
                required
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Mật khẩu mới (ít nhất 6 ký tự) *
              </label>
              <input
                type="password"
                value={passwords.new_password}
                onChange={(e) => setPasswords((prev) => ({ ...prev, new_password: e.target.value }))}
                required
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Xác nhận mật khẩu mới *
              </label>
              <input
                type="password"
                value={passwords.confirm_password}
                onChange={(e) => setPasswords((prev) => ({ ...prev, confirm_password: e.target.value }))}
                required
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg text-sm transition-colors shadow-sm"
            >
              {passwordLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
