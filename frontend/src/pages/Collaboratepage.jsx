import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getProjectSkills, searchProjects } from '../services/Authservice'
import Skillsidebar from '../components/Skillsidebar'
import Projectlist from '../components/Projectlist'

const LIMIT = 10

function Collaboratepage() {
  const { user } = useAuth()

  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [allSkills, setAllSkills] = useState([])
  const [selectedSkills, setSelectedSkills] = useState([])
  const [skillMatch, setSkillMatch] = useState('any')

  const [searchInput, setSearchInput] = useState('')
  const [q, setQ] = useState('')

  const [sortBy, setSortBy] = useState('newest')
  const [page, setPage] = useState(1)

  // Fetch the skill list once, for the filter sidebar
  useEffect(() => {
    async function fetchSkills() {
      try {
        const data = await getProjectSkills()
        setAllSkills(data)
      } catch (err) {
        console.error('Failed to load skills', err)
      }
    }
    fetchSkills()
  }, [])

  // Debounce free-text search; reset to page 1 once the debounced value lands
  useEffect(() => {
    const timer = setTimeout(() => {
      setQ(searchInput.trim())
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Fetch projects whenever filters, sort, or page change
  useEffect(() => {
    async function fetchProjects() {
      setLoading(true)
      setError('')
      try {
        const data = await searchProjects({
          q: q || undefined,
          skills: selectedSkills,
          skillMatch,
          sortBy,
          page,
          limit: LIMIT,
        })
        setProjects(data)
      } catch (err) {
        setError('Failed to load projects')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [q, selectedSkills, skillMatch, sortBy, page])

  function toggleSkill(skillName) {
    setSelectedSkills((prev) =>
      prev.includes(skillName)
        ? prev.filter((s) => s !== skillName)
        : [...prev, skillName]
    )
    setPage(1)
  }

  function changeSkillMatch(value) {
    setSkillMatch(value)
    setPage(1)
  }

  function changeSortBy(value) {
    setSortBy(value)
    setPage(1)
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">

      {/* Top bar */}
      <div
        style={{ borderBottom: '1px solid #E8E0D8' }}
        className="flex items-center gap-3 mb-6 pb-3 flex-wrap"
      >
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search projects..."
          style={{
            border: '1px solid #E8E0D8',
            backgroundColor: '#FFFFFF',
            color: '#1A1512',
            minWidth: '220px',
          }}
          className="px-3 py-1.5 rounded-full text-sm"
        />

        <div
          style={{ border: '1px solid #E8E0D8', borderRadius: '9999px', overflow: 'hidden' }}
          className="flex text-sm"
        >
          <button
            onClick={() => changeSortBy('newest')}
            style={sortBy === 'newest'
              ? { backgroundColor: '#C4552A', color: '#FFFFFF' }
              : { backgroundColor: '#FFFFFF', color: '#9A8880' }
            }
            className="px-3 py-1.5 font-medium"
          >
            Newest
          </button>
          <button
            onClick={() => changeSortBy('recommended')}
            style={sortBy === 'recommended'
              ? { backgroundColor: '#C4552A', color: '#FFFFFF' }
              : { backgroundColor: '#FFFFFF', color: '#9A8880' }
            }
            className="px-3 py-1.5 font-medium"
          >
            Recommended
          </button>
        </div>

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
          allSkills={allSkills}
          selectedSkills={selectedSkills}
          onToggleSkill={toggleSkill}
          skillMatch={skillMatch}
          onChangeSkillMatch={changeSkillMatch}
        />
        <Projectlist
          projects={projects}
          loading={loading}
          error={error}
          page={page}
          onChangePage={setPage}
          limit={LIMIT}
        />
      </div>

    </div>
  )
}

export default Collaboratepage