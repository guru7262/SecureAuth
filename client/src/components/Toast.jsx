import { useEffect, useState } from 'react'

const TOAST_LIMIT = 3
const TOAST_REMOVE_DELAY = 5000

let toastId = 0
let toasts = []
let listeners = []

function dispatch(action) {
  toasts = reducer(toasts, action)
  listeners.forEach((listener) => listener(toasts))
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return [action.toast, ...state].slice(0, TOAST_LIMIT)
    case 'REMOVE':
      return state.filter((t) => t.id !== action.id)
    default:
      return state
  }
}

export function useToast() {
  const [state, setState] = useState(toasts)

  useEffect(() => {
    listeners.push(setState)
    return () => {
      listeners = listeners.filter((l) => l !== setState)
    }
  }, [])

  const toast = ({ title, message, variant = 'default', duration = TOAST_REMOVE_DELAY }) => {
    const id = ++toastId
    const newToast = { id, title, message, variant }
    dispatch({ type: 'ADD', toast: newToast })

    if (duration > 0) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE', id })
      }, duration)
    }

    return {
      id,
      dismiss: () => dispatch({ type: 'REMOVE', id }),
      update: (props) => {
        toasts = toasts.map((t) => (t.id === id ? { ...t, ...props } : t))
        listeners.forEach((listener) => listener(toasts))
      },
    }
  }

  return { toast, toasts: state }
}

export function ToastContainer() {
  const { toasts } = useToast()

  return (
    <div className="toast-container" role="region" aria-label="Notifications" aria-live="polite">
      {toasts.map(({ id, title, message, variant }) => (
        <Toast key={id} id={id} title={title} message={message} variant={variant} />
      ))}
    </div>
  )
}

function Toast({ id, title, message, variant }) {
  const icons = {
    default: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
    ),
    success: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    error: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
    warning: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  }

  return (
    <div className={`toast ${variant}`} role="alert">
      <div className="toast-icon" aria-hidden="true">
        {icons[variant] || icons.default}
      </div>
      <div className="toast-content">
        <div className="toast-title">{title}</div>
        {message && <div className="toast-message">{message}</div>}
      </div>
      <button
        className="toast-close"
        onClick={() => dispatch({ type: 'REMOVE', id })}
        aria-label="Dismiss notification"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}