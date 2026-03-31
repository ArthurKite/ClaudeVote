import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { useEffect, useState, type ReactNode } from 'react'
import PlayerManagementModal from './PlayerManagementModal'

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
  const [showPlayerModal, setShowPlayerModal] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  if (!currentUser) return null

  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'superadmin'

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
                {currentUser.role === 'superadmin' ? 'SUPER' : currentUser.role}
              </span>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowPlayerModal(true)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                title="Manage Players"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>
            )}
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

      {showPlayerModal && (
        <PlayerManagementModal onClose={() => setShowPlayerModal(false)} />
      )}
    </div>
  )
}
