import { useNavigate } from 'react-router-dom'
import { formatSkill } from '../utils/formatSkill'

function Projectlist({ projects, loading, error, page, onChangePage, limit }) {
  const navigate = useNavigate()

  function timeAgo(dateString) {
    const now = new Date()
    const date = new Date(dateString)
    const seconds = Math.floor((now - date) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  function statusStyle(status) {
    if (status === 'OPEN') {
      return { backgroundColor: '#EAF3EA', color: '#3A7D44' }
    }
    if (status === 'IN_PROGRESS') {
      return { backgroundColor: '#FFF3E0', color: '#B8772E' }
    }
    return { backgroundColor: '#F5F0EB', color: '#9A8880' }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <p style={{ color: '#9A8880' }} className="text-sm">Loading projects...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <p style={{ color: '#C4552A' }} className="text-sm">{error}</p>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <p style={{ color: '#9A8880' }} className="text-sm">
          {page === 1 ? 'No projects match your filters.' : 'No more projects.'}
        </p>
      </div>
    )
  }

  const hasNextPage = projects.length === limit

  return (
    <div className="flex-1 flex flex-col gap-3">

      <div className="flex items-center justify-between mb-1">
        <span style={{ color: '#1A1512' }} className="text-sm font-medium">
          {projects.length} project{projects.length !== 1 ? 's' : ''}
        </span>
      </div>

      {projects.map((project) => (
        <div
          key={project.id}
          onClick={() => navigate(`/collaborate/${project.id}`)}
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E0D8' }}
          className="flex gap-4 p-4 rounded-lg hover:opacity-90 cursor-pointer"
        >

          {/* Status column */}
          <div className="flex flex-col items-center gap-1 pt-1" style={{ minWidth: '90px' }}>
            <span
              style={{ ...statusStyle(project.status), fontSize: '10px' }}
              className="px-2 py-1 rounded-full font-medium text-center"
            >
              {project.status?.replace('_', ' ')}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 style={{ color: '#1A1512' }} className="text-sm font-medium mb-1 leading-snug">
              {project.title}
            </h3>
            <p style={{ color: '#9A8880' }} className="text-xs mb-2 leading-relaxed">
              {project.description?.substring(0, 120)}...
            </p>

            <div className="flex items-center gap-2 flex-wrap">
              {project.skills?.map((skill) => (
                <span
                  key={skill.id}
                  style={{ backgroundColor: '#F5F0EB', color: '#9A8880', fontSize: '10px' }}
                  className="px-2 py-0.5 rounded-full font-medium"
                >
                  {formatSkill(skill.name)}
                </span>
              ))}
              <span style={{ color: '#9A8880', fontSize: '11px', marginLeft: 'auto' }}>
                u/{project.author?.username} · 🕐 {timeAgo(project.createdAt)}
              </span>
            </div>
          </div>

        </div>
      ))}

      {/* Pagination */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <button
          onClick={() => onChangePage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          style={{
            border: '1px solid #E8E0D8',
            color: page === 1 ? '#C4B8AE' : '#1A1512',
            backgroundColor: '#FFFFFF',
          }}
          className="px-4 py-1.5 rounded-full text-sm font-medium"
        >
          Previous
        </button>
        <span style={{ color: '#9A8880' }} className="text-sm">
          Page {page}
        </span>
        <button
          onClick={() => onChangePage((p) => p + 1)}
          disabled={!hasNextPage}
          style={{
            border: '1px solid #E8E0D8',
            color: !hasNextPage ? '#C4B8AE' : '#1A1512',
            backgroundColor: '#FFFFFF',
          }}
          className="px-4 py-1.5 rounded-full text-sm font-medium"
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default Projectlist