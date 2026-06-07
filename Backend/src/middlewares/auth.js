import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.access_token
    if (!token) return res.status(401).json({ error: 'No autenticado' })

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findByPk(decoded.id)   // decoded.id → id_user (ver generateAccessToken)

    if (!user) return res.status(401).json({ error: 'Usuario no válido' })

    req.user = user
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' })
  }
}

export const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ error: 'Acceso denegado' })
  next()
}