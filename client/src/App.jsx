import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { ToastContainer } from './components/Toast'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import './styles/components.css'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--border-primary)',
          borderTopColor: 'var(--accent-primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--border-primary)',
          borderTopColor: 'var(--accent-primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<PublicRoute><Login /></PublicRoute>}>
          <Route path="/login" element={<Login />} />
        </Route>
        <Route element={<PublicRoute><Signup /></PublicRoute>}>
          <Route path="/signup" element={<Signup />} />
        </Route>
        <Route element={<PublicRoute><ForgotPassword /></PublicRoute>}>
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>
        <Route element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <ToastContainer />
    </>
  )
}