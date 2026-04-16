import { useEffect, useState, useCallback } from 'react'
import { getSummary, getTransactions, getLatestPrediction } from '../services/api'
import TransactionForm from './TransactionForm'
import TransactionList from './TransactionList'
import SpendingChart from './SpendingChart'
import CarbonChart from './CarbonChart'
import PredictionCard from './PredictionCard'

/* ── SVG icon primitives ─────────────────────────────────────────── */
const Icon = {
  overview: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="7" height="7" rx="1.5"/>
      <rect x="11" y="2" width="7" height="7" rx="1.5"/>
      <rect x="2" y="11" width="7" height="7" rx="1.5"/>
      <rect x="11" y="11" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  transactions: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 6h16M2 10h10M2 14h7" strokeLinecap="round"/>
    </svg>
  ),
  analytics: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 15l4-5 4 3 3-6 3 2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  predictions: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="10" cy="10" r="8"/>
      <path d="M10 6v4l3 2" strokeLinecap="round"/>
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 4v12M4 10h12" strokeLinecap="round"/>
    </svg>
  ),
  leaf: (
    <svg viewBox="0 0 20 20" fill="currentColor">
      <path d="M17 3C9 3 3 9.5 3 17c2-4 5-6 8-6-3 0-5 2-6 5 1-1 2.5-1.5 4-1.5 3.5 0 6-2.5 8-7.5V3z"/>
    </svg>
  ),
  chevronRight: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
}

const NAV = [
  { id: 'overview',      label: 'Overview',      icon: Icon.overview },
  { id: 'transactions',  label: 'Transactions',  icon: Icon.transactions },
  { id: 'analytics',     label: 'Analytics',     icon: Icon.analytics },
  { id: 'predictions',   label: 'Predictions',   icon: Icon.predictions },
]

/* ── KPI Card ─────────────────────────────────────────────────────── */
function KpiCard({ label, value, sub, accent }) {
  return (
    <div className="bg-white border border-[#E4E3DF] rounded-xl p-5 flex flex-col gap-3">
      <p className="text-[10px] font-semibold text-[#A09E9A] uppercase tracking-[0.12em]">{label}</p>
      <p className={`num text-3xl font-semibold leading-none ${accent ? 'text-[#CAFF33]' : 'text-[#18181B]'}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-[#A09E9A]">{sub}</p>}
    </div>
  )
}

/* ── Sidebar NavItem ──────────────────────────────────────────────── */
function NavItem({ item, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
        active
          ? 'bg-[#CAFF33] text-[#0C0D11]'
          : 'text-white/40 hover:text-white/80 hover:bg-white/5'
      }`}
    >
      <span className="w-4 h-4 flex-shrink-0">{item.icon}</span>
      {item.label}
    </button>
  )
}

