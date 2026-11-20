import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'

const FREQUENCY_LABELS = {
  daily: 'Hàng ngày',
  weekly: 'Hàng tuần',
  monthly: 'Hàng tháng',
  yearly: 'Hàng năm',
}

export default function RecurringCard({ item, onExecute, onToggle, onDelete }) {
  const isIncome = item.type === 'income'

  return (
    <div
      className={`border rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between ${
        !item.is_active
          ? 'bg-gray-50/80 border-gray-200 opacity-60'
          : item.is_due
          ? 'bg-amber-50/50 border-amber-300 ring-2 ring-amber-400/20 shadow-md'
          : 'bg-white border-gray-100 hover:shadow-md'
      }`}
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">
              {item.category_icon || '🏷️'}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">{item.category_name}</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Ví: <span className="font-medium text-gray-600">{item.wallet_name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {item.is_due && item.is_active && (
              <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                ⚡ Đến hạn
              </span>
            )}
            <button
              onClick={() => onDelete(item)}
              title="Xóa lịch định kỳ"
              className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg text-xs transition-colors"
            >
              🗑️
            </button>
          </div>
        </div>

        {/* Note */}
        {item.note && (
          <p className="text-xs text-gray-500 italic mb-3 bg-gray-50 p-2 rounded-lg">
            "{item.note}"
          </p>
        )}

        {/* Amount */}
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-xs text-gray-400">Số tiền định kỳ</span>
          <span
            className={`text-base font-bold ${
              isIncome ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isIncome ? '+' : '−'}
            {formatCurrency(item.amount)}
          </span>
        </div>

        {/* Frequency & Next Date */}
        <div className="text-xs text-gray-500 space-y-1 pt-2 border-t border-gray-100">
          <div className="flex justify-between">
            <span>Chu kỳ:</span>
            <span className="font-semibold text-gray-700">
              {FREQUENCY_LABELS[item.frequency] || item.frequency}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Đến hạn kế tiếp:</span>
            <span
              className={`font-semibold ${
                item.is_due ? 'text-amber-700 font-bold' : 'text-gray-700'
              }`}
            >
              {formatDate(item.next_due_date)}
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-4 mt-3 border-t border-gray-100">
        <button
          onClick={() => onToggle(item.id)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
            item.is_active
              ? 'border-gray-200 text-gray-600 hover:bg-gray-100'
              : 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100'
          }`}
        >
          {item.is_active ? 'Tạm dừng' : 'Kích hoạt'}
        </button>

        {item.is_active && (
          <button
            onClick={() => onExecute(item)}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1 ${
              item.is_due
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <span>⚡</span> Ghi nhận giao dịch
          </button>
        )}
      </div>
    </div>
  )
}
