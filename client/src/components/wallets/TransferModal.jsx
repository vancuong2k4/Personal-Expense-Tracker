import { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDateInput } from '../../utils/formatDate'

export default function TransferModal({ isOpen, onClose, wallets, onTransferSuccess }) {
  const [fromWalletId, setFromWalletId] = useState('')
  const [toWalletId, setToWalletId] = useState('')
  const [amount, setAmount] = useState('')
  const [fee, setFee] = useState('')
  const [note, setNote] = useState('')
  const [transferDate, setTransferDate] = useState(formatDateInput(new Date()))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && wallets.length >= 2) {
      setFromWalletId(wallets[0]?.id || '')
      setToWalletId(wallets[1]?.id || '')
      setAmount('')
      setFee('')
      setNote('')
      setTransferDate(formatDateInput(new Date()))
      setError('')
    }
  }, [isOpen, wallets])

  const selectedFromWallet = wallets.find((w) => w.id === fromWalletId)
  const availableToWallets = wallets.filter((w) => w.id !== fromWalletId)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const numAmount = parseFloat(amount)
    const numFee = parseFloat(fee || 0)

    if (!fromWalletId || !toWalletId) {
      return setError('Vui lòng chọn ví nguồn và ví đích')
    }
    if (fromWalletId === toWalletId) {
      return setError('Ví nguồn và ví đích không được trùng nhau')
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      return setError('Số tiền chuyển phải lớn hơn 0')
    }

    // Check client-side balance
    const totalDeduction = numAmount + numFee
    if (
      selectedFromWallet &&
      selectedFromWallet.type !== 'credit' &&
      parseFloat(selectedFromWallet.balance) < totalDeduction
    ) {
      return setError(
        `Số dư ví "${selectedFromWallet.name}" không đủ (${formatCurrency(selectedFromWallet.balance)} < ${formatCurrency(totalDeduction)})`
      )
    }

    setLoading(true)
    try {
      await onTransferSuccess({
        from_wallet_id: fromWalletId,
        to_wallet_id: toWalletId,
        amount: numAmount,
        fee: numFee,
        note,
        transfer_date: transferDate,
      })
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Chuyển tiền thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chuyển tiền giữa các ví">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3.5 py-2.5 mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Ví nguồn */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-gray-700">Ví nguồn (Trừ tiền) *</label>
            {selectedFromWallet && (
              <span className="text-xs text-gray-500">
                Số dư: <b className="text-gray-800">{formatCurrency(selectedFromWallet.balance)}</b>
              </span>
            )}
          </div>
          <select
            value={fromWalletId}
            onChange={(e) => {
              const newFrom = e.target.value
              setFromWalletId(newFrom)
              if (toWalletId === newFrom) {
                const nextTo = wallets.find((w) => w.id !== newFrom)
                setToWalletId(nextTo ? nextTo.id : '')
              }
            }}
            required
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.type === 'cash' ? '💵' : w.type === 'bank' ? '🏦' : '💳'} {w.name} (
                {formatCurrency(w.balance)})
              </option>
            ))}
          </select>
        </div>

        {/* Icon chuyển mũi tên */}
        <div className="flex justify-center -my-2 text-gray-400">
          <span className="bg-gray-100 p-1.5 rounded-full text-xs">⬇️</span>
        </div>

        {/* Ví đích */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Ví đích (Cộng tiền) *
          </label>
          <select
            value={toWalletId}
            onChange={(e) => setToWalletId(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {availableToWallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.type === 'cash' ? '💵' : w.type === 'bank' ? '🏦' : '💳'} {w.name} (
                {formatCurrency(w.balance)})
              </option>
            ))}
          </select>
        </div>

        {/* Số tiền & phí */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Số tiền chuyển *
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              min="1000"
              step="1000"
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Phí giao dịch (nếu có)
            </label>
            <input
              type="number"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              placeholder="0"
              min="0"
              step="1000"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Ngày & Ghi chú */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Ngày chuyển</label>
            <input
              type="date"
              value={transferDate}
              onChange={(e) => setTransferDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Ghi chú</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Rút tiền mặt, trả thẻ tín dụng..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            {loading ? 'Đang chuyển...' : 'Xác nhận chuyển'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
