import { useState } from 'react'
import { useRecurring } from '../hooks/useRecurring'
import { useWallets } from '../hooks/useWallets'
import RecurringCard from '../components/recurring/RecurringCard'
import RecurringForm from '../components/recurring/RecurringForm'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'

export default function RecurringPage() {
  const {
    recurringList,
    dueCount,
    loading,
    error,
    addRecurring,
    toggleActive,
    recordTransaction,
    removeRecurring,
  } = useRecurring()

  const { wallets } = useWallets()

  const [showForm, setShowForm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')

  const handleCreate = async (data) => {
    setFormLoading(true)
    setFormError('')
    try {
      await addRecurring(data)
      setShowForm(false)
    } catch (err) {
      setFormError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo giao dịch định kỳ')
    } finally {
      setFormLoading(false)
    }
  }

  const handleExecute = async (item) => {
    try {
      await recordTransaction(item.id)
    } catch (err) {
      alert(err.response?.data?.message || 'Ghi nhận giao dịch thất bại')
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await removeRecurring(deleteTarget.id)
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa thất bại')
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <div className="max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Khoản chi & Hóa đơn định kỳ</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Tự động theo dõi các chi phí lặp lại: Tiền nhà, điện nước, internet, lương, gói dịch vụ...
          </p>
        </div>

        <button
          onClick={() => {
            setFormError('')
            setShowForm(true)
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
        >
          <span>+</span> Thêm khoản định kỳ
        </button>
      </div>

      {/* Due Alert Banner */}
      {dueCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-bounce">⚡</span>
            <div>
              <p className="text-sm font-bold text-amber-900">
                Bạn có {dueCount} khoản định kỳ đã đến hạn thanh toán!
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Nhấn "Ghi nhận giao dịch" để trừ tiền vào ví và tự động dời sang kỳ thanh toán tiếp theo.
              </p>
            </div>
          </div>
        </div>
      )}

      {loading && <LoadingSpinner text="Đang tải danh sách định kỳ..." />}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {!loading && recurringList.length === 0 && (
        <EmptyState
          icon="📅"
          title="Chưa có khoản thu chi định kỳ nào"
          description="Thiết lập các khoản tiền thuê nhà, bảo hiểm, hóa đơn điện nước hay lương hàng tháng để không bao giờ quên"
          action={
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
            >
              + Tạo khoản định kỳ đầu tiên
            </button>
          }
        />
      )}

      {/* Grid */}
      {!loading && recurringList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recurringList.map((item) => (
            <RecurringCard
              key={item.id}
              item={item}
              onExecute={handleExecute}
              onToggle={toggleActive}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Modal Form */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Thêm khoản định kỳ mới"
      >
        {formError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-2.5 mb-3">
            {formError}
          </div>
        )}
        <RecurringForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
          wallets={wallets}
          loading={formLoading}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        title="Xóa khoản định kỳ"
        message={`Bạn có chắc muốn xóa lịch định kỳ "${deleteTarget?.category_name}" (${deleteTarget?.amount})? Các giao dịch đã ghi nhận trước đây sẽ không bị ảnh hưởng.`}
        confirmLabel="Xóa"
        danger
      />
    </div>
  )
}
