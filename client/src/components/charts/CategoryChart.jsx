import {
  PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { formatCurrency } from '../../utils/formatCurrency'

const COLORS = [
  '#6366f1','#22c55e','#f59e0b','#f87171','#8b5cf6',
  '#06b6d4','#f97316','#ec4899','#14b8a6','#84cc16',
]

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-700">{d.icon} {d.name}</p>
      <p className="text-gray-500 mt-0.5">{formatCurrency(d.total)} · {d.percentage}%</p>
      <p className="text-gray-400 text-xs">{d.count} giao dịch</p>
    </div>
  )
}

export default function CategoryChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Chưa có dữ liệu để hiển thị
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-center">
      {/* Pie */}
      <div className="w-full lg:w-56 flex-shrink-0" style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="name"
              cx="50%" cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} strokeWidth={0} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend list */}
      <div className="flex-1 w-full space-y-2.5 max-h-56 overflow-y-auto pr-1">
        {data.map((item, i) => (
          <div key={item.name} className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
            <span className="text-sm text-gray-600 flex-1 truncate">{item.icon} {item.name}</span>
            <div className="text-right flex-shrink-0">
              <span className="text-sm font-semibold text-gray-800">{item.percentage}%</span>
              <span className="text-xs text-gray-400 ml-2">{formatCurrency(item.total)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
