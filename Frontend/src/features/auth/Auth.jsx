import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginSection from './sections/LoginSection'
import RegisterSection from './sections/RegisterSection'

function AuthContent() {
  const [isLogin, setIsLogin] = useState(true)
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  if (loading) return null

  if (user) return <Navigate to="/" replace />

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
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
      </div>
    </div>
  )
}

export default function Auth() {
  return (
    <AuthProvider>
      <AuthContent />
    </AuthProvider>
  )
}
