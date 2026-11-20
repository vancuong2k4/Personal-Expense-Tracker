import { useState } from 'react'
import { useCategories } from '../../hooks/useCategories'
import { formatDateInput } from '../../utils/formatDate'

export default function RecurringForm({ onSubmit, onCancel, wallets, loading }) {
  const [walletId, setWalletId] = useState(wallets[0]?.id || '')
  const [type, setType] = useState('expense')
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [frequency, setFrequency] = useState('monthly')
  const [note, setNote] = useState('')
  const [nextDueDate, setNextDueDate] = useState(formatDateInput(new Date()))
  const [error, setError] = useState('')

  const { byType } = useCategories()
  const availableCategories = byType(type)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    const numAmount = parseFloat(amount)
    if (!walletId) return setError('Vui lòng chọn ví thanh toán')
    if (!categoryId) return setError('Vui lòng chọn danh mục')
    if (isNaN(numAmount) || numAmount <= 0) return setError('Số tiền phải lớn hơn 0')
    if (!nextDueDate) return setError('Vui lòng chọn ngày đến hạn')

    onSubmit({
      wallet_id: walletId,
      category_id: parseInt(categoryId),
      type,
      amount: numAmount,
      frequency,
      note,
      next_due_date: nextDueDate,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-2.5">
          {error}
        </div>
      )}

      {/* Type toggle */}
      <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs">
        {[
          { value: 'expense', label: '❤️ Chi phí định kỳ' },
          { value: 'income', label: '💚 Thu nhập định kỳ' },
        ].map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              setType(opt.value)
              setCategoryId('')
            }}
            className={`flex-1 py-2 font-semibold transition-colors ${
              type === opt.value
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Amount & Frequency */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Số tiền (VNĐ) *</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="VD: 500000"
            min="1000"
            step="1000"
            required
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Tần suất chu kỳ *</label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="daily">Hàng ngày</option>
            <option value="weekly">Hàng tuần</option>
            <option value="monthly">Hàng tháng</option>
            <option value="yearly">Hàng năm</option>
          </select>
        </div>
      </div>

      {/* Wallet & Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Ví tài khoản *</label>
          <select
            value={walletId}
            onChange={(e) => setWalletId(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Danh mục *</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">— Chọn danh mục —</option>
            {availableCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Next due date & Note */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Ngày đến hạn đầu tiên *</label>
          <input
            type="date"
            value={nextDueDate}
            onChange={(e) => setNextDueDate(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Ghi chú (Mục đích)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="VD: Tiền nhà, Spotify, Internet..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-xs font-medium transition-colors"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
        >
          {loading ? 'Đang tạo...' : 'Tạo lịch định kỳ'}
        </button>
      </div>
    </form>
  )
}
