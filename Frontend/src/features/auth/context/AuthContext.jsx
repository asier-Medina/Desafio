import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import * as authService from '@services/auth.service'

const AuthContext = createContext(null)

// Normaliza el user del backend (nombre/apellido) al formato del front (name/lastName)
function normalizeUser(raw) {
  if (!raw) return null
  return {
    ...raw,
    name:      raw.name      ?? raw.nombre   ?? '',
    lastName:  raw.lastName  ?? raw.apellido ?? '',
    createdAt: raw.createdAt ?? raw.created_at ?? null,
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function init() {
      try {
        const me = await authService.getMe()
        if (!cancelled) setUser(normalizeUser(me))
      } catch {
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    init()
    return () => { cancelled = true }
  }, [])

  const login = useCallback(async ({ email, password }) => {
    setLoading(true)
    setError(null)
    try {
      const data = await authService.login({ email, password })
      const normalized = normalizeUser(data.user)
      setUser(normalized)
      return normalized
    } catch (err) {
      setError('Credenciales inválidas')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async ({ name, lastName, email, password, tlf, municipality_id, sexo, age }) => {
    setLoading(true)
    setError(null)
    try {
      const data = await authService.register({
        nombre:   name,
        apellido: lastName,
        email, password, tlf, municipality_id, sexo, age,
      })
      const normalized = normalizeUser(data.user)
      setUser(normalized)
      return normalized
    } catch (err) {
      setError('No se pudo completar el registro')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // Silencioso
    } finally {
      setUser(null)
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return context
}
