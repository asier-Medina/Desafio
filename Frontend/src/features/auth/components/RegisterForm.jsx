import { useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import InputField from './InputField'
import SelectField from './SelectField'
import PasswordInput from './PasswordInput'
import SubmitButton from './SubmitButton'
import { getAll } from '@services/municipalities'
import { sanitize, sanitizePassword, validateName, validateEmail, validatePassword, validateAge, validateSexo } from '../utils/validation'

export default function RegisterForm({ onSuccess }) {
  const { register, loading, error, clearError } = useAuth()
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    municipality_id: '', sexo: '', age: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const municipalities = getAll()

  function validate() {
    const errors = {}
    const nameErr = validateName(form.name)
    if (nameErr) errors.name = nameErr
    const emailErr = validateEmail(form.email)
    if (emailErr) errors.email = emailErr
    const passErr = validatePassword(form.password)
    if (passErr) errors.password = passErr
    if (form.password !== form.confirmPassword) errors.confirmPassword = 'Las contraseñas no coinciden'
    const ageErr = validateAge(form.age)
    if (ageErr) errors.age = ageErr
    const sexoErr = validateSexo(form.sexo)
    if (sexoErr) errors.sexo = sexoErr
    if (!form.municipality_id) errors.municipality_id = 'El municipio es obligatorio'
    return errors
  }

  const handleChange = useCallback((field) => (e) => {
    const cleaned = ['name', 'email'].includes(field)
      ? sanitize(e.target.value)
      : e.target.value
    setForm((prev) => ({ ...prev, [field]: field === 'email' ? cleaned.toLowerCase() : cleaned }))
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
        onChange={handleChange('name')}
        error={fieldErrors.name}
        autoComplete="given-name"
        maxLength={100}
      />

      <InputField
        label="Correo electrónico"
        id="register-email"
        type="email"
        placeholder="tucorreo@ejemplo.com"
        value={form.email}
        onChange={handleChange('email')}
        error={fieldErrors.email}
        autoComplete="email"
        maxLength={254}
      />

      <SelectField
        label="Municipio"
        id="register-municipality"
        options={municipalities}
        value={form.municipality_id}
        onChange={handleChange('municipality_id')}
        error={fieldErrors.municipality_id}
      />

      <SelectField
        label="Sexo"
        id="register-sexo"
        options={[
          { value: 'hombre', label: 'Hombre' },
          { value: 'mujer', label: 'Mujer' },
          { value: 'otro', label: 'Otro' },
        ]}
        value={form.sexo}
        onChange={handleChange('sexo')}
        error={fieldErrors.sexo}
      />

      <InputField
        label="Edad"
        id="register-age"
        type="number"
        placeholder="30"
        value={form.age}
        onChange={handleChange('age')}
        error={fieldErrors.age}
        min={1}
        max={119}
      />

      <PasswordInput
        label="Contraseña"
        id="register-password"
        placeholder="Mínimo 8 caracteres"
        value={form.password}
        onChange={handleChange('password')}
        error={fieldErrors.password}
        autoComplete="new-password"
        showStrength
      />

      <PasswordInput
        label="Confirmar contraseña"
        id="register-confirm"
        placeholder="Repite la contraseña"
        value={form.confirmPassword}
        onChange={handleChange('confirmPassword')}
        error={fieldErrors.confirmPassword}
        autoComplete="new-password"
      />

      <SubmitButton loading={loading}>Crear cuenta</SubmitButton>
    </form>
  )
}
