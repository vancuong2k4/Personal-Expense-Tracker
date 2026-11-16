export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('vi-VN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  })
