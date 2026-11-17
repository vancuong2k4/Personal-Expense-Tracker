import { useState, useEffect } from 'react'
import { useCategories } from '../../hooks/useCategories'
import { formatDateInput } from '../../utils/formatDate'

const INITIAL = {
  wallet_id: '', category_id: '', type: 'expense',
  amount: '', note: '', transaction_date: formatDateInput(new Date()),
}

export default function TransactionForm({ onSubmit, onCancel, initialData = null, wallets, loading }) {
  const [form, setForm]     = useState(INITIAL)
  const [formErr, setFormErr] = useState('')
  const { byType }          = useCategories()
  const isEdit              = !!initialData

  useEffect(() => {
    if (initialData) {
      setForm({
        wallet_id:        initialData.wallet_id    || '',
        category_id:      String(initialData.category_id || ''),
        type:             initialData.type         || 'expense',
        amount:           String(initialData.amount || ''),
        note:             initialData.note         || '',
        transaction_date: formatDateInput(initialData.transaction_date) || formatDateInput(new Date()),
      })
    } else {
      setForm({ ...INITIAL, wallet_id: wallets[0]?.id || '' })
    }
  }, [initialData, wallets])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value,
      // Reset category khi đổi type (category income/expense khác nhau)
      ...(name === 'type' ? { category_id: '' } : {}),
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setFormErr('')
    if (!form.wallet_id)   return setFormErr('Vui lòng chọn ví')
    if (!form.category_id) return setFormErr('Vui lòng chọn danh mục')
    if (!form.amount || parseFloat(form.amount) <= 0) return setFormErr('Số tiền phải lớn hơn 0')
    onSubmit({ ...form, amount: parseFloat(form.amount), category_id: parseInt(form.category_id) })
  }

  const categories = byType(form.type)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formErr && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2">{formErr}</div>
      )}

      {/* Type toggle */}
      <div className="flex rounded-xl overflow-hidden border border-gray-200">
        {['expense', 'income'].map(t => (
          <button key={t} type="button" onClick={() => setForm(prev => ({ ...prev, type: t, category_id: '' }))}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
              form.type === t
                ? t === 'income' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}>
            {t === 'income' ? '💚 Thu nhập' : '❤️ Chi tiêu'}
          </button>
        ))}
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền *</label>
        <div className="relative">
          <input type="number" name="amount" value={form.amount} onChange={handleChange}
            placeholder="0" min="1" step="1000" required
            className="w-full px-4 py-2.5 pr-14 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-semibold" />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">VNĐ</span>
        </div>
      </div>

      {/* Wallet */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ví *</label>
        <select name="wallet_id" value={form.wallet_id} onChange={handleChange} required
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">— Chọn ví —</option>
          {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
        <select name="category_id" value={form.category_id} onChange={handleChange} required
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">— Chọn danh mục —</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày</label>
        <input type="date" name="transaction_date" value={form.transaction_date} onChange={handleChange}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {/* Note */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
        <textarea name="note" value={form.note} onChange={handleChange}
          placeholder="Thêm ghi chú..." rows={2}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm" />
      </div>

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
          Hủy
        </button>
        <button type="submit" disabled={loading}
          className={`flex-1 py-2.5 rounded-lg text-white font-semibold transition-colors text-sm ${
            form.type === 'income'
              ? 'bg-green-500 hover:bg-green-600 disabled:bg-green-300'
              : 'bg-red-500 hover:bg-red-600 disabled:bg-red-300'
          }`}>
          {loading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Thêm giao dịch'}
        </button>
      </div>
    </form>
  )
}
