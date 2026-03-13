import type { Settings } from '@/types'

export function formatCurrency(amount: number, settings: Settings): string {
  return `${settings.currencySymbol}${amount.toFixed(2)}`
}

export function formatCurrencyCompact(amount: number, settings: Settings): string {
  if (amount >= 1000) {
    return `${settings.currencySymbol}${(amount / 1000).toFixed(1)}k`
  }
  return `${settings.currencySymbol}${amount.toFixed(2)}`
}
