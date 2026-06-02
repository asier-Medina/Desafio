import { useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import InputField from './InputField'
import PasswordInput from './PasswordInput'
import SubmitButton from './SubmitButton'
import { sanitize, sanitizePassword, validateEmail } from '../utils/validation'

export default function LoginForm({ onSuccess }) {
  const { login, loading, error, clearError } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({})

  function validate() {
    const errors = {}
    const emailErr = validateEmail(form.email)
    if (emailErr) errors.email = emailErr
    if (!form.password) errors.password = 'La contraseña es obligatoria'
    else if (form.password.length < 8) errors.password = 'Mínimo 8 caracteres'
    else if (form.password.length > 128) errors.password = 'Contraseña demasiado larga'
    return errors
  }

  const handleEmailChange = useCallback((e) => {
    const raw = e.target.value
    const cleaned = sanitize(raw)
    const lower = cleaned.toLowerCase()
    setForm((prev) => ({ ...prev, email: lower }))
  }, [])

  const handlePasswordChange = useCallback((e) => {
    const cleaned = sanitizePassword(e.target.value)
    setForm((prev) => ({ ...prev, password: cleaned }))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    clearError()
    try {
      const cleanEmail = sanitize(form.email).toLowerCase()
      const cleanPassword = sanitizePassword(form.password)
      await login({ email: cleanEmail, password: cleanPassword })
      onSuccess?.()
    } catch {
      // Error manejado por el contexto
    }
  }

  return (
    <form onSubmit={handleSubmit} className="auth-card__form" noValidate autoComplete="off">
      {error && (
        <div className="auth-card__error" role="alert">
          Credenciales inválidas. Intente de nuevo.
        </div>
      )}

      <InputField
        label="Correo electrónico"
        id="login-email"
        type="email"
        placeholder="tucorreo@ejemplo.com"
        value={form.email}
        onChange={handleEmailChange}
        error={fieldErrors.email}
        autoComplete="email"
        maxLength={254}
      />

      <PasswordInput
        label="Contraseña"
        id="login-password"
        placeholder="••••••••"
        value={form.password}
        onChange={handlePasswordChange}
        error={fieldErrors.password}
        autoComplete="current-password"
      />

      <SubmitButton loading={loading}>Iniciar sesión</SubmitButton>
    </form>
  )
}
