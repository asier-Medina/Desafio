import { Router } from 'express'
import { protect } from '../middlewares/auth.js'
import {
  getReviewsByEntidadHandler,
  createReviewHandler,
  updateReviewHandler,
  deleteReviewHandler,
  getMyReviewsHandler,
} from '../controllers/review.controller.js'

const router = Router()

// ── Reviews de una entidad (público) ─────────────────────────
router.get('/:tipo/:entidad_id',    getReviewsByEntidadHandler)          // GET    /api/reviews/:tipo/:entidad_id

// ── CRUD de review propia (requiere auth) ─────────────────────
router.post('/:tipo/:entidad_id',   protect, createReviewHandler)        // POST   /api/reviews/:tipo/:entidad_id
router.put('/:tipo/:entidad_id',    protect, updateReviewHandler)        // PUT    /api/reviews/:tipo/:entidad_id
router.delete('/:tipo/:entidad_id', protect, deleteReviewHandler)        // DELETE /api/reviews/:tipo/:entidad_id

export default router