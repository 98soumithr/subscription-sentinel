import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, Area, AreaChart
} from 'recharts'
import { useSubscriptionStore } from '@/store/subscriptionStore'
import { formatCurrency } from '@/utils/format'
import { CATEGORY_COLORS, CATEGORY_LABELS, BILLING_CYCLE_LABELS, type Subscription } from '@/types'
import { format, subMonths, parseISO, startOfMonth } from 'date-fns'
import { TrendingUp, DollarSign, Calendar, Layers } from 'lucide-react'

const CHART_COLORS = ['#7c3aed', '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa']

const tooltipStyle = {
  background: '#FFFFFF',
  border: '1px solid #E2E8F0',
  borderRadius: 12,
  fontSize: 12,
  color: '#0F172A',
  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
}

export function Analytics() {
  const { subscriptions, settings, getTotalMonthly, getTotalYearly, getMonthlyAmount } = useSubscriptionStore()
  const active = subscriptions.filter((s: Subscription) => s.isActive)

  const categoryMap: Record<string, number> = {}
  active.forEach((s: Subscription) => {
    categoryMap[s.category] = (categoryMap[s.category] ?? 0) + getMonthlyAmount(s)
  })
  const categoryData = Object.entries(categoryMap)
    .map(([cat, amount]) => ({
      name: CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat,
      category: cat,
      amount: parseFloat(amount.toFixed(2)),
    }))
    .sort((a, b) => b.amount - a.amount)

  const cycleMap: Record<string, number> = {}
  active.forEach((s: Subscription) => { cycleMap[s.billingCycle] = (cycleMap[s.billingCycle] ?? 0) + 1 })
  const cycleData = Object.entries(cycleMap).map(([cycle, count]) => ({
    name: BILLING_CYCLE_LABELS[cycle as keyof typeof BILLING_CYCLE_LABELS],
    count,
  }))

  const trendData = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), 11 - i)
    const label = format(date, 'MMM yy')
    const amount = active
      .filter((s: Subscription) => parseISO(s.startDate) <= startOfMonth(date))
      .reduce((acc: number, s: Subscription) => acc + getMonthlyAmount(s), 0)
    return { month: label, amount: parseFloat(amount.toFixed(2)) }
  })

  const topSubs = [...active]
    .sort((a: Subscription, b: Subscription) => getMonthlyAmount(b) - getMonthlyAmount(a))
    .slice(0, 8)

  const totalMonthly = getTotalMonthly()
  const totalYearly = getTotalYearly()
  const sym = settings.currencySymbol

  const statCards = [
    { label: 'Monthly Total', value: formatCurrency(totalMonthly, settings), sub: 'per month', icon: DollarSign, color: '#7c3aed', glow: 'rgba(124,58,237,0.2)' },
    { label: 'Yearly Total', value: formatCurrency(totalYearly, settings), sub: 'per year', icon: TrendingUp, color: '#60a5fa', glow: 'rgba(96,165,250,0.2)' },
    { label: 'Daily Cost', value: formatCurrency(totalMonthly / 30, settings), sub: 'per day', icon: Calendar, color: '#34d399', glow: 'rgba(52,211,153,0.2)' },
    { label: 'Active Services', value: String(active.length), sub: 'subscriptions', icon: Layers, color: '#fbbf24', glow: 'rgba(251,191,36,0.2)' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">Deep dive into your subscription spending</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, ease: [0.23, 1, 0.32, 1] }}
              className="relative rounded-2xl p-5 overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: `0 0 0 1px ${s.color}15, 0 8px 32px rgba(0,0,0,0.2)`,
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${s.color}80, transparent)` }} />
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-medium text-slate-500">{s.label}</p>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${s.color}18` }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: s.color }} />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 tabular-nums">{s.value}</p>
              <p className="text-xs text-slate-400 mt-1">{s.sub}</p>
              <div className="absolute bottom-0 left-0 right-0 h-8" style={{ background: `linear-gradient(to top, ${s.glow}, transparent)`, opacity: 0.4 }} />
            </motion.div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spend by Category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="rounded-2xl p-6"
          style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}
        >
          <h2 className="text-sm font-semibold text-slate-900">Spend by Category</h2>
          <p className="text-xs text-slate-500 mt-0.5 mb-5">Monthly in {settings.currency}</p>
          {categoryData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData} layout="vertical" margin={{ left: 8, right: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={(v: number) => `${sym}${v}`} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} width={85} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${sym}${Number(v).toFixed(2)}/mo`, 'Spend']} />
                <Bar dataKey="amount" radius={[0, 6, 6, 0]} maxBarSize={16}>
                  {categoryData.map(entry => (
                    <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category as keyof typeof CATEGORY_COLORS] ?? '#7c3aed'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Billing Cycles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, ease: [0.23, 1, 0.32, 1] }}
          className="rounded-2xl p-6"
          style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}
        >
          <h2 className="text-sm font-semibold text-slate-900">Billing Cycles</h2>
          <p className="text-xs text-slate-500 mt-0.5 mb-5">Distribution of payment frequency</p>
          {cycleData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={cycleData} dataKey="count" nameKey="name" cx="50%" cy="45%"
                  outerRadius={75} innerRadius={46} paddingAngle={3} strokeWidth={0}>
                  {cycleData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 11, color: '#64748B', paddingTop: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* 12-Month Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className="rounded-2xl p-6"
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
        }}
      >
        <h2 className="text-sm font-semibold text-slate-900">12-Month Trend</h2>
        <p className="text-xs text-slate-500 mt-0.5 mb-5">How your monthly spend has changed</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.12} />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} width={42}
              tickFormatter={(v: number) => `${sym}${v}`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${sym}${Number(v).toFixed(2)}`, 'Monthly Spend']} />
            <Area type="monotone" dataKey="amount" stroke="#7c3aed" strokeWidth={2}
              fill="url(#analyticsGrad)"
              dot={{ fill: '#7c3aed', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#a78bfa', strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Top Subscriptions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, ease: [0.23, 1, 0.32, 1] }}
        className="rounded-2xl p-6"
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
        }}
      >
        <h2 className="text-sm font-semibold text-slate-900">Top Subscriptions by Cost</h2>
        <p className="text-xs text-slate-500 mt-0.5 mb-5">Ranked by monthly equivalent</p>
        <div className="space-y-4">
          {topSubs.map((sub: Subscription, i: number) => {
            const mo = getMonthlyAmount(sub)
            const pct = totalMonthly > 0 ? (mo / totalMonthly) * 100 : 0
            return (
              <div key={sub.id} className="flex items-center gap-4">
                <span className="text-xs text-slate-400 w-4 text-right font-medium">{i + 1}</span>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                  style={{ backgroundColor: `${sub.color}18`, boxShadow: `0 0 0 1px ${sub.color}30` }}
                >
                  {sub.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-slate-900 font-medium truncate pr-2">{sub.name}</span>
                    <span className="text-sm font-bold text-slate-900 tabular-nums flex-shrink-0">{formatCurrency(mo, settings)}/mo</span>
                  </div>
                  <div className="relative w-full h-1.5 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.4 + i * 0.05, ease: [0.23, 1, 0.32, 1] }}
                      style={{ background: `linear-gradient(90deg, ${sub.color}, ${sub.color}aa)` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">{pct.toFixed(1)}% of total</span>
                </div>
              </div>
            )
          })}
          {topSubs.length === 0 && (
            <div className="flex items-center justify-center py-10 text-slate-400 text-sm">No active subscriptions</div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
