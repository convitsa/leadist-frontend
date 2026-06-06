import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'

export default function Sidebar() {
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-2.5 text-sm transition-colors border-l-2 ${
      isActive
        ? 'border-brand bg-[#2a2a2a] text-text-primary'
        : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-[#2a2a2a]/50'
    }`

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <aside className="w-56 min-h-screen bg-surface border-r border-border flex flex-col shrink-0">
      <div className="px-4 py-6">
        <span className="text-brand font-semibold text-lg tracking-tight">leadist</span>
      </div>
      <nav className="flex-1 space-y-0.5">
        <NavLink to="/dashboard" className={linkClass}>
          Dashboard
        </NavLink>
        <NavLink to="/integrations" className={linkClass}>
          Integrations
        </NavLink>
      </nav>
      <button
        onClick={handleLogout}
        className="m-4 px-4 py-2 text-sm text-text-secondary hover:text-text-primary border border-border rounded-sm transition-colors"
      >
        Logout
      </button>
    </aside>
  )
}
