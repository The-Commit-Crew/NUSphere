import { useState, useEffect } from 'react'
import { getAllTopics } from '../services/Authservice'

function Sidebar({ selectedTopicId, onSelectTopic }) {
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTopics() {
      try {
        const data = await getAllTopics()
        setTopics(data)
      } catch (err) {
        console.error('Failed to load topics:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchTopics()
  }, [])

  return (
    <aside
      style={{ minWidth: '180px', maxWidth: '180px' }}
      className="flex flex-col gap-6"
    >

      {/* Browse */}
      <div>
        <p
          style={{ color: '#9A8880', fontSize: '11px', letterSpacing: '0.08em' }}
          className="uppercase font-medium mb-2"
        >
          Browse
        </p>

        <div className="flex flex-col">

          {/* All button */}
          <button
            onClick={() => onSelectTopic(null)}
            style={selectedTopicId === null
              ? { backgroundColor: '#F0E8E0', color: '#1A1512', borderLeft: '2px solid #C4552A' }
              : { color: '#1A1512' }
            }
            className="flex items-center gap-2 px-3 py-2 text-sm text-left hover:opacity-70 rounded-sm"
          >
            All
          </button>

          {/* Real topics from API */}
          {loading ? (
            <p style={{ color: '#9A8880' }} className="px-3 py-2 text-xs">
              Loading...
            </p>
          ) : (
            topics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => onSelectTopic(topic.id)}
                style={selectedTopicId === topic.id
                  ? { backgroundColor: '#F0E8E0', color: '#1A1512', borderLeft: '2px solid #C4552A' }
                  : { color: '#1A1512' }
                }
                className="flex items-center gap-2 px-3 py-2 text-sm text-left hover:opacity-70 rounded-sm"
              >
                {topic.name}
              </button>
            ))
          )}
        </div>
      </div>

    </aside>
  )
}

export default Sidebar