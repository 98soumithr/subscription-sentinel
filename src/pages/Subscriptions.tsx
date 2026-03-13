import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Grid3X3, List } from 'lucide-react'
import { useSubscriptionStore } from '@/store/subscriptionStore'
import { SubscriptionCard } from '@/components/subscriptions/SubscriptionCard'
import { SubscriptionModal } from '@/components/subscriptions/SubscriptionModal'
import type { Subscription, Category } from '@/types'
import { CATEGORY_LABELS } from '@/types'
import { cn } from '@/utils/cn'

const categories = ['all', ...Object.keys(CATEGORY_LABELS)] as (Category | 'all')[]

export function Subscriptions() {
  const {
    subscriptions, viewMode, searchQuery, selectedCategory,
    setViewMode, setSearchQuery, setSelectedCategory
  } = useSubscriptionStore()

  const [modalOpen, setModalOpen] = useState(false)
  const [editSub, setEditSub] = useState<Subscription | null>(null)

  const filtered = subscriptions.filter(sub => {
    const matchesSearch = sub.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || sub.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleEdit = (sub: Subscription) => {
    setEditSub(sub)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditSub(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Subscriptions</h1>
          <p className="text-sm text-slate-500 mt-1">
            {subscriptions.length} total &middot; {subscriptions.filter(s => s.isActive).length} active
          </p>
        </div>
        <button
          onClick={() => { setEditSub(null); setModalOpen(true) }}
          className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
            boxShadow: '0 4px 20px rgba(124,58,237,0.35), 0 1px 0 rgba(255,255,255,0.1) inset',
          }}
        >
          <Plus className="w-4 h-4" />
          Add Subscription
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search subscriptions..."
            className="w-full pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 rounded-xl outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
            onFocus={e => {
              e.currentTarget.style.border = '1px solid rgba(124,58,237,0.4)'
              e.currentTarget.style.background = '#FAFAFA'
            }}
            onBlur={e => {
              e.currentTarget.style.border = '1px solid #E2E8F0'
              e.currentTarget.style.background = '#FFFFFF'
            }}
          />
        </div>

        {/* View Toggle */}
        <div
          className="flex p-1 gap-1 rounded-xl"
          style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}
        >
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-2 rounded-lg transition-all',
              viewMode === 'grid'
                ? 'text-violet-700'
                : 'text-slate-400 hover:text-slate-600'
            )}
            style={viewMode === 'grid' ? { background: 'rgba(124,58,237,0.1)' } : undefined}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-2 rounded-lg transition-all',
              viewMode === 'list'
                ? 'text-violet-700'
                : 'text-slate-400 hover:text-slate-600'
            )}
            style={viewMode === 'list' ? { background: 'rgba(124,58,237,0.1)' } : undefined}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => {
          const isActive = selectedCategory === cat
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all"
              style={isActive ? {
                background: 'rgba(124,58,237,0.2)',
                border: '1px solid rgba(124,58,237,0.4)',
                color: '#c4b5fd',
              } : {
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.06)',
                color: '#6b7280',
              }}
            >
              {cat === 'all' ? 'All' : CATEGORY_LABELS[cat as Category]}
            </button>
          )
        })}
      </div>

      {/* Grid / List */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4"
              style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)' }}
            >
              💳
            </div>
            <p className="text-slate-700 font-semibold">No subscriptions found</p>
            <p className="text-slate-400 text-sm mt-1.5">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your filters'
                : 'Add your first subscription to get started'}
            </p>
            {!searchQuery && selectedCategory === 'all' && (
              <button
                onClick={() => { setEditSub(null); setModalOpen(true) }}
                className="mt-5 flex items-center gap-2 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                  boxShadow: '0 4px 20px rgba(124,58,237,0.3)',
                }}
              >
                <Plus className="w-4 h-4" />
                Add Your First
              </button>
            )}
          </motion.div>
        ) : viewMode === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filtered.map((sub, i) => (
              <SubscriptionCard key={sub.id} sub={sub} onEdit={handleEdit} index={i} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            {filtered.map((sub, i) => (
              <ListRow key={sub.id} sub={sub} onEdit={handleEdit} index={i} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <SubscriptionModal open={modalOpen} onClose={handleCloseModal} editSub={editSub} />
    </div>
  )
}

function ListRow({ sub, onEdit, index }: { sub: Subscription; onEdit: (s: Subscription) => void; index: number }) {
  const { deleteSubscription, toggleActive, getMonthlyAmount, getDaysUntilRenewal, settings } = useSubscriptionStore()
  const days = getDaysUntilRenewal(sub)
  const monthly = getMonthlyAmount(sub)

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03, ease: [0.23, 1, 0.32, 1] }}
      className="flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group"
      style={{
        background: sub.isActive ? '#FFFFFF' : '#FAFAFA',
        border: `1px solid ${sub.isActive ? '#E2E8F0' : '#F1F5F9'}`,
        opacity: sub.isActive ? 1 : 0.55,
      }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
        style={{ backgroundColor: `${sub.color}18`, boxShadow: `0 0 0 1px ${sub.color}28` }}
      >
        {sub.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">{sub.name}</p>
        <p className="text-xs text-slate-400">{sub.category}</p>
      </div>
      <div className="text-right hidden sm:block">
        <p className="text-sm font-bold text-slate-900 tabular-nums">
          {settings.currencySymbol}{sub.amount.toFixed(2)}/{ {weekly:'wk',monthly:'mo',quarterly:'3mo',yearly:'yr'}[sub.billingCycle] }
        </p>
        <p className="text-xs text-slate-400">{settings.currencySymbol}{monthly.toFixed(2)}/mo</p>
      </div>
      <div className="text-right hidden md:block w-16">
        <p className="text-[10px] text-slate-400 uppercase tracking-wide">Renews</p>
        <p className={cn(
          'text-xs font-bold tabular-nums',
          days <= 3 ? 'text-red-400' : days <= 7 ? 'text-amber-400' : 'text-emerald-400'
        )}>
          {days <= 0 ? 'Today!' : `${days}d`}
        </p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(sub)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-200 hover:bg-white/[0.07] transition-colors text-xs"
        >✏️</button>
        <button
          onClick={() => toggleActive(sub.id)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-200 hover:bg-white/[0.07] transition-colors text-xs"
        >
          {sub.isActive ? '⏸' : '▶️'}
        </button>
        <button
          onClick={() => deleteSubscription(sub.id)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-500/[0.1] transition-colors text-xs"
        >🗑️</button>
      </div>
    </motion.div>
  )
}
