import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'

type Role = 'player' | 'admin'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [role, setRole] = useState<Role | null>(null)
  const navigate = useNavigate()
  const { currentUser, registerUser } = useAppStore()

  useEffect(() => {
    if (currentUser) navigate('/dashboard', { replace: true })
  }, [currentUser, navigate])

  const handleSubmit = () => {
    if (!name.trim() || !role) return
    registerUser(name.trim(), role)
    navigate('/dashboard')
  }

  const isValid = name.trim().length > 0 && role !== null

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0f]">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(99,102,241,0.15),_transparent_50%)] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(168,85,247,0.12),_transparent_50%)] animate-[pulse_10s_ease-in-out_infinite_2s]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.08),_transparent_60%)] animate-[pulse_12s_ease-in-out_infinite_4s]" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Title */}
        <h1 className="text-center text-5xl font-bold tracking-tight text-white mb-10">
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(129,140,248,0.4)]">
            ClaudeVote
          </span>
        </h1>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-8 shadow-2xl">
          {/* Name input */}
          <div className="mb-8">
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && isValid && handleSubmit()}
              className="w-full bg-transparent border-b border-white/20 pb-3 text-lg text-white placeholder-white/30 outline-none transition-colors focus:border-indigo-400/60"
            />
          </div>

          {/* Role selection */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              type="button"
              onClick={() => setRole('player')}
              className={`group relative rounded-xl border p-5 text-left transition-all duration-200 cursor-pointer ${
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
              onClick={() => setRole('admin')}
              className={`group relative rounded-xl border p-5 text-left transition-all duration-200 cursor-pointer ${
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
