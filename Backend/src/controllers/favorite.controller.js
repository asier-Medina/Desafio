import * as favoriteService from '../services/favorite.service.js'

// GET /api/users/me/favorites
// GET /api/users/me/favorites?tipo=evento
export const getFavoritesHandler = async (req, res) => {
  try {
    const { tipo } = req.query
    const favorites = await favoriteService.getFavorites(req.user.id_user, tipo)
    res.json(favorites)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// POST /api/users/me/favorites
// Body: { "entidad_id": 1, "entidad_tipo": "evento" }
export const addFavoriteHandler = async (req, res) => {
  try {
    const favorite = await favoriteService.addFavorite(req.user.id_user, req.body)
    res.status(201).json(favorite)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// DELETE /api/users/me/favorites/:entidad_tipo/:entidad_id
export const removeFavoriteHandler = async (req, res) => {
  try {
    const { entidad_tipo, entidad_id } = req.params
    const result = await favoriteService.removeFavorite(req.user.id_user, entidad_tipo, Number(entidad_id))
    res.json(result)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}