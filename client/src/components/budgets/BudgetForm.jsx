import { useState, useEffect } from 'react'
import { useCategories } from '../../hooks/useCategories'

export default function BudgetForm({ onSubmit, onCancel, initialData = null, month, loading }) {
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [formErr, setFormErr] = useState('')

  const { byType } = useCategories()
  const expenseCategories = byType('expense')
  const isEdit = !!initialData

  useEffect(() => {
    if (initialData) {
      setCategoryId(String(initialData.category_id || ''))
      setAmount(String(initialData.amount || ''))
    } else {
      setCategoryId(expenseCategories[0]?.id ? String(expenseCategories[0].id) : '')
      setAmount('')
    }
  }, [initialData, expenseCategories.length]) // eslint-disable-line

  const handleSubmit = (e) => {
    e.preventDefault()
    setFormErr('')

    const numAmount = parseFloat(amount)
    if (!categoryId) {
      return setFormErr('Vui lòng chọn danh mục chi tiêu')
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      return setFormErr('Số tiền hạn mức phải lớn hơn 0')
    }

    onSubmit({
      category_id: parseInt(categoryId),
      amount: numAmount,
      month,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formErr && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2">
          {formErr}
        </div>
      )}

      {/* Category selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Danh mục chi tiêu *
        </label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          disabled={isEdit} // Nếu edit thì không đổi category
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
        >
          <option value="">— Chọn danh mục —</option>
          {expenseCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
        {isEdit && (
          <p className="text-[11px] text-gray-400 mt-1">
            Không thể thay đổi danh mục khi đang chỉnh sửa hạn mức
          </p>
        )}
      </div>

      {/* Amount input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Hạn mức ngân sách hàng tháng (VNĐ) *
        </label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="VD: 3000000"
            min="1000"
            step="1000"
            required
            className="w-full px-4 py-2.5 pr-14 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base font-semibold"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
            VNĐ
          </span>
        </div>
        <p className="text-[11px] text-gray-400 mt-1">
          Áp dụng cho tháng: <span className="font-semibold text-gray-600">{month}</span>
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg font-semibold transition-colors text-sm"
        >
          {loading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Thiết lập ngân sách'}
        </button>
      </div>
    </form>
  )
}
