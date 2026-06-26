function DeleteConfirmDialog({ open, onConfirm, onCancel, message }) {
  if (!open) return null

  return (
    <div
      style={{ backgroundColor: 'rgba(26, 21, 18, 0.4)' }}
      className="fixed inset-0 flex items-center justify-center z-50"
      onClick={onCancel}
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
        {/* Close button */}
        <button
          onClick={onCancel}
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

        {/* Title */}
        <h2
          className="font-bold mb-3"
          style={{
            color: '#1A1512',
            fontSize: '22px',
          }}
        >
          Delete comment?
        </h2>

        {/* Description */}
        <p
          className="mb-6"
          style={{
            color: '#6B5B52',
            fontSize: '15px',
            lineHeight: '1.5',
          }}
        >
          {message ||
            "Are you sure you want to delete your comment? You can't undo this."}
        </p>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="transition-all duration-200 hover:scale-105 hover:opacity-90"
            style={{
              backgroundColor: '#F3EEE9',
              color: '#6B5B52',
              borderRadius: '12px',
              padding: '10px 20px',
              fontWeight: '600',
            }}
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="transition-all duration-200 hover:scale-105 hover:brightness-90"
            style={{
              backgroundColor: '#C4552A',
              color: '#FFFFFF',
              borderRadius: '12px',
              padding: '10px 20px',
              fontWeight: '600',
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmDialog