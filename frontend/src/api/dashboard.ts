import type { AxiosInstance } from 'axios'
import type { MonthlySummary, CategorySpend, BalancePoint } from '../types'

export const dashboardApi = (client: AxiosInstance) => ({
  summary: (year: number, month: number) =>
    client.get<MonthlySummary>('/api/dashboard/summary', { params: { year, month } }).then(r => r.data),
  byCategory: (year: number, month: number) =>
    client.get<CategorySpend[]>('/api/dashboard/by-category', { params: { year, month } }).then(r => r.data),
  balanceHistory: () =>
    client.get<BalancePoint[]>('/api/dashboard/balance-history').then(r => r.data),
})
