import { useState } from 'react'
import { createTransaction } from '../services/api'

export default function TransactionForm({ onSuccess, onCancel }) {
  const [description, setDescription] = useState('')
  const [amount,      setAmount]      = useState('')
  const [date,        setDate]        = useState('')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!description.trim() || !amount) return
    setLoading(true); setError('')
    try {
      await createTransaction({
        description: description.trim(),
        amount: parseFloat(amount),
        date: date ? new Date(date).toISOString() : undefined,
      })
      setDescription(''); setAmount(''); setDate('')
      onSuccess()
    } catch {
      setError('Failed to save. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      {/* Label */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[10px] font-semibold text-[#A09E9A] uppercase tracking-[0.12em] mb-0.5">New entry</p>
          <h2 className="text-base font-semibold text-[#18181B]">Add a transaction</h2>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-[#A09E9A] bg-[#F0EFEB] px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-[#CAFF33] animate-pulse" />
          Groq AI will categorise
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Description — full width, most important */}
        <div>
          <label className="block text-[10px] font-semibold text-[#A09E9A] uppercase tracking-[0.1em] mb-2">
            What did you spend on?
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Tesco, McDonald's, Uber, Netflix…"
            required
            disabled={loading}
            autoFocus
            className="w-full px-4 py-3 text-sm border border-[#E4E3DF] rounded-xl bg-white text-[#18181B] placeholder-[#C4C3BF] focus:outline-none focus:ring-2 focus:ring-[#CAFF33] focus:border-transparent disabled:opacity-50 transition-shadow"
          />
        </div>

        {/* Amount + Date side by side */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-[#A09E9A] uppercase tracking-[0.1em] mb-2">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 num text-sm text-[#A09E9A] font-medium">£</span>
              <input
                type="number" step="0.01" min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                disabled={loading}
                className="w-full pl-8 pr-4 py-3 num text-sm border border-[#E4E3DF] rounded-xl bg-white text-[#18181B] placeholder-[#C4C3BF] focus:outline-none focus:ring-2 focus:ring-[#CAFF33] focus:border-transparent disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-[#A09E9A] uppercase tracking-[0.1em] mb-2">
              Date <span className="normal-case font-normal">(optional)</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 text-sm border border-[#E4E3DF] rounded-xl bg-white text-[#52524E] focus:outline-none focus:ring-2 focus:ring-[#CAFF33] focus:border-transparent disabled:opacity-50"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2.5 rounded-lg">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center gap-3 px-4 py-3 bg-[#0C0D11] rounded-xl">
            <svg className="animate-spin h-4 w-4 text-[#CAFF33] flex-shrink-0" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            <div>
              <p className="text-xs font-medium text-white">Groq LLaMA3 is reading your transaction…</p>
              <p className="text-[10px] text-white/40 mt-0.5">Categorising and calculating CO₂ impact</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-[#CAFF33] hover:bg-[#B8E82E] disabled:opacity-40 text-[#0C0D11] font-semibold text-sm py-2.5 px-5 rounded-xl transition-colors"
          >
            {loading ? 'Saving…' : 'Save transaction'}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="text-sm text-[#A09E9A] hover:text-[#52524E] py-2.5 px-4 rounded-xl hover:bg-[#F0EFEB] transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
