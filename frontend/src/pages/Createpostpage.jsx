import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getAllTopics, createPost } from '../services/Authservice'

function Createpostpage() {
  const navigate = useNavigate()
  const { token } = useAuth()

  const [topics, setTopics] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    topicId: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchTopics() {
      try {
        const data = await getAllTopics()
        setTopics(data)
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, topicId: data[0].id }))
        }
      } catch (err) {
        console.error('Failed to load topics:', err)
      }
    }
    fetchTopics()
  }, [])

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await createPost(
        {
          title: formData.title,
          content: formData.content,
          topicId: parseInt(formData.topicId),
        },
        token
      )
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 style={{ color: '#1A1512' }} className="text-2xl font-bold mb-1">
        Ask a question
      </h1>
      <p style={{ color: '#9A8880' }} className="text-sm mb-6">
        Share something with the NUS community
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

        {/* Topic selector */}
        <div className="flex flex-col gap-1">
          <label style={{ color: '#1A1512', fontSize: '13px' }} className="font-medium">
            Topic
          </label>
          <select
            name="topicId"
            value={formData.topicId}
            onChange={handleChange}
            required
            style={{ border: '1px solid #E8E0D8', color: '#1A1512', backgroundColor: '#FAFAF8' }}
            className="px-3 py-2 rounded-lg text-sm outline-none"
          >
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1">
          <label style={{ color: '#1A1512', fontSize: '13px' }} className="font-medium">
            Title
          </label>
          <input
            name="title"
            type="text"
            placeholder="What do you want to ask?"
            value={formData.title}
            onChange={handleChange}
            required
            style={{ border: '1px solid #E8E0D8', color: '#1A1512', backgroundColor: '#FAFAF8' }}
            className="px-3 py-2 rounded-lg text-sm outline-none"
          />
        </div>

        {/* Content */}
        <div className="flex flex-col gap-1">
          <label style={{ color: '#1A1512', fontSize: '13px' }} className="font-medium">
            Details
          </label>
          <textarea
            name="content"
            placeholder="Give more context to your question..."
            value={formData.content}
            onChange={handleChange}
            required
            rows={6}
            style={{ border: '1px solid #E8E0D8', color: '#1A1512', backgroundColor: '#FAFAF8', resize: 'vertical' }}
            className="px-3 py-2 rounded-lg text-sm outline-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-1">
          <button
            type="button"
            onClick={() => navigate('/')}
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
            {loading ? 'Posting...' : 'Post question'}
          </button>
        </div>

      </form>
    </div>
  )
}

export default Createpostpage