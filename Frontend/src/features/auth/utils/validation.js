const DANGEROUS_PATTERN = /[<>"%()&+\\]/g
const PATH_TRAVERSAL = /\.\.[\/\\]/g
const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g
const NEWLINES = /[\r\n]/g

const NAME_PATTERN = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function sanitize(value) {
  if (typeof value !== 'string') return ''
  let s = value.normalize('NFC')
  s = s.trim()
  s = s.replace(CONTROL_CHARS, '')
  s = s.replace(NEWLINES, '')
  s = s.replace(PATH_TRAVERSAL, '')
  s = s.replace(DANGEROUS_PATTERN, '')
  return s
}

export function validateName(value) {
  const v = sanitize(value)
  if (!v) return 'El nombre es obligatorio'
  if (v.length < 2) return 'Debe tener al menos 2 caracteres'
  if (v.length > 100) return 'No debe exceder 100 caracteres'
  if (!NAME_PATTERN.test(v)) return 'Solo letras, espacios, guiones y apóstrofes'
  return null
}

export function validatePhone(value) {
  const v = sanitize(value)
  if (!v) return null
  if (v.length > 20) return 'No debe exceder 20 caracteres'
  if (!/^[\d\s+\-()]+$/.test(v)) return 'Solo números, espacios, +, -, ()'
  return null
}

export function validateAge(value) {
  if (!value) return 'La edad es obligatoria'
  const n = Number(value)
  if (isNaN(n) || !Number.isInteger(n)) return 'Debe ser un número entero'
  if (n < 1) return 'Debe ser mayor a 0'
  if (n >= 120) return 'Debe ser menor a 120'
  return null
}

export function validateMunicipality(value) {
  if (!value) return 'El municipio es obligatorio'
  const n = Number(value)
  if (isNaN(n) || !Number.isInteger(n)) return 'Selecciona un municipio'
  return null
}

export function validateSexo(value) {
  if (!value) return 'El sexo es obligatorio'
  if (!['hombre', 'mujer', 'otro'].includes(value)) return 'Valor inválido'
  return null
}

export function validateEmail(value) {
  const v = sanitize(value).toLowerCase()
  if (!v) return 'El correo es obligatorio'
  if (v.length > 254) return 'Correo demasiado largo'
  if (!EMAIL_PATTERN.test(v)) return 'Formato de correo inválido'
  return null
}

export function validatePassword(value) {
  if (!value) return 'La contraseña es obligatoria'
  if (value.length < 8) return 'Mínimo 8 caracteres'
  if (value.length > 128) return 'No debe exceder 128 caracteres'
  return null
}

export function getPasswordStrength(value) {
  if (!value) return { score: 0, label: '', level: '' }
  let score = 0
  if (value.length >= 8) score++
  if (value.length >= 12) score++
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++
  if (/\d/.test(value)) score++
  if (/[^a-zA-Z0-9]/.test(value)) score++
  if (score < 2) return { score, label: 'Débil', level: 'weak' }
  if (score < 4) return { score, label: 'Media', level: 'medium' }
  return { score, label: 'Fuerte', level: 'strong' }
}

export function sanitizePassword(value) {
  if (typeof value !== 'string') return ''
  return value.replace(CONTROL_CHARS, '').replace(NEWLINES, '')
}
