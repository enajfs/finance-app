import type { AxiosInstance } from 'axios'
import type { SavingsGoal } from '../types'

interface GoalBody {
  name: string
  target_amount: number
  current_amount: number
  currency: string
  deadline?: string | null
}

export const savingsGoalsApi = (client: AxiosInstance) => ({
  list: () => client.get<SavingsGoal[]>('/api/savings-goals').then(r => r.data),
  create: (body: GoalBody) =>
    client.post<SavingsGoal>('/api/savings-goals', body).then(r => r.data),
  update: (id: string, body: Partial<GoalBody>) =>
    client.put<SavingsGoal>(`/api/savings-goals/${id}`, body).then(r => r.data),
  remove: (id: string) => client.delete(`/api/savings-goals/${id}`),
})
