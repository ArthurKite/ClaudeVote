import { useState, useEffect } from 'react'

interface ConfirmModalProps {
  title: string
  subtitle?: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({
  title,
  subtitle,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const handleClose = (action: 'confirm' | 'cancel') => {
    setVisible(false)
    setTimeout(() => {
      if (action === 'confirm') onConfirm()
      else onCancel()
    }, 200)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleClose('cancel')
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
        visible ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0'
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#12121a] shadow-2xl transition-all duration-200 ${
          visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <div className="p-6">
          <h2 className="text-lg font-bold text-white mb-1">{title}</h2>
          {subtitle && (
            <p className="text-sm text-white/40 mb-6 truncate">{subtitle}</p>
          )}

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => handleClose('cancel')}
              className="flex-1 rounded-xl border border-white/[0.08] py-3 text-sm font-medium text-white/50 hover:text-white/80 hover:border-white/15 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleClose('confirm')}
              className="flex-1 rounded-xl py-3 text-sm font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:brightness-110 transition-all cursor-pointer"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
