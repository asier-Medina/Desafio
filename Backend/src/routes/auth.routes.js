import { Router } from 'express'
import { loginHandler, refreshHandler, logoutHandler, registerHandler } from '../controllers/auth.controller.js'
import { protect, isAdmin } from '../middlewares/auth.js'

const router = Router()

router.post('/register', registerHandler)
router.post('/login',    loginHandler)
router.post('/refresh',  refreshHandler)
router.post('/logout', logoutHandler)
router.get('/me',        protect, (req, res) => {
  const { id_user, nombre, apellido, email, role, municipality_id, tlf, sexo, age, created_at } = req.user
  res.json({ id: id_user, nombre, apellido, email, role, municipality_id, tlf, sexo, age, createdAt: created_at })
})

export default router