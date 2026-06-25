export const extractMentions = (text) => {
  if (!text) {
    return null;
  }
  const mentionRegex = /@([a-zA-z0-9]{3,50})/g;
  const matches = [...text.matchAll(mentionRegex)];
  return matches.map((match) => match[1]);
};
