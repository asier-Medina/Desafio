import { useState } from 'react'
import { useNavigate } from 'react-router'
import SplashScreen from './SplashScreen'

export default function Home() {
  const [showSplash, setShowSplash] = useState(true)
  const navigate = useNavigate()

  function handleFinish() {
    setShowSplash(false)
    navigate('/login', { replace: true })
  }

  if (showSplash) return <SplashScreen onFinish={handleFinish} />

  return null
}
