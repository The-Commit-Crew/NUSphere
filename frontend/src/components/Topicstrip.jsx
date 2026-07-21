function Topicstrip({ topics, selectedTopicId, onSelectTopic }) {
  return (
    <div
      style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E8E0D8' }}
      className="flex items-center gap-1 px-6 py-2.5 overflow-x-auto"
    >
      <button
        onClick={() => onSelectTopic(null)}
        style={selectedTopicId === null
          ? { backgroundColor: '#C4552A', color: '#FFFFFF' }
          : { backgroundColor: 'transparent', color: '#9A8880' }
        }
        className="text-xs font-medium px-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors hover:opacity-80"
      >
        All
      </button>

      {topics.map((topic) => (
        <button
          key={topic.id}
          onClick={() => onSelectTopic(topic.id)}
          style={selectedTopicId === topic.id
            ? { backgroundColor: '#C4552A', color: '#FFFFFF' }
            : { backgroundColor: 'transparent', color: '#9A8880' }
          }
          className="text-xs font-medium px-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors hover:opacity-80"
        >
          {topic.name}
        </button>
      ))}
    </div>
  )
}

export default Topicstrip