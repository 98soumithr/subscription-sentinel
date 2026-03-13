import { cn } from '@/utils/cn'
import type { Category } from '@/types'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/types'

interface BadgeProps {
  category: Category
  className?: string
}

export function CategoryBadge({ category, className }: BadgeProps) {
  const color = CATEGORY_COLORS[category]
  return (
    <span
      className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide', className)}
      style={{ backgroundColor: `${color}22`, color, border: `1px solid ${color}44` }}
    >
      {CATEGORY_LABELS[category]}
    </span>
  )
}

interface StatusBadgeProps {
  isActive: boolean
  className?: string
}

export function StatusBadge({ isActive, className }: StatusBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold',
      isActive
        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
        : 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
      className
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full', isActive ? 'bg-emerald-400' : 'bg-gray-500')} />
      {isActive ? 'Active' : 'Paused'}
    </span>
  )
}
