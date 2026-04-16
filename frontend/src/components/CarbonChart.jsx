import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts'

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  return (
    <div style={{ background: '#0C0D11', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px' }}>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 4 }}>{name}</p>
      <p style={{ color: '#CAFF33', fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 600 }}>
        {value.toFixed(2)} kg
      </p>
      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 2 }}>CO₂ equivalent</p>
    </div>
  )
}

export default function CarbonChart({ co2ByCategory }) {
  const data = Object.entries(co2ByCategory || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const total = data.reduce((s, d) => s + d.value, 0)
  const max   = data[0]?.value ?? 1

  return (
    <div className="bg-white border border-[#E4E3DF] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#F0EFEB] flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[#18181B]">Carbon footprint</p>
          <p className="text-[11px] text-[#A09E9A] mt-0.5">Estimates based on UK averages</p>
        </div>
        {total > 0 && (
          <div className="text-right">
            <p className="num text-xl font-semibold text-[#18181B]">{total.toFixed(1)} kg</p>
            <p className="text-[10px] text-[#A09E9A] uppercase tracking-wide">CO₂ total</p>
          </div>
        )}
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-[#A09E9A]">
          <svg className="w-10 h-10 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h1a2 2 0 012-2v-3a2 2 0 012-2h1.064M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p className="text-sm">No carbon data yet</p>
        </div>
      ) : (
        <div className="p-5">
          {/* Custom horizontal bars — no recharts overflow issues */}
          <div className="space-y-3">
            {data.map((item, i) => {
              const pct = (item.value / max) * 100
              const isTop = i === 0
              return (
                <div key={item.name} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs font-medium ${isTop ? 'text-[#18181B]' : 'text-[#52524E]'}`}>
                      {item.name}
                    </span>
                    <span className={`num text-xs font-semibold ${isTop ? 'text-[#18181B]' : 'text-[#A09E9A]'}`}>
                      {item.value.toFixed(2)} kg
                    </span>
                  </div>
                  <div className="h-2 bg-[#F0EFEB] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: isTop ? '#CAFF33' : `rgba(202,255,51,${0.25 + (1 - i / data.length) * 0.45})`,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Bottom note */}
          <p className="text-[10px] text-[#A09E9A] mt-4 pt-4 border-t border-[#F0EFEB]">
            Travel and Transport carry the highest CO₂ rates (2.5× and 1.2× per £ spent).
          </p>
        </div>
      )}
    </div>
  )
}
