import { Router } from 'express'
import { protect } from '../middlewares/auth.js'
import {
  getMeHandler,
  updateMeHandler,
  deleteMeHandler,
  getInterestsHandler,
  updateInterestsHandler,
  getPreferencesHandler,
  updatePreferencesHandler,
  getAllInterestsHandler,
} from '../controllers/user.controller.js'

const router = Router()

// ── Perfil ───────────────────────────────────────────────────
router.get('/me',    protect, getMeHandler)
router.put('/me',    protect, updateMeHandler)
router.delete('/me', protect, deleteMeHandler)

// ── Intereses del usuario ────────────────────────────────────
router.get('/me/interests', protect, getInterestsHandler)
router.put('/me/interests', protect, updateInterestsHandler)

// ── Preferencias ─────────────────────────────────────────────
router.get('/me/preferences', protect, getPreferencesHandler)
router.put('/me/preferences', protect, updatePreferencesHandler)

// ── Catálogo de intereses disponibles (sin auth) ─────────────
router.get('/interests/catalog', getAllInterestsHandler)

export default router
