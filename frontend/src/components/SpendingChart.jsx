import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

/* Monochromatic lime palette — distinctive, not a rainbow */
const PALETTE = [
  '#CAFF33', '#9EC926', '#749C18', '#4E710D', '#2F4A04',
  '#D8FF7A', '#E8FFAD', '#B2E020',
]

const CATEGORY_ICON = {
  'Food & Dining': '🍽', 'Transport': '🚗', 'Shopping': '🛍',
  'Entertainment': '🎬', 'Utilities': '⚡', 'Healthcare': '🩺',
  'Travel': '✈', 'Education': '📚', 'Other': '📦',
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { name, value, payload: p } = payload[0]
  return (
    <div style={{ background: '#0C0D11', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px' }}>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 4 }}>{name}</p>
      <p style={{ color: '#CAFF33', fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 600 }}>
        £{value.toFixed(2)}
      </p>
      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 2 }}>
        {(p.percent * 100).toFixed(1)}% of spend
      </p>
    </div>
  )
}

export default function SpendingChart({ spendByCategory }) {
  const raw = Object.entries(spendByCategory || {}).map(([name, value]) => ({ name, value }))
  const data = raw.sort((a, b) => b.value - a.value)
  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <div className="bg-white border border-[#E4E3DF] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#F0EFEB] flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[#18181B]">Spending by category</p>
          <p className="text-[11px] text-[#A09E9A] mt-0.5">Where your money goes</p>
        </div>
        {total > 0 && (
          <div className="text-right">
            <p className="num text-xl font-semibold text-[#18181B]">£{total.toFixed(2)}</p>
            <p className="text-[10px] text-[#A09E9A] uppercase tracking-wide">total</p>
          </div>
        )}
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-[#A09E9A]">
          <svg className="w-10 h-10 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/>
          </svg>
          <p className="text-sm">No spending data yet</p>
        </div>
      ) : (
        <div className="p-5 flex flex-col sm:flex-row items-start gap-6">
          {/* Doughnut */}
          <div className="relative flex-shrink-0 mx-auto sm:mx-0">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%" cy="50%"
                  innerRadius={56} outerRadius={86}
                  paddingAngle={2}
                  dataKey="value"
                  startAngle={90} endAngle={-270}
                  stroke="none"
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Centre label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="num text-lg font-bold text-[#18181B] leading-none">£{total.toFixed(0)}</p>
              <p className="text-[10px] text-[#A09E9A] mt-0.5 uppercase tracking-wide">total</p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 w-full space-y-2.5">
            {data.map((item, i) => {
              const pct = total > 0 ? (item.value / total) * 100 : 0
              return (
                <div key={item.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm flex-shrink-0">{CATEGORY_ICON[item.name] ?? '📦'}</span>
                      <span className="text-xs text-[#52524E] font-medium truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <span className="num text-xs font-semibold text-[#18181B]">£{item.value.toFixed(2)}</span>
                      <span className="text-[10px] text-[#A09E9A] w-8 text-right">{pct.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="h-1 bg-[#F0EFEB] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: PALETTE[i % PALETTE.length] }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
