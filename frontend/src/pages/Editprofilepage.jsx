import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUserProfile, updateUserProfile } from '../services/Authservice'

function Editprofilepage() {
  const navigate = useNavigate()
  const { token, user } = useAuth()

  const [formData, setFormData] = useState({
    bio: '',
    githubLink: '',
    linkedinLink: '',
    profilePic: '',
    skills: '',
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return
      setLoading(true)
      setError('')
      try {
        const profile = await getUserProfile(user.username, token)
        setFormData({
          bio: profile.bio || '',
          githubLink: profile.githubLink || '',
          linkedinLink: profile.linkedinLink || '',
          profilePic: profile.profilePic || '',
          skills: profile.skills?.map((skill) => skill.name).join(', ') || '',
        })
      } catch (err) {
        setError('Failed to load profile')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [user, token])

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

      await updateUserProfile(
        {
          bio: formData.bio,
          githubLink: formData.githubLink,
          linkedinLink: formData.linkedinLink,
          profilePic: formData.profilePic,
          skills: skillsArray,
        },
        token
      )
      navigate(`/u/${user.username}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p style={{ color: '#9A8880' }}>Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 style={{ color: '#1A1512' }} className="text-2xl font-bold mb-1">
        Edit profile
      </h1>
      <p style={{ color: '#9A8880' }} className="text-sm mb-6">
        Update your public profile
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

        {/* Bio */}
        <div className="flex flex-col gap-1">
          <label style={{ color: '#1A1512', fontSize: '13px' }} className="font-medium">
            Bio
          </label>
          <textarea
            name="bio"
            placeholder="Tell people a bit about yourself..."
            value={formData.bio}
            onChange={handleChange}
            maxLength={500}
            rows={4}
            style={{ border: '1px solid #E8E0D8', color: '#1A1512', backgroundColor: '#FAFAF8', resize: 'vertical' }}
            className="px-3 py-2 rounded-lg text-sm outline-none"
          />
        </div>

        {/* Profile picture URL */}
        <div className="flex flex-col gap-1">
          <label style={{ color: '#1A1512', fontSize: '13px' }} className="font-medium">
            Profile picture URL
          </label>
          <input
            name="profilePic"
            type="text"
            placeholder="https://example.com/your-photo.jpg"
            value={formData.profilePic}
            onChange={handleChange}
            style={{ border: '1px solid #E8E0D8', color: '#1A1512', backgroundColor: '#FAFAF8' }}
            className="px-3 py-2 rounded-lg text-sm outline-none"
          />
          <span style={{ color: '#9A8880', fontSize: '12px' }}>
            Must start with https://
          </span>
        </div>

        {/* GitHub */}
        <div className="flex flex-col gap-1">
          <label style={{ color: '#1A1512', fontSize: '13px' }} className="font-medium">
            GitHub link
          </label>
          <input
            name="githubLink"
            type="text"
            placeholder="https://github.com/yourusername"
            value={formData.githubLink}
            onChange={handleChange}
            style={{ border: '1px solid #E8E0D8', color: '#1A1512', backgroundColor: '#FAFAF8' }}
            className="px-3 py-2 rounded-lg text-sm outline-none"
          />
        </div>

        {/* LinkedIn */}
        <div className="flex flex-col gap-1">
          <label style={{ color: '#1A1512', fontSize: '13px' }} className="font-medium">
            LinkedIn link
          </label>
          <input
            name="linkedinLink"
            type="text"
            placeholder="https://linkedin.com/in/yourusername"
            value={formData.linkedinLink}
            onChange={handleChange}
            style={{ border: '1px solid #E8E0D8', color: '#1A1512', backgroundColor: '#FAFAF8' }}
            className="px-3 py-2 rounded-lg text-sm outline-none"
          />
        </div>

        {/* Skills */}
        <div className="flex flex-col gap-1">
          <label style={{ color: '#1A1512', fontSize: '13px' }} className="font-medium">
            Skills
          </label>
          <input
            name="skills"
            type="text"
            placeholder="e.g. Python, React, Figma (comma-separated)"
            value={formData.skills}
            onChange={handleChange}
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
            onClick={() => navigate(`/u/${user.username}`)}
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

export default Editprofilepage