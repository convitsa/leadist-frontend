import { useEffect } from 'react'
import api from '../api/axios'
import { useAuthStore } from '../store/auth'
import type { User } from '../types'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setToken, setUser, logout, setLoading } = useAuthStore()

  useEffect(() => {
    const init = async () => {
      const stored = localStorage.getItem('leadist_token')
      if (stored) {
        setToken(stored)
        try {
          const { data } = await api.get<User>('/auth/me')
          setUser(data)
        } catch {
          logout()
        }
      }
      setLoading(false)
    }
    init()
  }, [setToken, setUser, logout, setLoading])

  return <>{children}</>
}
