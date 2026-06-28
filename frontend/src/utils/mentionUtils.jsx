import { Link } from 'react-router-dom'

// Matches @ followed by letters, numbers, underscores, or hyphens
const MENTION_REGEX = /@([a-zA-Z0-9_-]+)/g

export function renderWithMentions(text) {
  if (!text) return text

  const parts = []
  let lastIndex = 0
  let match

  // Reset regex state since it's a shared module-level regex with the 'g' flag
  MENTION_REGEX.lastIndex = 0

  while ((match = MENTION_REGEX.exec(text)) !== null) {
    const [fullMatch, username] = match
    const matchStart = match.index

    // Push the plain text before this mention
    if (matchStart > lastIndex) {
      parts.push(text.slice(lastIndex, matchStart))
    }

    // Push the mention as a clickable link
    parts.push(
      <Link
        key={`${matchStart}-${username}`}
        to={`/u/${username}`}
        style={{ color: '#C4552A' }}
        className="font-medium hover:underline"
      >
        {fullMatch}
      </Link>
    )

    lastIndex = matchStart + fullMatch.length
  }

  // Push whatever plain text is left after the last mention
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts
}