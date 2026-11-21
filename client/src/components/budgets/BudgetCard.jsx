import { formatCurrency } from '../../utils/formatCurrency'

export default function BudgetCard({ budget, onEdit, onDelete }) {
  const {
    category_name,
    category_icon,
    amount,
    spent,
    remaining,
    percentage,
    status,
    transaction_count,
  } = budget

  // Style theo trạng thái
  let barColor = 'bg-blue-600'
  let badgeText = 'Bình thường'
  let badgeStyle = 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'

  if (status === 'exceeded') {
    barColor = 'bg-red-500'
    badgeText = 'Vượt ngân sách'
    badgeStyle = 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
  } else if (status === 'warning') {
    barColor = 'bg-amber-500'
    badgeText = 'Sắp hết'
    badgeStyle = 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      {/* Header card */}
      <div>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-2xl border border-gray-100 dark:border-gray-600">
              {category_icon || '🏷️'}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm leading-tight">{category_name}</h3>
              <span className={`inline-block mt-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${badgeStyle}`}>
                {badgeText}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(budget)}
              title="Chỉnh sửa ngân sách"
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors text-xs"
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete(budget)}
              title="Xóa ngân sách"
              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 text-gray-400 hover:text-red-500 rounded-lg transition-colors text-xs"
            >
              🗑️
            </button>
          </div>
        </div>

        {/* Số liệu Đã chi vs Hạn mức */}
        <div className="flex items-baseline justify-between mt-4 mb-2">
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500">Đã chi</p>
            <p className="text-base font-bold text-gray-800 dark:text-gray-100">{formatCurrency(spent)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 dark:text-gray-500">Hạn mức</p>
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">{formatCurrency(amount)}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden my-2">
          <div
            className={`h-full rounded-full transition-all duration-300 ${barColor}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Footer card */}
      <div className="pt-3 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
        <span>{percentage}% đã dùng ({transaction_count} giao dịch)</span>
        <span className={`font-semibold ${remaining < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
          {remaining < 0 ? `Vượt ${formatCurrency(Math.abs(remaining))}` : `Còn ${formatCurrency(remaining)}`}
        </span>
      </div>
    </div>
  )
}
