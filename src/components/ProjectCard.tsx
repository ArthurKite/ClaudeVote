import { useState, useRef } from 'react'
import type { Project } from '../types'

interface ProjectCardProps {
  project: Project
  hasVoted: boolean
  onToggleVote: () => Promise<string | void>
  onMaxVotes: () => void
  onDelete?: () => void
}

export default function ProjectCard({ project, hasVoted, onToggleVote, onMaxVotes, onDelete }: ProjectCardProps) {
  const [imgError, setImgError] = useState(false)
  const [bouncing, setBouncing] = useState(false)
  const bounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const handleVote = async () => {
    const result = await onToggleVote()
    if (result === 'max_reached') {
      onMaxVotes()
      return
    }
    if (result === 'project_deleted') return
    // Trigger bounce
    setBouncing(true)
    clearTimeout(bounceTimer.current)
    bounceTimer.current = setTimeout(() => setBouncing(false), 300)
  }

  const truncatedUrl = project.url.replace(/^https?:\/\//, '').slice(0, 40) + (project.url.length > 48 ? '…' : '')

  return (
    <div className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.03] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:border-white/[0.1]">
      {/* Delete button (admin only) */}
      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center transition-all duration-200 cursor-pointer hover:bg-red-500/80 text-white/50 hover:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="stroke-current">
            <path d="M3 4h10M5.5 4V3a1 1 0 011-1h3a1 1 0 011 1v1M6.5 7v4M9.5 7v4M4.5 4l.5 9a1 1 0 001 1h4a1 1 0 001-1l.5-9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {/* Thumbnail */}
      <div className="aspect-video bg-white/[0.04] overflow-hidden rounded-t-2xl">
        {imgError ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
            <span className="text-4xl font-bold text-white/30">
              {project.title.charAt(0).toUpperCase()}
            </span>
          </div>
        ) : (
          <img
            src={project.thumbnailUrl}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-white text-sm truncate">{project.title}</h3>
        <p className="text-xs text-white/40 mt-1">{project.owner}</p>
        <p className="text-[11px] text-white/25 mt-0.5 truncate">{truncatedUrl}</p>

        {/* Vote button */}
        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={handleVote}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
              hasVoted
                ? 'bg-indigo-500/20 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.2)]'
                : 'bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white/60'
            }`}
          >
            <span
              className={`inline-block transition-transform duration-300 ${
                bouncing ? 'animate-[voteBounce_0.3s_ease-out]' : ''
              }`}
            >👍</span>
            <span className="font-medium">{project.votes}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
