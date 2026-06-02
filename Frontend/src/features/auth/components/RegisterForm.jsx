import { useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import InputField from './InputField'
import PasswordInput from './PasswordInput'
import SubmitButton from './SubmitButton'
import { sanitize, sanitizePassword, validateName, validateEmail, validatePassword } from '../utils/validation'

export default function RegisterForm({ onSuccess }) {
  const { register, loading, error, clearError } = useAuth()
  const [form, setForm] = useState({ name: '', lastName: '', email: '', password: '', confirmPassword: '' })
  const [fieldErrors, setFieldErrors] = useState({})

  function validate() {
    const errors = {}
    const nameErr = validateName(form.name)
    if (nameErr) errors.name = nameErr
    const lastNameErr = validateName(form.lastName)
    if (lastNameErr) errors.lastName = lastNameErr
    const emailErr = validateEmail(form.email)
    if (emailErr) errors.email = emailErr
    const passErr = validatePassword(form.password)
    if (passErr) errors.password = passErr
    if (form.password !== form.confirmPassword) errors.confirmPassword = 'Las contraseñas no coinciden'
    return errors
  }

  const handleNameChange = useCallback((e) => {
    const cleaned = sanitize(e.target.value)
    setForm((prev) => ({ ...prev, name: cleaned }))
  }, [])

  const handleLastNameChange = useCallback((e) => {
    const cleaned = sanitize(e.target.value)
    setForm((prev) => ({ ...prev, lastName: cleaned }))
  }, [])

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

  const handleConfirmChange = useCallback((e) => {
    const cleaned = sanitizePassword(e.target.value)
    setForm((prev) => ({ ...prev, confirmPassword: cleaned }))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    clearError()
    try {
      const cleanName = sanitize(form.name)
      const cleanLastName = sanitize(form.lastName)
      const cleanEmail = sanitize(form.email).toLowerCase()
      const cleanPassword = sanitizePassword(form.password)
      await register({ name: cleanName, lastName: cleanLastName, email: cleanEmail, password: cleanPassword })
      onSuccess?.()
    } catch {
      // Error manejado por el contexto
    }
  }

  return (
    <form onSubmit={handleSubmit} className="auth-card__form" noValidate autoComplete="off">
      {error && (
        <div className="auth-card__error" role="alert">
          No se pudo completar el registro. Intente de nuevo.
        </div>
      )}

      <InputField
        label="Nombre"
        id="register-name"
        type="text"
        placeholder="Tu nombre"
        value={form.name}
        onChange={handleNameChange}
        error={fieldErrors.name}
        autoComplete="given-name"
        maxLength={100}
      />

      <InputField
        label="Apellido"
        id="register-lastname"
        type="text"
        placeholder="Tu apellido"
        value={form.lastName}
        onChange={handleLastNameChange}
        error={fieldErrors.lastName}
        autoComplete="family-name"
        maxLength={100}
      />

      <InputField
        label="Correo electrónico"
        id="register-email"
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
        id="register-password"
        placeholder="Mínimo 8 caracteres"
        value={form.password}
        onChange={handlePasswordChange}
        error={fieldErrors.password}
        autoComplete="new-password"
        showStrength
      />

      <PasswordInput
        label="Confirmar contraseña"
        id="register-confirm"
        placeholder="Repite la contraseña"
        value={form.confirmPassword}
        onChange={handleConfirmChange}
        error={fieldErrors.confirmPassword}
        autoComplete="new-password"
      />

      <SubmitButton loading={loading}>Crear cuenta</SubmitButton>
    </form>
  )
}
