import { motion, AnimatePresence } from 'framer-motion'
import { Download, Upload, Trash2, ChevronDown, CheckCircle, XCircle } from 'lucide-react'
import { useRef, useState } from 'react'
import { useSubscriptionStore } from '@/store/subscriptionStore'
import { CURRENCIES } from '@/types'
import { cn } from '@/utils/cn'
import { db } from '@/db/database'

interface Toast {
  type: 'success' | 'error'
  message: string
}

export function Settings() {
  const { settings, updateSettings, exportData, importData, subscriptions, loadAll } = useSubscriptionStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const [toast, setToast] = useState<Toast | null>(null)

  const showToast = (type: Toast['type'], message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3500)
  }

  const handleExport = () => {
    const json = exportData()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `subscription-sentinel-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('success', `Exported ${subscriptions.length} subscriptions`)
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    try {
      const result = await importData(text)
      const msg = result.skipped > 0
        ? `Imported ${result.imported} · Skipped ${result.skipped} invalid`
        : `Successfully imported ${result.imported} subscriptions`
      showToast('success', msg)
    } catch {
      showToast('error', 'Failed to import — invalid file format')
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleClearAll = async () => {
    if (!confirm('Delete ALL subscriptions? This cannot be undone.')) return
    await db.subscriptions.clear()
    await loadAll()
    showToast('success', 'All data cleared')
  }

  const selectedCurrency = CURRENCIES.find(c => c.code === settings.currency) ?? CURRENCIES[0]

  return (
    <div className="space-y-6 max-w-xl">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              'fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl text-sm font-medium',
              toast.type === 'success'
                ? 'bg-emerald-900/80 border-emerald-500/30 text-emerald-300 backdrop-blur-sm'
                : 'bg-red-900/80 border-red-500/30 text-red-300 backdrop-blur-sm'
            )}
          >
            {toast.type === 'success'
              ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
              : <XCircle className="w-4 h-4 flex-shrink-0" />
            }
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Customize your experience</p>
      </div>

      {/* Currency */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 rounded-2xl p-6"
      >
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Display Currency</h2>
        <div className="relative">
          <select
            value={settings.currency}
            onChange={e => {
              const cur = CURRENCIES.find(c => c.code === e.target.value)
              if (cur) updateSettings({ currency: cur.code, currencySymbol: cur.symbol })
            }}
            className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-violet-500 transition-colors cursor-pointer"
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code} className="bg-[#13131a]">
                {c.symbol} {c.name} ({c.code})
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Currently using: <span className="text-violet-400">{selectedCurrency.symbol} ({selectedCurrency.name})</span>
        </p>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white border border-slate-200 rounded-2xl p-6"
      >
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Renewal Reminders</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-900">Browser Notifications</p>
              <p className="text-xs text-slate-500 mt-0.5">Get notified before renewals</p>
            </div>
            <button
              onClick={async () => {
                const enabling = !settings.notificationsEnabled
                if (enabling && Notification.permission !== 'granted') {
                  const permission = await Notification.requestPermission()
                  if (permission !== 'granted') return
                }
                updateSettings({ notificationsEnabled: enabling })
              }}
              className={cn(
                'relative w-11 h-6 rounded-full transition-colors focus:outline-none',
                settings.notificationsEnabled ? 'bg-violet-600' : 'bg-white/[0.12]'
              )}
            >
              <span className={cn(
                'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200',
                settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
              )} />
            </button>
          </div>
          <div>
            <p className="text-sm text-slate-900 mb-2">Remind me</p>
            <div className="flex gap-2">
              {[1, 3, 5, 7].map(days => (
                <button
                  key={days}
                  onClick={() => updateSettings({ reminderDays: days })}
                  className={cn(
                    'flex-1 py-2 rounded-xl text-xs font-medium transition-all',
                    settings.reminderDays === days
                      ? 'bg-violet-50 text-violet-700 border border-violet-200'
                      : 'bg-slate-50 text-slate-500 border border-slate-200 hover:border-slate-300'
                  )}
                >
                  {days}d before
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Data Management */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white border border-slate-200 rounded-2xl p-6"
      >
        <h2 className="text-sm font-semibold text-slate-900 mb-1">Data Management</h2>
        <p className="text-xs text-slate-500 mb-5">All data is stored locally in your browser. Export to back up.</p>
        <div className="space-y-3">
          <button
            onClick={handleExport}
            disabled={subscriptions.length === 0}
            className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl py-3 text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export Data ({subscriptions.length} subscriptions)
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl py-3 text-sm font-medium transition-all"
          >
            <Upload className="w-4 h-4" />
            Import Data
          </button>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white border border-red-200 rounded-2xl p-6"
      >
        <h2 className="text-sm font-semibold text-red-500 mb-1">Danger Zone</h2>
        <p className="text-xs text-slate-500 mb-4">Irreversible actions. Proceed with caution.</p>
        <button
          onClick={handleClearAll}
          className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 rounded-xl px-4 py-2.5 text-sm font-medium transition-all"
        >
          <Trash2 className="w-4 h-4" />
          Clear All Data
        </button>
      </motion.div>

      {/* About */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white border border-slate-200 rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center text-lg">🛡️</div>
          <div>
            <p className="text-sm font-semibold text-slate-900">SubscriptionSentinel</p>
            <p className="text-xs text-slate-500">v1.0.0 · Open Source</p>
          </div>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          100% local. Zero cloud. Zero tracking. Zero cost. Your data never leaves your device.
          Built with React, Dexie.js, and Tailwind CSS.
        </p>
      </motion.div>
    </div>
  )
}
