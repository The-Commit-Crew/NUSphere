export function formatSkill(name) {
  if (!name) return ''
  return name
    .toUpperCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}