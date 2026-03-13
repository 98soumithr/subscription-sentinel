import { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import type { Subscription, Category, BillingCycle } from '@/types'
import {
  CATEGORY_LABELS, BILLING_CYCLE_LABELS, POPULAR_SUBSCRIPTIONS
} from '@/types'
import { useSubscriptionStore } from '@/store/subscriptionStore'

interface Props {
  open: boolean
  onClose: () => void
  editSub?: Subscription | null
}

const defaultForm = {
  name: '',
  emoji: '✨',
  color: '#7c3aed',
  amount: '',
  billingCycle: 'monthly' as BillingCycle,
  category: 'other' as Category,
  startDate: format(new Date(), 'yyyy-MM-dd'),
  website: '',
  notes: '',
  isActive: true,
  reminderDays: 3,
  currency: 'USD',
}

export function SubscriptionModal({ open, onClose, editSub }: Props) {
  const { addSubscription, updateSubscription, settings } = useSubscriptionStore()
  const [form, setForm] = useState({ ...defaultForm, currency: settings.currency })
  const [step, setStep] = useState<'pick' | 'form'>('pick')

  useEffect(() => {
    if (editSub) {
      setForm({
        name: editSub.name,
        emoji: editSub.emoji,
        color: editSub.color,
        amount: String(editSub.amount),
        billingCycle: editSub.billingCycle,
        category: editSub.category,
        startDate: editSub.startDate,
        website: editSub.website ?? '',
        notes: editSub.notes ?? '',
        isActive: editSub.isActive,
        reminderDays: editSub.reminderDays,
        currency: editSub.currency,
      })
      setStep('form')
    } else {
      setForm({ ...defaultForm, currency: settings.currency })
      setStep('pick')
    }
  }, [editSub, open, settings.currency])

  const handlePickTemplate = (t: typeof POPULAR_SUBSCRIPTIONS[0]) => {
    setForm(f => ({ ...f, name: t.name, emoji: t.emoji, color: t.color, category: t.category }))
    setStep('form')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      name: form.name,
      emoji: form.emoji,
      color: form.color,
      amount: parseFloat(form.amount) || 0,
      billingCycle: form.billingCycle,
      category: form.category,
      startDate: form.startDate,
      website: form.website,
      notes: form.notes,
      isActive: form.isActive,
      reminderDays: form.reminderDays,
      currency: form.currency,
    }
    if (editSub) {
      await updateSubscription(editSub.id, data)
    } else {
      await addSubscription(data)
    }
    onClose()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const set = (key: string, val: any) => setForm((f: any) => ({ ...f, [key]: val }))

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-white border border-slate-200 rounded-2xl shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <Dialog.Title className="text-base font-semibold text-slate-900">
                  {editSub ? 'Edit Subscription' : 'Add Subscription'}
                </Dialog.Title>
                {!editSub && step === 'pick' && (
                  <p className="text-xs text-slate-400 mt-0.5">Pick a popular service or start custom</p>
                )}
              </div>
              <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <AnimatePresence mode="wait">
              {step === 'pick' && !editSub ? (
                <motion.div
                  key="pick"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="p-4"
                >
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {POPULAR_SUBSCRIPTIONS.slice(0, -1).map(t => (
                      <button
                        key={t.name}
                        onClick={() => handlePickTemplate(t)}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all group"
                      >
                        <span className="text-2xl">{t.emoji}</span>
                        <span className="text-[11px] text-slate-500 group-hover:text-slate-900 transition-colors text-center leading-tight">{t.name}</span>
                      </button>
                    ))}
                    <button
                      onClick={() => setStep('form')}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-violet-200 hover:border-violet-300 hover:bg-violet-50 transition-all group"
                    >
                      <span className="text-2xl">✨</span>
                      <span className="text-[11px] text-violet-600 group-hover:text-violet-700 transition-colors">Custom</span>
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleSubmit}
                  className="p-6 space-y-4"
                >
                  {/* Name + Emoji */}
                  <div className="flex gap-3">
                    <div className="w-16">
                      <label className="text-xs text-slate-500 mb-1.5 block">Icon</label>
                      <input
                        type="text"
                        value={form.emoji}
                        onChange={e => set('emoji', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2.5 text-center text-xl focus:outline-none focus:border-violet-500 transition-colors"
                        maxLength={2}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-slate-500 mb-1.5 block">Name *</label>
                      <input
                        required
                        type="text"
                        value={form.name}
                        onChange={e => set('name', e.target.value)}
                        placeholder="e.g. Netflix"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Amount + Cycle */}
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-xs text-slate-500 mb-1.5 block">Amount *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{settings.currencySymbol}</span>
                        <input
                          required
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.amount}
                          onChange={e => set('amount', e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-7 pr-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-500 transition-colors"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-slate-500 mb-1.5 block">Billing Cycle</label>
                      <div className="relative">
                        <select
                          value={form.billingCycle}
                          onChange={e => set('billingCycle', e.target.value)}
                          className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-violet-500 transition-colors cursor-pointer"
                        >
                          {Object.entries(BILLING_CYCLE_LABELS).map(([v, l]) => (
                            <option key={v} value={v} className="bg-white">{l}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="text-xs text-slate-500 mb-1.5 block">Category</label>
                    <div className="relative">
                      <select
                        value={form.category}
                        onChange={e => set('category', e.target.value)}
                        className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-violet-500 transition-colors cursor-pointer"
                      >
                        {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                          <option key={v} value={v} className="bg-white">{l}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="text-xs text-slate-500 mb-1.5 block">Start Date</label>
                    <input
                      type="date"
                      value={form.startDate}
                      max={format(new Date(), 'yyyy-MM-dd')}
                      onChange={e => set('startDate', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>

                  {/* Color */}
                  <div>
                    <label className="text-xs text-slate-500 mb-1.5 block">Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={form.color}
                        onChange={e => set('color', e.target.value)}
                        className="w-10 h-10 rounded-lg border border-white/[0.08] bg-transparent cursor-pointer p-0.5"
                      />
                      <span className="text-xs text-slate-400">{form.color}</span>
                    </div>
                  </div>

                  {/* Website */}
                  <div>
                    <label className="text-xs text-slate-500 mb-1.5 block">Website (optional)</label>
                    <input
                      type="url"
                      value={form.website}
                      onChange={e => set('website', e.target.value)}
                      placeholder="https://example.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-xs text-slate-500 mb-1.5 block">Notes (optional)</label>
                    <textarea
                      value={form.notes}
                      onChange={e => set('notes', e.target.value)}
                      rows={2}
                      placeholder="Add any notes..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    {!editSub && (
                      <button
                        type="button"
                        onClick={() => setStep('pick')}
                        className="px-4 py-2.5 rounded-xl text-sm text-slate-500 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 transition-colors"
                      >
                        Back
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex-1 bg-violet-600 hover:bg-violet-500 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors shadow-lg shadow-violet-500/20"
                    >
                      {editSub ? 'Save Changes' : 'Add Subscription'}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
