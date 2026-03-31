import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface PlayerManagementModalProps {
  onClose: () => void
}

export default function PlayerManagementModal({ onClose }: PlayerManagementModalProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 200)
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
        className={`relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#12121a] shadow-2xl transition-all duration-200 ${
          visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <div className="p-6">
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

          {/* Placeholder content */}
          <p className="text-white/40 text-sm text-center py-8">
            Player management coming soon...
          </p>
        </div>
      </div>
    </div>,
    document.body
  )
}
