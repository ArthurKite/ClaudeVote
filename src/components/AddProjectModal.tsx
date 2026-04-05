import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useAppStore } from '../store/useAppStore'
import { db } from '../lib/firebase'
import { doc, onSnapshot } from 'firebase/firestore'

interface AddProjectModalProps {
  onClose: () => void
}

function normalizeUrl(u: string): string {
  return u.trim().toLowerCase().replace(/\/+$/, '')
}

export default function AddProjectModal({ onClose }: AddProjectModalProps) {
  const { currentUser, projects, addProject } = useAppStore()
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [owner, setOwner] = useState('')
  const [demoUrl, setDemoUrl] = useState('')
  const [urlError, setUrlError] = useState('')
  const [demoUrlError, setDemoUrlError] = useState('')
  const [visible, setVisible] = useState(false)
  const [selectOpen, setSelectOpen] = useState(false)
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)

  const [playerNames, setPlayerNames] = useState<string[]>([])

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  // Fetch player list from Firestore in real-time
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'config', 'players'), (snap) => {
      if (snap.exists()) {
        setPlayerNames(snap.data().names ?? [])
      }
    })
    return unsub
  }, [])

  // Build owner options: all players + current user (if not already in the list)
  const ownerOptions = [...playerNames]
  const currentName = currentUser?.name ?? ''
  if (currentName && !ownerOptions.some((n) => n.toLowerCase() === currentName.toLowerCase())) {
    ownerOptions.push(currentName)
  }
  const uniqueOwners = ownerOptions

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(e.target as Node)) {
        setSelectOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 200)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleClose()
  }

  const isValidUrl = (v: string) => /^https?:\/\/.+/.test(v)

  const doAdd = async () => {
    const trimmedDemo = demoUrl.trim()
    await addProject(url.trim(), title.trim(), owner, trimmedDemo || undefined)
    handleClose()
  }

  const handleSubmit = async () => {
    if (!isValidUrl(url)) {
      setUrlError('URL must start with http:// or https://')
      return
    }
    if (demoUrl.trim() && !isValidUrl(demoUrl)) {
      setDemoUrlError('Must be a valid URL starting with http:// or https://')
      return
    }
    if (!title.trim() || !owner) return

    const normalized = normalizeUrl(url)
    const isDuplicate = projects.some((p) => normalizeUrl(p.url) === normalized)
    if (isDuplicate && !showDuplicateWarning) {
      setShowDuplicateWarning(true)
      return
    }
    await doAdd()
  }

  const canSubmit = url.trim() && title.trim() && owner

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
        visible ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0'
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`w-full max-w-md max-h-[90vh] overflow-visible rounded-2xl border border-white/[0.08] bg-[#12121a] shadow-2xl transition-all duration-200 sm:max-h-none sm:mx-0 mx-2 ${
          visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <div className="p-6 overflow-visible">
          <h2 className="text-xl font-bold text-white mb-6">Add a new project</h2>

          {/* URL input */}
          <div className="mb-5">
            <label className="block text-xs font-medium text-white/40 mb-2">Project URL</label>
            <input
              type="text"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setUrlError('') }}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-indigo-400/40"
            />
            {urlError && <p className="text-xs text-red-400 mt-1.5">{urlError}</p>}
          </div>

          {/* Title input */}
          <div className="mb-5">
            <label className="block text-xs font-medium text-white/40 mb-2">Project Title</label>
            <input
              type="text"
              placeholder="My awesome project"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-indigo-400/40"
            />
          </div>

          {/* Owner select */}
          <div className="mb-6 relative z-20">
            <label className="block text-xs font-medium text-white/40 mb-2">Owner</label>
            <div ref={selectRef} className="relative">
              <button
                type="button"
                onClick={() => setSelectOpen(!selectOpen)}
                className={`w-full bg-white/[0.04] border rounded-xl px-4 py-3 text-sm text-left outline-none transition-colors flex items-center justify-between cursor-pointer ${
                  selectOpen ? 'border-indigo-400/40' : 'border-white/[0.08]'
                } ${owner ? 'text-white' : 'text-white/25'}`}
              >
                <span>{owner || 'Select owner'}</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className={`text-white/30 transition-transform duration-200 ${selectOpen ? 'rotate-180' : ''}`}
                >
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {selectOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-white/[0.08] bg-[#1a1a26] shadow-xl overflow-y-auto max-h-48 z-[100]">
                  {uniqueOwners.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => { setOwner(name); setSelectOpen(false) }}
                      className={`w-full px-4 py-2.5 text-sm text-left transition-colors cursor-pointer ${
                        owner === name
                          ? 'bg-indigo-500/15 text-indigo-300'
                          : 'text-white/70 hover:bg-white/[0.06]'
                      }`}
                    >
                      {name}{name === currentUser?.name && name !== 'You' ? '' : name === currentUser?.name ? '' : ''}
                      {name === currentUser?.name ? ' (You)' : ''}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Demo video link (optional) */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-white/40 mb-2">Demo video link</label>
            <input
              type="text"
              placeholder="https://www.loom.com/share/..."
              value={demoUrl}
              onChange={(e) => { setDemoUrl(e.target.value); setDemoUrlError('') }}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-indigo-400/40"
            />
            <p className="text-[11px] text-white/25 mt-1.5">Optional — link to a Loom, YouTube, or other video demo</p>
            {demoUrlError && <p className="text-xs text-red-400 mt-1">{demoUrlError}</p>}
          </div>

          {/* Duplicate warning or buttons */}
          {showDuplicateWarning ? (
            <div>
              <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 mb-4">
                <p className="text-sm text-amber-300">
                  There is already another project with the same link, are you sure you want to continue?
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 rounded-xl border border-white/[0.08] py-3 text-sm font-medium text-white/50 hover:text-white/80 hover:border-white/15 transition-all cursor-pointer"
                >
                  No, cancel
                </button>
                <button
                  type="button"
                  onClick={doAdd}
                  className="flex-1 rounded-xl py-3 text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:brightness-110 transition-all cursor-pointer"
                >
                  Yes, add anyway
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 rounded-xl border border-white/[0.08] py-3 text-sm font-medium text-white/50 hover:text-white/80 hover:border-white/15 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all ${
                  canSubmit
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:brightness-110 cursor-pointer'
                    : 'bg-white/[0.05] text-white/20 cursor-not-allowed'
                }`}
              >
                Add Project
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
