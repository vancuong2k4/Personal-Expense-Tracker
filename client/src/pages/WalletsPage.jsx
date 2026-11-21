import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useWallets } from '../hooks/useWallets'
import WalletCard from '../components/wallets/WalletCard'
import WalletForm from '../components/wallets/WalletForm'
import TransferModal from '../components/wallets/TransferModal'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/formatDate'
import * as transferApi from '../api/transferApi'

export default function WalletsPage() {
  const { t } = useTranslation()
  const { wallets, loading, error, fetchWallets, addWallet, editWallet, removeWallet } = useWallets()

  // State quản lý ví
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')

  // State chuyển tiền
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [transfers, setTransfers] = useState([])
  const [transfersLoading, setTransfersLoading] = useState(false)
  const [deleteTransferTarget, setDeleteTransferTarget] = useState(null)

  // Fetch wallets khi component mount
  useEffect(() => {
    fetchWallets()
    loadTransfers()
  }, [fetchWallets]) // eslint-disable-line

  const loadTransfers = useCallback(async () => {
    setTransfersLoading(true)
    try {
      const res = await transferApi.getTransfers({ limit: 10 })
      setTransfers(res.data.data || [])
    } catch {
      // Ignored if transfers not yet created
    } finally {
      setTransfersLoading(false)
    }
  }, [])

  // Tổng số dư tất cả ví
  const totalBalance = wallets.reduce((sum, w) => sum + parseFloat(w.balance || 0), 0)

  // ── Handlers ví ──────────────────────────────────────────
  const handleOpenCreate = () => {
    setEditTarget(null)
    setFormError('')
    setShowForm(true)
  }

  const handleOpenEdit = (wallet) => {
    setEditTarget(wallet)
    setFormError('')
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditTarget(null)
    setFormError('')
  }

  const handleSubmit = async (formData) => {
    setFormLoading(true)
    setFormError('')
    try {
      if (editTarget) {
        await editWallet(editTarget.id, formData)
      } else {
        await addWallet(formData)
      }
      handleCloseForm()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setFormLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await removeWallet(deleteTarget.id)
      setDeleteTarget(null)
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể xóa ví này')
    }
  }

  const handleTransferSuccess = () => {
    fetchWallets()
    loadTransfers()
  }

  const handleConfirmDeleteTransfer = async () => {
    if (!deleteTransferTarget) return
    try {
      await transferApi.deleteTransfer(deleteTransferTarget.id)
      setDeleteTransferTarget(null)
      fetchWallets()
      loadTransfers()
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể hủy lượt chuyển tiền')
    }
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="max-w-6xl space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('wallets.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{t('wallets.subtitle')}</p>
        </div>

        <div className="flex items-center gap-3">
          {wallets.length >= 2 && (
            <button
              onClick={() => setShowTransferModal(true)}
              className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
            >
              🔄 {t('wallets.transfer')}
            </button>
          )}
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
          >
            <span>+</span> {t('wallets.addWallet')}
          </button>
        </div>
      </div>

      {/* Tổng số dư */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-sm">
        <p className="text-blue-100 text-sm mb-1">{t('dashboard.totalBalance')}</p>
        <p className="text-3xl font-bold">{formatCurrency(totalBalance)}</p>
        <p className="text-blue-200 text-sm mt-1">{wallets.length} tài khoản đang hoạt động</p>
      </div>

      {/* Danh sách ví */}
      {loading && <LoadingSpinner />}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {!loading && !error && wallets.length === 0 && (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <div className="text-5xl mb-3">👛</div>
          <p className="font-medium text-gray-700 dark:text-gray-200">Chưa có ví nào</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Nhấn "Thêm ví" để bắt đầu theo dõi số dư</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {wallets.map((wallet) => (
          <WalletCard
            key={wallet.id}
            wallet={wallet}
            onEdit={handleOpenEdit}
            onDelete={setDeleteTarget}
          />
        ))}
      </div>

      {/* Lịch sử chuyển tiền gần đây */}
      {transfers.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm mt-8 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">Lịch sử chuyển tiền giữa các ví</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Các lượt luân chuyển dòng tiền nội bộ gần nhất</p>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full font-medium">
              {transfers.length} lượt
            </span>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {transfers.map((t) => (
              <div key={t.id} className="py-3 flex items-center justify-between hover:bg-gray-50/70 dark:hover:bg-gray-750 rounded-xl px-2 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-bold">
                    🔄
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                      <span>{t.from_wallet_name}</span>
                      <span className="text-gray-400 text-xs">➔</span>
                      <span>{t.to_wallet_name}</span>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {formatDate(t.transfer_date)} {t.note ? `· ${t.note}` : ''}
                      {t.fee > 0 ? ` · Phí: ${formatCurrency(t.fee)}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(t.amount)}
                  </span>
                  <button
                    onClick={() => setDeleteTransferTarget(t)}
                    title="Hủy lượt chuyển tiền này (hoàn trả số dư)"
                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 text-gray-400 hover:text-red-500 rounded-lg text-xs transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={editTarget ? 'Chỉnh sửa ví' : t('wallets.addWallet')}
      >
        {formError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 text-sm rounded-lg border border-red-100 dark:border-red-850">
            {formError}
          </div>
        )}
        <WalletForm
          initialData={editTarget}
          onSubmit={handleSubmit}
          onCancel={handleCloseForm}
          loading={formLoading}
        />
      </Modal>

      {/* Modal Chuyển tiền giữa các ví */}
      <TransferModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        onSuccess={handleTransferSuccess}
        wallets={wallets}
      />

      {/* Confirm xóa ví */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Xóa ví tài khoản"
        message={`Bạn có chắc muốn xóa ví "${deleteTarget?.name}"? Các giao dịch liên quan sẽ bị ảnh hưởng.`}
        confirmLabel={t('common.delete')}
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Confirm hủy giao dịch chuyển tiền */}
      <ConfirmDialog
        isOpen={Boolean(deleteTransferTarget)}
        title="Hủy giao dịch chuyển tiền"
        message={`Hủy giao dịch chuyển ${deleteTransferTarget ? formatCurrency(deleteTransferTarget.amount) : ''} từ "${deleteTransferTarget?.from_wallet_name}" sang "${deleteTransferTarget?.to_wallet_name}". Số dư hai ví sẽ được hoàn nguyên.`}
        confirmLabel="Hủy giao dịch"
        danger
        onConfirm={handleConfirmDeleteTransfer}
        onCancel={() => setDeleteTransferTarget(null)}
      />
    </div>
  )
}
