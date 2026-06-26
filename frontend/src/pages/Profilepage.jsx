import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUserProfile } from '../services/Authservice'

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

function Profilepage() {
  const { username } = useParams()
  const navigate = useNavigate()
  const { token, user } = useAuth()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const isOwnProfile = user && user.username === username

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
              style={{ backgroundColor: '#F5F0EB', color: '#9A8880' }}
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold"
            >
              {profile.firstName?.[0]?.toUpperCase()}
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 style={{ color: '#1A1512' }} className="text-xl font-bold">
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
                <a
                  href={profile.githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#C4552A' }}
                  className="text-sm hover:underline"
                >
                  GitHub
                </a>
              )}
              {profile.linkedinLink && (
                <a
                  href={profile.linkedinLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#C4552A' }}
                  className="text-sm hover:underline"
                >
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
                    className="px-2 py-1 rounded-full font-medium"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Authored projects */}
      <div
        style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E0D8' }}
        className="rounded-lg p-6 mb-6"
      >
        <h2 style={{ color: '#1A1512' }} className="text-lg font-semibold mb-4">
          Projects ({profile.authoredProjects?.length || 0})
        </h2>

        {(!profile.authoredProjects || profile.authoredProjects.length === 0) ? (
          <p style={{ color: '#9A8880' }} className="text-sm">
            No projects posted yet.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {profile.authoredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/collaborate/${project.id}`)}
                style={{ backgroundColor: '#F5F0EB', border: '1px solid #E8E0D8' }}
                className="rounded-lg p-4 cursor-pointer hover:opacity-90"
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 style={{ color: '#1A1512' }} className="text-sm font-medium">
                    {project.title}
                  </h3>
                  <span
                    style={{ ...statusStyle(project.status), fontSize: '10px' }}
                    className="px-2 py-0.5 rounded-full font-medium"
                  >
                    {project.status?.replace('_', ' ')}
                  </span>
                </div>
                <p style={{ color: '#9A8880' }} className="text-xs mb-2 leading-relaxed">
                  {project.description?.substring(0, 100)}...
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {project.skills?.map((skill) => (
                    <span
                      key={skill.id}
                      style={{ backgroundColor: '#FFFFFF', color: '#9A8880', fontSize: '10px' }}
                      className="px-2 py-0.5 rounded-full font-medium"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Outbound applications — only visible on your own profile */}
      {isOwnProfile && profile.applications && (
        <div
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E0D8' }}
          className="rounded-lg p-6"
        >
          <h2 style={{ color: '#1A1512' }} className="text-lg font-semibold mb-4">
            Your applications ({profile.applications.length})
          </h2>

          {profile.applications.length === 0 ? (
            <p style={{ color: '#9A8880' }} className="text-sm">
              You haven't applied to any projects yet.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {profile.applications.map((application) => (
                <Link
                  key={application.id}
                  to={`/collaborate/${application.project.id}`}
                  style={{ backgroundColor: '#F5F0EB', border: '1px solid #E8E0D8' }}
                  className="rounded-lg p-4 flex items-center justify-between hover:opacity-90"
                >
                  <span style={{ color: '#1A1512' }} className="text-sm font-medium">
                    {application.project.title}
                  </span>
                  <span
                    style={{ ...statusStyle(application.status), fontSize: '10px' }}
                    className="px-2 py-0.5 rounded-full font-medium"
                  >
                    {application.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  )
}

export default Profilepage