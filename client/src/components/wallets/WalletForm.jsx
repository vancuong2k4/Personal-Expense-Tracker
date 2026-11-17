import { useState, useEffect } from 'react'

const INITIAL = { name: '', type: 'cash', balance: '', currency: 'VND' }

export default function WalletForm({ onSubmit, onCancel, initialData = null, loading }) {
  const [form, setForm] = useState(INITIAL)
  const isEdit = !!initialData

  // Khi edit: điền sẵn data vào form
  useEffect(() => {
    if (initialData) {
      setForm({
        name:     initialData.name     || '',
        type:     initialData.type     || 'cash',
        balance:  initialData.balance  ?? '',
        currency: initialData.currency || 'VND',
      })
    } else {
      setForm(INITIAL)
    }
  }, [initialData])

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ ...form, balance: parseFloat(form.balance) || 0 })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tên ví *</label>
        <input type="text" name="name" value={form.name} onChange={handleChange} required
          placeholder="VD: Ví tiền mặt, MB Bank..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Loại ví *</label>
        <select name="type" value={form.type} onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="cash">💵 Tiền mặt</option>
          <option value="bank">🏦 Ngân hàng</option>
          <option value="credit">💳 Thẻ tín dụng</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {isEdit ? 'Số dư' : 'Số dư ban đầu'}
        </label>
        <input type="number" name="balance" value={form.balance} onChange={handleChange}
          placeholder="0" min="0" step="1000"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          Hủy
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors">
          {loading ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Tạo ví')}
        </button>
      </div>
    </form>
  )
}
