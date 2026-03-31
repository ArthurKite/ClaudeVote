import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { db } from '../lib/firebase'
import {
  doc,
  onSnapshot,
  collection,
  updateDoc,
} from 'firebase/firestore'

interface SessionData {
  playerName: string
  lastSeen: { toMillis: () => number } | null
}

interface PlayerManagementModalProps {
  onClose: () => void
}

const MAX_PLAYERS = 100

export default function PlayerManagementModal({ onClose }: PlayerManagementModalProps) {
  const [visible, setVisible] = useState(false)
  const [playerNames, setPlayerNames] = useState<string[]>([])
  const [livePlayers, setLivePlayers] = useState<Set<string>>(new Set())
  const [newName, setNewName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  // Real-time player list from Firestore
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'config', 'players'), (snap) => {
      if (snap.exists()) {
        setPlayerNames(snap.data().names ?? [])
      }
      setLoading(false)
    })
    return unsub
  }, [])

  // Real-time sessions for live status
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'sessions'), (snap) => {
      const fiveMinAgo = Date.now() - 5 * 60 * 1000
      const live = new Set<string>()
      snap.docs.forEach((d) => {
        const data = d.data() as SessionData
        const lastSeen = data.lastSeen?.toMillis?.() ?? 0
        if (lastSeen > fiveMinAgo) {
          live.add(data.playerName)
        }
      })
      setLivePlayers(live)
    })
    return unsub
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 200)
  }

  const handleAddPlayer = async () => {
    const trimmed = newName.trim()
    if (!trimmed) return

    if (playerNames.some((n) => n.toLowerCase() === trimmed.toLowerCase())) {
      setError('A player with this name already exists')
      return
    }

    if (playerNames.length >= MAX_PLAYERS) return

    try {
      await updateDoc(doc(db, 'config', 'players'), {
        names: [...playerNames, trimmed],
      })
      setNewName('')
      setError('')
    } catch {
      setError('Failed to add player')
    }
  }

  const atLimit = playerNames.length >= MAX_PLAYERS

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-200 ${
        visible ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0'
      }`}
    >
      {/* Backdrop click layer */}
      <div className="absolute inset-0" onClick={handleClose} />

      {/* Modal card */}
      <div
        className={`relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl border border-white/[0.08] bg-[#12121a] shadow-2xl transition-all duration-200 ${
          visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <div className="p-6 flex flex-col min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Manage Players</h2>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Add player input */}
          <div className="mb-4">
            {atLimit ? (
              <p className="text-amber-400/80 text-sm">Player limit reached (100)</p>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value)
                    setError('')
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                  placeholder="New player name"
                  className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-indigo-500/50 transition-colors"
                />
                <button
                  onClick={handleAddPlayer}
                  disabled={!newName.trim()}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
            )}
            {error && (
              <p className="text-red-400 text-xs mt-2">{error}</p>
            )}
          </div>

          {/* Player list */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
              </div>
            ) : playerNames.length === 0 ? (
              <p className="text-white/30 text-sm text-center py-8">No players yet</p>
            ) : (
              <div className="space-y-0">
                {playerNames.map((name) => {
                  const isLive = livePlayers.has(name)
                  return (
                    <div
                      key={name}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors border-b border-white/[0.04] last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            isLive ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]' : 'bg-white/20'
                          }`}
                        />
                        <span className="text-sm text-white/80">{name}</span>
                        {isLive && (
                          <span className="text-[10px] text-emerald-400/60 uppercase tracking-wider">live</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {/* Edit button */}
                        <button
                          className="w-7 h-7 flex items-center justify-center rounded-md text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all cursor-pointer"
                          title="Rename"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                            <path d="m15 5 4 4" />
                          </svg>
                        </button>
                        {/* Delete button */}
                        <button
                          className="w-7 h-7 flex items-center justify-center rounded-md text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer count */}
          <div className="mt-4 pt-3 border-t border-white/[0.06]">
            <p className="text-xs text-white/30 text-center">
              {playerNames.length} / {MAX_PLAYERS} players
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
