import { useState, useEffect } from 'react'
import type { Project } from '../types'

interface PreviewModalProps {
  project: Project
  onClose: () => void
}

export default function PreviewModal({ project, onClose }: PreviewModalProps) {
  const [visible, setVisible] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 200)
  }

  const truncatedUrl =
    project.url.length > 60
      ? project.url.slice(0, 60) + '…'
      : project.url

  // Use Microlink to get a high-res screenshot preview
  const screenshotUrl = `https://api.microlink.io/?url=${encodeURIComponent(project.url)}&screenshot=true&meta=false&embed=screenshot.url&screenshot.width=1280&screenshot.height=800`

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 transition-all duration-200 ${
        visible ? 'bg-black/70 backdrop-blur-sm' : 'bg-black/0'
      }`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
    >
      {/* Modal card */}
      <div
        className={`relative w-full sm:w-[90vw] h-[95vh] sm:h-[85vh] flex flex-col rounded-xl sm:rounded-2xl border border-white/[0.08] bg-[#12121a] shadow-2xl transition-all duration-200 ${
          visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 border-b border-white/[0.06] shrink-0 gap-2">
          <h3 className="text-xs sm:text-sm font-semibold text-white truncate min-w-0">
            {project.title}
          </h3>
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:block text-xs text-white/30 hover:text-white/50 transition-colors truncate min-w-0"
          >
            {truncatedUrl}
          </a>
          <button
            onClick={handleClose}
            className="w-9 h-9 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-all cursor-pointer shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="stroke-current">
              <path d="M4 4l8 8M12 4l-8 8" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Screenshot preview */}
        <div className="flex-1 overflow-auto rounded-b-2xl relative">
          {loading && !imgError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                <p className="text-xs text-white/30">Loading preview…</p>
              </div>
            </div>
          )}

          {imgError ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white/20 stroke-current">
                  <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                  <path d="M15 9l-6 6M9 9l6 6" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-sm text-white/40">Preview unavailable</p>
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
            <img
              src={screenshotUrl}
              alt={`Preview of ${project.title}`}
              className={`w-full h-auto transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
              onLoad={() => setLoading(false)}
              onError={() => { setImgError(true); setLoading(false) }}
            />
          )}

          {/* Open in new tab floating button */}
          {!imgError && !loading && (
            <div className="sticky bottom-4 flex justify-center pb-2">
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-indigo-500/90 hover:bg-indigo-500 text-white text-sm font-medium shadow-lg shadow-black/30 backdrop-blur-sm transition-all"
              >
                Open in new tab →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
