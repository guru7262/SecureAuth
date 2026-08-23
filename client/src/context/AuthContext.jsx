import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const apiRequest = useCallback(async (endpoint, options = {}) => {
    const baseUrl = import.meta.env.VITE_API_URL || ''
    const response = await fetch(`${baseUrl}/api${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong')
    }

    return data
  }, [])

  const checkAuth = useCallback(async () => {
    try {
      const data = await apiRequest('/auth/me')
      setUser(data.user)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [apiRequest])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const signup = useCallback(async (credentials) => {
    setError(null)
    try {
      const data = await apiRequest('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(credentials),
      })
      setUser(data.user)
      return { success: true, user: data.user }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }, [apiRequest])

  const login = useCallback(async (credentials) => {
    setError(null)
    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      })
      setUser(data.user)
      return { success: true, user: data.user }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }, [apiRequest])

  const logout = useCallback(async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' })
    } catch {
      // Ignore logout errors
    } finally {
      setUser(null)
    }
  }, [apiRequest])

  const clearError = useCallback(() => setError(null), [])

  const value = {
    user,
    loading,
    error,
    signup,
    login,
    logout,
    clearError,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}