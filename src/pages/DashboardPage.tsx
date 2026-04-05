import { useState, useCallback } from 'react'
import { useAppStore } from '../store/useAppStore'
import ProjectCard from '../components/ProjectCard'
import Toast from '../components/Toast'
import AddProjectModal from '../components/AddProjectModal'
import ConfirmModal from '../components/ConfirmModal'
import PreviewModal from '../components/PreviewModal'
import EditProjectModal from '../components/EditProjectModal'
import UnvoteModal from '../components/UnvoteModal'
import type { Project } from '../types'

export default function DashboardPage() {
  const { currentUser, projects, toggleVote, deleteProject, getVotesForUser } = useAppStore()
  const [toast, setToast] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null)
  const [previewProject, setPreviewProject] = useState<Project | null>(null)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [unvoteTarget, setUnvoteTarget] = useState<{ id: string; title: string } | null>(null)

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin'
  const isSuperAdmin = currentUser?.role === 'superadmin'

  const userVotes = currentUser ? getVotesForUser(currentUser.id) : []
  const votesUsed = userVotes.length

  const showToast = useCallback((msg: string) => setToast(msg), [])
  const dismissToast = useCallback(() => setToast(null), [])

  const handleVoteClick = async (project: Project) => {
    const hasVoted = userVotes.includes(project.id)
    if (hasVoted) {
      // Open unvote confirmation
      setUnvoteTarget({ id: project.id, title: project.title })
    } else {
      // Vote directly
      const result = await toggleVote(project.id)
      if (result === 'max_reached') {
        showToast("You've used all 3 votes! Remove a vote to vote again.")
      } else if (result === 'project_deleted') {
        showToast('This project was just deleted.')
      }
    }
  }

  const handleUnvoteConfirm = async () => {
    if (!unvoteTarget) return
    await toggleVote(unvoteTarget.id)
    setUnvoteTarget(null)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5 sm:mb-8">
        <div className="flex items-center gap-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Projects</h2>
          {/* Votes used indicator */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    i < votesUsed
                      ? 'bg-indigo-400 shadow-[0_0_6px_rgba(129,140,248,0.5)]'
                      : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-white/30 hidden sm:inline">
              {votesUsed}/3 votes
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:brightness-110 transition-all duration-200 cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="stroke-current sm:w-4 sm:h-4">
            <path d="M8 3v10M3 8h10" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="hidden sm:inline">Add Project</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Grid or empty state */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white/20 stroke-current">
              <path d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" strokeWidth="1.5" />
              <path d="M3 7l9 6 9-6" strokeWidth="1.5" />
            </svg>
          </div>
          <p className="text-lg font-medium text-white/50">No projects yet</p>
          <p className="text-sm text-white/25 mt-1">Click Add Project to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              hasVoted={userVotes.includes(project.id)}
              onVoteClick={() => handleVoteClick(project)}
              onDelete={isAdmin ? () => setDeleteTarget({ id: project.id, title: project.title }) : undefined}
              onPreview={() => setPreviewProject(project)}
              onEdit={
                isSuperAdmin || currentUser?.name === project.owner
                  ? () => setEditingProject(project)
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {/* Add Project Modal */}
      {showModal && <AddProjectModal onClose={() => setShowModal(false)} />}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <ConfirmModal
          title="Delete this project?"
          subtitle={deleteTarget.title}
          confirmLabel="Delete"
          onConfirm={() => { deleteProject(deleteTarget.id); setDeleteTarget(null) }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Preview Modal */}
      {previewProject && (
        <PreviewModal project={previewProject} onClose={() => setPreviewProject(null)} />
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <EditProjectModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onSessionChanged={() => showToast('Your session was updated. Please try again.')}
        />
      )}

      {/* Unvote Confirm Modal */}
      {unvoteTarget && (
        <UnvoteModal
          projectTitle={unvoteTarget.title}
          onConfirm={handleUnvoteConfirm}
          onCancel={() => setUnvoteTarget(null)}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast} onDismiss={dismissToast} />}
    </div>
  )
}
