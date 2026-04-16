import { useState } from 'react'
import { generatePrediction } from '../services/api'

export default function PredictionCard({ prediction, onGenerate }) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const run = async () => {
    setLoading(true); setError('')
    try { await generatePrediction(); onGenerate() }
    catch { setError('Prediction failed. Add more transactions and retry.') }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-5 max-w-lg">
      {/* Primary prediction display */}
      <div className="bg-[#0C0D11] rounded-xl p-6">
        <p className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.14em] mb-4">
          ML forecast · LinearRegression
        </p>

        {prediction ? (
          <div className="space-y-1 mb-6">
            <p className="text-[11px] text-white/30">{prediction.month}</p>
            <p className="num text-5xl font-bold text-white leading-none">
              £{prediction.predicted_amount.toFixed(2)}
            </p>
            <p className="text-xs text-white/30 pt-1">predicted spend for next month</p>
          </div>
        ) : (
          <div className="mb-6">
            <p className="num text-4xl font-bold text-white/10 leading-none">£ —</p>
            <p className="text-xs text-white/25 mt-2">No forecast yet</p>
          </div>
        )}

        <button
          onClick={run}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-[#CAFF33] hover:bg-[#B8E82E] disabled:bg-[#CAFF33]/20 disabled:text-[#CAFF33]/40 text-[#0C0D11] font-semibold text-sm py-2.5 rounded-lg transition-colors"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Training model…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              {prediction ? 'Recalculate' : 'Generate forecast'}
            </>
          )}
        </button>

        {error && <p className="text-[11px] text-red-400 mt-3 text-center">{error}</p>}
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-[#E4E3DF] rounded-xl p-4">
          <p className="text-[10px] font-semibold text-[#A09E9A] uppercase tracking-wide mb-2">Model</p>
          <p className="text-sm font-semibold text-[#18181B]">LinearRegression</p>
          <p className="text-[11px] text-[#A09E9A] mt-0.5">scikit-learn</p>
        </div>
        <div className="bg-white border border-[#E4E3DF] rounded-xl p-4">
          <p className="text-[10px] font-semibold text-[#A09E9A] uppercase tracking-wide mb-2">Training</p>
          <p className="text-sm font-semibold text-[#18181B]">Your data only</p>
          <p className="text-[11px] text-[#A09E9A] mt-0.5">More = better</p>
        </div>
      </div>

      {/* Note */}
      <div className="flex gap-3 items-start bg-[#F7F6F3] border border-[#E4E3DF] rounded-xl p-4">
        <svg className="w-4 h-4 text-[#A09E9A] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p className="text-[11px] text-[#A09E9A] leading-relaxed">
          Model trains fresh on every call from your transaction history. With fewer than
          2 months of data, it falls back to a simple average. CO₂ values are UK average estimates.
        </p>
      </div>
    </div>
  )
}
