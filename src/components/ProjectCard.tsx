import { useState } from 'react'
import type { Project } from '../types'

interface ProjectCardProps {
  project: Project
  hasVoted: boolean
  onToggleVote: () => string | void
  onMaxVotes: () => void
}

export default function ProjectCard({ project, hasVoted, onToggleVote, onMaxVotes }: ProjectCardProps) {
  const [imgError, setImgError] = useState(false)

  const handleVote = () => {
    const result = onToggleVote()
    if (result === 'max_reached') onMaxVotes()
  }

  const truncatedUrl = project.url.replace(/^https?:\/\//, '').slice(0, 40) + (project.url.length > 48 ? '…' : '')

  return (
    <div className="group rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:border-white/[0.1]">
      {/* Thumbnail */}
      <div className="aspect-video bg-white/[0.04] overflow-hidden">
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
            <span>👍</span>
            <span className="font-medium">{project.votes}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
