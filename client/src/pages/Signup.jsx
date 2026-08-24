import { useState, useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'

const PASSWORD_REQUIREMENTS = [
  { id: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { id: 'uppercase', label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { id: 'lowercase', label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { id: 'number', label: 'One number', test: (p) => /\d/.test(p) },
  { id: 'special', label: 'One special character', test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
]

function calculateStrength(password) {
  if (!password) return { score: 0, label: '' }
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++

  const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong']
  return { score: Math.min(score, 5), label: labels[Math.min(score, 5)] }
}

function getStrengthClass(score) {
  if (score <= 1) return 'weak'
  if (score === 2) return 'fair'
  if (score === 3) return 'good'
  return 'strong'
}

export default function Signup() {
  const navigate = useNavigate()
  const { signup, clearError } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false,
  })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const strength = useMemo(() => calculateStrength(formData.password), [formData.password])
  const metRequirements = useMemo(
    () => PASSWORD_REQUIREMENTS.map((req) => ({ ...req, met: req.test(formData.password) })),
    [formData.password]
  )

  const validateField = useCallback((name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required'
        if (value.trim().length < 2) return 'Name must be at least 2 characters'
        if (value.trim().length > 50) return 'Name must be less than 50 characters'
        return ''
      case 'email':
        if (!value) return 'Email is required'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address'
        return ''
      case 'password':
        if (!value) return 'Password is required'
        if (value.length < 8) return 'Password must be at least 8 characters'
        return ''
      case 'confirmPassword':
        if (!value) return 'Please confirm your password'
        if (value !== formData.password) return 'Passwords do not match'
        return ''
      case 'terms':
        if (!value) return 'You must accept the terms and conditions'
        return ''
      default:
        return ''
    }
  }, [formData.password])

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value
    setFormData((prev) => ({ ...prev, [name]: newValue }))

    if (touched[name]) {
      const error = validateField(name, newValue)
      setErrors((prev) => ({ ...prev, [name]: error }))
    }

    if (errors[name]) {
      clearError()
    }
  }, [validateField, touched, errors, clearError])

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    const error = validateField(name, value)
    setErrors((prev) => ({ ...prev, [name]: error }))
  }, [validateField])

  const handleSubmit = async (e) => {
    e.preventDefault()

    const newErrors = {}
    const newTouched = {}
    Object.keys(formData).forEach((key) => {
      newTouched[key] = true
      const error = validateField(key, formData[key])
      if (error) newErrors[key] = error
    })

    setTouched(newTouched)

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)

    try {
      const result = await signup({
        name: formData.name.trim(),
        email: formData.email,
        password: formData.password,
      })

      if (result.success) {
        toast({
          title: 'Account created!',
          message: 'Welcome to SecureAuth. You are now signed in.',
          variant: 'success',
        })
        navigate('/dashboard', { replace: true })
      } else {
        toast({
          title: 'Signup failed',
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
            <svg viewBox="0 0 115 100" xmlns="http://www.w3.org/2000/svg">
              <path d="M57.5 0L115 100H0L57.5 0Z" />
            </svg>
          </div>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Start securing your applications today</p>
        </header>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full name
            </label>
            <div className="form-input-wrapper">
              <input
                type="text"
                id="name"
                name="name"
                className={`form-input ${errors.name && touched.name ? 'error' : ''}`}
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="John Doe"
                autoComplete="name"
                autoFocus
                disabled={isLoading}
                aria-invalid={errors.name && touched.name ? 'true' : 'false'}
                aria-describedby={errors.name && touched.name ? 'name-error' : undefined}
              />
              <span className="form-input-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
            </div>
            {errors.name && touched.name && (
              <p id="name-error" className="form-error" role="alert">
                {errors.name}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <div className="form-input-wrapper">
              <input
                type="email"
                id="email"
                name="email"
                className={`form-input ${errors.email && touched.email ? 'error' : ''}`}
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={isLoading}
                aria-invalid={errors.email && touched.email ? 'true' : 'false'}
                aria-describedby={errors.email && touched.email ? 'email-error' : undefined}
              />
              <span className="form-input-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M22 6L12 13L2 6" />
                </svg>
              </span>
            </div>
            {errors.email && touched.email && (
              <p id="email-error" className="form-error" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="form-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className={`form-input ${errors.password && touched.password ? 'error' : ''}`}
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isLoading}
                aria-invalid={errors.password && touched.password ? 'true' : 'false'}
                aria-describedby={errors.password && touched.password ? 'password-error' : 'password-hint'}
              />
              <button
                type="button"
                className="form-toggle-visibility"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {showPassword ? (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22" />
                    </>
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  )}
                </svg>
              </button>
            </div>
            {errors.password && touched.password ? (
              <p id="password-error" className="form-error" role="alert">
                {errors.password}
              </p>
            ) : (
              <p id="password-hint" className="form-hint">
                Must be at least 8 characters
              </p>
            )}

            {formData.password && (
              <div aria-live="polite" aria-label="Password strength">
                <div className="strength-meter" role="progressbar" aria-valuenow={strength.score} aria-valuemin={0} aria-valuemax={5} aria-label={`Password strength: ${strength.label}`}>
                  <div className={`strength-meter-fill ${getStrengthClass(strength.score)}`} style={{ width: `${(strength.score / 5) * 100}%` }} />
                </div>
                <p className="strength-label">Strength: {strength.label}</p>
                <ul className="requirements-list" role="list" aria-label="Password requirements">
                  {metRequirements.map((req) => (
                    <li key={req.id} className={`requirement ${req.met ? 'met' : ''}`}>
                      <span className="requirement-icon" aria-hidden="true">
                        {req.met ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                          </svg>
                        )}
                      </span>
                      <span>{req.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm password
            </label>
            <div className="form-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                className={`form-input ${errors.confirmPassword && touched.confirmPassword ? 'error' : ''}`}
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isLoading}
                aria-invalid={errors.confirmPassword && touched.confirmPassword ? 'true' : 'false'}
                aria-describedby={errors.confirmPassword && touched.confirmPassword ? 'confirm-error' : undefined}
              />
              <span className="form-input-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </span>
            </div>
            {errors.confirmPassword && touched.confirmPassword && (
              <p id="confirm-error" className="form-error" role="alert">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
                onBlur={handleBlur}
                style={{
                  width: '16px',
                  height: '16px',
                  marginTop: '0.125rem',
                  accentColor: 'var(--accent-primary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-input)',
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                I agree to the{' '}
                <a href="/terms" className="auth-link">Terms of Service</a>{' '}
                and{' '}
                <a href="/privacy" className="auth-link">Privacy Policy</a>
              </span>
            </label>
            {errors.terms && touched.terms && (
              <p className="form-error" role="alert">
                {errors.terms}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="divider"><span>already have an account?</span></div>

        <button
          type="button"
          className="btn btn-secondary btn-full"
          onClick={() => navigate('/login')}
        >
          Sign in
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