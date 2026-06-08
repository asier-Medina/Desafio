import { useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '@shared/context/LanguageContext'
import InputField from './InputField'
import SelectField from './SelectField'
import MunicipalityAutocomplete from './MunicipalityAutocomplete'
import PasswordInput from './PasswordInput'
import SubmitButton from './SubmitButton'
import { sanitize, sanitizePassword } from '../utils/validation'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NAME_PATTERN  = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/

export default function RegisterForm({ onSuccess }) {
  const { register, loading, error, clearError } = useAuth()
  const { t } = useLanguage()
  const ta = t.auth
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    municipality_id: null, sexo: '', age: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})

  function validate() {
    const e = ta.errors
    const errors = {}

    const name = sanitize(form.name)
    if (!name) errors.name = e.nameRequired
    else if (name.length < 2) errors.name = e.nameMin
    else if (name.length > 100) errors.name = e.nameMax
    else if (!NAME_PATTERN.test(name)) errors.name = e.nameInvalid

    const email = sanitize(form.email).toLowerCase()
    if (!email) errors.email = e.emailRequired
    else if (email.length > 254) errors.email = e.emailTooLong
    else if (!EMAIL_PATTERN.test(email)) errors.email = e.emailInvalid

    if (!form.password) errors.password = e.passwordRequired
    else if (form.password.length < 8) errors.password = e.passwordMin
    else if (form.password.length > 128) errors.password = e.passwordMax

    if (form.password !== form.confirmPassword) errors.confirmPassword = e.passwordsNoMatch

    const age = Number(form.age)
    if (!form.age) errors.age = e.ageRequired
    else if (isNaN(age) || !Number.isInteger(age)) errors.age = e.ageInvalid
    else if (age < 1) errors.age = e.ageMin
    else if (age >= 120) errors.age = e.ageMax

    if (!form.sexo) errors.sexo = e.genderRequired

    if (!form.municipality_id) errors.municipality_id = e.municipalityRequired

    return errors
  }

  const handleChange = useCallback((field) => (e) => {
    const cleaned = ['name', 'email'].includes(field) ? sanitize(e.target.value) : e.target.value
    setForm((prev) => ({ ...prev, [field]: field === 'email' ? cleaned.toLowerCase() : cleaned }))
  }, [])

  const handleMunicipality = useCallback((value) => {
    setForm(prev => ({ ...prev, municipality_id: value }))
    setFieldErrors(prev => ({ ...prev, municipality_id: undefined }))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return
    clearError()
    try {
      await register({
        name: sanitize(form.name),
        email: sanitize(form.email).toLowerCase(),
        password: sanitizePassword(form.password),
        municipality_id: Number(form.municipality_id),
        sexo: form.sexo,
        age: Number(form.age),
      })
      onSuccess?.()
    } catch {}
  }

  const genderOptions = [
    { value: 'hombre', label: ta.genderMale },
    { value: 'mujer',  label: ta.genderFemale },
    { value: 'otro',   label: ta.genderOther },
  ]

  return (
    <form onSubmit={handleSubmit} className="auth-card__form" noValidate autoComplete="off">
      {error && (
        <div className="auth-card__error" role="alert">{ta.registerError}</div>
      )}
      <InputField
        label={ta.name}
        id="register-name"
        type="text"
        placeholder={ta.namePlaceholder}
        value={form.name}
        onChange={handleChange('name')}
        error={fieldErrors.name}
        autoComplete="given-name"
        maxLength={100}
      />
      <InputField
        label={ta.email}
        id="register-email"
        type="email"
        placeholder={ta.emailPlaceholder}
        value={form.email}
        onChange={handleChange('email')}
        error={fieldErrors.email}
        autoComplete="email"
        maxLength={254}
      />
      <MunicipalityAutocomplete
        id="register-municipality"
        value={form.municipality_id}
        onChange={handleMunicipality}
        error={fieldErrors.municipality_id}
      />
      <SelectField
        label={ta.gender}
        id="register-sexo"
        options={genderOptions}
        value={form.sexo}
        onChange={handleChange('sexo')}
        error={fieldErrors.sexo}
      />
      <InputField
        label={ta.age}
        id="register-age"
        type="number"
        placeholder="30"
        value={form.age}
        onChange={handleChange('age')}
        error={fieldErrors.age}
        min={18}
        max={99}
      />
      <PasswordInput
        label={ta.password}
        id="register-password"
        placeholder={ta.passwordNewPlaceholder}
        value={form.password}
        onChange={handleChange('password')}
        error={fieldErrors.password}
        autoComplete="new-password"
        showStrength
      />
      <PasswordInput
        label={ta.confirmPassword}
        id="register-confirm"
        placeholder={ta.confirmPasswordPlaceholder}
        value={form.confirmPassword}
        onChange={handleChange('confirmPassword')}
        error={fieldErrors.confirmPassword}
        autoComplete="new-password"
      />
      <SubmitButton loading={loading}>{ta.registerBtn}</SubmitButton>
    </form>
  )
}
