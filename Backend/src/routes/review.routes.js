import { Router } from 'express'
import { protect } from '../middlewares/auth.js'
import {
  getMyReviewsHandler,
  getGastronomyReviewsHandler,
  getCultureReviewsHandler,
  getEventReviewsHandler,
  createGastronomyReviewHandler,
  createCultureReviewHandler,
  createEventReviewHandler,
  deleteReviewHandler,
} from '../controllers/review.controller.js'

const router = Router()

// Mis reviews (auth)
router.get('/me', protect, getMyReviewsHandler)                         // GET  /api/reviews/me

// Reviews por entidad (público)
router.get('/gastronomy/:id', getGastronomyReviewsHandler)              // GET  /api/reviews/gastronomy/:id
router.get('/culture/:id',    getCultureReviewsHandler)                 // GET  /api/reviews/culture/:id
router.get('/event/:id',      getEventReviewsHandler)                   // GET  /api/reviews/event/:id

// Crear review (auth)
router.post('/gastronomy/:id', protect, createGastronomyReviewHandler)  // POST /api/reviews/gastronomy/:id
router.post('/culture/:id',    protect, createCultureReviewHandler)     // POST /api/reviews/culture/:id
router.post('/event/:id',      protect, createEventReviewHandler)       // POST /api/reviews/event/:id

// Eliminar review por id (auth)
router.delete('/:tipo/:id', protect, deleteReviewHandler)               // DELETE /api/reviews/:tipo/:id

export default router
