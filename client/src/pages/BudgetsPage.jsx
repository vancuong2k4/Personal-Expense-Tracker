import { useEffect, useState } from 'react'
import { useBudgets } from '../hooks/useBudgets'
import BudgetOverview from '../components/budgets/BudgetOverview'
import BudgetCard from '../components/budgets/BudgetCard'
import BudgetForm from '../components/budgets/BudgetForm'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'

export default function BudgetsPage() {
  const {
    budgets,
    summary,
    month,
    loading,
    error,
    fetchBudgets,
    changeMonth,
    saveBudget,
    removeBudget,
  } = useBudgets()

  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    fetchBudgets()
  }, []) // eslint-disable-line

  // Tạo danh sách 12 tháng gần nhất
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - i + 2) // Xem trước 2 tháng tương lai & 10 tháng trước
    return {
      value: d.toISOString().slice(0, 7),
      label: d.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }),
    }
  })

  const currentMonthLabel =
    monthOptions.find((m) => m.value === month)?.label || month

  // Handlers
  const handleOpenCreate = () => {
    setEditTarget(null)
    setFormError('')
    setShowForm(true)
  }

  const handleOpenEdit = (budget) => {
    setEditTarget(budget)
    setFormError('')
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditTarget(null)
  }

  const handleSubmit = async (formData) => {
    setFormLoading(true)
    setFormError('')
    try {
      await saveBudget(formData)
      handleCloseForm()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu ngân sách')
    } finally {
      setFormLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await removeBudget(deleteTarget.id)
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa ngân sách thất bại')
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <div className="max-w-6xl">
      {/* Header trang */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Ngân sách</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Kiểm soát hạn mức chi tiêu theo danh mục để không bị vung tay quá trán
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Bộ chọn tháng */}
          <select
            value={month}
            onChange={(e) => changeMonth(e.target.value)}
            className="bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          >
            {monthOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                Tháng {opt.label}
              </option>
            ))}
          </select>

          {/* Nút thêm ngân sách */}
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm shadow-sm"
          >
            <span>+</span> Thiết lập ngân sách
          </button>
        </div>
      </div>

      {/* Loading & Error */}
      {loading && !summary && <LoadingSpinner text="Đang tải ngân sách..." />}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm mb-6">
          {error}
        </div>
      )}

      {/* Overview */}
      {summary && summary.budget_count > 0 && (
        <BudgetOverview summary={summary} monthLabel={currentMonthLabel} />
      )}

      {/* Empty State */}
      {!loading && budgets.length === 0 && (
        <EmptyState
          icon="🎯"
          title={`Chưa có ngân sách cho ${currentMonthLabel}`}
          description="Thiết lập hạn mức chi tiêu cho từng danh mục để theo dõi tài chính hiệu quả hơn"
          action={
            <button
              onClick={handleOpenCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
            >
              + Thiết lập ngân sách ngay
            </button>
          }
        />
      )}

      {/* Grid danh sách thẻ ngân sách */}
      {!loading && budgets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgets.map((b) => (
            <BudgetCard
              key={b.id}
              budget={b}
              onEdit={handleOpenEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Modal Form */}
      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={editTarget ? 'Chỉnh sửa hạn mức ngân sách' : 'Thiết lập ngân sách mới'}
      >
        <BudgetForm
          onSubmit={handleSubmit}
          onCancel={handleCloseForm}
          initialData={editTarget}
          month={month}
          loading={formLoading}
        />
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        title="Xóa ngân sách"
        message={`Bạn có chắc chắn muốn xóa ngân sách cho danh mục "${deleteTarget?.category_name}" trong ${currentMonthLabel}?`}
        confirmLabel="Xóa"
        danger
      />
    </div>
  )
}
