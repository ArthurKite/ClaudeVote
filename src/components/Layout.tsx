import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'

export default function Layout() {
  const { currentUser, logout } = useAppStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (!currentUser) return null

  const isAdmin = currentUser.role === 'admin'

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Navbar */}
      <nav className="border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 h-16">
          {/* Left: Logo */}
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
            ClaudeVote
          </span>

          {/* Center: Nav links */}
          <div className="flex items-center gap-1">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-white bg-white/[0.08] shadow-[0_0_12px_rgba(129,140,248,0.15)]'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
                }`
              }
            >
              Dashboard
            </NavLink>
            {isAdmin && (
              <NavLink
                to="/stats"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-white bg-white/[0.08] shadow-[0_0_12px_rgba(129,140,248,0.15)]'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
                  }`
                }
              >
                Stats
              </NavLink>
            )}
          </div>

          {/* Right: User info + Logout */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/70">{currentUser.name}</span>
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  isAdmin
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'bg-indigo-500/20 text-indigo-300'
                }`}
              >
                {currentUser.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-white/40 hover:text-white/80 transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
