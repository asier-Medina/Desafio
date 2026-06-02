import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import User from '../models/User.js'
import LogAuth from '../models/LogAuth.js'   // ← antes apuntaba a models/mongo/LogAuth.js

const generateAccessToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role, company_id: user.company_id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  )

const generateRefreshToken = (user) =>
  jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
  )

export const register = async ({ name, lastName, email, password, role = 'employee' }) => {
  const normalizedEmail = email?.trim().toLowerCase()

  const exists = await User.findOne({ where: { email: normalizedEmail } })
  if (exists) throw new Error('El email ya está registrado')

  const password_hash = await bcrypt.hash(password, 10)

  const user = await User.create({
    name,
    last_name: lastName,
    email: normalizedEmail,
    password_hash,
    role,
    active: true
  })

  await LogAuth.create({ user_id: user.id, email: user.email, action: 'register', success: true })

  return { id: user.id, name: user.name, lastName: user.last_name, role: user.role}
}

export const login = async ({ email, password, ip, userAgent }) => {
  const normalizedEmail = email?.trim().toLowerCase()
  const user = await User.findOne({ where: { email: normalizedEmail } })

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    await LogAuth.create({
      user_id: user?.id || 0,
      email: normalizedEmail,
      action: 'login_failed',
      ip,
      user_agent: userAgent,
      success: false,
      reason: !user ? 'user_not_found' : 'wrong_password'
    })
    throw new Error('Credenciales incorrectas')
  }

  if (!user.active) throw new Error('Usuario desactivado')

  const accessToken  = generateAccessToken(user)
  const refreshToken = generateRefreshToken(user)

  await LogAuth.create({
    user_id: user.id, email: user.email, action: 'login',
    ip, user_agent: userAgent, success: true
  })

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, name: user.name, lastName: user.last_name, role: user.role}
  }
}

export const refresh = async (refreshToken) => {
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
  const user = await User.findByPk(decoded.id)

  if (!user || !user.active) throw new Error('Usuario no válido')

  const newAccessToken = generateAccessToken(user)

  await LogAuth.create({ user_id: user.id, email: user.email, action: 'token_refresh', success: true })

  return newAccessToken
}

export const logout = async (userId, email) => {
  await LogAuth.create({
    user_id: userId,
    email:   email || 'unknown',
    action:  'logout',
    success: true
  })
}
