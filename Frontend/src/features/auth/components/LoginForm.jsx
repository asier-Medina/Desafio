import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import InputField from './InputField'
import PasswordInput from './PasswordInput'
import SubmitButton from './SubmitButton'

export default function LoginForm({ onSuccess }) {
  const { login, loading, error, clearError } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({})

  function validate() {
    const errors = {}
    if (!form.email.trim()) errors.email = 'El correo es obligatorio'
    if (!form.password) errors.password = 'La contraseña es obligatoria'
    return errors
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    clearError()
    try {
      await login({ email: form.email, password: form.password })
      onSuccess?.()
    } catch {
      // Error manejado por el contexto
    }
  }

  return (
    <form onSubmit={handleSubmit} className="auth-card__form" noValidate>
      {error && (
        <div className="auth-card__error">
          {error}
        </div>
      )}

      <InputField
        label="Correo electrónico"
        id="login-email"
        type="email"
        placeholder="tucorreo@ejemplo.com"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        error={fieldErrors.email}
        autoComplete="email"
      />

      <PasswordInput
        label="Contraseña"
        id="login-password"
        placeholder="••••••••"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        error={fieldErrors.password}
        autoComplete="current-password"
      />

      <SubmitButton loading={loading}>Iniciar sesión</SubmitButton>
    </form>
  )
}
