import type { AxiosInstance } from 'axios'
import type { Transaction, TransactionType } from '../types'

interface TransactionFilters {
  wallet_id?: string
  category_id?: string
  from_date?: string
  to_date?: string
}

interface TransactionBody {
  wallet_id: string
  category_id: string
  amount: number
  type: TransactionType
  note?: string
  date: string
}

export const transactionsApi = (client: AxiosInstance) => ({
  list: (filters?: TransactionFilters) =>
    client.get<Transaction[]>('/api/transactions', { params: filters }).then(r => r.data),
  create: (body: TransactionBody) =>
    client.post<Transaction>('/api/transactions', body).then(r => r.data),
  update: (id: string, body: Partial<TransactionBody>) =>
    client.put<Transaction>(`/api/transactions/${id}`, body).then(r => r.data),
  remove: (id: string) => client.delete(`/api/transactions/${id}`),
})
