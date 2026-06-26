import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getProjectById, updateProject } from '../services/Authservice'

function Editprojectpage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token, user } = useAuth()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skills: '',
    status: 'OPEN',
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [notAuthor, setNotAuthor] = useState(false)

  useEffect(() => {
    async function fetchProject() {
      setLoading(true)
      setError('')
      try {
        const project = await getProjectById(id)

        if (!user || user.username !== project.author?.username) {
          setNotAuthor(true)
          return
        }

        setFormData({
          title: project.title,
          description: project.description,
          skills: project.skills?.map((skill) => skill.name).join(', ') || '',
          status: project.status,
        })
      } catch (err) {
        setError('Failed to load project')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProject()
  }, [id, user])

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const skillsArray = formData.skills
        .split(',')
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0)

      await updateProject(
        id,
        {
          title: formData.title,
          description: formData.description,
          skills: skillsArray,
          status: formData.status,
        },
        token
      )
      navigate(`/collaborate/${id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p style={{ color: '#9A8880' }}>Loading project...</p>
      </div>
    )
  }

  if (notAuthor) {
    return (
      <div className="flex items-center justify-center py-20">
        <p style={{ color: '#C4552A' }}>You don't have permission to edit this project</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 style={{ color: '#1A1512' }} className="text-2xl font-bold mb-1">
        Edit project
      </h1>
      <p style={{ color: '#9A8880' }} className="text-sm mb-6">
        Update your project details
      </p>

      {error && (
        <div
          style={{ backgroundColor: '#FFF0EB', border: '1px solid #C4552A', color: '#C4552A' }}
          className="text-sm px-4 py-3 rounded-lg mb-4"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* Status */}
        <div className="flex flex-col gap-1">
          <label style={{ color: '#1A1512', fontSize: '13px' }} className="font-medium">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            style={{ border: '1px solid #E8E0D8', color: '#1A1512', backgroundColor: '#FAFAF8' }}
            className="px-3 py-2 rounded-lg text-sm outline-none"
          >
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1">
          <label style={{ color: '#1A1512', fontSize: '13px' }} className="font-medium">
            Project title
          </label>
          <input
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            required
            minLength={5}
            maxLength={100}
            style={{ border: '1px solid #E8E0D8', color: '#1A1512', backgroundColor: '#FAFAF8' }}
            className="px-3 py-2 rounded-lg text-sm outline-none"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label style={{ color: '#1A1512', fontSize: '13px' }} className="font-medium">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            minLength={20}
            rows={6}
            style={{ border: '1px solid #E8E0D8', color: '#1A1512', backgroundColor: '#FAFAF8', resize: 'vertical' }}
            className="px-3 py-2 rounded-lg text-sm outline-none"
          />
        </div>

        {/* Skills */}
        <div className="flex flex-col gap-1">
          <label style={{ color: '#1A1512', fontSize: '13px' }} className="font-medium">
            Skills needed
          </label>
          <input
            name="skills"
            type="text"
            placeholder="e.g. Python, React, Figma (comma-separated)"
            value={formData.skills}
            onChange={handleChange}
            required
            style={{ border: '1px solid #E8E0D8', color: '#1A1512', backgroundColor: '#FAFAF8' }}
            className="px-3 py-2 rounded-lg text-sm outline-none"
          />
          <span style={{ color: '#9A8880', fontSize: '12px' }}>
            Separate each skill with a comma
          </span>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-1">
          <button
            type="button"
            onClick={() => navigate(`/collaborate/${id}`)}
            style={{ border: '1px solid #E8E0D8', color: '#9A8880' }}
            className="px-6 py-2.5 rounded-full text-sm hover:opacity-70"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            style={{ backgroundColor: submitting ? '#9A8880' : '#C4552A', color: '#fff' }}
            className="px-6 py-2.5 rounded-full text-sm font-medium hover:opacity-90"
          >
            {submitting ? 'Saving...' : 'Save changes'}
          </button>
        </div>

      </form>
    </div>
  )
}

export default Editprojectpage