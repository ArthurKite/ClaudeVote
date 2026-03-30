import { useState, useEffect } from 'react'
import type { Project } from '../types'

interface PreviewModalProps {
  project: Project
  onClose: () => void
}

export default function PreviewModal({ project, onClose }: PreviewModalProps) {
  const [visible, setVisible] = useState(false)
  const [iframeError, setIframeError] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 200)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleClose()
  }

  const truncatedUrl =
    project.url.length > 60
      ? project.url.slice(0, 60) + '…'
      : project.url

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
        visible ? 'bg-black/70 backdrop-blur-sm' : 'bg-black/0'
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`w-[90vw] h-[85vh] flex flex-col rounded-2xl border border-white/[0.08] bg-[#12121a] shadow-2xl transition-all duration-200 ${
          visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] shrink-0">
          <h3 className="text-sm font-semibold text-white truncate max-w-[30%]">
            {project.title}
          </h3>
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/30 hover:text-white/50 transition-colors truncate max-w-[40%]"
          >
            {truncatedUrl}
          </a>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="stroke-current">
              <path d="M4 4l8 8M12 4l-8 8" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Iframe content */}
        <div className="flex-1 overflow-hidden rounded-b-2xl">
          {iframeError ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white/20 stroke-current">
                  <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                  <path d="M15 9l-6 6M9 9l6 6" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-sm text-white/40">This site cannot be previewed</p>
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Open in new tab →
              </a>
            </div>
          ) : (
            <iframe
              src={project.url}
              title={`Preview of ${project.title}`}
              className="w-full h-full border-0"
              onError={() => setIframeError(true)}
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
          )}
        </div>
      </div>
    </div>
  )
}
