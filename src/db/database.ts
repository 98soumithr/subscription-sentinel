import Dexie, { type Table } from 'dexie'
import type { Subscription, Settings } from '@/types'

export class SubscriptionDB extends Dexie {
  subscriptions!: Table<Subscription>
  settings!: Table<Settings & { id: number }>

  constructor() {
    super('SubscriptionSentinelDB')
    this.version(1).stores({
      subscriptions: 'id, isActive, nextRenewalDate, category, createdAt',
      settings: '++id',
    })
  }
}

export const db = new SubscriptionDB()

// Seed default settings if none exist
export async function initDB() {
  const count = await db.settings.count()
  if (count === 0) {
    await db.settings.add({
      id: 1,
      currency: 'USD',
      currencySymbol: '$',
      notificationsEnabled: true,
      reminderDays: 3,
      theme: 'dark',
    })
  }
}
