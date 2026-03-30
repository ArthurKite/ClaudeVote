import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { useEffect, useState, type ReactNode } from 'react'

function FadeTransition({ children, locationKey }: { children: ReactNode; locationKey: string }) {
  const [visible, setVisible] = useState(true)
  const [currentChildren, setCurrentChildren] = useState(children)
  const [currentKey, setCurrentKey] = useState(locationKey)

  useEffect(() => {
    if (locationKey !== currentKey) {
      setVisible(false)
      const timer = setTimeout(() => {
        setCurrentChildren(children)
        setCurrentKey(locationKey)
        setVisible(true)
      }, 150)
      return () => clearTimeout(timer)
    } else {
      setCurrentChildren(children)
    }
  }, [locationKey, children, currentKey])

  return (
    <div
      className={`transition-all duration-200 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
      }`}
    >
      {currentChildren}
    </div>
  )
}

export default function Layout() {
  const { currentUser, logout } = useAppStore()
  const navigate = useNavigate()
  const location = useLocation()

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
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 sm:px-6 h-14 sm:h-16 gap-2">
          {/* Left: Logo */}
          <span className="text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 bg-clip-text text-transparent shrink-0">
            ClaudeVote
          </span>

          {/* Center: Nav links */}
          <div className="flex items-center gap-1">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
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
                  `px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
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
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="hidden sm:flex items-center gap-2">
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
              className="text-xs sm:text-sm text-white/40 hover:text-white/80 transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8">
        <FadeTransition locationKey={location.pathname}>
          <Outlet />
        </FadeTransition>
      </main>
    </div>
  )
}
