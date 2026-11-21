import { formatCurrency } from '../../utils/formatCurrency'

export default function BudgetOverview({ summary, monthLabel }) {
  if (!summary) return null

  const {
    total_budget,
    total_spent,
    total_remaining,
    overall_percentage,
    is_exceeded,
    warning_count,
    exceeded_count,
  } = summary

  // Màu sắc thanh tiến độ tổng thể
  let barColor = 'bg-green-500'
  let textColor = 'text-green-600 dark:text-green-400'
  if (overall_percentage >= 100) {
    barColor = 'bg-red-500'
    textColor = 'text-red-600 dark:text-red-400'
  } else if (overall_percentage >= 80) {
    barColor = 'bg-amber-500'
    textColor = 'text-amber-600 dark:text-amber-400'
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm mb-6 transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Tổng quan ngân sách</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Tiến độ chi tiêu trong {monthLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          {exceeded_count > 0 && (
            <span className="bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
              ⚠️ {exceeded_count} mục vượt ngân sách
            </span>
          )}
          {warning_count > 0 && (
            <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
              ⚡ {warning_count} mục sắp chạm mức
            </span>
          )}
        </div>
      </div>

      {/* Grid 3 thẻ số liệu */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50/70 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4">
          <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Tổng hạn mức</p>
          <p className="text-xl font-bold text-blue-900 dark:text-blue-200">{formatCurrency(total_budget)}</p>
        </div>

        <div className="bg-red-50/70 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl p-4">
          <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">Đã chi tiêu</p>
          <p className="text-xl font-bold text-red-900 dark:text-red-200">{formatCurrency(total_spent)}</p>
        </div>

        <div className={`rounded-xl p-4 border ${
          is_exceeded
            ? 'bg-red-50/70 dark:bg-red-950/20 border-red-200 dark:border-red-900/40'
            : 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40'
        }`}>
          <p className={`text-xs font-medium mb-1 ${is_exceeded ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {is_exceeded ? 'Vượt quá hạn mức' : 'Ngân sách còn lại'}
          </p>
          <p className={`text-xl font-bold ${is_exceeded ? 'text-red-700 dark:text-red-300' : 'text-emerald-800 dark:text-emerald-200'}`}>
            {formatCurrency(Math.abs(total_remaining))}
          </p>
        </div>
      </div>

      {/* Thanh tiến độ */}
      <div>
        <div className="flex justify-between items-center text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
          <span>Tiến độ sử dụng</span>
          <span className={`font-bold ${textColor}`}>{overall_percentage}%</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${Math.min(overall_percentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
