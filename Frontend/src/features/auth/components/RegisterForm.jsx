import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import InputField from './InputField'
import PasswordInput from './PasswordInput'
import SubmitButton from './SubmitButton'

export default function RegisterForm({ onSuccess }) {
  const { register, loading, error, clearError } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [fieldErrors, setFieldErrors] = useState({})

  function validate() {
    const errors = {}
    if (!form.name.trim()) errors.name = 'El nombre es obligatorio'
    if (!form.email.trim()) errors.email = 'El correo es obligatorio'
    if (!form.password) errors.password = 'La contraseña es obligatoria'
    else if (form.password.length < 6) errors.password = 'Mínimo 6 caracteres'
    if (form.password !== form.confirmPassword) errors.confirmPassword = 'Las contraseñas no coinciden'
    return errors
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    clearError()
    try {
      await register({ name: form.name, email: form.email, password: form.password })
      onSuccess?.()
    } catch {
      // Error manejado por el contexto
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      <InputField
        label="Nombre completo"
        id="register-name"
        type="text"
        placeholder="Tu nombre"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        error={fieldErrors.name}
        autoComplete="name"
      />

      <InputField
        label="Correo electrónico"
        id="register-email"
        type="email"
        placeholder="tucorreo@ejemplo.com"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        error={fieldErrors.email}
        autoComplete="email"
      />

      <PasswordInput
        label="Contraseña"
        id="register-password"
        placeholder="Mínimo 6 caracteres"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        error={fieldErrors.password}
        autoComplete="new-password"
      />

      <PasswordInput
        label="Confirmar contraseña"
        id="register-confirm"
        placeholder="Repite la contraseña"
        value={form.confirmPassword}
        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
        error={fieldErrors.confirmPassword}
        autoComplete="new-password"
      />

      <SubmitButton loading={loading}>Crear cuenta</SubmitButton>
    </form>
  )
}
