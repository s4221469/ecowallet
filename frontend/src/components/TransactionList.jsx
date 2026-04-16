import { useState, useMemo } from 'react'
import { deleteTransaction } from '../services/api'

const CATEGORIES = [
  'Food & Dining', 'Transport', 'Shopping', 'Entertainment',
  'Utilities', 'Healthcare', 'Travel', 'Education', 'Other',
]

const CAT_DOT = {
  'Food & Dining':  '#22c55e',
  'Transport':      '#3b82f6',
  'Shopping':       '#a855f7',
  'Entertainment':  '#f59e0b',
  'Utilities':      '#6b7280',
  'Healthcare':     '#ef4444',
  'Travel':         '#f97316',
  'Education':      '#06b6d4',
  'Other':          '#94a3b8',
}

const CAT_BADGE = {
  'Food & Dining':  'bg-green-50  text-green-700  border-green-200',
  'Transport':      'bg-blue-50   text-blue-700   border-blue-200',
  'Shopping':       'bg-purple-50 text-purple-700 border-purple-200',
  'Entertainment':  'bg-amber-50  text-amber-700  border-amber-200',
  'Utilities':      'bg-gray-100  text-gray-600   border-gray-200',
  'Healthcare':     'bg-red-50    text-red-700    border-red-200',
  'Travel':         'bg-orange-50 text-orange-700 border-orange-200',
  'Education':      'bg-cyan-50   text-cyan-700   border-cyan-200',
  'Other':          'bg-slate-100 text-slate-600  border-slate-200',
}

function CategoryPill({ category }) {
  const cls = CAT_BADGE[category] || CAT_BADGE['Other']
  const dot = CAT_DOT[category]  || CAT_DOT['Other']
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dot }} />
      {category || 'Other'}
    </span>
  )
}

function SortBtn({ field, sortBy, sortDir, onClick, children }) {
  const active = sortBy === field
  return (
    <button
      onClick={() => onClick(field)}
      className={`flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors ${
        active ? 'text-[#4E710D]' : 'text-[#A09E9A] hover:text-[#52524E]'
      }`}
    >
      {children}
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {active && sortDir === 'asc'
          ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7"/>
          : active && sortDir === 'desc'
          ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
          : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/>}
      </svg>
    </button>
  )
}

/* shared input style helpers */
const inputBase = 'w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#CAFF33] focus:border-[#9EC926] transition-colors'
const inputIdle = 'border-[#E4E3DF] bg-[#F7F6F3] text-[#18181B] placeholder-[#B0AEA9]'
const inputActive = 'border-[#9EC926] bg-white text-[#18181B] font-medium'

const PAGE_SIZE = 8

