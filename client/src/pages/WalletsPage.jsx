import { useEffect, useState } from 'react'
import { useWallets } from '../hooks/useWallets'
import WalletCard from '../components/wallets/WalletCard'
import WalletForm from '../components/wallets/WalletForm'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { formatCurrency } from '../utils/formatCurrency'

export default function WalletsPage() {
  const { wallets, loading, error, fetchWallets, addWallet, editWallet, removeWallet } = useWallets()

  // State quản lý modal
  const [showForm, setShowForm]       = useState(false)
  const [editTarget, setEditTarget]   = useState(null)   // ví đang được edit
  const [deleteTarget, setDeleteTarget] = useState(null) // ví đang được xóa
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError]     = useState('')

  // Fetch wallets khi component mount
  useEffect(() => { fetchWallets() }, [fetchWallets])

  // Tổng số dư tất cả ví
  const totalBalance = wallets.reduce((sum, w) => sum + parseFloat(w.balance || 0), 0)

  // ── Handlers ──────────────────────────────────────────────
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

  // ── Render ─────────────────────────────────────────────────
  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ví của tôi</h1>
          <p className="text-gray-500 text-sm mt-0.5">Quản lý tài khoản và số dư</p>
        </div>
        <button onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <span>+</span> Thêm ví
        </button>
      </div>

      {/* Tổng số dư */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-6 text-white">
        <p className="text-blue-100 text-sm mb-1">Tổng tài sản</p>
        <p className="text-3xl font-bold">{formatCurrency(totalBalance)}</p>
        <p className="text-blue-200 text-sm mt-1">{wallets.length} ví đang hoạt động</p>
      </div>

      {/* Danh sách ví */}
      {loading && <LoadingSpinner />}
      {error   && <p className="text-red-500 text-sm">{error}</p>}
      {!loading && !error && wallets.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">👛</div>
          <p className="font-medium">Chưa có ví nào</p>
          <p className="text-sm mt-1">Nhấn "Thêm ví" để bắt đầu</p>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {wallets.map(wallet => (
          <WalletCard
            key={wallet.id}
            wallet={wallet}
            onEdit={handleOpenEdit}
            onDelete={setDeleteTarget}
          />
        ))}
      </div>

      {/* Modal Form */}
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

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        title="Xóa ví"
        message={`Bạn có chắc muốn xóa ví "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        danger
      />
    </div>
  )
}
