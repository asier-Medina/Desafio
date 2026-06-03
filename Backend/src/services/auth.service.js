import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import {User} from '../models/index.js'

// ── Token generators ────────────────────────────────────────
const generateAccessToken = (user) =>
  jwt.sign(
    { id: user.id_user, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  )

const generateRefreshToken = (user) =>
  jwt.sign(
    { id: user.id_user },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
  )

// ── register ────────────────────────────────────────────────
export const register = async ({ nombre, apellido, email, password, tlf, municipality_id, sexo, age, role = 'user' }) => {
  const normalizedEmail = email?.trim().toLowerCase()
  const exists = await User.findOne({ where: { email: normalizedEmail } })
  if (exists) throw new Error('El email ya está registrado')

  const password_hash = await bcrypt.hash(password, 10)
  const user = await User.create({
    nombre,
    apellido,
    email: normalizedEmail,
    password_hash,
    tlf,
    municipality_id,
    sexo,
    age,
    role,
  })
  return { id: user.id_user, nombre: user.nombre, email: user.email, role: user.role }
}

// ── login ───────────────────────────────────────────────────
export const login = async ({ email, password }) => {
  const normalizedEmail = email?.trim().toLowerCase()
  const user = await User.findOne({ where: { email: normalizedEmail } })

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new Error('Credenciales incorrectas')
  }

  const accessToken  = generateAccessToken(user)
  const refreshToken = generateRefreshToken(user)

  return {
    accessToken,
    refreshToken,
    user: { id: user.id_user, nombre: user.nombre, email: user.email, role: user.role }
  }
}

// ── refresh ─────────────────────────────────────────────────
export const refresh = async (refreshToken) => {
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
  const user = await User.findByPk(decoded.id)

  if (!user) throw new Error('Usuario no válido')

  return generateAccessToken(user)
}

// ── logout ──────────────────────────────────────────────────
// El logout se gestiona en el cliente eliminando las cookies.
// Si en el futuro se necesita blacklist de tokens, añadirlo aquí.
export const logout = async () => true