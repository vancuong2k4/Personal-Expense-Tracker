import { useEffect, useState }    from 'react'
import { useTranslation }          from 'react-i18next'
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
import { exportTransactionsToCSV } from '../utils/exportCSV'

export default function TransactionsPage() {
  const { t } = useTranslation()
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
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('transactions.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{t('transactions.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          {transactions.length > 0 && (
            <button
              onClick={() => exportTransactionsToCSV(transactions)}
              className="flex items-center gap-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-3.5 py-2 rounded-lg font-medium transition-colors text-sm shadow-sm"
              title="Xuất danh sách ra file CSV"
            >
              📥 {t('transactions.exportCsv')}
            </button>
          )}
          <TransactionFilter wallets={wallets} categories={categories} onApply={handleFilter} />
          <button onClick={openCreate}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">
            + {t('transactions.addTransaction')}
          </button>
        </div>
      </div>

      {/* Summary cards */}
      {transactions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-800/40 rounded-xl p-4">
            <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">{t('common.income')}</p>
            <p className="text-lg font-bold text-green-700 dark:text-green-300">{formatCurrency(totalIncome)}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-800/40 rounded-xl p-4">
            <p className="text-xs font-medium text-red-500 dark:text-red-400 mb-1">{t('common.expense')}</p>
            <p className="text-lg font-bold text-red-600 dark:text-red-300">{formatCurrency(totalExpense)}</p>
          </div>
          <div className={`border rounded-xl p-4 ${net >= 0 ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-800/40' : 'bg-orange-50 dark:bg-orange-950/30 border-orange-100 dark:border-orange-800/40'}`}>
            <p className={`text-xs font-medium mb-1 ${net >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-500 dark:text-orange-400'}`}>Chênh lệch</p>
            <p className={`text-lg font-bold ${net >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-orange-600 dark:text-orange-300'}`}>
              {net >= 0 ? '+' : ''}{formatCurrency(net)}
            </p>
          </div>
        </div>
      )}

      {/* Transaction list */}
      {loading && <LoadingSpinner />}
      {error   && <p className="text-red-500 text-sm bg-red-50 dark:bg-red-950/30 px-4 py-3 rounded-lg">{error}</p>}

      {!loading && !error && transactions.length === 0 && (
        <EmptyState
          icon="💸"
          title="Chưa có giao dịch nào"
          description="Nhấn 'Thêm giao dịch' để bắt đầu ghi chép thu chi"
          action={
            <button onClick={openCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              + {t('transactions.addTransaction')}
            </button>
          }
        />
      )}

      {!loading && transactions.length > 0 && (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-2 overflow-hidden transition-colors">
            <TransactionList
              transactions={transactions}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          </div>
          <Pagination pagination={pagination} onPageChange={changePage} />
        </>
      )}

      {/* Form Modal */}
      <Modal isOpen={showForm} onClose={closeForm}
        title={editTarget ? 'Chỉnh sửa giao dịch' : t('transactions.addTransaction')}>
        {formError && (
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-sm rounded-lg px-3 py-2 mb-4">{formError}</div>
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
        message="Xóa giao dịch này sẽ hoàn trả số dư vào ví. Hành động không thể hoàn tác."
        confirmLabel={t('common.delete')}
        danger
      />
    </div>
  )
}
