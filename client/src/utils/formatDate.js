export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('vi-VN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  })

export const formatDateInput = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toISOString().slice(0, 10) // yyyy-mm-dd
}

export const formatDateGroup = (dateStr) => {
  const d = new Date(dateStr)
  const today     = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (d.toDateString() === today.toDateString())     return 'Hôm nay'
  if (d.toDateString() === yesterday.toDateString()) return 'Hôm qua'

  return d.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
}

export const groupByDate = (transactions) => {
  const groups = {}
  transactions.forEach(tx => {
    const key = new Date(tx.transaction_date).toDateString()
    if (!groups[key]) groups[key] = { label: formatDateGroup(tx.transaction_date), items: [] }
    groups[key].items.push(tx)
  })
  return Object.values(groups)
}
