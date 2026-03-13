import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Dashboard } from '@/pages/Dashboard'
import { Subscriptions } from '@/pages/Subscriptions'
import { Analytics } from '@/pages/Analytics'
import { Calendar } from '@/pages/Calendar'
import { Settings } from '@/pages/Settings'
import { useSubscriptionStore } from '@/store/subscriptionStore'
import { initDB } from '@/db/database'

function fireRenewalNotifications(
  _subscriptions: import('@/types').Subscription[],
  settings: import('@/types').Settings,
  getUpcomingRenewals: (days?: number) => import('@/types').Subscription[],
  getDaysUntilRenewal: (sub: import('@/types').Subscription) => number
) {
  if (!settings.notificationsEnabled) return
  if (Notification.permission !== 'granted') return

  const today = new Date().toISOString().slice(0, 10)
  const upcoming = getUpcomingRenewals(settings.reminderDays)

  for (const sub of upcoming) {
    const key = `notif-sent-${sub.id}-${today}`
    if (localStorage.getItem(key)) continue

    const days = getDaysUntilRenewal(sub)
    const dueText = days === 0 ? 'due today' : days === 1 ? 'due tomorrow' : `due in ${days} days`
    new Notification(`${sub.emoji} ${sub.name} renewing ${dueText}`, {
      body: `${settings.currencySymbol}${sub.amount} · ${sub.billingCycle}`,
      icon: '/pwa-192x192.png',
      tag: sub.id,
    })
    localStorage.setItem(key, '1')
  }
}

function AppLoader() {
  const { loadAll, settings, subscriptions, getUpcomingRenewals, getDaysUntilRenewal } = useSubscriptionStore()

  useEffect(() => {
    initDB().then(() => loadAll())
  }, [loadAll])

  useEffect(() => {
    if (subscriptions.length > 0) {
      fireRenewalNotifications(subscriptions, settings, getUpcomingRenewals, getDaysUntilRenewal)
    }
  }, [subscriptions, settings, getUpcomingRenewals, getDaysUntilRenewal])

  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLoader />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="subscriptions" element={<Subscriptions />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
