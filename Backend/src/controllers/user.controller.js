import * as userService from '../services/user.service.js'

// GET /api/users/me
export const getMeHandler = async (req, res) => {
  try {
    const user = await userService.getMe(req.user.id_user)
    res.json(user)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

// PUT /api/users/me
export const updateMeHandler = async (req, res) => {
  try {
    const user = await userService.updateMe(req.user.id_user, req.body)
    res.json(user)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// DELETE /api/users/me
export const deleteMeHandler = async (req, res) => {
  try {
    const result = await userService.deleteMe(req.user.id_user)
    res.clearCookie('access_token')
    res.clearCookie('refresh_token')
    res.json(result)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

// GET /api/users/me/interests
export const getInterestsHandler = async (req, res) => {
  try {
    const interests = await userService.getInterests(req.user.id_user)
    res.json(interests)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// PUT /api/users/me/interests
// Body: { "interest_ids": [1, 3, 7] }
export const updateInterestsHandler = async (req, res) => {
  try {
    const { interest_ids } = req.body
    const interests = await userService.updateInterests(req.user.id_user, interest_ids)
    res.json(interests)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// GET /api/users/me/preferences
export const getPreferencesHandler = async (req, res) => {
  try {
    const prefs = await userService.getPreferences(req.user.id_user)
    res.json(prefs)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// PUT /api/users/me/preferences
// Body: { "rango_precio": "medio", "movilidad_reducida": false, "municipios_interes": [1, 3] }
export const updatePreferencesHandler = async (req, res) => {
  try {
    const prefs = await userService.updatePreferences(req.user.id_user, req.body)
    res.json(prefs)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// GET /api/users/interests/catalog
// Catálogo completo de intereses disponibles
export const getAllInterestsHandler = async (req, res) => {
  try {
    const interests = await userService.getAllInterests()
    res.json(interests)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}