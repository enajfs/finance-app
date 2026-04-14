export type CategoryType = 'income' | 'expense'
export type TransactionType = 'income' | 'expense'

export interface Wallet {
  id: string
  name: string
  currency: string
  balance: number
  created_at: string
}

export interface Category {
  id: string
  name: string
  type: CategoryType
  icon: string | null
  created_at: string
}

export interface Transaction {
  id: string
  wallet_id: string
  category_id: string
  amount: number
  type: TransactionType
  note: string | null
  date: string
  created_at: string
}

export interface SavingsGoal {
  id: string
  name: string
  target_amount: number
  current_amount: number
  currency: string
  deadline: string | null
  created_at: string
}

export interface MonthlySummary {
  total_income: number
  total_expense: number
  net: number
}

export interface CategorySpend {
  category_id: string
  category_name: string
  icon: string | null
  total: number
}

export interface BalancePoint {
  date: string
  balance: number
  wallet_id: string
  wallet_name: string
}

export interface Theme {
  name: string
  primary: string
  accent: string
  light: string
}
