import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Topicstrip from '../components/Topicstrip'
import Postlist from '../components/Postlist'
import { useAuth } from '../context/AuthContext'
import { getAllTopics } from '../services/Authservice'
import { useSearch } from '../context/SearchContext'

function Homepage() {
  const { user } = useAuth()
  const { searchQuery, sortBy } = useSearch()
  const [selectedTopicId, setSelectedTopicId] = useState(null)
  const [topics, setTopics] = useState([])
  const [topicsLoading, setTopicsLoading] = useState(true)

  useEffect(() => {
    async function fetchTopics() {
      try {
        const data = await getAllTopics()
        setTopics(data)
      } catch (err) {
        console.error('Failed to load topics:', err)
      } finally {
        setTopicsLoading(false)
      }
    }
    fetchTopics()
  }, [])

  return (
    <div>
      <Topicstrip
        topics={topics}
        selectedTopicId={selectedTopicId}
        onSelectTopic={setSelectedTopicId}
        showAskButton={!!user}
      />

      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex gap-6 items-start">
          <Sidebar
            topics={topics}
            loading={topicsLoading}
            selectedTopicId={selectedTopicId}
            onSelectTopic={setSelectedTopicId}
          />
          <Postlist
            selectedTopicId={selectedTopicId}
            searchQuery={searchQuery}
            sortBy={sortBy}
          />
        </div>
      </div>
    </div>
  )
}

export default Homepage