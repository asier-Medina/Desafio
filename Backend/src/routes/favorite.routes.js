import { Router } from 'express'
import { protect } from '../middlewares/auth.js'
import {
  getFavoritesHandler,
  addFavoriteHandler,
  removeFavoriteHandler,
} from '../controllers/favorite.controller.js'

const router = Router()

router.get('/',                           protect, getFavoritesHandler)   // GET    /api/users/me/favorites
router.post('/',                          protect, addFavoriteHandler)    // POST   /api/users/me/favorites
router.delete('/:entidad_tipo/:entidad_id', protect, removeFavoriteHandler) // DELETE /api/users/me/favorites/:tipo/:id

export default router