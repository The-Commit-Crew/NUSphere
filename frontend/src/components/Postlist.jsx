import { useState, useEffect } from 'react'
import { getAllPosts, castVote, deletePost, toggleBookmark, getBookmarkedPosts } from '../services/Authservice'
import DeleteConfirmDialog from './DeleteConfirmDialog'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSearch } from '../context/SearchContext'

const LIMIT = 10

function Postlist({ selectedTopicId, searchQuery, sortBy }) {
  const { setSearchQuery } = useSearch()
  const [searchInput, setSearchInput] = useState(searchQuery)

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [voteMessage, setVoteMessage] = useState('')
  const navigate = useNavigate()
  const { token, user } = useAuth()
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set())
  const [prevUser, setPrevUser] = useState(user)

  if (user !== prevUser) {
    setPrevUser(user)
    setBookmarkedIds(new Set())
  }

  const [page, setPage] = useState(1)
  const filterKey = `${selectedTopicId}|${searchQuery}|${sortBy}`
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey)

  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey)
    setPage(1)
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchQuery(searchInput.trim())
    }, 400)
    return () => clearTimeout(timeout)
  }, [searchInput])

  useEffect(() => {
    if (!user) return
    getBookmarkedPosts()
      .then((bookmarks) => setBookmarkedIds(new Set(bookmarks.map((p) => p.id))))
      .catch((err) => console.error(err))
  }, [user])

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true)
      setError('')
      try {
        const data = await getAllPosts({
          q: searchQuery || undefined,
          sort: sortBy,
          topicId: selectedTopicId ?? undefined,
          page,
          limit: LIMIT,
        })
        setPosts(data)
      } catch (err) {
        setError('Failed to load posts')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [selectedTopicId, searchQuery, sortBy, page])

  const [pendingDeleteId, setPendingDeleteId] = useState(null)
  async function handleDeletePost() {
    try {
      await deletePost(pendingDeleteId)
      setPosts(prev => prev.filter(post => post.id !== pendingDeleteId))
    } catch (err) {
      console.error(err)
      setVoteMessage(err.message)
      setTimeout(() => setVoteMessage(''), 3000)
    } finally {
      setPendingDeleteId(null)
    }
  }

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
              userVoteStatus: post.userVoteStatus === voteType ? null : voteType,
            }
          : post
      ))
      setVoteMessage('')
    } catch (err) {
      console.error(err)
    }
  }

  async function handleBookmarkToggle(e, postId) {
    e.stopPropagation()
    if (!token) {
      setVoteMessage('Please log in to save posts')
      setTimeout(() => setVoteMessage(''), 3000)
      return
    }
    const wasBookmarked = bookmarkedIds.has(postId)
    setBookmarkedIds((prev) => {
      const next = new Set(prev)
      wasBookmarked ? next.delete(postId) : next.add(postId)
      return next
    })
    try {
      await toggleBookmark(postId)
    } catch (err) {
      console.error(err)
      setBookmarkedIds((prev) => {
        const next = new Set(prev)
        wasBookmarked ? next.add(postId) : next.delete(postId)
        return next
      })
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


 const headerRow = (
  <div className="flex items-start justify-between mb-1 gap-4">
    <span style={{ color: '#1A1512', paddingTop: '10px' }} className="text-sm font-medium whitespace-nowrap">
      {posts.length} questions
    </span>
    <div
      className="flex items-center gap-2 rounded-lg"
      style={{ border: '1px solid #E8E0D8', backgroundColor: '#FFFFFF', minWidth: '220px' }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#9A8880', marginLeft: '10px', flexShrink: 0 }}>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="Search posts..."
        className="bg-transparent outline-none flex-1 text-sm py-2 pr-3"
        style={{ color: '#1A1512' }}
      />
    </div>
  </div>
)

  if (loading) {
    return (
      <div className="flex-1 flex flex-col gap-3">
        {headerRow}
        <div className="flex items-center justify-center py-20">
          <p style={{ color: '#9A8880' }} className="text-sm">Loading posts...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col gap-3">
        {headerRow}
        <div className="flex items-center justify-center py-20">
          <p style={{ color: '#C4552A' }} className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="flex-1 flex flex-col gap-3">
        {headerRow}
        <div className="flex items-center justify-center py-20">
          <p style={{ color: '#9A8880' }} className="text-sm">
            {page === 1 ? 'No posts yet. Be the first to ask!' : 'No more posts.'}
          </p>
        </div>
      </div>
    )
  }

  const hasNextPage = posts.length === LIMIT

  return (
    <div className="flex-1 flex flex-col gap-3">

      {headerRow}

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

          <div className="flex items-center gap-2" style={{ borderTop: '1px solid #F5F0EB', paddingTop: '10px' }}>
            <button
              onClick={(e) => handleVote(e, post.id, 'UP')}
              style={{
                backgroundColor: post.userVoteStatus === 'UP' ? '#FDF6F3' : '#F5F0EB',
                color: post.userVoteStatus === 'UP' ? '#C4552A' : '#9A8880',
                border: post.userVoteStatus === 'UP' ? '1px solid #C4552A' : '1px solid transparent',
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium hover:opacity-70"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
              {post.upvoteCount}
            </button>

            <button
              onClick={(e) => handleVote(e, post.id, 'DOWN')}
              style={{
                backgroundColor: post.userVoteStatus === 'DOWN' ? '#FDF6F3' : '#F5F0EB',
                color: post.userVoteStatus === 'DOWN' ? '#C4552A' : '#9A8880',
                border: post.userVoteStatus === 'DOWN' ? '1px solid #C4552A' : '1px solid transparent',
              }}
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
            <button
              onClick={(e) => handleBookmarkToggle(e, post.id)}
              style={{
                backgroundColor: bookmarkedIds.has(post.id) ? '#C4552A' : '#F5F0EB',
                color: bookmarkedIds.has(post.id) ? '#F5F0EB' : '#9A8880',
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium hover:opacity-70"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill={bookmarkedIds.has(post.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </button>

            {user && user.id === post.authorId && (
              <button
                onClick={(e) => { e.stopPropagation(); setPendingDeleteId(post.id) }}
                style={{ backgroundColor: '#F5F0EB', color: '#C4552A', marginLeft: 'auto' }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium hover:opacity-70"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Delete
              </button>
            )}
          </div>
        </div>
      ))}

      <div className="flex items-center justify-center gap-4 mt-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
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
          onClick={() => setPage((p) => p + 1)}
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

      <DeleteConfirmDialog
        open={pendingDeleteId !== null}
        message="Delete this post? This can't be undone."
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={handleDeletePost}
      />
    </div>
  )
}

export default Postlist