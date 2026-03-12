import { apiClient } from './client'
import type { User } from '../types'

export const authApi = {

  // Verify the stored token + get fresh user data from server
  getMe: () => apiClient<User>('/auth/me'),

  // Tell the server to log out (for cleanup — JWT is stateless
  // so server can't invalidate it, but good practice to call anyway)
  logout: () => apiClient('/auth/logout', { method: 'POST' }),
}