import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  onDismiss: () => void
}

export default function Toast({ message, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDismiss, 300)
    }, 3000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-[calc(100%-2rem)] sm:w-auto max-w-md">
      <div
        className={`rounded-xl border border-white/10 bg-white/[0.08] backdrop-blur-xl px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm text-white/90 shadow-2xl transition-all duration-300 text-center ${
          visible
            ? 'translate-y-0 opacity-100'
            : 'translate-y-4 opacity-0'
        }`}
      >
        {message}
      </div>
    </div>
  )
}
