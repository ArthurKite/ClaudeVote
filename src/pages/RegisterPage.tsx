import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, getDoc, setDoc, collection, getDocs, Timestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAppStore } from '../store/useAppStore'

type Role = 'player' | 'admin'

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [role, setRole] = useState<Role | null>(null)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [shaking, setShaking] = useState(false)
  const [playerNames, setPlayerNames] = useState<string[]>([])
  const [activeSessions, setActiveSessions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlayer, setSelectedPlayer] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [kickedBanner, setKickedBanner] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { currentUser, registerUser } = useAppStore()

  // Check if player was kicked
  useEffect(() => {
    const kicked = sessionStorage.getItem('claudevote-kicked')
    if (kicked) {
      setKickedBanner(true)
      sessionStorage.removeItem('claudevote-kicked')
    }
  }, [])

  useEffect(() => {
    if (currentUser) navigate('/dashboard', { replace: true })
  }, [currentUser, navigate])

  // Fetch player names and active sessions
  useEffect(() => {
    async function fetchData() {
      try {
        const [playersSnap, sessionsSnap] = await Promise.all([
          getDoc(doc(db, 'config', 'players')),
          getDocs(collection(db, 'sessions')),
        ])
        if (playersSnap.exists()) {
          setPlayerNames(playersSnap.data().names ?? [])
        }
        const activeNames: string[] = []
        const fiveMinAgo = Date.now() - 5 * 60 * 1000
        sessionsSnap.docs.forEach((d) => {
          const data = d.data()
          const lastSeen = data.lastSeen?.toMillis?.() ?? 0
          if (lastSeen > fiveMinAgo) {
            activeNames.push(data.playerName)
          }
        })
        setActiveSessions(activeNames)
      } catch {
        // If fetch fails, allow registration anyway
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSubmit = async () => {
    if (role === 'admin') {
      if (!name.trim() || !password) return
      // Hash and compare
      const inputHash = await sha256(password)
      const adminDoc = await getDoc(doc(db, 'config', 'adminPassword'))
      const storedHash = adminDoc.exists() ? adminDoc.data().hash : null
      if (inputHash !== storedHash) {
        setPasswordError('Wrong password')
        setShaking(true)
        setTimeout(() => setShaking(false), 500)
        return
      }
      const adminRole = name.trim().toLowerCase() === 'arthur' ? 'superadmin' as const : 'admin' as const
      registerUser(name.trim(), adminRole)
    } else if (role === 'player') {
      if (!selectedPlayer) return
      // Write session doc
      const userId = crypto.randomUUID()
      await setDoc(doc(db, 'sessions', userId), {
        userId,
        playerName: selectedPlayer,
        lastSeen: Timestamp.now(),
      })
      // Store session ID for cleanup on logout
      sessionStorage.setItem('claudevote-session-id', userId)
      registerUser(selectedPlayer, 'player')
    }
    navigate('/dashboard')
  }

  const isValid =
    role === 'admin'
      ? name.trim().length > 0 && password.length > 0
      : role === 'player'
        ? selectedPlayer.length > 0
        : false

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0f]">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(99,102,241,0.15),_transparent_50%)] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(168,85,247,0.12),_transparent_50%)] animate-[pulse_10s_ease-in-out_infinite_2s]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.08),_transparent_60%)] animate-[pulse_12s_ease-in-out_infinite_4s]" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4 sm:px-6">
        {/* Title */}
        <h1 className="text-center text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6 sm:mb-10">
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(129,140,248,0.4)]">
            ClaudeVote
          </span>
        </h1>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-5 sm:p-8 shadow-2xl">
          {/* Kicked banner */}
          {kickedBanner && (
            <div className="mb-5 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 flex items-center gap-3">
              <span className="text-red-400 text-sm">⚠️</span>
              <span className="text-sm text-red-300">You have been removed by an admin.</span>
              <button
                onClick={() => setKickedBanner(false)}
                className="ml-auto text-red-400/50 hover:text-red-400 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Role selection */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <button
              type="button"
              onClick={() => { setRole('player'); setName(''); setPassword(''); setPasswordError(''); }}
              className={`group relative rounded-xl border p-3 sm:p-5 text-left transition-all duration-200 cursor-pointer ${
                role === 'player'
                  ? 'border-indigo-400/50 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.15)]'
                  : 'border-white/[0.08] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]'
              }`}
            >
              <div className="text-2xl mb-2">🎮</div>
              <div className={`font-semibold text-sm ${role === 'player' ? 'text-indigo-300' : 'text-white/80'}`}>
                Player
              </div>
              <div className="text-xs text-white/40 mt-1">Vote for your favorites</div>
            </button>

            <button
              type="button"
              onClick={() => { setRole('admin'); setSelectedPlayer(''); }}
              className={`group relative rounded-xl border p-3 sm:p-5 text-left transition-all duration-200 cursor-pointer ${
                role === 'admin'
                  ? 'border-purple-400/50 bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                  : 'border-white/[0.08] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]'
              }`}
            >
              <div className="text-2xl mb-2">🛠️</div>
              <div className={`font-semibold text-sm ${role === 'admin' ? 'text-purple-300' : 'text-white/80'}`}>
                Admin
              </div>
              <div className="text-xs text-white/40 mt-1">Manage submissions</div>
            </button>
          </div>

          {/* Player: dropdown */}
          {role === 'player' && (
            <div className="mb-8">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="w-5 h-5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                </div>
              ) : (
                <div ref={dropdownRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={`w-full bg-transparent border-b pb-3 text-lg text-left outline-none transition-colors flex items-center justify-between cursor-pointer ${
                      dropdownOpen ? 'border-indigo-400/60' : 'border-white/20'
                    } ${selectedPlayer ? 'text-white' : 'text-white/30'}`}
                  >
                    <span>{selectedPlayer || 'Select your name'}</span>
                    <svg
                      width="16" height="16" viewBox="0 0 16 16" fill="none"
                      className={`text-white/30 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                    >
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {dropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-white/[0.08] bg-[#1a1a26] shadow-xl overflow-hidden z-10">
                      {playerNames.map((pName) => {
                        const inUse = activeSessions.includes(pName)
                        return (
                          <button
                            key={pName}
                            type="button"
                            disabled={inUse}
                            onClick={() => { setSelectedPlayer(pName); setDropdownOpen(false) }}
                            className={`w-full px-4 py-3 text-sm text-left transition-colors ${
                              inUse
                                ? 'text-white/25 cursor-not-allowed'
                                : selectedPlayer === pName
                                  ? 'bg-indigo-500/15 text-indigo-300 cursor-pointer'
                                  : 'text-white/70 hover:bg-white/[0.06] cursor-pointer'
                            }`}
                          >
                            {pName}
                            {inUse && <span className="ml-2 text-xs text-white/20">(in use)</span>}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Admin: name + password */}
          {role === 'admin' && (
            <div className="mb-8 space-y-5">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent border-b border-white/20 pb-3 text-lg text-white placeholder-white/30 outline-none transition-colors focus:border-purple-400/60"
              />
              <div>
                <input
                  type="password"
                  placeholder="Admin password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPasswordError('') }}
                  onKeyDown={(e) => e.key === 'Enter' && isValid && handleSubmit()}
                  className={`w-full bg-transparent border-b pb-3 text-lg text-white placeholder-white/30 outline-none transition-colors focus:border-purple-400/60 ${
                    passwordError ? 'border-red-400/60' : 'border-white/20'
                  } ${shaking ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
                />
                {passwordError && (
                  <p className="text-xs text-red-400 mt-2">{passwordError}</p>
                )}
              </div>
            </div>
          )}

          {/* No role selected: show placeholder input */}
          {!role && (
            <div className="mb-8">
              <input
                type="text"
                placeholder="Select a role first"
                disabled
                className="w-full bg-transparent border-b border-white/10 pb-3 text-lg text-white/20 placeholder-white/15 outline-none cursor-not-allowed"
              />
            </div>
          )}

          {/* Submit button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid}
            className={`w-full rounded-xl py-3.5 text-sm font-semibold tracking-wide transition-all duration-200 ${
              isValid
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:brightness-110 cursor-pointer'
                : 'bg-white/[0.05] text-white/20 cursor-not-allowed'
            }`}
          >
            Enter
          </button>
        </div>
      </div>
    </div>
  )
}
