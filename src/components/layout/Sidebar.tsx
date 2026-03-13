import { NavLink } from 'react-router-dom'
import { LayoutDashboard, CreditCard, BarChart3, Calendar, Settings } from 'lucide-react'
import { cn } from '@/utils/cn'
import { motion } from 'framer-motion'
import { useSubscriptionStore } from '@/store/subscriptionStore'
import { formatCurrency } from '@/utils/format'

const navItems = [
  { to: '/',              icon: LayoutDashboard, label: 'Dashboard',     color: '#7C3AED' },
  { to: '/subscriptions', icon: CreditCard,      label: 'Subscriptions', color: '#3B82F6' },
  { to: '/analytics',     icon: BarChart3,       label: 'Analytics',     color: '#10B981' },
  { to: '/calendar',      icon: Calendar,        label: 'Calendar',      color: '#F59E0B' },
  { to: '/settings',      icon: Settings,        label: 'Settings',      color: '#64748B' },
]

export function Sidebar() {
  const { getTotalMonthly, settings, subscriptions } = useSubscriptionStore()
  const totalMonthly = getTotalMonthly()
  const activeCount = subscriptions.filter(s => s.isActive).length

  return (
    <aside className="fixed left-0 top-0 h-full w-[240px] flex flex-col z-40"
      style={{ background: '#FFFFFF', borderRight: '1px solid #E2E8F0' }}>

      {/* Logo */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 flex-shrink-0">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700" />
            <div className="absolute inset-0 rounded-xl flex items-center justify-center">
              <span className="text-base">🛡️</span>
            </div>
          </div>
          <div>
            <p className="text-[13px] text-slate-900 tracking-tight leading-none" style={{ fontWeight: 800 }}>SubSentinel</p>
            <p className="text-[10px] mt-0.5 font-semibold" style={{ color: '#7C3AED' }}>Subscription Tracker</p>
          </div>
        </div>
      </div>

      {/* Spend Summary Card */}
      <div className="mx-4 mb-5 px-4 py-3.5 rounded-2xl"
        style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(59,130,246,0.04) 100%)', border: '1px solid rgba(124,58,237,0.15)' }}>
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgba(124,58,237,0.7)' }}>Monthly Spend</p>
        <p className="text-xl font-bold text-slate-900 tabular-nums" style={{ letterSpacing: '-0.02em' }}>
          {formatCurrency(totalMonthly, settings)}
        </p>
        <p className="text-[11px] mt-0.5 text-slate-500">{activeCount} active service{activeCount !== 1 ? 's' : ''}</p>
      </div>

      <div className="mx-4 mb-3" style={{ borderTop: '1px solid #F1F5F9' }} />

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Navigation</p>
        {navItems.map(({ to, icon: Icon, label, color }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className="group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200"
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="activeNavBg"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: `linear-gradient(135deg, ${color}14, ${color}06)`, border: `1px solid ${color}20` }}
                    initial={false}
                    transition={{ type: 'spring', duration: 0.4 }}
                  />
                )}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                    style={{ background: `linear-gradient(180deg, ${color}, ${color}80)` }} />
                )}
                <div className={cn(
                  'relative w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200',
                  isActive ? '' : 'group-hover:bg-slate-100'
                )}
                  style={isActive ? { background: `${color}14` } : {}}>
                  <Icon className="w-3.5 h-3.5 transition-colors" style={{ color: isActive ? color : '#94A3B8' }} />
                </div>
                <span className={cn('relative transition-colors', isActive ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700')}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4">
        <div className="px-3 py-2.5 rounded-xl flex items-center gap-2"
          style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot flex-shrink-0" />
          <div>
            <p className="text-[10px] font-semibold text-emerald-600 leading-none">All local · No cloud</p>
            <p className="text-[9px] mt-0.5 leading-none text-slate-400">Data never leaves your device</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
