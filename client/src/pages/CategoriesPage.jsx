import { useState } from 'react'
import { useCategories } from '../hooks/useCategories'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import LoadingSpinner from '../components/common/LoadingSpinner'

// Danh sách gợi ý emoji phổ biến cho tài chính
const EMOJI_PRESETS = [
  '🍜', '🚗', '🛍️', '💡', '🎬', '🏥', '📚', '💸', '💼', '🎁',
  '📈', '💰', '☕', '🏠', '✈️', '🎮', '🏋️', '🐾', '💄', '📱',
]

export default function CategoriesPage() {
  const { categories, loading, error, addCategory, editCategory, removeCategory } = useCategories()

  const [activeTab, setActiveTab] = useState('expense') // 'expense' | 'income'
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [name, setName] = useState('')
  const [type, setType] = useState('expense')
  const [icon, setIcon] = useState('🏷️')
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filteredCategories = categories.filter((c) => c.type === activeTab)

  const handleOpenCreate = () => {
    setEditTarget(null)
    setName('')
    setType(activeTab)
    setIcon('🏷️')
    setModalError('')
    setShowModal(true)
  }

  const handleOpenEdit = (cat) => {
    setEditTarget(cat)
    setName(cat.name)
    setType(cat.type)
    setIcon(cat.icon || '🏷️')
    setModalError('')
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditTarget(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setModalError('')
    setModalLoading(true)

    try {
      if (editTarget) {
        await editCategory(editTarget.id, { name, icon })
      } else {
        await addCategory({ name, type, icon })
      }
      handleCloseModal()
    } catch (err) {
      setModalError(err.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setModalLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await removeCategory(deleteTarget.id)
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể xóa danh mục')
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Danh mục</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Tùy biến các danh mục thu chi phù hợp với thói quen sinh hoạt và phong cách cá nhân
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
        >
          <span>+</span> Thêm danh mục
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('expense')}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'expense'
              ? 'border-red-500 text-red-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <span>❤️</span> Danh mục Chi tiêu (
          {categories.filter((c) => c.type === 'expense').length})
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'income'
              ? 'border-green-500 text-green-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <span>💚</span> Danh mục Thu nhập (
          {categories.filter((c) => c.type === 'income').length})
        </button>
      </div>

      {loading && <LoadingSpinner text="Đang tải danh mục..." />}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Categories Grid */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredCategories.map((c) => (
            <div
              key={c.id}
              className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                c.is_default
                  ? 'bg-gray-50/60 border-gray-200'
                  : 'bg-white border-blue-100 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl shadow-xs border border-gray-100">
                  {c.icon || '🏷️'}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">{c.name}</h4>
                  <span
                    className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-0.5 ${
                      c.is_default
                        ? 'bg-gray-200 text-gray-600'
                        : 'bg-blue-100 text-blue-700 font-semibold'
                    }`}
                  >
                    {c.is_default ? 'Mặc định hệ thống' : 'Tùy chỉnh cá nhân'}
                  </span>
                </div>
              </div>

              {!c.is_default && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(c)}
                    title="Chỉnh sửa danh mục"
                    className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-blue-600 rounded-lg text-xs transition-colors"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => setDeleteTarget(c)}
                    title="Xóa danh mục"
                    className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg text-xs transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editTarget ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
      >
        {modalError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-2.5 mb-3">
            {modalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!editTarget && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Loại danh mục</label>
              <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs">
                {[
                  { value: 'expense', label: '❤️ Chi tiêu' },
                  { value: 'income', label: '💚 Thu nhập' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setType(opt.value)}
                    className={`flex-1 py-2 font-semibold transition-colors ${
                      type === opt.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Tên danh mục *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Cà phê, Nuôi thú cưng, Đầu tư Crypto..."
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Biểu tượng Emoji (Chọn hoặc nhập)
            </label>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-9 h-9 flex items-center justify-center bg-gray-100 rounded-lg text-xl border">
                {icon}
              </span>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                maxLength={4}
                className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 p-2 bg-gray-50 rounded-lg max-h-24 overflow-y-auto border border-gray-100">
              {EMOJI_PRESETS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setIcon(e)}
                  className="w-8 h-8 hover:bg-white hover:scale-110 rounded flex items-center justify-center text-lg transition-transform"
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex-1 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-xs font-medium transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={modalLoading}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
            >
              {modalLoading ? 'Đang lưu...' : editTarget ? 'Cập nhật' : 'Tạo danh mục'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        title="Xóa danh mục"
        message={`Bạn có chắc muốn xóa danh mục "${deleteTarget?.name}"? Hệ thống sẽ kiểm tra và từ chối nếu danh mục này đang có giao dịch phát sinh.`}
        confirmLabel="Xóa"
        danger
      />
    </div>
  )
}
