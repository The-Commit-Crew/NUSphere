import { useMemo } from 'react'
import { formatSkill } from '../utils/formatSkill'

function Skillsidebar({ projects, selectedSkill, onSelectSkill }) {

  const skills = useMemo(() => {
    const skillSet = new Set()
    projects.forEach((project) => {
      project.skills?.forEach((skill) => skillSet.add(skill.name))
    })
    return Array.from(skillSet).sort()
  }, [projects])

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
          Filter by skill
        </p>

        <div className="flex flex-col">

          {/* All button */}
          <button
            onClick={() => onSelectSkill(null)}
            style={selectedSkill === null
              ? { backgroundColor: '#F0E8E0', color: '#1A1512', borderLeft: '2px solid #C4552A' }
              : { color: '#1A1512' }
            }
            className="flex items-center gap-2 px-3 py-2 text-sm text-left hover:opacity-70 rounded-sm"
          >
            All
          </button>

          {/* Skills derived from current projects */}
          {skills.length === 0 ? (
            <p style={{ color: '#9A8880' }} className="px-3 py-2 text-xs">
              No skills yet
            </p>
          ) : (
            skills.map((skillName) => (
              <button
                key={skillName}
                onClick={() => onSelectSkill(skillName)}
                style={selectedSkill === skillName
                  ? { backgroundColor: '#F0E8E0', color: '#1A1512', borderLeft: '2px solid #C4552A' }
                  : { color: '#1A1512' }
                }
                className="flex items-center gap-2 px-3 py-2 text-sm text-left hover:opacity-70 rounded-sm"
              >
               {formatSkill(skillName)}
              </button>
            ))
          )}
        </div>
      </div>

    </aside>
  )
}

export default Skillsidebar