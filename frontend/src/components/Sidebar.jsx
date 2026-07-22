import { useState } from 'react'
import { Link } from 'react-router-dom'
import Modal from './Modal'
import { createTopic } from '../services/Authservice'
import { useAuth } from '../context/AuthContext'
import { useSearch } from '../context/SearchContext'

function formatCategory(category) {
  return category.replace(/[/_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

const SORT_OPTIONS = [
  { value: 'hot', label: 'Hot' },
  { value: 'new', label: 'New' },
  { value: 'top', label: 'Top' },
]

function Sidebar({ onTopicCreated, onSelectTopic }) {
  const { user } = useAuth()
  const { sortBy, setSortBy } = useSearch()

  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [error, setError] = useState('')
  const [flaggedCategories, setFlaggedCategories] = useState([])
  const [subsumption, setSubsumption] = useState(null)
  const [loading, setLoading] = useState(false)

  function closeModal() {
    setModalOpen(false)
    setFormData({ name: '', description: '' })
    setError('')
    setFlaggedCategories([])
    setSubsumption(null)
  }

  function handleChange(e) {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setFlaggedCategories([])
    setSubsumption(null)
    setLoading(true)

    try {
      const result = await createTopic(formData)

      if (result.isDuplicate) {
        setSubsumption(result)
        return
      }

      const topic = result.topic || result
      closeModal()
      onTopicCreated(topic)
    } catch (err) {
      setError(err.message)
      setFlaggedCategories(err.categories || [])
    } finally {
      setLoading(false)
    }
  }

  return (
    <aside style={{ minWidth: '200px', maxWidth: '200px' }} className="flex flex-col gap-6">

      {/* Sort */}
      <div>
        <p style={{ color: '#9A8880', fontSize: '11px', letterSpacing: '0.08em' }} className="uppercase font-medium mb-2">
          Sort by
        </p>
        <div className="flex flex-col gap-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              style={sortBy === opt.value
                ? { backgroundColor: '#F0E8E0', color: '#1A1512', borderLeft: '2px solid #C4552A' }
                : { color: '#1A1512' }
              }
              className="flex items-center gap-2 px-3 py-2 text-sm text-left hover:opacity-70 rounded-sm"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      {user && (
        <div>
          <p style={{ color: '#9A8880', fontSize: '11px', letterSpacing: '0.08em' }} className="uppercase font-medium mb-2">
            Quick actions
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setModalOpen(true)}
              style={{ backgroundColor: '#F5E8E2', color: '#9E3D1C' }}
              className="text-xs font-semibold px-3 py-2 rounded-full hover:opacity-80 text-center"
            >
              + New topic
            </button>
            <Link
              to="/create-post"
              style={{ backgroundColor: '#F5E8E2', color: '#9E3D1C' }}
              className="text-xs font-semibold px-3 py-2 rounded-full hover:opacity-80 text-center"
            >
              + Ask a question
            </Link>
          </div>
        </div>
      )}

      <Modal open={modalOpen} onClose={closeModal} title="Create a topic">
        {subsumption ? (
          <div className="flex flex-col gap-4">
            <p style={{ color: '#6B5B52', fontSize: '14px', lineHeight: '1.5' }}>
              {subsumption.reason}
            </p>
            <button
              onClick={() => {
                closeModal()
                onSelectTopic(subsumption.existingTopicId)
              }}
              style={{ backgroundColor: '#C4552A', color: '#fff' }}
              className="px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 w-fit"
            >
              Go to existing topic
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div style={{ backgroundColor: '#FFF0EB', border: '1px solid #C4552A', color: '#C4552A' }} className="text-sm px-4 py-3 rounded-lg">
                <p>{error}</p>
                {flaggedCategories.length > 0 && (
                  <p className="mt-1 text-xs">
                    Flagged for: {flaggedCategories.map(formatCategory).join(', ')}
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label style={{ color: '#1A1512', fontSize: '13px' }} className="font-medium">Topic name</label>
              <input
                name="name"
                type="text"
                placeholder="e.g. Campus Housing"
                value={formData.name}
                onChange={handleChange}
                required
                style={{ border: '1px solid #E8E0D8', color: '#1A1512', backgroundColor: '#FAFAF8' }}
                className="px-3 py-2 rounded-lg text-sm outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label style={{ color: '#1A1512', fontSize: '13px' }} className="font-medium">Description</label>
              <textarea
                name="description"
                placeholder="What kind of posts belong here?"
                value={formData.description}
                onChange={handleChange}
                required
                rows={3}
                style={{ border: '1px solid #E8E0D8', color: '#1A1512', backgroundColor: '#FAFAF8', resize: 'vertical' }}
                className="px-3 py-2 rounded-lg text-sm outline-none"
              />
            </div>

            <div className="flex gap-3 mt-1">
              <button
                type="button"
                onClick={closeModal}
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
                {loading ? 'Creating...' : 'Create topic'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </aside>
  )
}

export default Sidebar
