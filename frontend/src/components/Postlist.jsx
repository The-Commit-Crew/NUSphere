import { useState, useEffect } from 'react'
import { getTopicById, getAllPosts, castVote } from '../services/Authservice'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Postlist({ selectedTopicId }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [voteMessage, setVoteMessage] = useState('')
  const navigate = useNavigate()
  const { token } = useAuth()

    useEffect(() => {
      async function fetchPosts() {
        setLoading(true)
        setError('')
        try {
          if (selectedTopicId === null) {
            const allPosts = await getAllPosts()
            setPosts(allPosts)
          } else {
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

  async function handleVote(e, postId, voteType) {
    e.stopPropagation()
    if (!token) {
      setVoteMessage('Please log in to vote')
      setTimeout(() => setVoteMessage(''), 3000)
      return
    }
    try {
      const result = await castVote(postId, voteType, token)
      setPosts(prev => prev.map(post =>
        post.id === postId
          ? {
              ...post,
              upvoteCount: result.upvoteCount,
              downvoteCount: result.downvoteCount,
            }
          : post
      ))
      setVoteMessage('')
    } catch (err) {
      console.error(err)
    }
  }

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

      <div className="flex items-center justify-between mb-1">
        <span style={{ color: '#1A1512' }} className="text-sm font-medium">
          {posts.length} questions
        </span>
        <span style={{ color: '#9A8880' }} className="text-sm">
          Sort: Recent
        </span>
      </div>

      {voteMessage && (
        <p style={{ color: '#C4552A' }} className="text-xs">
          {voteMessage}
        </p>
      )}

     {posts.map((post) => (
        <div
          key={post.id}
          onClick={() => navigate(`/posts/${post.id}`)}
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E0D8' }}
          className="flex flex-col gap-3 p-4 rounded-lg hover:opacity-90 cursor-pointer"
        >
          <div>
            <h3 style={{ color: '#1A1512', fontFamily: "'Playfair Display', serif" }} className="text-sm font-semibold mb-1 leading-snug">
              {post.title}
            </h3>
            <p style={{ color: '#9A8880' }} className="text-xs mb-2 leading-relaxed">
              {post.content?.substring(0, 120)}...
            </p>

            <div className="flex items-center gap-2 flex-wrap">
              <span
                style={{ backgroundColor: '#F5F0EB', color: '#9A8880', fontSize: '10px' }}
                className="px-2 py-0.5 rounded-full font-medium"
              >
                {post.topic?.name}
              </span>
              <span style={{ color: '#9A8880', fontSize: '11px', marginLeft: 'auto' }} className="flex items-center gap-1">
                u/{post.author?.username} ·
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                {timeAgo(post.createdAt)}
              </span>
            </div>
          </div>

          {/* Action row */}
          <div className="flex items-center gap-2" style={{ borderTop: '1px solid #F5F0EB', paddingTop: '10px' }}>
            <button
              onClick={(e) => handleVote(e, post.id, 'UP')}
              style={{ backgroundColor: '#F5F0EB', color: '#9A8880' }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium hover:opacity-70"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
              {post.upvoteCount}
            </button>

            <button
              onClick={(e) => handleVote(e, post.id, 'DOWN')}
              style={{ backgroundColor: '#F5F0EB', color: '#9A8880' }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium hover:opacity-70"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M19 12l-7 7-7-7" />
              </svg>
              {post.downvoteCount}
            </button>

            <span
              style={{ backgroundColor: '#F5F0EB', color: '#9A8880' }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
            >
              <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor">
                <circle cx="128" cy="128" r="10" />
                <circle cx="84" cy="128" r="10" />
                <circle cx="172" cy="128" r="10" />
                <path d="M45.15,230.11A8,8,0,0,1,32,224V64a8,8,0,0,1,8-8H216a8,8,0,0,1,8,8V192a8,8,0,0,1-8,8H80Z" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {post.commentCount ?? post._count?.comments ?? 0}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Postlist