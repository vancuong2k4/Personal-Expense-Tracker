/**
 * Tiện ích xuất dữ liệu ra file CSV chuẩn UTF-8 (có BOM để mở trong Excel không bị lỗi font tiếng Việt)
 */

/**
 * Thoát các ký tự đặc biệt trong CSV (dấu phẩy, dấu nháy kép, xuống dòng)
 */
const escapeCSV = (value) => {
  if (value === null || value === undefined) return '""'
  const str = String(value).replace(/"/g, '""')
  return `"${str}"`
}

/**
 * Tải file CSV về máy người dùng
 */
const downloadCSV = (csvContent, filename) => {
  // \uFEFF là Byte Order Mark (BOM) giúp Excel nhận diện mã UTF-8 tiếng Việt chính xác
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Xuất danh sách giao dịch ra file CSV
 */
export const exportTransactionsToCSV = (transactions, filename) => {
  if (!transactions || transactions.length === 0) {
    alert('Không có giao dịch nào để xuất!')
    return
  }

  const defaultFilename = `giao-dich-${new Date().toISOString().slice(0, 10)}.csv`
  const targetFilename = filename || defaultFilename

  // Tiêu đề cột
  const headers = [
    'Mã GD',
    'Ngày giao dịch',
    'Loại giao dịch',
    'Danh mục',
    'Ví tài khoản',
    'Số tiền (VNĐ)',
    'Ghi chú',
  ]

  const rows = transactions.map((t) => [
    escapeCSV(t.id),
    escapeCSV(new Date(t.transaction_date).toLocaleDateString('vi-VN')),
    escapeCSV(t.type === 'income' ? 'Thu nhập' : 'Chi tiêu'),
    escapeCSV(t.category_name),
    escapeCSV(t.wallet_name),
    escapeCSV(t.amount),
    escapeCSV(t.note || ''),
  ])

  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map((r) => r.join(',')),
  ].join('\r\n')

  downloadCSV(csvContent, targetFilename)
}
