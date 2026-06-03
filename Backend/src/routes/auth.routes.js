import { Router } from 'express'
import { loginHandler, refreshHandler, logoutHandler, registerHandler } from '../controllers/auth.controller.js'
import { protect, isAdmin } from '../middlewares/auth.js'

const router = Router()

router.post('/register', registerHandler)
router.post('/login',    loginHandler)
router.post('/refresh',  refreshHandler)
router.post('/logout',   protect, logoutHandler)
router.get('/me',        protect, (req, res) => {
  const { id_user, nombre, email, role, municipality_id } = req.user
  res.json({ id: id_user, nombre, email, role, municipality_id })
})

export default router