import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate }     from '../../utils/formatDate'

export default function TransactionItem({ transaction: tx, onEdit, onDelete }) {
  const isIncome = tx.type === 'income'

  return (
    <div className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 rounded-xl group transition-colors">
      {/* Category Icon */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${
        isIncome ? 'bg-green-100' : 'bg-red-100'
      }`}>
        {tx.category_icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-800 text-sm truncate">{tx.category_name}</p>
        <p className="text-xs text-gray-400 truncate mt-0.5">
          {tx.note || '—'} · {tx.wallet_name}
        </p>
      </div>

      {/* Amount */}
      <div className="flex items-center gap-2">
        <span className={`font-semibold text-sm tabular-nums ${isIncome ? 'text-green-600' : 'text-red-500'}`}>
          {isIncome ? '+' : '−'}{formatCurrency(tx.amount)}
        </span>

        {/* Hover actions */}
        <div className="hidden group-hover:flex gap-0.5">
          <button onClick={() => onEdit(tx)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-100 text-gray-400 hover:text-blue-600 transition-colors text-sm">
            ✏️
          </button>
          <button onClick={() => onDelete(tx)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors text-sm">
            🗑️
          </button>
        </div>
      </div>
    </div>
  )
}
