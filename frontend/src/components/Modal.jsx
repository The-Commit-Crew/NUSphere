import { useEffect } from 'react'

function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return

    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      style={{ backgroundColor: 'rgba(26, 21, 18, 0.4)' }}
      className="fixed inset-0 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md mx-4"
        style={{
          backgroundColor: '#FFFDFC',
          border: '1px solid #E8E0D8',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
        }}
      >
        <button
          onClick={onClose}
          className="absolute flex items-center justify-center transition-all duration-200 hover:scale-105"
          style={{
            top: '16px',
            right: '16px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#F3EEE9',
            color: '#6B5B52',
          }}
        >
          ✕
        </button>

        {title && (
          <h2 className="font-bold mb-4" style={{ color: '#1A1512', fontSize: '22px' }}>
            {title}
          </h2>
        )}

        {children}
      </div>
    </div>
  )
}

export default Modal