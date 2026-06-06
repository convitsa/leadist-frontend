import { create } from 'zustand'
import type { User } from '../types'

interface AuthState {
  token: string | null
  user: User | null
  isLoading: boolean
  setToken: (token: string | null) => void
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('leadist_token'),
  user: null,
  isLoading: true,
  setToken: (token) => {
    if (token) {
      localStorage.setItem('leadist_token', token)
    } else {
      localStorage.removeItem('leadist_token')
    }
    set({ token })
  },
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => {
    localStorage.removeItem('leadist_token')
    set({ token: null, user: null })
  },
}))
