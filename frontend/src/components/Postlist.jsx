import { useState, useEffect } from 'react'
import { getAllTopics, getTopicById } from '../services/Authservice'
import { useNavigate } from 'react-router-dom'

function Postlist({ selectedTopicId }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate() 

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true)
      setError('')
      try {
        if (selectedTopicId === null) {
          // Load all topics then flatten all their posts
          const topics = await getAllTopics()
          const allPostsPromises = topics.map((topic) =>
            getTopicById(topic.id)
          )
          const allTopics = await Promise.all(allPostsPromises)
          const allPosts = allTopics.flatMap((topic) => topic.posts)
          setPosts(allPosts)
        } else {
          // Load posts for specific topic
          const topic = await getTopicById(selectedTopicId)
          setPosts(topic.posts)
        }
      } catch (err) {
        setError('Failed to load posts')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [selectedTopicId])

  function timeAgo(dateString) {
    const now = new Date()
    const date = new Date(dateString)
    const seconds = Math.floor((now - date) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <p style={{ color: '#9A8880' }} className="text-sm">Loading posts...</p>
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

  if (posts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <p style={{ color: '#9A8880' }} className="text-sm">No posts yet. Be the first to ask!</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col gap-3">

      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <span style={{ color: '#1A1512' }} className="text-sm font-medium">
          {posts.length} questions
        </span>
        <span style={{ color: '#9A8880' }} className="text-sm">
          Sort: Recent
        </span>
      </div>

      {/* Post cards */}
      {posts.map((post) => (
        <div
          key={post.id}
          onClick={() => navigate(`/posts/${post.id}`)}
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E0D8' }}
          className="flex gap-4 p-4 rounded-lg hover:opacity-90 cursor-pointer"
        >

          {/* Upvote column */}
          <div className="flex flex-col items-center gap-1 pt-1">
            <button style={{ color: '#9A8880' }} className="text-sm hover:opacity-70">▲</button>
            <span style={{ color: '#1A1512' }} className="text-sm font-medium">
              0
            </span>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 style={{ color: '#1A1512' }} className="text-sm font-medium mb-1 leading-snug">
              {post.title}
            </h3>
            <p style={{ color: '#9A8880' }} className="text-xs mb-2 leading-relaxed">
              {post.content?.substring(0, 120)}...
            </p>

            {/* Meta */}
            <div className="flex items-center gap-2 flex-wrap">
              <span
                style={{ backgroundColor: '#F5F0EB', color: '#9A8880', fontSize: '10px' }}
                className="px-2 py-0.5 rounded-full font-medium"
              >
                {post.topic?.name}
              </span>
              <span style={{ color: '#9A8880', fontSize: '11px', marginLeft: 'auto' }}>
                u/{post.author?.username} · 🕐 {timeAgo(post.createdAt)}
              </span>
            </div>
          </div>

        </div>
      ))}
    </div>
  )
}

export default Postlist