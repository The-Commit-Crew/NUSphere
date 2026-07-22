import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Topicstrip from '../components/Topicstrip'
import Postlist from '../components/Postlist'
import { getAllTopics } from '../services/Authservice'
import { useSearch } from '../context/SearchContext'

function Homepage() {
  const { searchQuery, sortBy } = useSearch()
  const [selectedTopicId, setSelectedTopicId] = useState(null)
  const [topics, setTopics] = useState([])

  useEffect(() => {
    async function fetchTopics() {
      try {
        const data = await getAllTopics()
        setTopics(data)
      } catch (err) {
        console.error('Failed to load topics:', err)
      }
    }
    fetchTopics()
  }, [])

  function handleTopicCreated(topic) {
    setTopics((prev) => [...prev, topic])
    setSelectedTopicId(topic.id)
  }

  return (
    <div>
      <Topicstrip
        topics={topics}
        selectedTopicId={selectedTopicId}
        onSelectTopic={setSelectedTopicId}
      />

      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex gap-6 items-start">
          <Sidebar
            onTopicCreated={handleTopicCreated}
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