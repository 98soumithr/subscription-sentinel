import { create } from 'zustand'
import { db } from '@/db/database'
import type { Subscription, Settings, ViewMode } from '@/types'
import {
  addWeeks, addMonths, addQuarters, addYears,
  format, parseISO, differenceInDays
} from 'date-fns'

const WEEKS_PER_MONTH = 52 / 12

function generateId(): string {
  return crypto.randomUUID()
}

function getNextRenewalDate(startDate: string, billingCycle: Subscription['billingCycle']): string {
  const start = parseISO(startDate)
  const now = new Date()
  let next = start

  while (next <= now) {
    switch (billingCycle) {
      case 'weekly':    next = addWeeks(next, 1); break
      case 'monthly':   next = addMonths(next, 1); break
      case 'quarterly': next = addQuarters(next, 1); break
      case 'yearly':    next = addYears(next, 1); break
    }
  }
  return format(next, 'yyyy-MM-dd')
}

function isValidSubscription(s: unknown): s is Subscription {
  if (!s || typeof s !== 'object') return false
  const sub = s as Record<string, unknown>
  return (
    typeof sub.id === 'string' &&
    typeof sub.name === 'string' &&
    typeof sub.amount === 'number' &&
    typeof sub.billingCycle === 'string' &&
    typeof sub.category === 'string' &&
    typeof sub.startDate === 'string' &&
    typeof sub.nextRenewalDate === 'string' &&
    typeof sub.isActive === 'boolean'
  )
}

interface SubscriptionStore {
  subscriptions: Subscription[]
  settings: Settings
  viewMode: ViewMode
  searchQuery: string
  selectedCategory: string
  isLoading: boolean

  loadAll: () => Promise<void>
  addSubscription: (data: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt' | 'nextRenewalDate'>) => Promise<void>
  updateSubscription: (id: string, data: Partial<Subscription>) => Promise<void>
  deleteSubscription: (id: string) => Promise<void>
  toggleActive: (id: string) => Promise<void>
  updateSettings: (settings: Partial<Settings>) => Promise<void>
  setViewMode: (mode: ViewMode) => void
  setSearchQuery: (q: string) => void
  setSelectedCategory: (cat: string) => void
  exportData: () => string
  importData: (json: string) => Promise<{ imported: number; skipped: number }>

  getMonthlyAmount: (sub: Subscription) => number
  getTotalMonthly: () => number
  getTotalYearly: () => number
  getUpcomingRenewals: (days?: number) => Subscription[]
  getDaysUntilRenewal: (sub: Subscription) => number
}

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
  subscriptions: [],
  settings: {
    currency: 'USD',
    currencySymbol: '$',
    notificationsEnabled: true,
    reminderDays: 3,
    theme: 'dark',
  },
  viewMode: 'grid',
  searchQuery: '',
  selectedCategory: 'all',
  isLoading: true,

  loadAll: async () => {
    try {
      const [subs, settingsRows] = await Promise.all([
        db.subscriptions.orderBy('createdAt').reverse().toArray(),
        db.settings.toArray(),
      ])
      set({
        subscriptions: subs,
        settings: settingsRows[0] ? { ...settingsRows[0] } : get().settings,
        isLoading: false,
      })
    } catch {
      set({ isLoading: false })
    }
  },

  addSubscription: async (data) => {
    const id = generateId()
    const now = new Date().toISOString()
    const nextRenewalDate = getNextRenewalDate(data.startDate, data.billingCycle)
    const sub: Subscription = { ...data, id, nextRenewalDate, createdAt: now, updatedAt: now }
    await db.subscriptions.add(sub)
    set(s => ({ subscriptions: [sub, ...s.subscriptions] }))
  },

  updateSubscription: async (id, data) => {
    const current = get().subscriptions.find(s => s.id === id)
    if (!current) return
    const now = new Date().toISOString()
    const updates: Partial<Subscription> = { ...data, updatedAt: now }
    if (data.startDate ?? data.billingCycle) {
      updates.nextRenewalDate = getNextRenewalDate(
        data.startDate ?? current.startDate,
        data.billingCycle ?? current.billingCycle
      )
    }
    await db.subscriptions.update(id, updates)
    set(s => ({
      subscriptions: s.subscriptions.map(sub =>
        sub.id === id ? { ...sub, ...updates } : sub
      ),
    }))
  },

  deleteSubscription: async (id) => {
    await db.subscriptions.delete(id)
    set(s => ({ subscriptions: s.subscriptions.filter(sub => sub.id !== id) }))
  },

  toggleActive: async (id) => {
    const sub = get().subscriptions.find(s => s.id === id)
    if (!sub) return
    await get().updateSubscription(id, { isActive: !sub.isActive })
  },

  updateSettings: async (newSettings) => {
    const updated = { ...get().settings, ...newSettings }
    await db.settings.update(1, updated)
    set({ settings: updated })
  },

  setViewMode: (mode) => set({ viewMode: mode }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setSelectedCategory: (cat) => set({ selectedCategory: cat }),

  exportData: () => {
    const { subscriptions, settings } = get()
    return JSON.stringify({ subscriptions, settings, exportedAt: new Date().toISOString() }, null, 2)
  },

  importData: async (json) => {
    const data: unknown = JSON.parse(json)
    if (!data || typeof data !== 'object') throw new Error('Invalid file format')

    const record = data as Record<string, unknown>
    const rawSubs = Array.isArray(record.subscriptions) ? record.subscriptions : []
    const validSubs = rawSubs.filter(isValidSubscription)
    const skipped = rawSubs.length - validSubs.length

    if (validSubs.length > 0) {
      await db.subscriptions.clear()
      await db.subscriptions.bulkAdd(validSubs)
    }
    if (record.settings && typeof record.settings === 'object') {
      await db.settings.update(1, record.settings as Partial<Settings>)
    }
    await get().loadAll()
    return { imported: validSubs.length, skipped }
  },

  getMonthlyAmount: (sub) => {
    if (!sub.isActive) return 0
    switch (sub.billingCycle) {
      case 'weekly':    return sub.amount * WEEKS_PER_MONTH
      case 'monthly':   return sub.amount
      case 'quarterly': return sub.amount / 3
      case 'yearly':    return sub.amount / 12
    }
  },

  getTotalMonthly: () => {
    return get().subscriptions
      .filter(s => s.isActive)
      .reduce((acc, sub) => acc + get().getMonthlyAmount(sub), 0)
  },

  getTotalYearly: () => get().getTotalMonthly() * 12,

  // Critical fix: only include renewals 0-N days away (not past)
  getUpcomingRenewals: (days = 30) => {
    const now = new Date()
    return get().subscriptions
      .filter(s => s.isActive)
      .filter(s => {
        const d = differenceInDays(parseISO(s.nextRenewalDate), now)
        return d >= 0 && d <= days
      })
      .sort((a, b) =>
        differenceInDays(parseISO(a.nextRenewalDate), now) -
        differenceInDays(parseISO(b.nextRenewalDate), now)
      )
  },

  getDaysUntilRenewal: (sub) => {
    return differenceInDays(parseISO(sub.nextRenewalDate), new Date())
  },
}))
