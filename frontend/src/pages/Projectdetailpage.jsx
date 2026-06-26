import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getProjectById,
  applyToProject,
  getProjectApplications,
  updateApplicationStatus,
} from '../services/Authservice'
import ApplicationRow from "../components/Applicationrow";

function statusStyle(status) {
  if (status === 'OPEN') {
    return { backgroundColor: '#EAF3EA', color: '#3A7D44' }
  }
  if (status === 'IN_PROGRESS') {
    return { backgroundColor: '#FFF3E0', color: '#B8772E' }
  }
  return { backgroundColor: '#F5F0EB', color: '#9A8880' }
}

function Projectdetailpage() {
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [applications, setApplications] = useState([])
  const [applicationsLoading, setApplicationsLoading] = useState(false)
  const [applicationsError, setApplicationsError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  const [showApplyForm, setShowApplyForm] = useState(false)
  const [applyMessage, setApplyMessage] = useState('')
  const [applySubmitting, setApplySubmitting] = useState(false)
  const [applyError, setApplyError] = useState('')
  const [hasApplied, setHasApplied] = useState(false)

  const { id } = useParams()
  const navigate = useNavigate()
  const { token, user } = useAuth()

  const isAuthor = user && project && user.username === project.author?.username

  useEffect(() => {
    async function fetchProject() {
      setLoading(true)
      setError('')
      try {
        const projectData = await getProjectById(id)
        setProject(projectData)
      } catch (err) {
        setError('Failed to load project')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProject()
  }, [id])

  useEffect(() => {
    if (!isAuthor) return
    async function fetchApplications() {
      setApplicationsLoading(true)
      setApplicationsError('')
      try {
        const data = await getProjectApplications(id, token)
        setApplications(data)
      } catch (err) {
        setApplicationsError('Failed to load applications')
        console.error(err)
      } finally {
        setApplicationsLoading(false)
      }
    }
    fetchApplications()
  }, [isAuthor, id, token])

  async function handleApply() {
    setApplySubmitting(true)
    setApplyError('')
    try {
      await applyToProject(id, { message: applyMessage }, token)
      setHasApplied(true)
      setShowApplyForm(false)
    } catch (err) {
      setApplyError(err.message)
    } finally {
      setApplySubmitting(false)
    }
  }

  async function handleUpdateStatus(applicationId, status) {
    setUpdatingId(applicationId)
    try {
      await updateApplicationStatus(applicationId, { status }, token)
      setApplications((prev) =>
        prev.map((app) => (app.id === applicationId ? { ...app, status } : app))
      )
    } catch (err) {
      setApplicationsError(err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p style={{ color: '#9A8880' }}>Loading project...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <p style={{ color: '#C4552A' }}>{error}</p>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center py-20">
        <p style={{ color: '#9A8880' }}>Project not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">

      <div
        style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E0D8' }}
        className="rounded-lg p-6 mb-6"
      >
        <div className="flex items-center gap-3 mb-3">
          <span
            style={{ ...statusStyle(project.status), fontSize: '11px' }}
            className="px-3 py-1 rounded-full font-medium"
          >
            {project.status?.replace('_', ' ')}
          </span>
          {isAuthor && (
            <button
              onClick={() => navigate(`/collaborate/${id}/edit`)}
              style={{ color: '#9A8880' }}
              className="text-xs hover:underline ml-auto"
            >
              Edit project
            </button>
          )}
        </div>

        <h1 style={{ color: '#1A1512' }} className="text-2xl font-bold mb-4">
          {project.title}
        </h1>

        <p style={{ color: '#1A1512' }} className="mb-6 whitespace-pre-wrap leading-relaxed">
          {project.description}
        </p>

        <div className="flex items-center gap-2 flex-wrap mb-6">
          {project.skills?.map((skill) => (
            <span
              key={skill.id}
              style={{ backgroundColor: '#F5F0EB', color: '#9A8880' }}
              className="px-3 py-1 rounded-full text-sm font-medium"
            >
              {skill.name}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <span style={{ color: '#9A8880' }} className="text-sm">
            u/{project.author?.username} · {project.applicationCount ?? 0} applicant
            {project.applicationCount === 1 ? '' : 's'}
          </span>

          {/* Apply section — only for non-authors */}
          {!isAuthor && (
            <div>
              {!token && (
                <span style={{ color: '#9A8880' }} className="text-sm">
                  Log in to apply
                </span>
              )}

              {token && hasApplied && (
                <span style={{ color: '#3A7D44' }} className="text-sm font-medium">
                  Applied ✓
                </span>
              )}

              {token && !hasApplied && !showApplyForm && (
                <button
                  onClick={() => setShowApplyForm(true)}
                  style={{ backgroundColor: '#C4552A', color: '#FFFFFF' }}
                  className="px-4 py-2 rounded-full text-sm font-medium hover:opacity-90"
                >
                  Apply to this project
                </button>
              )}
            </div>
          )}
        </div>

        {/* Apply form */}
        {!isAuthor && token && showApplyForm && (
          <div className="mt-4 flex flex-col gap-2">
            <textarea
              value={applyMessage}
              onChange={(e) => setApplyMessage(e.target.value)}
              placeholder="Optional message to the project author..."
              maxLength={500}
              rows={3}
              style={{ border: '1px solid #E8E0D8', backgroundColor: '#FAFAF8', color: '#1A1512' }}
              className="w-full rounded-lg p-3 text-sm resize-none outline-none"
            />
            {applyError && (
              <p style={{ color: '#C4552A' }} className="text-sm">{applyError}</p>
            )}
            <div className="flex gap-2 self-start">
              <button
                onClick={handleApply}
                disabled={applySubmitting}
                style={{ backgroundColor: '#C4552A', color: '#FFFFFF' }}
                className="px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                {applySubmitting ? 'Submitting...' : 'Submit application'}
              </button>
              <button
                onClick={() => setShowApplyForm(false)}
                style={{ border: '1px solid #E8E0D8', color: '#9A8880' }}
                className="px-4 py-2 rounded-full text-sm hover:opacity-70"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Applications management — only for the author */}
      {isAuthor && (
        <div
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E0D8' }}
          className="rounded-lg p-6"
        >
          <h2 style={{ color: '#1A1512' }} className="text-lg font-semibold mb-4">
            Applications ({applications.length})
          </h2>

          {applicationsLoading && (
            <p style={{ color: '#9A8880' }} className="text-sm">Loading applications...</p>
          )}

          {applicationsError && (
            <p style={{ color: '#C4552A' }} className="text-sm mb-4">{applicationsError}</p>
          )}

          {!applicationsLoading && applications.length === 0 && (
            <p style={{ color: '#9A8880' }} className="text-sm">
              No applications yet.
            </p>
          )}

          <div className="flex flex-col gap-3">
            {applications.map((application) => (
              <ApplicationRow
                key={application.id}
                application={application}
                onUpdateStatus={handleUpdateStatus}
                updatingId={updatingId}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

export default Projectdetailpage