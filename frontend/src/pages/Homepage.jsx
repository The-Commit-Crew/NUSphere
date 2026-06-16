import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Postlist from '../components/Postlist'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Homepage() {
  const { user } = useAuth()
  const [selectedTopicId, setSelectedTopicId] = useState(null)

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">

      {/* Top bar */}
      <div style={{ borderBottom: '1px solid #E8E0D8' }} className="flex items-center gap-6 mb-6 pb-3">
        {user && (
          <Link
            to="/create-post"
            style={{ marginLeft: 'auto', border: '1px solid #C4552A', color: '#C4552A' }}
            className="px-4 py-1.5 rounded-full text-sm font-medium hover:opacity-80"
          >
            + Ask a question
          </Link>
        )}
      </div>

      {/* Two column layout */}
      <div className="flex gap-6">
        <Sidebar
          selectedTopicId={selectedTopicId}
          onSelectTopic={setSelectedTopicId}
        />
        <Postlist selectedTopicId={selectedTopicId} />
      </div>

    </div>
  )
}

export default Homepage