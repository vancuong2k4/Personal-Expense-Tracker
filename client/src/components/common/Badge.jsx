const VARIANTS = {
  income:  'bg-green-100 text-green-700',
  expense: 'bg-red-100 text-red-600',
  cash:    'bg-emerald-100 text-emerald-700',
  bank:    'bg-blue-100 text-blue-700',
  credit:  'bg-purple-100 text-purple-700',
  default: 'bg-gray-100 text-gray-600',
}

export default function Badge({ label, variant = 'default' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${VARIANTS[variant] || VARIANTS.default}`}>
      {label}
    </span>
  )
}
