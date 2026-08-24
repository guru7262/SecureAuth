import { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'

export default function Login() {
  const navigate = useNavigate()
  const { login, clearError } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  })
  const [errors, setErrors] = useState({})

  const validateField = useCallback((name, value) => {
    switch (name) {
      case 'email':
        if (!value) return 'Email is required'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address'
        return ''
      case 'password':
        if (!value) return 'Password is required'
        return ''
      default:
        return ''
    }
  }, [])

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value
    setFormData((prev) => ({ ...prev, [name]: newValue }))

    const error = validateField(name, newValue)
    setErrors((prev) => ({ ...prev, [name]: error }))

    if (errors[name]) {
      clearError()
    }
  }, [validateField, errors, clearError])

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target
    const error = validateField(name, value)
    setErrors((prev) => ({ ...prev, [name]: error }))
  }, [validateField])

  const handleSubmit = async (e) => {
    e.preventDefault()

    const newErrors = {}
    Object.keys(formData).forEach((key) => {
      if (key !== 'remember') {
        const error = validateField(key, formData[key])
        if (error) newErrors[key] = error
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)

    try {
      const result = await login({ email: formData.email, password: formData.password })
      if (result.success) {
        toast({
          title: 'Welcome back!',
          message: 'You have been signed in successfully.',
          variant: 'success',
        })
        navigate('/dashboard', { replace: true })
      } else {
        toast({
          title: 'Sign in failed',
          message: result.error,
          variant: 'error',
        })
      }
    } catch (err) {
      toast({
        title: 'Error',
        message: err.message || 'An unexpected error occurred',
        variant: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-layout">
      <main className="auth-card" role="main">
        <header className="auth-header">
          <div className="auth-logo" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="6" fill="currentColor"/>
              <path d="M16 8C20.4183 8 24 11.5817 24 16C24 20.4183 20.4183 24 16 24C11.5817 24 8 20.4183 8 16C8 11.5817 11.5817 8 16 8Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 12V16M16 16L16 20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your SecureAuth account</p>
        </header>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <div className="form-input-wrapper">
              <input
                type="email"
                id="email"
                name="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
                disabled={isLoading}
                aria-invalid={errors.email ? 'true' : 'false'}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              <span className="form-input-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M22 6L12 13L2 6" />
                </svg>
              </span>
            </div>
            {errors.email && (
              <p id="email-error" className="form-error" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="password" className="form-label">
                Password
              </label>
            </div>
            <div className="form-input-wrapper">
              <input
                type="password"
                id="password"
                name="password"
                className={`form-input ${errors.password ? 'error' : ''}`}
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isLoading}
                aria-invalid={errors.password ? 'true' : 'false'}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              <button
                type="button"
                className="form-toggle-visibility"
                onClick={() => {
                  const input = document.getElementById('password')
                  input.type = input.type === 'password' ? 'text' : 'password'
                }}
                aria-label="Toggle password visibility"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="form-error" role="alert">
                {errors.password}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: 'var(--accent-primary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-input)',
                }}
              />
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Remember me</span>
            </label>
            <Link to="/forgot-password" className="auth-link" style={{ fontSize: '0.875rem' }}>
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="divider"><span>or</span></div>

        <button
          type="button"
          className="btn btn-secondary btn-full"
          onClick={() => navigate('/signup')}
        >
          Create an account
        </button>

        <footer className="auth-footer">
          <p>
            By continuing, you agree to our{' '}
            <a href="/terms" className="auth-link">Terms of Service</a>{' '}
            and{' '}
            <a href="/privacy" className="auth-link">Privacy Policy</a>
          </p>
        </footer>
      </main>
    </div>
  )
}