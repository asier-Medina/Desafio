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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm px-3 py-2 rounded-lg">
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


/*Cuando VITE_API_BASE_URL está vacío (el .env.example viene así), automáticamente usa auth.mock.js. Los usuarios se guardan en localStorage bajo sustrai_mock_db. Cuando tengas la API real, solo pones la URL en .env y ya usa auth.api.js sin tocar nada más.*/
