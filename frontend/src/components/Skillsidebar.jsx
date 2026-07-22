import { useState, useRef } from 'react'
import { formatSkill } from '../utils/formatSkill'

const CHIP_CLOUD_CAP = 15

function Skillsidebar({ allSkills, selectedSkills, onToggleSkill, skillMatch, onChangeSkillMatch }) {
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showAllChips, setShowAllChips] = useState(false)
  const inputRef = useRef(null)

  const unselectedSkills = allSkills.filter((s) => !selectedSkills.includes(s.name))

  const suggestions = inputValue.trim() === ''
    ? unselectedSkills.slice(0, 6)
    : unselectedSkills
        .filter((s) => s.name.toLowerCase().includes(inputValue.trim().toLowerCase()))
        .slice(0, 6)

  const hasQuery = inputValue.trim() !== ''
  const noMatches = hasQuery && suggestions.length === 0

  const visibleChips = showAllChips ? unselectedSkills : unselectedSkills.slice(0, CHIP_CLOUD_CAP)
  const hiddenChipCount = unselectedSkills.length - visibleChips.length

  function addSkill(skillName) {
    onToggleSkill(skillName)
    setInputValue('')
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const exactMatch = unselectedSkills.find(
        (s) => s.name.toLowerCase() === inputValue.trim().toLowerCase()
      )
      if (exactMatch) {
        addSkill(exactMatch.name)
      } else if (suggestions.length > 0) {
        addSkill(suggestions[0].name)
      }
    } else if (e.key === 'Backspace' && inputValue === '' && selectedSkills.length > 0) {
      onToggleSkill(selectedSkills[selectedSkills.length - 1])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      inputRef.current?.blur()
    }
  }

  return (
    <aside style={{ minWidth: '200px', maxWidth: '200px' }} className="flex flex-col gap-4">
      <div>
        <p
          style={{ color: '#9A8880', fontSize: '11px', letterSpacing: '0.08em' }}
          className="uppercase font-medium mb-2"
        >
          Filter by skill
        </p>

        {/* Selected pills */}
        {selectedSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {selectedSkills.map((skillName) => (
              <span
                key={skillName}
                style={{ backgroundColor: '#C4552A', color: '#FFFFFF', fontSize: '11px' }}
                className="flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full font-medium"
              >
                {formatSkill(skillName)}
                <button
                  onClick={() => onToggleSkill(skillName)}
                  style={{ color: '#FFFFFF' }}
                  className="flex items-center justify-center rounded-full hover:opacity-70"
                  aria-label={`Remove ${skillName} filter`}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Type-to-filter input */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => { setInputValue(e.target.value); setShowSuggestions(true) }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
            onKeyDown={handleKeyDown}
            placeholder="Type a skill..."
            style={{
              border: '1px solid #E8E0D8',
              backgroundColor: '#FFFFFF',
              color: '#1A1512',
              fontSize: '13px',
            }}
            className="w-full rounded-full px-3 py-1.5"
          />

          {showSuggestions && (suggestions.length > 0 || noMatches) && (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E8E0D8',
                top: 'calc(100% + 4px)',
              }}
              className="absolute left-0 right-0 rounded-lg shadow-sm z-10 overflow-hidden"
            >
              {noMatches ? (
                <p style={{ color: '#9A8880', fontSize: '13px' }} className="px-3 py-2">
                  No skills match "{inputValue.trim()}"
                </p>
              ) : (
                suggestions.map((skill) => (
                  <button
                    key={skill.id}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => addSkill(skill.name)}
                    style={{ color: '#1A1512', fontSize: '13px' }}
                    className="w-full text-left px-3 py-2 hover:opacity-70"
                  >
                    {formatSkill(skill.name)}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Any / All toggle, once it matters */}
        {selectedSkills.length > 1 && (
          <div
            style={{ border: '1px solid #E8E0D8', borderRadius: '9999px', overflow: 'hidden' }}
            className="flex text-xs mt-2"
          >
            <button
              onClick={() => onChangeSkillMatch('any')}
              style={skillMatch === 'any'
                ? { backgroundColor: '#F0E8E0', color: '#1A1512' }
                : { backgroundColor: '#FFFFFF', color: '#9A8880' }
              }
              className="flex-1 py-1 font-medium"
            >
              Any
            </button>
            <button
              onClick={() => onChangeSkillMatch('all')}
              style={skillMatch === 'all'
                ? { backgroundColor: '#F0E8E0', color: '#1A1512' }
                : { backgroundColor: '#FFFFFF', color: '#9A8880' }
              }
              className="flex-1 py-1 font-medium"
            >
              All
            </button>
          </div>
        )}
      </div>

      {/* Browse-all chip cloud, capped with show more/less */}
      {unselectedSkills.length > 0 && (
        <div>
          <p
            style={{ color: '#9A8880', fontSize: '11px', letterSpacing: '0.08em' }}
            className="uppercase font-medium mb-2"
          >
            Browse skills
          </p>
          <div className="flex flex-wrap gap-1.5">
            {visibleChips.map((skill) => (
              <button
                key={skill.id}
                onClick={() => addSkill(skill.name)}
                style={{
                  backgroundColor: '#F5F0EB',
                  color: '#9A8880',
                  border: '1px solid #E8E0D8',
                  fontSize: '11px',
                }}
                className="px-2.5 py-1 rounded-full font-medium hover:opacity-70"
              >
                {formatSkill(skill.name)}
              </button>
            ))}
          </div>

          {unselectedSkills.length > CHIP_CLOUD_CAP && (
            <button
              onClick={() => setShowAllChips((prev) => !prev)}
              style={{ color: '#C4552A', fontSize: '11px' }}
              className="mt-2 hover:underline font-medium"
            >
              {showAllChips ? 'Show less' : `Show ${hiddenChipCount} more`}
            </button>
          )}
        </div>
      )}
    </aside>
  )
}

export default Skillsidebar