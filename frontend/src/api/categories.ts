import type { AxiosInstance } from 'axios'
import type { Category, CategoryType } from '../types'

export const categoriesApi = (client: AxiosInstance) => ({
  list: () => client.get<Category[]>('/api/categories').then(r => r.data),
  create: (body: { name: string; type: CategoryType; icon: string }) =>
    client.post<Category>('/api/categories', body).then(r => r.data),
  update: (id: string, body: Partial<{ name: string; type: CategoryType; icon: string }>) =>
    client.put<Category>(`/api/categories/${id}`, body).then(r => r.data),
  remove: (id: string) => client.delete(`/api/categories/${id}`),
})
