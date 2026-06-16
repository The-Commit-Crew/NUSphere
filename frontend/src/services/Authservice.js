const BASE_URL = import.meta.env.VITE_API_URL

export async function registerUser(data) {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || 'Registration failed')
  return result
}

export async function loginUser(data) {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || 'Login failed')
  return result
}

export async function verifyOtp(data) {
  const response = await fetch(`${BASE_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || 'OTP verification failed')
  return result
}

export async function resendOtp(data) {
  const response = await fetch(`${BASE_URL}/auth/resend-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || 'Resend OTP failed')
  return result
}

// ---- Topics ----

export async function getAllTopics() {
  const response = await fetch(`${BASE_URL}/topics`)
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || 'Failed to fetch topics')
  return result
}

export async function getTopicById(topicId) {
  const response = await fetch(`${BASE_URL}/topics/${topicId}`)
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || 'Failed to fetch topic')
  return result
}

// ---- Posts ----

export async function getPostById(postId, token) {
  const headers = {}
  if (token) {
  headers.Authorization = `Bearer ${token}`
}
  const response = await fetch(`${BASE_URL}/posts/${postId}`,{
    headers,
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || 'Failed to fetch post')
  return result
}

export async function createPost(data, token) {
  const response = await fetch(`${BASE_URL}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || 'Failed to create post')
  return result
}

export async function castVote(postId, voteType, token) {
    const response = await fetch(`${BASE_URL}/posts/${postId}/vote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ voteType }),
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || 'Failed to vote')
  return result
}