/* ── Main ─────────────────────────────────────────────────────────── */
export default function Dashboard() {
  const [summary, setSummary]           = useState(null)
  const [transactions, setTransactions] = useState([])
  const [prediction, setPrediction]     = useState(null)
  const [loading, setLoading]           = useState(true)
  const [activeTab, setActiveTab]       = useState('overview')
  const [sidebarOpen, setSidebarOpen]   = useState(false)

  const fetchAll = useCallback(async () => {
    try {
      const [s, t, p] = await Promise.all([
        getSummary(), getTransactions(), getLatestPrediction(),
      ])
      setSummary(s.data)
      setTransactions(t.data)
      setPrediction(p.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const switchTab = (id) => { setActiveTab(id); setSidebarOpen(false) }

  /* ── Loading screen ── */
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0C0D11]">
        <div className="text-center space-y-5">
          <div className="w-12 h-12 mx-auto relative">
            <div className="absolute inset-0 rounded-full border-2 border-[#CAFF33]/20 animate-ping" />
            <div className="absolute inset-0 rounded-full border-2 border-t-[#CAFF33] animate-spin" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">EcoWallet</p>
            <p className="text-white/30 text-xs mt-1">Loading your ledger…</p>
          </div>
        </div>
      </div>
    )
  }

  const spend   = (summary?.total_spend  ?? 0).toFixed(2)
  const co2     = (summary?.total_co2    ?? 0).toFixed(1)
  const topCat  = summary?.top_category  ?? '—'
  const txCount = transactions.length

  /* ── Sidebar ── */
  const Sidebar = (
    <aside className="w-56 flex-shrink-0 bg-[#0C0D11] flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-6 flex items-center gap-3 border-b border-white/5">
        <div className="w-8 h-8 bg-[#CAFF33] rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="w-4 h-4 text-[#0C0D11]">{Icon.leaf}</span>
        </div>
        <div>
          <p className="text-white text-sm font-bold tracking-tight leading-none">EcoWallet</p>
          <p className="text-white/25 text-[10px] mt-0.5">Finance Tracker</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map((item) => (
          <NavItem key={item.id} item={item} active={activeTab === item.id} onClick={() => switchTab(item.id)} />
        ))}

        <div className="pt-3">
          <button
            onClick={() => switchTab('add')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all border ${
              activeTab === 'add'
                ? 'border-[#CAFF33]/40 bg-[#CAFF33]/10 text-[#CAFF33]'
                : 'border-white/10 text-white/40 hover:text-white/70 hover:border-white/20'
            }`}
          >
            <span className="w-4 h-4">{Icon.plus}</span>
            Add Transaction
          </button>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/5 space-y-1">
        <p className="text-[10px] text-white/20 uppercase tracking-widest">Powered by</p>
        <p className="text-[#CAFF33] text-xs font-medium">Groq LLaMA3-8b</p>
        <p className="text-white/15 text-[10px]">scikit-learn · SQLite</p>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F6F3]">

      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col w-56 flex-shrink-0">
        {Sidebar}
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-50 flex flex-col w-56">{Sidebar}</div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="flex-shrink-0 bg-white border-b border-[#E4E3DF] px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-1.5 rounded-lg text-[#A09E9A] hover:text-[#18181B] hover:bg-[#F7F6F3]"
              onClick={() => setSidebarOpen(true)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
            <div>
              <h1 className="text-sm font-semibold text-[#18181B]">
                {NAV.find((n) => n.id === activeTab)?.label ?? 'Add Transaction'}
              </h1>
              <p className="text-[11px] text-[#A09E9A]">
                {activeTab === 'overview' && `${txCount} transactions recorded`}
                {activeTab === 'transactions' && `${txCount} total · sorted by date`}
                {activeTab === 'analytics' && 'Spending breakdown & carbon impact'}
                {activeTab === 'predictions' && 'ML-powered forecast'}
                {activeTab === 'add' && 'AI will auto-categorise your entry'}
              </p>
            </div>
          </div>

          {/* KPI pill strip in header */}
          <div className="hidden md:flex items-center gap-4 text-xs">
            <span className="text-[#A09E9A]">Total spent</span>
            <span className="num font-semibold text-[#18181B]">£{spend}</span>
            <span className="w-px h-3 bg-[#E4E3DF]" />
            <span className="text-[#A09E9A]">CO₂</span>
            <span className="num font-semibold text-[#18181B]">{co2} kg</span>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto">

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div className="p-6 space-y-6 anim-fade-up">
              {/* KPI grid */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <KpiCard label="Total Spent"      value={`£${spend}`}     sub="all time" />
                <KpiCard label="Carbon Footprint" value={`${co2} kg`}     sub="CO₂ est. (UK avg)" />
                <KpiCard label="Transactions"     value={txCount}          sub="recorded entries" />
                <KpiCard label="Top Category"     value={topCat}           sub="highest spend" />
              </div>

              {/* Charts side by side */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                <SpendingChart spendByCategory={summary?.spend_by_category ?? {}} />
                <CarbonChart   co2ByCategory={summary?.co2_by_category ?? {}} />
              </div>

              {/* Recent transactions preview */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-[#A09E9A] uppercase tracking-[0.1em]">Recent transactions</p>
                  <button
                    onClick={() => setActiveTab('transactions')}
                    className="text-xs text-[#52524E] hover:text-[#18181B] flex items-center gap-1"
                  >
                    View all <span className="w-3 h-3">{Icon.chevronRight}</span>
                  </button>
                </div>
                <TransactionList
                  transactions={transactions.slice(0, 5)}
                  onDelete={fetchAll}
                  compact
                />
              </div>
            </div>
          )}

          {/* ── TRANSACTIONS ── */}
          {activeTab === 'transactions' && (
            <div className="p-6 anim-fade-up">
              <TransactionList transactions={transactions} onDelete={fetchAll} />
            </div>
          )}

          {/* ── ANALYTICS ── */}
          {activeTab === 'analytics' && (
            <div className="p-6 space-y-5 anim-fade-up">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                <SpendingChart spendByCategory={summary?.spend_by_category ?? {}} />
                <CarbonChart   co2ByCategory={summary?.co2_by_category ?? {}} />
              </div>
              {/* Category breakdown table */}
              <CategoryBreakdown summary={summary} />
            </div>
          )}

          {/* ── PREDICTIONS ── */}
          {activeTab === 'predictions' && (
            <div className="p-6 anim-fade-up">
              <PredictionCard prediction={prediction} onGenerate={fetchAll} />
            </div>
          )}

          {/* ── ADD ── */}
          {activeTab === 'add' && (
            <div className="p-6 anim-fade-up">
              <TransactionForm
                onSuccess={() => { fetchAll(); setActiveTab('transactions') }}
                onCancel={() => setActiveTab('overview')}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

/* ── Category breakdown table (Analytics tab only) ─────────────── */
function CategoryBreakdown({ summary }) {
  if (!summary) return null
  const cats = Object.entries(summary.spend_by_category || {})
    .map(([name, spend]) => ({
      name,
      spend,
      co2: summary.co2_by_category?.[name] ?? 0,
    }))
    .sort((a, b) => b.spend - a.spend)

  const total = cats.reduce((s, c) => s + c.spend, 0)

  return (
    <div className="bg-white border border-[#E4E3DF] rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[#E4E3DF]">
        <p className="text-sm font-semibold text-[#18181B]">Category breakdown</p>
      </div>
      <div className="divide-y divide-[#F0EFEB]">
        {cats.map((c) => {
          const pct = total > 0 ? (c.spend / total) * 100 : 0
          return (
            <div key={c.name} className="px-5 py-3.5 flex items-center gap-5">
              <p className="text-sm text-[#18181B] font-medium w-36 flex-shrink-0">{c.name}</p>
              <div className="flex-1 h-1.5 bg-[#F0EFEB] rounded-full overflow-hidden">
                <div className="h-full bg-[#CAFF33] rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <p className="num text-sm text-[#18181B] font-semibold w-20 text-right">£{c.spend.toFixed(2)}</p>
              <p className="num text-xs text-[#A09E9A] w-20 text-right">{c.co2.toFixed(2)} kg</p>
              <p className="num text-xs text-[#A09E9A] w-10 text-right">{pct.toFixed(0)}%</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