export default function TransactionList({ transactions, onDelete, compact = false }) {
  const [search,      setSearch]      = useState('')
  const [catFilter,   setCatFilter]   = useState('')
  const [dateFrom,    setDateFrom]    = useState('')
  const [dateTo,      setDateTo]      = useState('')
  const [amtMin,      setAmtMin]      = useState('')
  const [amtMax,      setAmtMax]      = useState('')
  const [sortBy,      setSortBy]      = useState('date')
  const [sortDir,     setSortDir]     = useState('desc')
  const [page,        setPage]        = useState(1)
  const [showAll,     setShowAll]     = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const handleSort = (field) => {
    if (sortBy === field) setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(field); setSortDir('desc') }
    setPage(1)
  }

  const clearFilters = () => {
    setSearch(''); setCatFilter(''); setDateFrom(''); setDateTo('')
    setAmtMin(''); setAmtMax(''); setPage(1); setShowAll(false)
  }

  const hasFilters = search || catFilter || dateFrom || dateTo || amtMin || amtMax

  const filtered = useMemo(() => {
    let list = [...(transactions || [])]
    if (search.trim())  list = list.filter((t) => t.description.toLowerCase().includes(search.toLowerCase()))
    if (catFilter)      list = list.filter((t) => t.category === catFilter)
    if (dateFrom)       list = list.filter((t) => new Date(t.date) >= new Date(dateFrom))
    if (dateTo)         list = list.filter((t) => new Date(t.date) <= new Date(dateTo + 'T23:59:59'))
    if (amtMin)         list = list.filter((t) => t.amount >= parseFloat(amtMin))
    if (amtMax)         list = list.filter((t) => t.amount <= parseFloat(amtMax))

    list.sort((a, b) => {
      const va = sortBy === 'date' ? new Date(a.date) : sortBy === 'amount' ? a.amount : (a.co2_kg ?? 0)
      const vb = sortBy === 'date' ? new Date(b.date) : sortBy === 'amount' ? b.amount : (b.co2_kg ?? 0)
      return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1)
    })
    return list
  }, [transactions, search, catFilter, dateFrom, dateTo, amtMin, amtMax, sortBy, sortDir])

  const displayed = compact
    ? filtered.slice(0, 5)
    : showAll ? filtered : filtered.slice(0, page * PAGE_SIZE)

  const hasMore = !compact && !showAll && displayed.length < filtered.length

  const handleDelete = async (id) => {
    try { await deleteTransaction(id); onDelete() }
    catch (e) { console.error(e) }
  }

  if (!transactions?.length) {
    return (
      <div className="bg-white border border-[#E4E3DF] rounded-xl py-20 text-center">
        <svg className="w-10 h-10 mx-auto mb-4 text-[#D4D3D0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
        <p className="text-[#52524E] font-medium text-sm">No transactions yet</p>
        <p className="text-[#A09E9A] text-xs mt-1">Add your first expense to get started</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#E4E3DF] rounded-xl overflow-hidden">

      {/* ── Toolbar (hidden in compact mode) ── */}
      {!compact && (
        <div className="border-b border-[#F0EFEB] px-5 py-3.5 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5">

            {/* Search */}
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A09E9A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z"/>
              </svg>
              <input
                type="text"
                placeholder="Search transactions…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className={`${inputBase} pl-9 pr-3 ${search ? inputActive : inputIdle}`}
              />
            </div>

            {/* Category select */}
            <select
              value={catFilter}
              onChange={(e) => { setCatFilter(e.target.value); setPage(1) }}
              className={`text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#CAFF33] focus:border-[#9EC926] transition-colors ${
                catFilter
                  ? 'border-[#9EC926] bg-white text-[#18181B] font-semibold'
                  : 'border-[#E4E3DF] bg-[#F7F6F3] text-[#52524E]'
              }`}
            >
              <option value="">All categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Sort */}
            <div className="flex items-center gap-3 px-3 py-2 border border-[#E4E3DF] rounded-lg bg-[#F7F6F3]">
              <SortBtn field="date"   sortBy={sortBy} sortDir={sortDir} onClick={handleSort}>Date</SortBtn>
              <SortBtn field="amount" sortBy={sortBy} sortDir={sortDir} onClick={handleSort}>Amount</SortBtn>
              <SortBtn field="co2"    sortBy={sortBy} sortDir={sortDir} onClick={handleSort}>CO₂</SortBtn>
            </div>

            {/* Advanced toggle */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition-colors ${
                showFilters || hasFilters
                  ? 'border-[#9EC926] text-[#4E710D] bg-[#CAFF33]/20'
                  : 'border-[#E4E3DF] text-[#52524E] bg-[#F7F6F3] hover:border-[#D4D3D0]'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 8h10M11 12h2M9 16h6"/>
              </svg>
              Filters
              {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-[#4E710D]" />}
            </button>

            {hasFilters && (
              <button onClick={clearFilters} className="text-xs font-medium text-red-500 hover:text-red-700 px-2 py-2 rounded-lg hover:bg-red-50 transition-colors">
                Clear all
              </button>
            )}
          </div>

          {/* Advanced filters */}
          {showFilters && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 pb-0.5">
              {[
                { label: 'From date', type: 'date',   val: dateFrom, set: setDateFrom },
                { label: 'To date',   type: 'date',   val: dateTo,   set: setDateTo },
                { label: 'Min £',     type: 'number', val: amtMin,   set: setAmtMin, placeholder: '0.00' },
                { label: 'Max £',     type: 'number', val: amtMax,   set: setAmtMax, placeholder: 'any' },
              ].map(({ label, type, val, set, placeholder }) => (
                <div key={label}>
                  <label className="text-[10px] font-semibold text-[#52524E] uppercase tracking-wide block mb-1">{label}</label>
                  <input
                    type={type} value={val} placeholder={placeholder}
                    onChange={(e) => { set(e.target.value); setPage(1) }}
                    className={`${inputBase} py-1.5 ${val ? inputActive : inputIdle}`}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Result count */}
          <p className="text-[11px] text-[#A09E9A]">
            Showing{' '}
            <span className="font-semibold text-[#18181B]">{displayed.length}</span>{' '}
            of{' '}
            <span className="font-semibold text-[#18181B]">{filtered.length}</span>{' '}
            transactions
            {hasFilters && <span className="text-[#A09E9A]"> · filtered from {transactions.length} total</span>}
          </p>
        </div>
      )}

      {/* ── Column header ── */}
      {!compact && (
        <div className="hidden sm:grid px-5 py-2.5 bg-[#F7F6F3] border-b border-[#F0EFEB]
                        text-[10px] font-semibold uppercase tracking-[0.08em] text-[#A09E9A]"
             style={{ gridTemplateColumns: 'minmax(0,1fr) 140px 88px 72px 88px 36px' }}>
          <span>Description</span>
          <span>Category</span>
          <span className="text-right">Date</span>
          <span className="text-right">CO₂</span>
          <span className="text-right">Amount</span>
          <span />
        </div>
      )}

      {/* ── Rows ── */}
      {filtered.length === 0 ? (
        <div className="py-14 text-center">
          <p className="text-sm text-[#52524E] font-medium">No matches</p>
          <button onClick={clearFilters} className="text-xs text-[#4E710D] font-medium mt-1 hover:underline">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="divide-y divide-[#F7F6F3]">
          {displayed.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} onDelete={handleDelete} compact={compact} />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {!compact && (hasMore || showAll) && (
        <div className="flex items-center justify-center gap-3 px-5 py-3.5 border-t border-[#F0EFEB] bg-[#F7F6F3]/50">
          {!showAll && hasMore && (
            <>
              <button
                onClick={() => setPage((p) => p + 1)}
                className="text-xs font-semibold text-[#4E710D] bg-[#CAFF33] px-4 py-1.5 rounded-lg hover:bg-[#B8E82E] transition-colors"
              >
                Show {Math.min(PAGE_SIZE, filtered.length - displayed.length)} more
              </button>
              <button
                onClick={() => setShowAll(true)}
                className="text-xs text-[#52524E] hover:text-[#18181B] px-3 py-1.5"
              >
                Show all {filtered.length}
              </button>
            </>
          )}
          {showAll && (
            <button
              onClick={() => { setShowAll(false); setPage(1) }}
              className="text-xs text-[#A09E9A] hover:text-[#52524E] px-3 py-1.5"
            >
              Collapse
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function TransactionRow({ tx, onDelete, compact }) {
  const dateStr = new Date(tx.date).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: compact ? undefined : 'numeric',
  })

  if (compact) {
    return (
      <div className="group flex items-center gap-3 px-5 py-3 hover:bg-[#FAFAF8] transition-colors">
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CAT_DOT[tx.category] ?? CAT_DOT['Other'] }} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#18181B] truncate">{tx.description}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <CategoryPill category={tx.category} />
            <span className="text-[11px] text-[#A09E9A]">{dateStr}</span>
          </div>
        </div>
        <p className="num text-sm font-semibold text-[#18181B] flex-shrink-0">£{tx.amount.toFixed(2)}</p>
      </div>
    )
  }

  return (
    <div
      className="group hidden sm:grid items-center px-5 py-3.5 hover:bg-[#FAFAF8] transition-colors"
      style={{ gridTemplateColumns: 'minmax(0,1fr) 140px 88px 72px 88px 36px' }}
    >
      {/* Description */}
      <div className="flex items-center gap-3 min-w-0 pr-4">
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CAT_DOT[tx.category] ?? CAT_DOT['Other'] }} />
        <p className="text-sm font-medium text-[#18181B] truncate">{tx.description}</p>
      </div>

      {/* Category */}
      <div className="flex items-center">
        <CategoryPill category={tx.category} />
      </div>

      {/* Date */}
      <div className="text-right">
        <p className="text-xs text-[#52524E]">{dateStr}</p>
      </div>

      {/* CO₂ */}
      <div className="text-right">
        {tx.co2_kg != null ? (
          <>
            <p className="num text-xs font-medium text-[#52524E]">{tx.co2_kg.toFixed(2)}</p>
            <p className="text-[10px] text-[#B0AEA9]">kg CO₂</p>
          </>
        ) : <span className="text-[#D4D3D0] text-xs">—</span>}
      </div>

      {/* Amount */}
      <div className="text-right">
        <p className="num text-sm font-semibold text-[#18181B]">£{tx.amount.toFixed(2)}</p>
      </div>

      {/* Delete */}
      <div className="flex justify-center">
        <button
          onClick={() => onDelete(tx.id)}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-[#C4C3BF] hover:text-red-500 hover:bg-red-50 transition-all"
          title="Delete"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
