import { useEffect, useState }    from 'react'
import { useTransactions }         from '../hooks/useTransactions'
import { useWallets }              from '../hooks/useWallets'
import { useCategories }           from '../hooks/useCategories'
import TransactionList             from '../components/transactions/TransactionList'
import TransactionForm             from '../components/transactions/TransactionForm'
import TransactionFilter           from '../components/transactions/TransactionFilter'
import Modal                       from '../components/common/Modal'
import ConfirmDialog               from '../components/common/ConfirmDialog'
import LoadingSpinner              from '../components/common/LoadingSpinner'
import Pagination                  from '../components/common/Pagination'
import EmptyState                  from '../components/common/EmptyState'
import { formatCurrency }          from '../utils/formatCurrency'

export default function TransactionsPage() {
  const {
    transactions, pagination, loading, error,
    fetchTransactions, applyFilters, changePage,
    addTransaction, editTransaction, removeTransaction,
  } = useTransactions()

  const { wallets, fetchWallets } = useWallets()
  const { categories }            = useCategories()

  const [showForm, setShowForm]         = useState(false)
  const [editTarget, setEditTarget]     = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [formLoading, setFormLoading]   = useState(false)
  const [formError, setFormError]       = useState('')

  useEffect(() => {
    fetchTransactions()
    fetchWallets()
  }, []) // eslint-disable-line

  // ── Computed summary ───────────────────────────────────────
  const totalIncome  = transactions.filter(t => t.type === 'income').reduce((s, t)  => s + parseFloat(t.amount), 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount), 0)
  const net          = totalIncome - totalExpense

  // ── Handlers ───────────────────────────────────────────────
  const openCreate = () => { setEditTarget(null); setFormError(''); setShowForm(true) }
  const openEdit   = (tx) => { setEditTarget(tx);   setFormError(''); setShowForm(true) }
  const closeForm  = () => { setShowForm(false); setEditTarget(null) }

  const handleSubmit = async (formData) => {
    setFormLoading(true); setFormError('')
    try {
      if (editTarget) await editTransaction(editTarget.id, formData)
      else            await addTransaction(formData)
      closeForm()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setFormLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    try { await removeTransaction(deleteTarget.id) }
    catch (err) { alert(err.response?.data?.message || 'Xóa thất bại') }
    finally     { setDeleteTarget(null) }
  }

  const handleFilter = (filters) => applyFilters({ ...filters, page: 1 })

  // ── Render ─────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Giao dịch</h1>
          <p className="text-gray-500 text-sm mt-0.5">Theo dõi mọi khoản thu chi</p>
        </div>
        <div className="flex items-center gap-3">
          <TransactionFilter wallets={wallets} categories={categories} onApply={handleFilter} />
          <button onClick={openCreate}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">
            + Thêm giao dịch
          </button>
        </div>
      </div>

      {/* Summary cards */}
      {transactions.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 border border-green-100 rounded-xl p-4">
            <p className="text-xs font-medium text-green-600 mb-1">Thu nhập</p>
            <p className="text-lg font-bold text-green-700">{formatCurrency(totalIncome)}</p>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-xl p-4">
            <p className="text-xs font-medium text-red-500 mb-1">Chi tiêu</p>
            <p className="text-lg font-bold text-red-600">{formatCurrency(totalExpense)}</p>
          </div>
          <div className={`border rounded-xl p-4 ${net >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'}`}>
            <p className={`text-xs font-medium mb-1 ${net >= 0 ? 'text-blue-600' : 'text-orange-500'}`}>Chênh lệch</p>
            <p className={`text-lg font-bold ${net >= 0 ? 'text-blue-700' : 'text-orange-600'}`}>
              {net >= 0 ? '+' : ''}{formatCurrency(net)}
            </p>
          </div>
        </div>
      )}

      {/* Transaction list */}
      {loading && <LoadingSpinner />}
      {error   && <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-lg">{error}</p>}

      {!loading && !error && transactions.length === 0 && (
        <EmptyState
          icon="💸"
          title="Chưa có giao dịch nào"
          description="Nhấn 'Thêm giao dịch' để bắt đầu ghi chép thu chi"
          action={
            <button onClick={openCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              + Thêm giao dịch đầu tiên
            </button>
          }
        />
      )}

      {!loading && transactions.length > 0 && (
        <>
          <TransactionList
            transactions={transactions}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
          />
          <Pagination pagination={pagination} onPageChange={changePage} />
        </>
      )}

      {/* Form Modal */}
      <Modal isOpen={showForm} onClose={closeForm}
        title={editTarget ? 'Chỉnh sửa giao dịch' : 'Thêm giao dịch mới'}>
        {formError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2 mb-4">{formError}</div>
        )}
        <TransactionForm
          onSubmit={handleSubmit} onCancel={closeForm}
          initialData={editTarget} wallets={wallets} loading={formLoading}
        />
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        title="Xóa giao dịch"
        message={`Xóa giao dịch này sẽ hoàn trả số dư vào ví. Hành động không thể hoàn tác.`}
        confirmLabel="Xóa"
        danger
      />
    </div>
  )
}
