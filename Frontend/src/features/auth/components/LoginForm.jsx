import { useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '@shared/context/LanguageContext'
import InputField from './InputField'
import PasswordInput from './PasswordInput'
import SubmitButton from './SubmitButton'
import { sanitize, sanitizePassword } from '../utils/validation'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LoginForm({ onSuccess }) {
  const { login, loading, error, clearError } = useAuth()
  const { t } = useLanguage()
  const ta = t.auth
  const [form, setForm] = useState({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({})

  function validate() {
    const e = ta.errors
    const errors = {}
    const email = form.email
    if (!email) errors.email = e.emailRequired
    else if (email.length > 254) errors.email = e.emailTooLong
    else if (!EMAIL_PATTERN.test(email)) errors.email = e.emailInvalid
    if (!form.password) errors.password = e.passwordRequired
    else if (form.password.length < 8) errors.password = e.passwordMin
    else if (form.password.length > 128) errors.password = e.passwordMax
    return errors
  }

  const handleEmailChange = useCallback((ev) => {
    const cleaned = sanitize(ev.target.value).toLowerCase()
    setForm((prev) => ({ ...prev, email: cleaned }))
  }, [])

  const handlePasswordChange = useCallback((ev) => {
    const cleaned = sanitizePassword(ev.target.value)
    setForm((prev) => ({ ...prev, password: cleaned }))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return
    clearError()
    try {
      await login({ email: sanitize(form.email).toLowerCase(), password: sanitizePassword(form.password) })
      onSuccess?.()
    } catch {}
  }

  return (
    <form onSubmit={handleSubmit} className="auth-card__form" noValidate autoComplete="off">
      {error && (
        <div className="auth-card__error" role="alert">{ta.loginError}</div>
      )}
      <InputField
        label={ta.email}
        id="login-email"
        type="email"
        placeholder={ta.emailPlaceholder}
        value={form.email}
        onChange={handleEmailChange}
        error={fieldErrors.email}
        autoComplete="email"
        maxLength={254}
      />
      <PasswordInput
        label={ta.password}
        id="login-password"
        placeholder={ta.passwordPlaceholder}
        value={form.password}
        onChange={handlePasswordChange}
        error={fieldErrors.password}
        autoComplete="current-password"
      />
      <SubmitButton loading={loading}>{ta.loginBtn}</SubmitButton>
    </form>
  )
}
