import { motion } from 'framer-motion'
import { ExternalLink, MoreVertical, Pencil, Trash2, Power } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { CountdownRing } from '@/components/ui/CountdownRing'
import { CategoryBadge } from '@/components/ui/Badge'
import { useSubscriptionStore } from '@/store/subscriptionStore'
import { formatCurrency } from '@/utils/format'
import { BILLING_CYCLE_LABELS } from '@/types'
import type { Subscription } from '@/types'
import { format, parseISO } from 'date-fns'

interface Props {
  sub: Subscription
  onEdit: (sub: Subscription) => void
  index: number
}

export function SubscriptionCard({ sub, onEdit, index }: Props) {
  const { deleteSubscription, toggleActive, getMonthlyAmount, getDaysUntilRenewal, settings } = useSubscriptionStore()
  const monthly = getMonthlyAmount(sub)
  const daysUntil = getDaysUntilRenewal(sub)

  const isUrgent = daysUntil <= 3
  const isSoon = daysUntil <= 7

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -2 }}
      className={`group relative rounded-2xl overflow-hidden transition-all duration-300 ${!sub.isActive ? 'opacity-50' : ''}`}
      style={{
        background: '#FFFFFF',
        border: `1px solid ${isUrgent ? 'rgba(239,68,68,0.3)' : isSoon ? 'rgba(245,158,11,0.25)' : '#E2E8F0'}`,
        boxShadow: sub.isActive
          ? `0 1px 8px rgba(0,0,0,0.06), 0 0 0 1px ${sub.color}10`
          : '0 1px 4px rgba(0,0,0,0.04)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Color accent top bar */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${sub.color}90, ${sub.color}60, transparent)` }}
      />

      {/* Subtle color glow behind card */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 120% 80% at 50% -10%, ${sub.color}08, transparent 70%)` }}
      />

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 relative"
              style={{
                backgroundColor: `${sub.color}18`,
                boxShadow: `0 0 0 1px ${sub.color}30, 0 4px 16px ${sub.color}20`,
              }}
            >
              {sub.emoji}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-900 truncate leading-tight">{sub.name}</h3>
              <CategoryBadge category={sub.category} className="mt-1.5" />
            </div>
          </div>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="min-w-[148px] rounded-xl p-1 shadow-2xl z-50"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  backdropFilter: 'blur(20px)',
                }}
                sideOffset={4}
              >
                <DropdownMenu.Item
                  onClick={() => onEdit(sub)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors outline-none"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </DropdownMenu.Item>
                {sub.website && (
                  <DropdownMenu.Item
                    onClick={() => window.open(sub.website, '_blank')}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors outline-none"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Visit Site
                  </DropdownMenu.Item>
                )}
                <DropdownMenu.Item
                  onClick={() => toggleActive(sub.id)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors outline-none"
                >
                  <Power className="w-3.5 h-3.5" /> {sub.isActive ? 'Pause' : 'Activate'}
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="my-1 h-px bg-slate-100" />
                <DropdownMenu.Item
                  onClick={() => deleteSubscription(sub.id)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/[0.1] rounded-lg cursor-pointer transition-colors outline-none"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>

        {/* Divider */}
        <div className="h-px mb-4" style={{ background: "#F1F5F9" }} />

        {/* Amount */}
        <div className="mb-4">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight" style={{ color: '#0F172A', fontVariantNumeric: 'tabular-nums' }}>
              {formatCurrency(sub.amount, settings)}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ {BILLING_CYCLE_LABELS[sub.billingCycle].toLowerCase()}</span>
          </div>
          {sub.billingCycle !== 'monthly' && (
            <p className="text-xs text-slate-400 mt-0.5">
              ≈ <span className="text-slate-500">{formatCurrency(monthly, settings)}</span>/mo
            </p>
          )}
        </div>

        {/* Renewal Footer */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Next Renewal</p>
            <p className="text-xs text-slate-700 font-medium mt-0.5">
              {format(parseISO(sub.nextRenewalDate), 'MMM d, yyyy')}
            </p>
          </div>
          <CountdownRing days={daysUntil} size={46} />
        </div>
      </div>
    </motion.div>
  )
}
