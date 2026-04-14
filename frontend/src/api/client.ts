import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export const apiClient = axios.create({ baseURL: API_URL })

// Hook to get an axios instance with the Clerk token attached
export function useApiClient() {
  const { getToken } = useAuth()

  const client = axios.create({ baseURL: API_URL })

  client.interceptors.request.use(async (config) => {
    const token = await getToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })

  return client
}
