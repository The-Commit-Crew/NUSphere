import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getAllTopics, createPost, checkDuplicatePosts  } from '../services/Authservice'

function formatCategory(category) {
  return category.replace(/[/_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
function Createpostpage() {


  const navigate = useNavigate()
  const { token } = useAuth()

  const [topics, setTopics] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    topicId: '',
    isAnonymous: false,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  //Duplicate post check states

   const [checkingDuplicates, setCheckingDuplicates] = useState(false)
  const [similarPosts, setSimilarPosts] = useState([])
  const [flaggedCategories, setFlaggedCategories] = useState([])
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
  const { name, type, checked, value } = e.target
  setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value })
  if (name === 'title' || name === 'content') {
    setSimilarPosts([])
  }
}

async function submitPost() {
  setLoading(true)
  setError('')
  setFlaggedCategories([])
  try {
    await createPost(
      {
        title: formData.title,
        content: formData.content,
        topicId: parseInt(formData.topicId),
        isAnonymous: formData.isAnonymous,
      },
      token
    )
    navigate('/')
  } catch (err) {
    setError(err.message)
    setFlaggedCategories(err.categories || [])
  } finally {
    setLoading(false)
  }
}

async function handleSubmit(e) {
  e.preventDefault()
  setError('')
  setFlaggedCategories([])
  setSimilarPosts([])
  setCheckingDuplicates(true)

  try {
    const dupResult = await checkDuplicatePosts(formData.title, formData.content)
    setCheckingDuplicates(false)
    if (dupResult.similarPosts?.length > 0) {
      setSimilarPosts(dupResult.similarPosts)
      return
    }
  } catch (err) {
    setCheckingDuplicates(false)
    console.error('Duplicate check failed:', err)
    // don't block posting if the check itself fails
  }

  await submitPost()
}

function handlePostAnyway() {
  setSimilarPosts([])
  submitPost()
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
    <p>{error}</p>
    {flaggedCategories.length > 0 && (
      <p className="mt-1 text-xs">
        Flagged for: {flaggedCategories.map(formatCategory).join(', ')}
      </p>
    )}
  </div>
)}
      
{similarPosts.length > 0 && (
  <div
    style={{ backgroundColor: '#FFF8ED', border: '1px solid #E0A639' }}
    className="rounded-lg p-4 mb-4 flex flex-col gap-3"
  >
    <p style={{ color: '#1A1512' }} className="text-sm font-medium">
      We found some similar posts. Take a look before posting:
    </p>
    <div className="flex flex-col gap-2">
      {similarPosts.map((post) => (
        <button
          key={post.id}
          type="button"
          onClick={() => navigate(`/posts/${post.id}`)}
          style={{ border: '1px solid #E8E0D8', backgroundColor: '#FAFAF8', color: '#1A1512' }}
          className="text-left px-3 py-2 rounded-lg text-sm hover:opacity-80"
        >
          {post.title}
        </button>
      ))}
    </div>
    <div className="flex gap-3">
      <button
        type="button"
        onClick={() => setSimilarPosts([])}
        style={{ border: '1px solid #E8E0D8', color: '#9A8880' }}
        className="px-4 py-2 rounded-full text-sm hover:opacity-70"
      >
        Edit my post
      </button>
      <button
        type="button"
        onClick={handlePostAnyway}
        disabled={loading}
        style={{ backgroundColor: '#C4552A', color: '#fff' }}
        className="px-4 py-2 rounded-full text-sm font-medium hover:opacity-90"
      >
        Post anyway
      </button>
    </div>
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

        {/* Anonymous toggle */}
        <label
          style={{ border: '1px solid #E8E0D8', backgroundColor: '#FAFAF8' }}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm cursor-pointer w-fit"
        >
          <input
            type="checkbox"
            name="isAnonymous"
            checked={formData.isAnonymous}
            onChange={handleChange}
            style={{ accentColor: '#C4552A' }}
            className="w-4 h-4"
          />
          <span style={{ color: '#1A1512' }}>Post anonymously</span>
        </label>

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
          disabled={loading || checkingDuplicates}
          style={{ backgroundColor: loading || checkingDuplicates ? '#9A8880' : '#C4552A', color: '#fff' }}
          className="px-6 py-2.5 rounded-full text-sm font-medium hover:opacity-90"
        >
          {checkingDuplicates ? 'Checking...' : loading ? 'Posting...' : 'Post question'}
        </button>
        </div>

      </form>
    </div>
  )
}
export default Createpostpage