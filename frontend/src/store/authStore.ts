import { create } from 'zustand'
import type { User } from '../types'
import { authApi } from '../services/api'

interface AuthStore {
  user: User | null
  token: string | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  fetchMe: () => Promise<void>
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: true,

  login: async (username, password) => {
    const res = await authApi.login(username, password)
    localStorage.setItem('token', res.access_token)
    set({ token: res.access_token, user: res.user })
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },

  fetchMe: async () => {
    const token = localStorage.getItem('token')
    if (!token) { set({ loading: false }); return }
    try {
      const user = await authApi.me()
      set({ user, loading: false })
    } catch {
      localStorage.removeItem('token')
      set({ user: null, token: null, loading: false })
    }
  },

  isAdmin: () => get().user?.role === 'admin',
}))
