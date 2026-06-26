import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getAllProjects } from '../services/Authservice'
import Skillsidebar from '../components/Skillsidebar'
import Projectlist from '../components/Projectlist'

function Collaboratepage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedSkill, setSelectedSkill] = useState(null)

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true)
      setError('')
      try {
        const data = await getAllProjects()
        setProjects(data)
      } catch (err) {
        setError('Failed to load projects')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">

      {/* Top bar */}
      <div style={{ borderBottom: '1px solid #E8E0D8' }} className="flex items-center gap-6 mb-6 pb-3">
        {user && (
          <Link
            to="/collaborate/create"
            style={{ marginLeft: 'auto', border: '1px solid #C4552A', color: '#C4552A' }}
            className="px-4 py-1.5 rounded-full text-sm font-medium hover:opacity-80"
          >
            + Post a project
          </Link>
        )}
      </div>

      {/* Two column layout */}
      <div className="flex gap-6">
        <Skillsidebar
          projects={projects}
          selectedSkill={selectedSkill}
          onSelectSkill={setSelectedSkill}
        />
        <Projectlist
          projects={projects}
          loading={loading}
          error={error}
          selectedSkill={selectedSkill}
        />
      </div>

    </div>
  )
}

export default Collaboratepage