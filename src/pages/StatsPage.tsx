import { useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'

export default function StatsPage() {
  const { projects } = useAppStore()

  const sorted = useMemo(
    () => [...projects].sort((a, b) => b.votes - a.votes),
    [projects]
  )

  const totalVotes = useMemo(
    () => projects.reduce((sum, p) => sum + p.votes, 0),
    [projects]
  )

  const maxVotes = sorted.length > 0 ? sorted[0].votes : 0
  const leader = sorted.length > 0 ? sorted[0] : null

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white/20 stroke-current">
            <path d="M3 3v18h18" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 16l4-4 4 2 5-6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-lg font-medium text-white/50">No stats yet</p>
        <p className="text-sm text-white/25 mt-1">Projects and votes will appear here</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 sm:mb-8">Stats</h2>

      {/* Summary bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-10">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
          <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-1">Total Projects</p>
          <p className="text-3xl font-bold text-white">{projects.length}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
          <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-1">Total Votes</p>
          <p className="text-3xl font-bold text-white">{totalVotes}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
          <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-1">Leading Project</p>
          <p className="text-xl font-bold text-white truncate">{leader?.title ?? '—'}</p>
          {leader && leader.votes > 0 && (
            <p className="text-xs text-amber-400/80 mt-0.5">{leader.votes} vote{leader.votes !== 1 ? 's' : ''}</p>
          )}
          {leader && leader.votes === 0 && (
            <p className="text-xs text-white/30 mt-0.5">No votes yet</p>
          )}
        </div>
      </div>

      {/* Ranked list — cards on mobile, table on md+ */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03]">
        {/* Desktop header — hidden on mobile */}
        <div className="hidden md:grid grid-cols-[3rem_1fr_6rem_3.5rem_1fr] gap-4 px-5 py-3 border-b border-white/[0.06] text-xs font-medium text-white/30 uppercase tracking-wider">
          <span>#</span>
          <span>Project</span>
          <span>Owner</span>
          <span>Votes</span>
          <span />
        </div>

        {/* Rows */}
        {sorted.map((project, i) => {
          const isFirst = i === 0 && project.votes > 0
          const barWidth = maxVotes > 0 ? (project.votes / maxVotes) * 100 : 0

          return (
            <div
              key={project.id}
              className={`border-b border-white/[0.04] last:border-b-0 transition-colors ${
                isFirst ? 'bg-amber-500/[0.04]' : 'hover:bg-white/[0.02]'
              }`}
              style={{
                animation: `statsRowIn 0.4s ease-out ${i * 0.06}s both`,
              }}
            >
              {/* Mobile layout */}
              <div className="flex md:hidden flex-col gap-2 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`text-sm font-semibold shrink-0 ${isFirst ? 'text-amber-400' : 'text-white/30'}`}>
                      #{i + 1}
                    </span>
                    <span className={`text-sm font-medium truncate ${isFirst ? 'text-white' : 'text-white/80'}`}>
                      {project.title}
                    </span>
                  </div>
                  <span className={`text-sm font-semibold shrink-0 ml-2 ${isFirst ? 'text-amber-400' : 'text-white/60'}`}>
                    {project.votes} vote{project.votes !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-white/40">{project.owner}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isFirst
                          ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                          : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                      }`}
                      style={{
                        width: `${barWidth}%`,
                        animation: `statsBarGrow 0.8s ease-out ${i * 0.06 + 0.2}s both`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Desktop layout */}
              <div className="hidden md:grid grid-cols-[3rem_1fr_6rem_3.5rem_1fr] gap-4 px-5 py-4 items-center">
                <span className={`text-sm font-semibold ${isFirst ? 'text-amber-400' : 'text-white/30'}`}>
                  {i + 1}
                </span>
                <span className={`text-sm font-medium truncate ${isFirst ? 'text-white' : 'text-white/80'}`}>
                  {project.title}
                </span>
                <span className="text-sm text-white/40 truncate">{project.owner}</span>
                <span className={`text-sm font-semibold ${isFirst ? 'text-amber-400' : 'text-white/60'}`}>
                  {project.votes}
                </span>
                <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isFirst
                        ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                        : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                    }`}
                    style={{
                      width: `${barWidth}%`,
                      animation: `statsBarGrow 0.8s ease-out ${i * 0.06 + 0.2}s both`,
                    }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {/* Keyframe animations */}
      <style>{`
        @keyframes statsRowIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes statsBarGrow {
          from { width: 0%; }
        }
      `}</style>
    </div>
  )
}
