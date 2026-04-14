import type { AxiosInstance } from 'axios'
import type { Wallet } from '../types'

export const walletsApi = (client: AxiosInstance) => ({
  list: () => client.get<Wallet[]>('/api/wallets').then(r => r.data),
  create: (body: { name: string; currency: string; balance: number }) =>
    client.post<Wallet>('/api/wallets', body).then(r => r.data),
  update: (id: string, body: Partial<{ name: string; currency: string; balance: number }>) =>
    client.put<Wallet>(`/api/wallets/${id}`, body).then(r => r.data),
  remove: (id: string) => client.delete(`/api/wallets/${id}`),
})
