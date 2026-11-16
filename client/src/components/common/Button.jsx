export default function Button({ children, variant = 'primary', ...props }) {
  const base = 'px-4 py-2 rounded font-medium transition-colors'
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    danger:  'bg-red-500 text-white hover:bg-red-600',
    ghost:   'bg-transparent border border-gray-300 hover:bg-gray-100',
  }
  return <button className={`${base} ${variants[variant]}`} {...props}>{children}</button>
}
