export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null
  const { currentPage, totalPages, total, limit } = pagination
  const from = (currentPage - 1) * limit + 1
  const to   = Math.min(currentPage * limit, total)

  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
      <span className="text-sm text-gray-500">
        Hiển thị {from}–{to} trong {total} giao dịch
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!pagination.hasPrev}
          className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
        >
          ← Trước
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const page = i + 1
          return (
            <button key={page} onClick={() => onPageChange(page)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-200 hover:bg-gray-50 text-gray-700'
              }`}>
              {page}
            </button>
          )
        })}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!pagination.hasNext}
          className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
        >
          Tiếp →
        </button>
      </div>
    </div>
  )
}
