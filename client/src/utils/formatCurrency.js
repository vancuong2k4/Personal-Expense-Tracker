export const formatCurrency = (amount, currency = 'VND') => {
  const num = parseFloat(amount) || 0
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(num)
}

export const formatNumber = (num) =>
  new Intl.NumberFormat('vi-VN').format(parseFloat(num) || 0)
