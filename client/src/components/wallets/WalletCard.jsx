import { formatCurrency } from '../../utils/formatCurrency'

const TYPE_CONFIG = {
  cash:   { label: 'Tiền mặt',    icon: '💵', color: 'bg-green-50 border-green-200',  textColor: 'text-green-700' },
  bank:   { label: 'Ngân hàng',   icon: '🏦', color: 'bg-blue-50 border-blue-200',    textColor: 'text-blue-700'  },
  credit: { label: 'Thẻ tín dụng',icon: '💳', color: 'bg-purple-50 border-purple-200',textColor: 'text-purple-700'},
}

export default function WalletCard({ wallet, onEdit, onDelete }) {
  const config = TYPE_CONFIG[wallet.type] || TYPE_CONFIG.cash

  return (
    <div className={`border rounded-xl p-5 ${config.color} flex flex-col gap-4 hover:shadow-md transition-shadow`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{config.icon}</span>
          <div>
            <p className="font-semibold text-gray-800">{wallet.name}</p>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-white ${config.textColor}`}>
              {config.label}
            </span>
          </div>
        </div>
        {/* Actions */}
        <div className="flex gap-1">
          <button onClick={() => onEdit(wallet)}
            className="p-1.5 hover:bg-white/70 rounded-lg transition-colors text-gray-500 hover:text-blue-600"
            title="Chỉnh sửa">✏️</button>
          <button onClick={() => onDelete(wallet)}
            className="p-1.5 hover:bg-white/70 rounded-lg transition-colors text-gray-500 hover:text-red-500"
            title="Xóa">🗑️</button>
        </div>
      </div>

      {/* Balance */}
      <div>
        <p className="text-xs text-gray-500 mb-0.5">Số dư hiện tại</p>
        <p className={`text-xl font-bold ${wallet.balance >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
          {formatCurrency(wallet.balance)}
        </p>
      </div>
    </div>
  )
}
