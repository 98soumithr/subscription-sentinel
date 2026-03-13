import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameMonth, isToday, parseISO, isSameDay, addMonths, subMonths
} from 'date-fns'
import { useSubscriptionStore } from '@/store/subscriptionStore'
import { formatCurrency } from '@/utils/format'
import type { Subscription } from '@/types'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const { subscriptions, settings } = useSubscriptionStore()

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPad = monthStart.getDay()
  const paddedDays: (Date | null)[] = Array(startPad).fill(null).concat(days)

  const getSubsForDay = (day: Date) =>
    subscriptions.filter((sub: Subscription) =>
      sub.isActive && isSameDay(parseISO(sub.nextRenewalDate), day)
    )

  const totalThisMonth = subscriptions
    .filter((s: Subscription) => s.isActive && isSameMonth(parseISO(s.nextRenewalDate), currentMonth))
    .reduce((acc: number, s: Subscription) => acc + s.amount, 0)

  const monthSubs = subscriptions
    .filter((s: Subscription) => s.isActive && isSameMonth(parseISO(s.nextRenewalDate), currentMonth))
    .sort((a: Subscription, b: Subscription) => parseISO(a.nextRenewalDate).getTime() - parseISO(b.nextRenewalDate).getTime())

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
          <p className="text-sm text-slate-500 mt-1">Visualize your renewal dates</p>
        </div>
        <div
          className="text-right px-5 py-3 rounded-2xl"
          style={{
            background: 'rgba(124,58,237,0.08)',
            border: '1px solid rgba(124,58,237,0.2)',
          }}
        >
          <p className="text-[10px] font-medium text-violet-600 uppercase tracking-widest">Renewing this month</p>
          <p className="text-xl font-bold text-slate-900 tabular-nums mt-0.5">{formatCurrency(totalThisMonth, settings)}</p>
        </div>
      </div>

      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden"
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
        }}
      >
        {/* Month Navigation */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #F1F5F9' }}>
          <button
            onClick={() => setCurrentMonth(m => subMonths(m, 1))}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 transition-all hover:bg-slate-100"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-violet-400" />
            <h2 className="text-sm font-semibold text-slate-900">{format(currentMonth, 'MMMM yyyy')}</h2>
          </div>
          <button
            onClick={() => setCurrentMonth(m => addMonths(m, 1))}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 transition-all hover:bg-slate-100"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7" style={{ borderBottom: '1px solid #F1F5F9' }}>
          {DAY_LABELS.map(d => (
            <div key={d} className="py-3 text-center text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
              {d}
            </div>
          ))}
        </div>

        {/* Day Cells */}
        <div className="grid grid-cols-7">
          {paddedDays.map((day, i) => {
            if (!day) {
              return (
                <div
                  key={`pad-${i}`}
                  className="h-24"
                  style={{ borderRight: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9' }}
                />
              )
            }
            const subs = getSubsForDay(day)
            const isCurrentDay = isToday(day)
            const inMonth = isSameMonth(day, currentMonth)

            return (
              <div
                key={day.toISOString()}
                className="h-24 p-2 transition-colors"
                style={{
                  borderRight: '1px solid rgba(255,255,255,0.03)',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  background: isCurrentDay ? 'rgba(124,58,237,0.04)' : undefined,
                  opacity: inMonth ? 1 : 0.3,
                }}
              >
                {/* Day Number */}
                <div
                  className="text-xs font-semibold mb-1.5 w-6 h-6 flex items-center justify-center rounded-full transition-all"
                  style={isCurrentDay
                    ? { background: '#7c3aed', color: '#fff', boxShadow: '0 2px 8px rgba(124,58,237,0.3)' }
                    : { color: '#64748B' }
                  }
                >
                  {format(day, 'd')}
                </div>

                {/* Subscription Events */}
                <div className="space-y-0.5 overflow-hidden">
                  {subs.slice(0, 2).map((sub: Subscription) => (
                    <div
                      key={sub.id}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-semibold truncate"
                      style={{ backgroundColor: `${sub.color}22`, color: sub.color }}
                      title={`${sub.name} — ${settings.currencySymbol}${sub.amount}`}
                    >
                      <span>{sub.emoji}</span>
                      <span className="truncate">{sub.name}</span>
                    </div>
                  ))}
                  {subs.length > 2 && (
                    <div className="text-[9px] text-slate-400 px-1.5 font-medium">+{subs.length - 2} more</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Renewals List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl p-6"
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
        }}
      >
        <h2 className="text-sm font-semibold text-slate-900 mb-4">
          Renewals in <span className="text-violet-600">{format(currentMonth, 'MMMM')}</span>
        </h2>
        {monthSubs.length === 0 ? (
          <p className="text-slate-400 text-sm py-6 text-center">No renewals this month</p>
        ) : (
          <div className="space-y-1.5">
            {monthSubs.map((sub: Subscription, i: number) => (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.04 }}
                className="flex items-center gap-3 px-3 py-3 rounded-xl transition-colors hover:bg-slate-50 group"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                  style={{ backgroundColor: `${sub.color}18`, boxShadow: `0 0 0 1px ${sub.color}28` }}
                >
                  {sub.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{sub.name}</p>
                  <p className="text-xs text-slate-400">{format(parseISO(sub.nextRenewalDate), 'EEEE, MMM d')}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-slate-900 tabular-nums">{formatCurrency(sub.amount, settings)}</p>
                  <div className="w-2 h-2 rounded-full ml-auto mt-1" style={{ backgroundColor: sub.color }} />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
