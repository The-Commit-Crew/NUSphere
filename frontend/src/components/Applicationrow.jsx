function ApplicationRow({ application, onUpdateStatus, updatingId }) {
  const isUpdating = updatingId === application.id
  const isDecided = application.status === 'ACCEPTED' || application.status === 'REJECTED'

  return (
    <div
      style={{ backgroundColor: '#F5F0EB', border: '1px solid #E8E0D8' }}
      className="rounded-lg p-4 flex flex-col gap-2"
    >
      <div className="flex items-center justify-between">
        <span style={{ color: '#1A1512' }} className="text-sm font-medium">
          {application.user?.firstName} {application.user?.lastName}{' '}
          <span style={{ color: '#9A8880' }}>· u/{application.user?.username}</span>
        </span>

        {isDecided ? (
          <span
            style={{
              backgroundColor: application.status === 'ACCEPTED' ? '#EAF3EA' : '#FFF0EB',
              color: application.status === 'ACCEPTED' ? '#3A7D44' : '#C4552A',
              fontSize: '11px',
            }}
            className="px-2 py-1 rounded-full font-medium"
          >
            {application.status}
          </span>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => onUpdateStatus(application.id, 'ACCEPTED')}
              disabled={isUpdating}
              style={{ backgroundColor: '#C4552A', color: '#FFFFFF' }}
              className="px-3 py-1 rounded-full text-xs font-medium hover:opacity-90 disabled:opacity-50"
            >
              {isUpdating ? '...' : 'Accept'}
            </button>
            <button
              onClick={() => onUpdateStatus(application.id, 'REJECTED')}
              disabled={isUpdating}
              style={{ border: '1px solid #E8E0D8', color: '#9A8880' }}
              className="px-3 py-1 rounded-full text-xs font-medium hover:opacity-70 disabled:opacity-50"
            >
              {isUpdating ? '...' : 'Reject'}
            </button>
          </div>
        )}
      </div>

      {application.message && (
        <p style={{ color: '#1A1512' }} className="text-sm leading-relaxed">
          {application.message}
        </p>
      )}

      <span style={{ color: '#9A8880', fontSize: '11px' }}>
        {application.user?.email}
      </span>
    </div>
  )
}

export default ApplicationRow