import { useEffect, useState, useCallback } from 'react'
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
  const handleOpenCreate = () => { setEditTarget(null); setFormError(''); setShowForm(true) }
  const handleOpenEdit   = (wallet) => { setEditTarget(wallet); setFormError(''); setShowForm(true) }
  const handleCloseForm  = () => { setShowForm(false); setEditTarget(null) }

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
      setFormError(err.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setFormLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await removeWallet(deleteTarget.id)
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa thất bại')
    } finally {
      setDeleteTarget(null)
    }
  }

  // ── Handlers chuyển tiền ────────────────────────────────
  const handleTransfer = async (transferData) => {
    await transferApi.createTransfer(transferData)
    await fetchWallets()
    await loadTransfers()
  }

  const handleConfirmDeleteTransfer = async () => {
    if (!deleteTransferTarget) return
    try {
      await transferApi.deleteTransfer(deleteTransferTarget.id)
      await fetchWallets()
      await loadTransfers()
    } catch (err) {
      alert(err.response?.data?.message || 'Hủy chuyển tiền thất bại')
    } finally {
      setDeleteTransferTarget(null)
    }
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="max-w-6xl space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ví của tôi</h1>
          <p className="text-gray-500 text-sm mt-0.5">Quản lý tài khoản, tiền mặt và chuyển quỹ</p>
        </div>

        <div className="flex items-center gap-3">
          {wallets.length >= 2 && (
            <button
              onClick={() => setShowTransferModal(true)}
              className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
            >
              🔄 Chuyển tiền giữa các ví
            </button>
          )}
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
          >
            <span>+</span> Thêm ví
          </button>
        </div>
      </div>

      {/* Tổng số dư */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-sm">
        <p className="text-blue-100 text-sm mb-1">Tổng tài sản các ví</p>
        <p className="text-3xl font-bold">{formatCurrency(totalBalance)}</p>
        <p className="text-blue-200 text-sm mt-1">{wallets.length} tài khoản đang hoạt động</p>
      </div>

      {/* Danh sách ví */}
      {loading && <LoadingSpinner />}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {!loading && !error && wallets.length === 0 && (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <div className="text-5xl mb-3">👛</div>
          <p className="font-medium text-gray-700">Chưa có ví nào</p>
          <p className="text-sm text-gray-400 mt-1">Nhấn "Thêm ví" để bắt đầu theo dõi số dư</p>
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
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-800">Lịch sử chuyển tiền giữa các ví</h2>
              <p className="text-xs text-gray-400 mt-0.5">Các lượt luân chuyển dòng tiền nội bộ gần nhất</p>
            </div>
            <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
              {transfers.length} lượt
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {transfers.map((t) => (
              <div key={t.id} className="py-3 flex items-center justify-between hover:bg-gray-50/70 rounded-xl px-2 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold">
                    🔄
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                      <span>{t.from_wallet_name}</span>
                      <span className="text-gray-400 text-xs">➔</span>
                      <span>{t.to_wallet_name}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(t.transfer_date)} {t.note ? `· ${t.note}` : ''}
                      {t.fee > 0 ? ` · Phí: ${formatCurrency(t.fee)}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-blue-600">
                    {formatCurrency(t.amount)}
                  </span>
                  <button
                    onClick={() => setDeleteTransferTarget(t)}
                    title="Hủy lượt chuyển tiền này (hoàn trả số dư)"
                    className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg text-xs transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Form Thêm/Sửa Ví */}
      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={editTarget ? 'Chỉnh sửa ví' : 'Thêm ví mới'}
      >
        {formError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 mb-4 text-sm">
            {formError}
          </div>
        )}
        <WalletForm
          onSubmit={handleSubmit}
          onCancel={handleCloseForm}
          initialData={editTarget}
          loading={formLoading}
        />
      </Modal>

      {/* Modal Chuyển Tiền */}
      <TransferModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        wallets={wallets}
        onTransferSuccess={handleTransfer}
      />

      {/* Confirm Delete Wallet Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        title="Xóa ví"
        message={`Bạn có chắc muốn xóa ví "${deleteTarget?.name}"? Mọi giao dịch liên kết với ví này cũng sẽ bị xóa.`}
        confirmLabel="Xóa"
        danger
      />

      {/* Confirm Delete Transfer Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTransferTarget}
        onConfirm={handleConfirmDeleteTransfer}
        onCancel={() => setDeleteTransferTarget(null)}
        title="Hủy giao dịch chuyển tiền"
        message={`Hủy giao dịch chuyển ${formatCurrency(deleteTransferTarget?.amount)} từ "${deleteTransferTarget?.from_wallet_name}" sang "${deleteTransferTarget?.to_wallet_name}" sẽ hoàn lại số dư các ví tương ứng. Bạn có chắc chắn không?`}
        confirmLabel="Hủy & Hoàn tiền"
        danger
      />
    </div>
  )
}
