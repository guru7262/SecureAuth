const API_BASE = import.meta.env.VITE_API_URL || ''

class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}/api${endpoint}`
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new ApiError(data.message || 'Request failed', response.status, data)
  }

  return data
}

export const authApi = {
  signup: (credentials) => request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  login: (credentials) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  logout: () => request('/auth/logout', { method: 'POST' }),

  me: () => request('/auth/me'),

  forgotPassword: (email) => request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),

  resetPassword: (token, password) => request('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  }),
}

export { ApiError }