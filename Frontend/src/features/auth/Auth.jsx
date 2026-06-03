import { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router'
import { useAuth } from './context/AuthContext'
import LoginSection from './sections/LoginSection'
import RegisterSection from './sections/RegisterSection'
import BackButton from '@ui/BackButton'
import { Card } from '@shared/components/Cards'
import './auth.css'

function AuthContent() {
  const [isLogin, setIsLogin] = useState(true)
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  useEffect(() => {
    const meta = document.createElement('meta')
    meta.httpEquiv = 'Cache-Control'
    meta.content = 'no-store, no-cache, must-revalidate'
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])

  if (loading) return null

  if (user) return <Navigate to="/" replace />

  return (
    <div className="auth-page">
      <div className="auth-page__back">
        <BackButton onClick={() => navigate(-1)} />
      </div>
      <Card display="auth">
        {isLogin ? (
          <LoginSection
            onToggle={() => setIsLogin(false)}
            onSuccess={() => navigate('/', { replace: true })}
          />
        ) : (
          <RegisterSection
            onToggle={() => setIsLogin(true)}
            onSuccess={() => navigate('/', { replace: true })}
          />
        )}
      </Card>
    </div>
  )
}

export default function Auth() {
  return <AuthContent />
}
