import { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const validateEmail = useCallback((value) => {
    if (!value) return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address'
    return ''
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const emailError = validateEmail(email)
    if (emailError) {
      setError(emailError)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset email')
      }

      setSubmitted(true)
      toast({
        title: 'Email sent!',
        message: 'If an account exists, you will receive a password reset link.',
        variant: 'success',
      })
    } catch (err) {
      setError(err.message)
      toast({
        title: 'Error',
        message: err.message,
        variant: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-layout">
      <main className="auth-card" role="main">
        {submitted ? (
          <>
            <header className="auth-header">
              <div className="auth-logo" aria-hidden="true">
                <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="32" height="32" rx="6" fill="currentColor"/>
                  <path d="M16 8C20.4183 8 24 11.5817 24 16C24 20.4183 20.4183 24 16 24C11.5817 24 8 20.4183 8 16C8 11.5817 11.5817 8 16 8Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 12V16M16 16L16 20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h1 className="auth-title">Check your email</h1>
              <p className="auth-subtitle">
                We&apos;ve sent a password reset link to <strong>{email}</strong>
              </p>
            </header>

            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                The link will expire in 1 hour for security.
              </p>
              <button
                type="button"
                className="btn btn-primary btn-full"
                onClick={() => navigate('/login')}
              >
                Back to sign in
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-full"
                style={{ marginTop: '0.75rem' }}
                onClick={() => {
                  setSubmitted(false)
                  setEmail('')
                }}
              >
                Resend email
              </button>
            </div>
          </>
        ) : (
          <>
            <header className="auth-header">
              <div className="auth-logo" aria-hidden="true">
                <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="32" height="32" rx="6" fill="currentColor"/>
                  <path d="M16 8C20.4183 8 24 11.5817 24 16C24 20.4183 20.4183 24 16 24C11.5817 24 8 20.4183 8 16C8 11.5817 11.5817 8 16 8Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 12V16M16 16L16 20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h1 className="auth-title">Forgot password?</h1>
              <p className="auth-subtitle">Enter your email and we&apos;ll send you a reset link</p>
            </header>

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email address
                </label>
                <div className="form-input-wrapper">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={`form-input ${error ? 'error' : ''}`}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (error) setError('')
                    }}
                    placeholder="you@example.com"
                    autoComplete="email"
                    autoFocus
                    disabled={isLoading}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? 'email-error' : undefined}
                  />
                  <span className="form-input-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="M22 6L12 13L2 6" />
                    </svg>
                  </span>
                </div>
                {error && (
                  <p id="email-error" className="form-error" role="alert">
                    {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                disabled={isLoading}
                aria-busy={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>

            <div className="divider"><span>remember your password?</span></div>

            <button
              type="button"
              className="btn btn-secondary btn-full"
              onClick={() => navigate('/login')}
            >
              Back to sign in
            </button>
          </>
        )}

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