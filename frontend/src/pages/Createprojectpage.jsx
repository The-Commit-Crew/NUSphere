import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createProject } from '../services/Authservice'

function Createprojectpage() {
  const navigate = useNavigate()
  const { token } = useAuth()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skills: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const skillsArray = formData.skills
        .split(',')
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0)

      await createProject(
        {
          title: formData.title,
          description: formData.description,
          skills: skillsArray,
        },
        token
      )
      navigate('/collaborate')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 style={{ color: '#1A1512' }} className="text-2xl font-bold mb-1">
        Post a project
      </h1>
      <p style={{ color: '#9A8880' }} className="text-sm mb-6">
        Find collaborators from the NUS community
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

        {/* Title */}
        <div className="flex flex-col gap-1">
          <label style={{ color: '#1A1512', fontSize: '13px' }} className="font-medium">
            Project title
          </label>
          <input
            name="title"
            type="text"
            placeholder="e.g. NLP Research Assistant"
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
            placeholder="Describe the project and what kind of help you're looking for..."
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
            onClick={() => navigate('/collaborate')}
            style={{ border: '1px solid #E8E0D8', color: '#9A8880' }}
            className="px-6 py-2.5 rounded-full text-sm hover:opacity-70"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: loading ? '#9A8880' : '#C4552A', color: '#fff' }}
            className="px-6 py-2.5 rounded-full text-sm font-medium hover:opacity-90"
          >
            {loading ? 'Posting...' : 'Post project'}
          </button>
        </div>

      </form>
    </div>
  )
}

export default Createprojectpage