import TransactionItem from './TransactionItem'
import { groupByDate }  from '../../utils/formatDate'
import { formatCurrency } from '../../utils/formatCurrency'

export default function TransactionList({ transactions, onEdit, onDelete }) {
  const groups = groupByDate(transactions)

  return (
    <div className="space-y-4">
      {groups.map((group) => {
        // Daily summary
        const dailyIncome  = group.items.filter(t => t.type === 'income').reduce((s, t) => s + parseFloat(t.amount), 0)
        const dailyExpense = group.items.filter(t => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount), 0)

        return (
          <div key={group.label} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {/* Date header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-600">{group.label}</span>
              <div className="flex gap-3 text-xs font-medium">
                {dailyIncome  > 0 && <span className="text-green-600">+{formatCurrency(dailyIncome)}</span>}
                {dailyExpense > 0 && <span className="text-red-500">−{formatCurrency(dailyExpense)}</span>}
              </div>
            </div>

            {/* Transactions */}
            <div className="divide-y divide-gray-50">
              {group.items.map(tx => (
                <TransactionItem key={tx.id} transaction={tx} onEdit={onEdit} onDelete={onDelete} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
