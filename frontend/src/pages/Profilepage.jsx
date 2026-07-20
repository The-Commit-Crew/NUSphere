import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUserProfile, getAllPosts, getBookmarkedPosts, toggleBookmark } from '../services/Authservice'
import { formatSkill } from '../utils/formatSkill'


function statusStyle(status) {
  if (status === 'OPEN') {
    return { backgroundColor: '#EAF3EA', color: '#3A7D44' }
  }
  if (status === 'IN_PROGRESS') {
    return { backgroundColor: '#FFF3E0', color: '#B8772E' }
  }
  if (status === 'ACCEPTED') {
    return { backgroundColor: '#EAF3EA', color: '#3A7D44' }
  }
  if (status === 'REJECTED') {
    return { backgroundColor: '#FFF0EB', color: '#C4552A' }
  }
  return { backgroundColor: '#F5F0EB', color: '#9A8880' }
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

function PostRow({ post, navigate, showUnsave, onUnsave }) {
  return (
    <div
      onClick={() => navigate(`/posts/${post.id}`)}
      style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E0D8' }}
      className="flex gap-4 p-4 rounded-lg cursor-pointer hover:opacity-90"
    >
      <div className="flex flex-col items-center gap-0.5 min-w-[32px] pt-0.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4552A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
        <span style={{ color: '#5C4E46' }} className="text-xs font-bold">
          {post.upvoteCount ?? 0}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <h3 style={{ color: '#1A1512', fontFamily: "'Playfair Display', serif" }} className="text-sm font-semibold mb-1 leading-snug">
          {post.title}
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          {post.topic?.name && (
            <span
              style={{ backgroundColor: '#F5F0EB', color: '#9A8880', fontSize: '10px' }}
              className="px-2 py-0.5 rounded-full font-medium"
            >
              {post.topic.name}
            </span>
          )}
          <span style={{ color: '#9A8880', fontSize: '11px' }} className="flex items-center gap-1 ml-auto">
            {post.commentCount ?? post._count?.comments ?? 0} replies · {timeAgo(post.createdAt)}
          </span>
          {showUnsave && (
            <button
              onClick={(e) => { e.stopPropagation(); onUnsave(post.id) }}
              style={{ color: '#C4552A' }}
              className="text-xs hover:underline"
            >
              Unsave
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Profilepage() {
  const { username } = useParams()
  const navigate = useNavigate()
  const { token, user } = useAuth()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const isOwnProfile = user && user.username === username

  const TABS = isOwnProfile
    ? ['Posts', 'Collaborations', 'Saved', 'Applications']
    : ['Posts', 'Collaborations']

  const [activeTab, setActiveTab] = useState('Posts')

  const [posts, setPosts] = useState([])
  const [postsFetched, setPostsFetched] = useState(false)

  const [savedPosts, setSavedPosts] = useState([])
  const [savedFetched, setSavedFetched] = useState(false)

  // Derived, not stored: avoids a synchronous setState-in-effect just to
  // flip a loading flag, and stays in sync with postsFetched automatically.
  const postsLoading = !!profile && !postsFetched
  const savedLoading = !!profile && isOwnProfile && !savedFetched

  // Reset per-tab data when navigating to a different user's profile.
  // Done during render (React re-runs synchronously before painting) rather
  // than in an effect, since this is a "reset state on prop change" case.
  const [prevUsername, setPrevUsername] = useState(username)
  if (username !== prevUsername) {
    setPrevUsername(username)
    setActiveTab('Posts')
    setPostsFetched(false)
    setSavedFetched(false)
    setPosts([])
    setSavedPosts([])
  }

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true)
      setError('')
      try {
        const data = await getUserProfile(username, token)
        setProfile(data)
      } catch (err) {
        setError('Failed to load profile')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [username, token])

  useEffect(() => {
    if (postsFetched || !profile) return
    getAllPosts({ sort: 'new' })
      .then((data) => {
        setPosts(data.filter((p) => p.authorId === profile.id))
      })
      .catch((err) => console.error(err))
      .finally(() => setPostsFetched(true))
  }, [postsFetched, profile])

  useEffect(() => {
    if (savedFetched || !isOwnProfile || !profile) return
    getBookmarkedPosts()
      .then((data) => {
        setSavedPosts(data)
      })
      .catch((err) => console.error(err))
      .finally(() => setSavedFetched(true))
  }, [savedFetched, isOwnProfile, profile])

  async function handleUnsave(postId) {
    setSavedPosts((prev) => prev.filter((p) => p.id !== postId))
    try {
      await toggleBookmark(postId)
    } catch (err) {
      console.error(err)
      setSavedFetched(false) // re-fetch to recover true state
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p style={{ color: '#9A8880' }}>Loading profile...</p>
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

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <p style={{ color: '#9A8880' }}>Profile not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">

      {/* Identity block */}
      <div
        style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E0D8' }}
        className="rounded-lg p-6 mb-6"
      >
        <div className="flex items-start gap-4">
          {profile.profilePic ? (
            <img
              src={profile.profilePic}
              alt={profile.username}
              style={{ border: '1px solid #E8E0D8' }}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div
              style={{ backgroundColor: '#F5E8E2', color: '#9E3D1C' }}
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold"
            >
              {profile.firstName?.[0]?.toUpperCase()}
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 style={{ color: '#1A1512', fontFamily: "'Playfair Display', serif" }} className="text-xl font-bold">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p style={{ color: '#9A8880' }} className="text-sm">
                  u/{profile.username}
                </p>
              </div>

              {isOwnProfile && (
                <button
                  onClick={() => navigate('/u/edit')}
                  style={{ border: '1px solid #E8E0D8', color: '#9A8880' }}
                  className="px-4 py-1.5 rounded-full text-sm hover:opacity-70"
                >
                  Edit profile
                </button>
              )}
            </div>

            {profile.bio && (
              <p style={{ color: '#1A1512' }} className="text-sm mt-3 leading-relaxed whitespace-pre-wrap">
                {profile.bio}
              </p>
            )}

            <div className="flex items-center gap-3 mt-3">
              {profile.githubLink && (
                <a href={profile.githubLink} target="_blank" rel="noopener noreferrer" style={{ color: '#C4552A' }} className="text-sm hover:underline">
                  GitHub
                </a>
              )}
              {profile.linkedinLink && (
                <a href={profile.linkedinLink} target="_blank" rel="noopener noreferrer" style={{ color: '#C4552A' }} className="text-sm hover:underline">
                  LinkedIn
                </a>
              )}
            </div>

            {profile.skills?.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mt-3">
                {profile.skills.map((skill) => (
                  <span
                    key={skill.id}
                    style={{ backgroundColor: '#F5F0EB', color: '#9A8880', fontSize: '11px' }}
                    className="px-2 py-1 rounded-full font-medium "
                  >
                  {formatSkill(skill.name)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ borderBottom: '1px solid #E8E0D8' }} className="flex items-center gap-6 mb-6">
        {TABS.map((tab) => {
          const count =
            tab === 'Posts' ? (postsFetched ? posts.length : null)
            : tab === 'Collaborations' ? (profile.authoredProjects?.length ?? 0)
            : tab === 'Saved' ? (savedFetched ? savedPosts.length : null)
            : tab === 'Applications' ? (profile.applications?.length ?? 0)
            : null
          const active = activeTab === tab
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                color: active ? '#C4552A' : '#9A8880',
                borderBottom: active ? '2px solid #C4552A' : '2px solid transparent',
                fontWeight: active ? 600 : 400,
              }}
              className="text-sm pb-3 -mb-px flex items-center gap-1.5"
            >
              {tab}
              {count !== null && count !== undefined && (
                <span
                  style={{
                    backgroundColor: active ? '#F5E8E2' : '#F5F0EB',
                    color: active ? '#9E3D1C' : '#9A8880',
                    fontSize: '10px',
                  }}
                  className="px-1.5 py-0.5 rounded-full font-semibold"
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'Posts' && (
        <div className="flex flex-col gap-3">
          {postsLoading && <p style={{ color: '#9A8880' }} className="text-sm">Loading posts...</p>}
          {!postsLoading && posts.length === 0 && (
            <p style={{ color: '#9A8880' }} className="text-sm">No posts yet.</p>
          )}
          {posts.map((post) => (
            <PostRow key={post.id} post={post} navigate={navigate} />
          ))}
        </div>
      )}

      {activeTab === 'Collaborations' && (
        <div className="flex flex-col gap-3">
          {(!profile.authoredProjects || profile.authoredProjects.length === 0) ? (
            <p style={{ color: '#9A8880' }} className="text-sm">No projects posted yet.</p>
          ) : (
            profile.authoredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/collaborate/${project.id}`)}
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E0D8' }}
                className="rounded-lg p-4 cursor-pointer hover:opacity-90"
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 style={{ color: '#1A1512' }} className="text-sm font-medium">
                    {project.title}
                  </h3>
                  <span style={{ ...statusStyle(project.status), fontSize: '10px' }} className="px-2 py-0.5 rounded-full font-medium">
                    {project.status?.replace('_', ' ')}
                  </span>
                </div>
                <p style={{ color: '#9A8880' }} className="text-xs mb-2 leading-relaxed">
                  {project.description?.substring(0, 100)}...
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {project.skills?.map((skill) => (
                    <span key={skill.id} style={{ backgroundColor: '#F5F0EB', color: '#9A8880', fontSize: '10px' }} className="px-2 py-0.5 rounded-full font-medium">
                      {formatSkill(skill.name)}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'Saved' && isOwnProfile && (
        <div className="flex flex-col gap-3">
          {savedLoading && <p style={{ color: '#9A8880' }} className="text-sm">Loading saved posts...</p>}
          {!savedLoading && savedPosts.length === 0 && (
            <p style={{ color: '#9A8880' }} className="text-sm">No saved posts yet.</p>
          )}
          {savedPosts.map((post) => (
            <PostRow key={post.id} post={post} navigate={navigate} showUnsave onUnsave={handleUnsave} />
          ))}
        </div>
      )}

      {activeTab === 'Applications' && isOwnProfile && (
        <div className="flex flex-col gap-3">
          {(!profile.applications || profile.applications.length === 0) ? (
            <p style={{ color: '#9A8880' }} className="text-sm">You haven't applied to any projects yet.</p>
          ) : (
            profile.applications.map((application) => (
              <Link
                key={application.id}
                to={`/collaborate/${application.project.id}`}
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E0D8' }}
                className="rounded-lg p-4 flex items-center justify-between hover:opacity-90"
              >
                <span style={{ color: '#1A1512' }} className="text-sm font-medium">
                  {application.project.title}
                </span>
                <span style={{ ...statusStyle(application.status), fontSize: '10px' }} className="px-2 py-0.5 rounded-full font-medium">
                  {application.status}
                </span>
              </Link>
            ))
          )}
        </div>
      )}

    </div>
  )
}

export default Profilepage