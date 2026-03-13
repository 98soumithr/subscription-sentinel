export type BillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'yearly'

export type Category =
  | 'entertainment'
  | 'productivity'
  | 'health'
  | 'education'
  | 'finance'
  | 'shopping'
  | 'utilities'
  | 'gaming'
  | 'news'
  | 'other'

export interface Subscription {
  id: string
  name: string
  amount: number
  currency: string
  billingCycle: BillingCycle
  category: Category
  startDate: string
  nextRenewalDate: string
  color: string
  emoji: string
  website?: string
  notes?: string
  isActive: boolean
  reminderDays: number
  createdAt: string
  updatedAt: string
}

export interface Settings {
  currency: string
  currencySymbol: string
  notificationsEnabled: boolean
  reminderDays: number
  theme: 'dark'
}

export type ViewMode = 'grid' | 'list'

export interface SpendingByCategory {
  category: Category
  amount: number
  count: number
}

export interface MonthlySpend {
  month: string
  amount: number
}

export const CATEGORY_LABELS: Record<Category, string> = {
  entertainment: 'Entertainment',
  productivity: 'Productivity',
  health: 'Health & Fitness',
  education: 'Education',
  finance: 'Finance',
  shopping: 'Shopping',
  utilities: 'Utilities',
  gaming: 'Gaming',
  news: 'News & Media',
  other: 'Other',
}

export const CATEGORY_COLORS: Record<Category, string> = {
  entertainment: '#f472b6',
  productivity: '#60a5fa',
  health: '#34d399',
  education: '#fbbf24',
  finance: '#a78bfa',
  shopping: '#fb923c',
  utilities: '#94a3b8',
  gaming: '#f87171',
  news: '#38bdf8',
  other: '#6b7280',
}

export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
}

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
]

export const POPULAR_SUBSCRIPTIONS = [
  { name: 'Netflix', emoji: '🎬', color: '#e50914', category: 'entertainment' as Category },
  { name: 'Spotify', emoji: '🎵', color: '#1db954', category: 'entertainment' as Category },
  { name: 'Apple TV+', emoji: '📺', color: '#555555', category: 'entertainment' as Category },
  { name: 'Disney+', emoji: '🏰', color: '#113ccf', category: 'entertainment' as Category },
  { name: 'Hulu', emoji: '📡', color: '#3dba00', category: 'entertainment' as Category },
  { name: 'YouTube Premium', emoji: '▶️', color: '#ff0000', category: 'entertainment' as Category },
  { name: 'Amazon Prime', emoji: '📦', color: '#ff9900', category: 'shopping' as Category },
  { name: 'iCloud', emoji: '☁️', color: '#3478f6', category: 'utilities' as Category },
  { name: 'Google One', emoji: '🔵', color: '#4285f4', category: 'utilities' as Category },
  { name: 'Notion', emoji: '📝', color: '#ffffff', category: 'productivity' as Category },
  { name: 'Adobe CC', emoji: '🎨', color: '#ff0000', category: 'productivity' as Category },
  { name: 'ChatGPT Plus', emoji: '🤖', color: '#10a37f', category: 'productivity' as Category },
  { name: 'GitHub Copilot', emoji: '🐱', color: '#6e40c9', category: 'productivity' as Category },
  { name: 'Figma', emoji: '✏️', color: '#f24e1e', category: 'productivity' as Category },
  { name: 'Xbox Game Pass', emoji: '🎮', color: '#107c10', category: 'gaming' as Category },
  { name: 'PlayStation Plus', emoji: '🕹️', color: '#003087', category: 'gaming' as Category },
  { name: 'NY Times', emoji: '📰', color: '#000000', category: 'news' as Category },
  { name: 'Duolingo Plus', emoji: '🦉', color: '#58cc02', category: 'education' as Category },
  { name: 'Headspace', emoji: '🧘', color: '#ff5b35', category: 'health' as Category },
  { name: 'Custom', emoji: '✨', color: '#7c3aed', category: 'other' as Category },
]
