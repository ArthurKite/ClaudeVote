import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { db } from '../lib/firebase'
import {
  doc,
  onSnapshot,
  collection,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  runTransaction,
} from 'firebase/firestore'
import { useAppStore } from '../store/useAppStore'

interface SessionInfo {
  id: string
  playerName: string
  role?: string
  isLive: boolean
}

interface PlayerManagementModalProps {
  onClose: () => void
}

const MAX_PLAYERS = 100

export default function PlayerManagementModal({ onClose }: PlayerManagementModalProps) {
  const [visible, setVisible] = useState(false)
  const [playerNames, setPlayerNames] = useState<string[]>([])
  const [sessions, setSessions] = useState<SessionInfo[]>([])
  const [newName, setNewName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingName, setEditingName] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [editError, setEditError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingName, setDeletingName] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const editInputRef = useRef<HTMLInputElement>(null)
  const currentUser = useAppStore((s) => s.currentUser)

  const isSuperAdmin = currentUser?.role === 'superadmin'

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

  // Real-time sessions for live status (players + admins)
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'sessions'), (snap) => {
      const fiveMinAgo = Date.now() - 5 * 60 * 1000
      const sessionList: SessionInfo[] = snap.docs.map((d) => {
        const data = d.data()
        const lastSeen = data.lastSeen?.toMillis?.() ?? 0
        return {
          id: d.id,
          playerName: data.playerName ?? '',
          role: data.role ?? 'player',
          isLive: lastSeen > fiveMinAgo,
        }
      })
      setSessions(sessionList)
    })
    return unsub
  }, [])

  // Auto-focus edit input
  useEffect(() => {
    if (editingName !== null) {
      editInputRef.current?.focus()
      editInputRef.current?.select()
    }
  }, [editingName])

  // Derive live players set and admin sessions
  const livePlayers = new Set(sessions.filter((s) => s.isLive).map((s) => s.playerName))
  const adminSessions = sessions.filter(
    (s) => (s.role === 'admin' || s.role === 'superadmin') && s.isLive
  )

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

  const startEditing = (name: string) => {
    setEditingName(name)
    setEditValue(name)
    setEditError('')
    setDeletingName(null)
  }

  const cancelEditing = () => {
    setEditingName(null)
    setEditValue('')
    setEditError('')
  }

  const handleSaveRename = async () => {
    if (!editingName) return
    const trimmed = editValue.trim()
    if (!trimmed) {
      setEditError('Name cannot be empty')
      return
    }

    if (
      playerNames.some(
        (n) => n.toLowerCase() === trimmed.toLowerCase() && n !== editingName
      )
    ) {
      setEditError('A player with this name already exists')
      return
    }

    if (trimmed === editingName) {
      cancelEditing()
      return
    }

    setSaving(true)
    try {
      const oldName = editingName

      const newNames = playerNames.map((n) => (n === oldName ? trimmed : n))
      await updateDoc(doc(db, 'config', 'players'), { names: newNames })

      const projectsSnap = await getDocs(
        query(collection(db, 'projects'), where('owner', '==', oldName))
      )
      for (const projDoc of projectsSnap.docs) {
        await updateDoc(doc(db, 'projects', projDoc.id), { owner: trimmed })
      }

      const sessionsSnap = await getDocs(
        query(collection(db, 'sessions'), where('playerName', '==', oldName))
      )
      for (const sessDoc of sessionsSnap.docs) {
        await updateDoc(doc(db, 'sessions', sessDoc.id), { playerName: trimmed })
      }

      cancelEditing()
    } catch {
      setEditError('Failed to rename player')
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePlayer = async (name: string) => {
    setDeleting(true)
    try {
      // 1. Remove from config/players (only if they're in the list)
      if (playerNames.includes(name)) {
        const newNames = playerNames.filter((n) => n !== name)
        await updateDoc(doc(db, 'config', 'players'), { names: newNames })
      }

      // 2. Update projects where owner === name → "Deleted player"
      const projectsSnap = await getDocs(
        query(collection(db, 'projects'), where('owner', '==', name))
      )
      for (const projDoc of projectsSnap.docs) {
        await updateDoc(doc(db, 'projects', projDoc.id), { owner: 'Deleted player' })
      }

      // 3. Find sessions for this person, remove their votes
      const sessionsSnap = await getDocs(
        query(collection(db, 'sessions'), where('playerName', '==', name))
      )
      for (const sessDoc of sessionsSnap.docs) {
        const sessionUserId = sessDoc.id
        const voteDocRef = doc(db, 'votes', sessionUserId)
        const voteSnap = await getDoc(voteDocRef)
        if (voteSnap.exists()) {
          const votedProjectIds: string[] = voteSnap.data().projectIds ?? []
          for (const projectId of votedProjectIds) {
            const projectRef = doc(db, 'projects', projectId)
            await runTransaction(db, async (transaction) => {
              const projSnap = await transaction.get(projectRef)
              if (projSnap.exists()) {
                const currentVotes = projSnap.data().votes ?? 0
                transaction.update(projectRef, { votes: Math.max(0, currentVotes - 1) })
              }
            })
          }
          await deleteDoc(voteDocRef)
        }

        // 4. Delete the session doc (triggers kick)
        await deleteDoc(doc(db, 'sessions', sessionUserId))
      }

      setDeletingName(null)
    } catch {
      // Best effort
    } finally {
      setDeleting(false)
    }
  }

  const atLimit = playerNames.length >= MAX_PLAYERS
  const isCurrentUser = (name: string) => currentUser?.name === name

  const renderPlayerRow = (name: string, badge?: string) => {
    const isLive = livePlayers.has(name)
    const isEditing = editingName === name
    const isDeleting = deletingName === name
    const isAdmin = badge === 'ADMIN' || badge === 'SUPER'
    // Only superadmin can manage other admins
    const canManage = isAdmin ? isSuperAdmin : true

    if (isEditing && canManage) {
      return (
        <div
          key={`${badge ?? 'player'}-${name}`}
          className="flex flex-col px-3 py-2.5 rounded-lg bg-white/[0.03] border-b border-white/[0.04] last:border-0"
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full shrink-0 ${
                isLive ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]' : 'bg-white/20'
              }`}
            />
            <input
              ref={editInputRef}
              type="text"
              value={editValue}
              onChange={(e) => {
                setEditValue(e.target.value)
                setEditError('')
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveRename()
                if (e.key === 'Escape') cancelEditing()
              }}
              disabled={saving}
              className="flex-1 bg-white/[0.06] border border-indigo-500/40 rounded px-2 py-1 text-sm text-white outline-none focus:border-indigo-500/70 transition-colors"
            />
            <button
              onClick={handleSaveRename}
              disabled={saving}
              className="w-7 h-7 flex items-center justify-center rounded-md text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer disabled:opacity-30"
              title="Save"
            >
              ✓
            </button>
            <button
              onClick={cancelEditing}
              disabled={saving}
              className="w-7 h-7 flex items-center justify-center rounded-md text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-all cursor-pointer disabled:opacity-30"
              title="Cancel"
            >
              ✕
            </button>
          </div>
          {editError && (
            <p className="text-red-400 text-xs mt-1.5 ml-5">{editError}</p>
          )}
        </div>
      )
    }

    if (isDeleting && canManage) {
      return (
        <div
          key={`${badge ?? 'player'}-${name}`}
          className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-red-500/[0.06] border-b border-white/[0.04] last:border-0"
        >
          <span className="text-sm text-red-300">
            Delete <strong>{name}</strong>?
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDeletePlayer(name)}
              disabled={deleting}
              className="px-3 py-1 rounded-md text-xs font-medium bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-all cursor-pointer disabled:opacity-30"
            >
              {deleting ? 'Deleting...' : 'Yes'}
            </button>
            <button
              onClick={() => setDeletingName(null)}
              disabled={deleting}
              className="px-3 py-1 rounded-md text-xs font-medium text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-all cursor-pointer disabled:opacity-30"
            >
              No
            </button>
          </div>
        </div>
      )
    }

    return (
      <div
        key={`${badge ?? 'player'}-${name}`}
        className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors border-b border-white/[0.04] last:border-0"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-2 h-2 rounded-full shrink-0 ${
              isLive ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]' : 'bg-white/20'
            }`}
          />
          <span className="text-sm text-white/80">{name}</span>
          {badge && (
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
              badge === 'SUPER'
                ? 'bg-amber-500/20 text-amber-300'
                : 'bg-purple-500/20 text-purple-300'
            }`}>
              {badge}
            </span>
          )}
          {isLive && (
            <span className="text-[10px] text-emerald-400/60 uppercase tracking-wider">live</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {canManage && !isAdmin && (
            <button
              onClick={() => startEditing(name)}
              className="w-7 h-7 flex items-center justify-center rounded-md text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all cursor-pointer"
              title="Rename"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
            </button>
          )}
          {canManage && !isCurrentUser(name) && (
            <button
              onClick={() => { setDeletingName(name); setEditingName(null) }}
              className="w-7 h-7 flex items-center justify-center rounded-md text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
              title="Delete"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </button>
          )}
        </div>
      </div>
    )
  }

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

          {/* Player + Admin list */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-0">
                {/* Admin sessions section */}
                {adminSessions.length > 0 && (
                  <>
                    <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-white/30">
                      Admins
                    </div>
                    {[...adminSessions].sort((a, b) => a.playerName.localeCompare(b.playerName, undefined, { sensitivity: 'base' })).map((session) =>
                      renderPlayerRow(
                        session.playerName,
                        session.role === 'superadmin' ? 'SUPER' : 'ADMIN'
                      )
                    )}
                    <div className="px-3 py-2 mt-2 text-[10px] font-semibold uppercase tracking-wider text-white/30">
                      Players
                    </div>
                  </>
                )}

                {/* Player list */}
                {playerNames.length === 0 ? (
                  <p className="text-white/30 text-sm text-center py-8">No players yet</p>
                ) : (
                  [...playerNames].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })).map((name) => renderPlayerRow(name))
                )}
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
