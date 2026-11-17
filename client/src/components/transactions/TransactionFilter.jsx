import { useState } from 'react'

export default function TransactionFilter({ wallets, categories, onApply }) {
  const [filters, setFilters] = useState({
    type: '', wallet_id: '', category_id: '', start_date: '', end_date: '',
  })
  const [open, setOpen] = useState(false)

  const handleChange = (e) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleApply = () => { onApply(filters); setOpen(false) }

  const handleClear = () => {
    const empty = { type: '', wallet_id: '', category_id: '', start_date: '', end_date: '' }
    setFilters(empty)
    onApply(empty)
    setOpen(false)
  }

  const hasActive = Object.values(filters).some(v => v !== '')

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
          hasActive
            ? 'bg-blue-50 border-blue-300 text-blue-700'
            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
        }`}>
        🔍 Lọc {hasActive && <span className="bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">!</span>}
      </button>

      {open && (
        <div className="absolute right-0 top-11 bg-white rounded-2xl shadow-xl border border-gray-100 p-5 z-30 w-80">
          <h3 className="font-semibold text-gray-800 mb-4">Bộ lọc</h3>
          <div className="space-y-3">
            {/* Type */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Loại giao dịch</label>
              <select name="type" value={filters.type} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Tất cả</option>
                <option value="income">💚 Thu nhập</option>
                <option value="expense">❤️ Chi tiêu</option>
              </select>
            </div>

            {/* Wallet */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Ví</label>
              <select name="wallet_id" value={filters.wallet_id} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Tất cả ví</option>
                {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Danh mục</label>
              <select name="category_id" value={filters.category_id} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Tất cả danh mục</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>

            {/* Date range */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Từ ngày</label>
                <input type="date" name="start_date" value={filters.start_date} onChange={handleChange}
                  className="w-full px-2 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Đến ngày</label>
                <input type="date" name="end_date" value={filters.end_date} onChange={handleChange}
                  className="w-full px-2 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
            <button onClick={handleClear}
              className="flex-1 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              Xóa lọc
            </button>
            <button onClick={handleApply}
              className="flex-1 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Áp dụng
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
