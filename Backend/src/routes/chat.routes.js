import { Router } from 'express'
import axios from 'axios'
import jwt from 'jsonwebtoken'

const router = Router()
const DATA_API = process.env.ML_API_URL ?? 'http://localhost:5442/api'

router.post('/', async (req, res) => {
  const { message, session_id } = req.body ?? {}
  if (!message) return res.status(400).json({ error: 'Falta el mensaje' })

  let userId = null
  try {
    const token = req.cookies?.access_token
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      userId = decoded.id
    }
  } catch {
    // sin sesión activa — el chatbot funciona igual sin personalización
  }

  try {
    const response = await axios.post(
      `${DATA_API}/chat`,
      { message, session_id: session_id ?? 'default' },
      {
        headers: userId ? { 'X-User-Id': String(userId) } : {},
        timeout: 15000,
      }
    )
    res.json(response.data)
  } catch (error) {
    const status = error.response?.status ?? 500
    const msg = error.response?.data?.error ?? 'Error en el chatbot'
    res.status(status).json({ error: msg })
  }
})

export default router
