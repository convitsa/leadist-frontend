import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuthStore } from '../store/auth'
import type { AuthResponse, User } from '../types'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setToken, setUser } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post<AuthResponse>('/auth/register', { email, password })
      setToken(data.token)
      const me = await api.get<User>('/auth/me')
      setUser(me.data)
      navigate('/dashboard')
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { detail?: string } } }
        setError(axiosErr.response?.data?.detail || 'Registration failed')
      } else {
        setError('Registration failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <p className="text-brand font-semibold text-xl text-center mb-8">leadist</p>
        <div className="bg-surface border border-border rounded-sm p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-6">Create your account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full px-3 py-2.5 rounded-sm text-sm"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full px-3 py-2.5 rounded-sm text-sm"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-brand text-white font-medium rounded-sm hover:bg-brand/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Get started'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-brand hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
