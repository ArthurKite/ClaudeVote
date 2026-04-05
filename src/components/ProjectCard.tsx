import { useState } from 'react'
import type { Project } from '../types'

interface ProjectCardProps {
  project: Project
  hasVoted: boolean
  onVoteClick: () => void
  isOwner: boolean
  onDelete?: () => void
  onPreview?: () => void
  onEdit?: () => void
}

export default function ProjectCard({ project, hasVoted, onVoteClick, isOwner, onDelete, onPreview, onEdit }: ProjectCardProps) {
  const [imgError, setImgError] = useState(false)

  const truncatedUrl = project.url.replace(/^https?:\/\//, '').slice(0, 40) + (project.url.length > 48 ? '…' : '')

  return (
    <div className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.03] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:border-white/[0.1]">
      {/* Delete button (admin only) */}
      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="absolute top-2 right-2 z-10 w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center transition-all duration-200 cursor-pointer hover:bg-red-500/80 text-white/50 hover:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="stroke-current">
            <path d="M3 4h10M5.5 4V3a1 1 0 011-1h3a1 1 0 011 1v1M6.5 7v4M9.5 7v4M4.5 4l.5 9a1 1 0 001 1h4a1 1 0 001-1l.5-9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {/* Preview button */}
      {onPreview && (
        <button
          onClick={(e) => { e.stopPropagation(); onPreview() }}
          className="absolute top-2 left-2 z-10 w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer hover:bg-black/80 text-white/50 hover:text-white"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="stroke-current">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="3" strokeWidth="1.5" />
          </svg>
        </button>
      )}

      {/* Edit button */}
      {onEdit && (
        <button
          onClick={(e) => { e.stopPropagation(); onEdit() }}
          className="absolute top-2 left-12 sm:left-11 z-10 w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer hover:bg-black/80 text-white/50 hover:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="stroke-current">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="m15 5 4 4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
        <button
          onClick={isOwner ? undefined : onVoteClick}
          disabled={isOwner}
          className={`w-full mt-3 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
            isOwner
              ? 'bg-white/[0.02] text-white/20 border border-white/[0.04] opacity-30 cursor-not-allowed'
              : hasVoted
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.15)] cursor-pointer'
                : 'bg-white/[0.04] text-white/40 border border-white/[0.06] hover:bg-white/[0.08] hover:text-white/60 hover:border-white/[0.1] cursor-pointer'
          }`}
          title={isOwner ? "You can't vote for your own project" : undefined}
        >
          {isOwner ? (
            "You can't vote for your own project"
          ) : hasVoted ? (
            <>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="stroke-current">
                <path d="M3.5 8.5L6.5 11.5L12.5 4.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              You voted for this project
            </>
          ) : (
            'Vote for this project'
          )}
        </button>
      </div>
    </div>
  )
}
