import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getPostById, castVote } from '../services/Authservice'

function Postdetailpage() {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [upvoteCount, setUpvoteCount] = useState(0)
  const [downvoteCount, setDownvoteCount] = useState(0)
  const [userVoteStatus, setUserVoteStatus] = useState(null)
  const [voteMessage, setVoteMessage] = useState('')

  const { id } = useParams()
  const { token } = useAuth()

  useEffect(() => {
    async function fetchPost() {
      setLoading(true)
      setError('')

      try {
        const data = await getPostById(id, token)
        setPost(data)
        setUpvoteCount(data.upvoteCount)
        setDownvoteCount(data.downvoteCount)
        setUserVoteStatus(data.userVoteStatus)
      } catch (err) {
        setError('Failed to load post')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [id, token])

  async function handleVote(voteType) {
    if (!token) {
      setVoteMessage('Please log in to vote')
      return
    }

    try {
      const result = await castVote(id, voteType, token)
      setUpvoteCount(result.upvoteCount)
      setDownvoteCount(result.downvoteCount)
      setUserVoteStatus(prev => prev === voteType ? null : voteType)
      setVoteMessage('')
    } catch (err) {
      setVoteMessage('Failed to cast vote')
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p style={{ color: '#9A8880' }}>Loading post...</p>
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

  if (!post) {
    return (
      <div className="flex items-center justify-center py-20">
        <p style={{ color: '#9A8880' }}>Post not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">

      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E8E0D8',
        }}
        className="rounded-lg p-6"
      >

        <h1
          style={{ color: '#1A1512' }}
          className="text-2xl font-bold mb-4"
        >
          {post.title}
        </h1>

        <p
          style={{ color: '#1A1512' }}
          className="mb-6 whitespace-pre-wrap leading-relaxed"
        >
          {post.content}
        </p>

        <div className="flex items-center gap-3 flex-wrap">

          <span
            style={{
              backgroundColor: '#F5F0EB',
              color: '#9A8880',
            }}
            className="px-3 py-1 rounded-full text-sm font-medium"
          >
            {post.topic?.name}
          </span>

          <span
            style={{ color: '#9A8880' }}
            className="text-sm"
          >
            u/{post.author?.username}
          </span>

        </div>

        <div className="flex items-center gap-4 mt-6">

          <button
            onClick={() => handleVote('UP')}
            style={{
              color: userVoteStatus === 'UP' ? '#C4552A' : '#9A8880',
              border: `1px solid ${userVoteStatus === 'UP' ? '#C4552A' : '#E8E0D8'}`,
              backgroundColor: userVoteStatus === 'UP' ? '#FDF6F3' : 'transparent',
            }}
            className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors"
          >
            ▲ {upvoteCount}
          </button>

          <button
            onClick={() => handleVote('DOWN')}
            style={{
              color: userVoteStatus === 'DOWN' ? '#C4552A' : '#9A8880',
              border: `1px solid ${userVoteStatus === 'DOWN' ? '#C4552A' : '#E8E0D8'}`,
              backgroundColor: userVoteStatus === 'DOWN' ? '#FDF6F3' : 'transparent',
            }}
            className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors"
          >
            ▼ {downvoteCount}
          </button>

          {voteMessage && (
            <span style={{ color: '#C4552A' }} className="text-sm">
              {voteMessage}
            </span>
          )}

        </div>

      </div>

    </div>
  )
}

export default Postdetailpage