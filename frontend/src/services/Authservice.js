const BASE_URL = import.meta.env.VITE_API_URL

// The CSRF token is handed to us once via GET /auth/csrf-token and stays
// valid regardless of login state, so we cache it in memory (a plain JS
// variable) and fetch it once per page load.
let csrfToken = null
let csrfTokenPromise = null

async function ensureCsrfToken() {
  if (csrfToken) return csrfToken
  if (!csrfTokenPromise) {
    csrfTokenPromise = fetch(`${BASE_URL}/auth/csrf-token`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        csrfToken = data.csrfToken
        return csrfToken
      })
  }
  return csrfTokenPromise
}

const MUTATING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE']
const NO_RETRY_PATHS = ['/auth/login', '/auth/register', '/auth/verify-otp', '/auth/resend-otp', '/auth/refresh']

async function apiFetch(path, options = {}, isRetry = false) {
  const method = (options.method || 'GET').toUpperCase()
  const headers = { ...(options.headers || {}) }

  if (MUTATING_METHODS.includes(method)) {
    headers['x-csrf-token'] = await ensureCsrfToken()
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    method,
    headers,
    credentials: 'include',
  })

  if (response.status === 401 && !isRetry && !NO_RETRY_PATHS.includes(path)) {
    const refreshed = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'x-csrf-token': await ensureCsrfToken() },
    })
    if (refreshed.ok) {
      return apiFetch(path, options, true)
    }
  }

  const result = await response.json()
  if (!response.ok) throw new Error(result.message || 'Request failed')
  return result
}

export async function registerUser(data) {
  return apiFetch('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export async function loginUser(data) {
  return apiFetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export async function verifyOtp(data) {
  return apiFetch('/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export async function resendOtp(data) {
  return apiFetch('/auth/resend-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export async function logoutUser() {
  return apiFetch('/auth/logout', { method: 'POST' })
}

//Topics
export async function getAllTopics() {
  return apiFetch('/topics')
}

export async function getTopicById(topicId) {
  return apiFetch(`/topics/${topicId}`)
}

//Posts

export async function getAllPosts() {
  return apiFetch('/posts')
}

export async function getPostById(postId) {
  return apiFetch(`/posts/${postId}`)
}

export async function createPost(data) {
  return apiFetch('/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}
export async function deletePost(postId) {
  return apiFetch(`/posts/${postId}`, { method: 'DELETE' })
}

//Voting
export async function castVote(postId, voteType) {
  return apiFetch(`/posts/${postId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ voteType }),
  })
}

//Comments

export async function getPostComments(postId) {
  return apiFetch(`/posts/${postId}/comments`)
}

export async function createComment(postId, data) {
  return apiFetch(`/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export async function updateComment(commentId, data) {
  return apiFetch(`/comments/${commentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export async function deleteComment(commentId) {
  return apiFetch(`/comments/${commentId}`, { method: 'DELETE' })
}

//Projects

export async function getAllProjects() {
  return apiFetch('/projects')
}

export async function getProjectById(projectId) {
  return apiFetch(`/projects/${projectId}`)
}

export async function createProject(data) {
  return apiFetch('/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export async function updateProject(projectId, data) {
  return apiFetch(`/projects/${projectId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export async function applyToProject(projectId, data) {
  return apiFetch(`/projects/${projectId}/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export async function getProjectApplications(projectId) {
  return apiFetch(`/projects/${projectId}/applications`)
}

export async function updateApplicationStatus(appId, data) {
  return apiFetch(`/projects/applications/${appId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

//User Profile

export async function getUserProfile(username) {
  return apiFetch(`/users/${username}`)
}

export async function updateUserProfile(data) {
  return apiFetch('/users/me', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export async function uploadProfilePhoto(file) {
  const formData = new FormData()
  formData.append('profileImage', file)
  return apiFetch('/users/me/photo', {
    method: 'PATCH',
    body: formData,
  })
}

export async function deleteProfilePhoto() {
  return apiFetch('/users/me/photo', { method: 'DELETE' })
}

//Notifications

export async function getUserNotifications() {
  return apiFetch('/notifications')
}

export async function markNotificationAsRead(notificationId) {
  return apiFetch(`/notifications/${notificationId}/read`, { method: 'PATCH' })
}