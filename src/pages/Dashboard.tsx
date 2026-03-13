import { motion } from 'framer-motion'
import { TrendingUp, CreditCard, AlertCircle, DollarSign, Plus, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSubscriptionStore } from '@/store/subscriptionStore'
import { formatCurrency } from '@/utils/format'
import { CountdownRing } from '@/components/ui/CountdownRing'
import { CategoryBadge } from '@/components/ui/Badge'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import { format, subMonths, parseISO } from 'date-fns'
import { CATEGORY_COLORS, type Subscription } from '@/types'

function useMonthlyTrend(months = 7) {
  const { subscriptions, getMonthlyAmount } = useSubscriptionStore()
  return Array.from({ length: months }, (_, i) => {
    const date = subMonths(new Date(), months - 1 - i)
    const label = format(date, 'MMM')
    const amount = subscriptions
      .filter((s: Subscription) => s.isActive && parseISO(s.startDate) <= date)
      .reduce((acc: number, sub: Subscription) => acc + getMonthlyAmount(sub), 0)
    return { month: label, amount: parseFloat(amount.toFixed(2)) }
  })
}

function useCategoryBreakdown() {
  const { subscriptions, getMonthlyAmount } = useSubscriptionStore()
  const map: Record<string, number> = {}
  subscriptions.filter((s: Subscription) => s.isActive).forEach((s: Subscription) => {
    map[s.category] = (map[s.category] ?? 0) + getMonthlyAmount(s)
  })
  return Object.entries(map)
    .map(([category, amount]) => ({ category, amount: parseFloat(amount.toFixed(2)) }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
}

// Custom area chart dot
const CustomDot = (props: { cx?: number; cy?: number; payload?: { amount: number } }) => {
  if (!props.cx || !props.cy) return null
  return (
    <circle cx={props.cx} cy={props.cy} r={3} fill="#7C3AED" stroke="#FFFFFF" strokeWidth={2} />
  )
}

export function Dashboard() {
  const navigate = useNavigate()
  const {
    subscriptions, settings, getTotalMonthly, getTotalYearly,
    getUpcomingRenewals, getDaysUntilRenewal
  } = useSubscriptionStore()

  const totalMonthly = getTotalMonthly()
  const totalYearly = getTotalYearly()
  const activeCount = subscriptions.filter((s: Subscription) => s.isActive).length
  const upcoming = getUpcomingRenewals(7)
  const trendData = useMonthlyTrend()
  const categoryData = useCategoryBreakdown()

  const stats = [
    {
      label: 'Monthly Spend',
      value: formatCurrency(totalMonthly, settings),
      sub: `${formatCurrency(totalYearly, settings)} yearly`,
      icon: DollarSign,
      color: '#8B5CF6',
      gradient: 'from-[#8B5CF6] to-[#6D28D9]',
      glow: 'rgba(139,92,246,0.3)',
      bg: 'rgba(139,92,246,0.08)',
    },
    {
      label: 'Active Services',
      value: String(activeCount),
      sub: `${subscriptions.length} total tracked`,
      icon: CreditCard,
      color: '#3B82F6',
      gradient: 'from-[#3B82F6] to-[#1D4ED8]',
      glow: 'rgba(59,130,246,0.25)',
      bg: 'rgba(59,130,246,0.07)',
    },
    {
      label: 'Renewing Soon',
      value: String(upcoming.length),
      sub: upcoming.length > 0 ? `Next: ${upcoming[0]?.name ?? '—'}` : 'Nothing due soon',
      icon: AlertCircle,
      color: upcoming.length > 0 ? '#F59E0B' : '#10B981',
      gradient: upcoming.length > 0 ? 'from-[#F59E0B] to-[#D97706]' : 'from-[#10B981] to-[#059669]',
      glow: upcoming.length > 0 ? 'rgba(245,158,11,0.25)' : 'rgba(16,185,129,0.25)',
      bg: upcoming.length > 0 ? 'rgba(245,158,11,0.07)' : 'rgba(16,185,129,0.07)',
    },
    {
      label: 'Cost Per Day',
      value: formatCurrency(totalMonthly / 30, settings),
      sub: `${formatCurrency(totalMonthly / activeCount || 0, settings)} avg / service`,
      icon: TrendingUp,
      color: '#EC4899',
      gradient: 'from-[#EC4899] to-[#BE185D]',
      glow: 'rgba(236,72,153,0.25)',
      bg: 'rgba(236,72,153,0.07)',
    },
  ]

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-slate-900" style={{ letterSpacing: '-0.02em' }}>
            Good morning 👋
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Here's your subscription overview
          </p>
        </div>
        <button
          onClick={() => navigate('/subscriptions')}
          className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', boxShadow: '0 4px 20px rgba(139,92,246,0.35)' }}
        >
          <Plus className="w-4 h-4" />
          Add Subscription
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-2xl p-5 overflow-hidden cursor-default select-none"
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              boxShadow: `0 4px 24px ${stat.glow}`,
            }}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {stat.label}
              </span>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${stat.color}30, ${stat.color}10)`, border: `1px solid ${stat.color}25` }}>
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
            </div>

            {/* Value */}
            <p className="text-[28px] font-bold text-slate-900 tabular-nums leading-none" style={{ letterSpacing: '-0.03em' }}>
              {stat.value}
            </p>
            <p className="text-[11px] mt-1.5" style={{ color: '#94A3B8' }}>
              {stat.sub}
            </p>

            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-2xl"
              style={{ background: `linear-gradient(90deg, ${stat.color}60, transparent)` }} />
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Spend Trend — spans 3 cols */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-3 rounded-2xl p-6"
          style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[14px] font-semibold text-slate-900">Spend Trend</h2>
              <p className="text-[11px] mt-0.5" style={{ color: '#94A3B8' }}>Last 7 months</p>
            </div>
            <div className="px-3 py-1 rounded-lg text-[11px] font-semibold"
              style={{ background: 'rgba(124,58,237,0.08)', color: '#7C3AED', border: '1px solid rgba(124,58,237,0.15)' }}>
              {settings.currencySymbol}{totalMonthly.toFixed(0)}/mo
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={trendData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'Plus Jakarta Sans' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'Plus Jakarta Sans' }} axisLine={false} tickLine={false}
                tickFormatter={(v: number) => `${settings.currencySymbol}${v}`} />
              <Tooltip
                contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, fontSize: 12, fontFamily: 'Plus Jakarta Sans', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
                labelStyle={{ color: '#0F172A', fontWeight: 600 }}
                formatter={(v) => [`${settings.currencySymbol}${Number(v).toFixed(2)}`, 'Spend']}
                cursor={{ stroke: 'rgba(124,58,237,0.25)', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area type="monotone" dataKey="amount" stroke="#7C3AED" strokeWidth={2}
                fill="url(#spendGrad)" dot={<CustomDot />} activeDot={{ r: 5, fill: '#7C3AED', stroke: '#FFFFFF', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Breakdown — spans 2 cols */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-2 rounded-2xl p-6"
          style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}
        >
          <h2 className="text-[14px] font-semibold text-slate-900 mb-1">By Category</h2>
          <p className="text-[11px] mb-5" style={{ color: '#94A3B8' }}>Monthly breakdown</p>

          {categoryData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <div className="text-3xl mb-2">📊</div>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Add subscriptions to see breakdown</p>
            </div>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie data={categoryData} dataKey="amount" cx="50%" cy="50%" innerRadius={32} outerRadius={52} paddingAngle={4} startAngle={90} endAngle={-270}>
                      {categoryData.map(entry => (
                        <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category as keyof typeof CATEGORY_COLORS] ?? '#6b7280'}
                          stroke="transparent" />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {categoryData.map(entry => {
                  const pct = totalMonthly > 0 ? (entry.amount / totalMonthly) * 100 : 0
                  const color = CATEGORY_COLORS[entry.category as keyof typeof CATEGORY_COLORS]
                  return (
                    <div key={entry.category} className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                      <span className="text-[11px] flex-1 capitalize" style={{ color: 'rgba(255,255,255,0.6)' }}>{entry.category}</span>
                      <span className="text-[11px] font-semibold" style={{ color }}>{pct.toFixed(0)}%</span>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Upcoming Renewals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl"
        style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-4"
          style={{ borderBottom: '1px solid #F1F5F9' }}>
          <div>
            <h2 className="text-[14px] font-semibold text-slate-900">Upcoming Renewals</h2>
            <p className="text-[11px] mt-0.5" style={{ color: '#94A3B8' }}>Next 30 days</p>
          </div>
          <button onClick={() => navigate('/calendar')}
            className="flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors hover:text-white"
            style={{ color: '#94A3B8', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            View calendar <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {getUpcomingRenewals(30).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-3xl mb-2">🎉</div>
            <p className="text-sm font-medium text-slate-700">Nothing renewing soon</p>
            <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>No renewals in the next 30 days</p>
          </div>
        ) : (
          <div className="p-4 space-y-1">
            {getUpcomingRenewals(30).map((sub: Subscription, idx: number) => {
              const days = getDaysUntilRenewal(sub)
              const isUrgent = days <= 3
              const isSoon = days <= 7

              return (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="flex items-center gap-4 px-3 py-3 rounded-xl transition-colors"
                  style={{ background: isUrgent ? 'rgba(239,68,68,0.03)' : 'transparent' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#F8FAFC' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = isUrgent ? 'rgba(239,68,68,0.04)' : 'transparent' }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: `${sub.color}15`, border: `1px solid ${sub.color}20` }}>
                    {sub.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-slate-900 truncate">{sub.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <CategoryBadge category={sub.category} />
                      <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {format(parseISO(sub.nextRenewalDate), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right mr-2">
                    <p className="text-[14px] font-bold text-slate-900 tabular-nums">{formatCurrency(sub.amount, settings)}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: isUrgent ? '#F87171' : isSoon ? '#FBB024' : 'rgba(255,255,255,0.3)' }}>
                      {days === 0 ? 'Due today' : days === 1 ? 'Tomorrow' : `${days} days`}
                    </p>
                  </div>
                  <CountdownRing days={days} size={42} />
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>
    </div>
  )
}
