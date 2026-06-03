import Favorite from '../models/Favorite.js'

// ── getFavorites ─────────────────────────────────────────────
// Devuelve todos los favoritos del usuario, con filtro opcional por tipo
export const getFavorites = async (user_id, tipo = null) => {
  const where = { user_id }
  if (tipo) {
    const validTipos = ['evento', 'gastronomia', 'cultura']
    if (!validTipos.includes(tipo)) throw new Error(`tipo inválido. Valores permitidos: ${validTipos.join(', ')}`)
    where.entidad_tipo = tipo
  }
  return Favorite.findAll({
    where,
    order: [['created_at', 'DESC']],
  })
}

// ── addFavorite ──────────────────────────────────────────────
export const addFavorite = async (user_id, { entidad_id, entidad_tipo }) => {
  const validTipos = ['evento', 'gastronomia', 'cultura']
  if (!validTipos.includes(entidad_tipo)) {
    throw new Error(`entidad_tipo inválido. Valores permitidos: ${validTipos.join(', ')}`)
  }
  if (!entidad_id) throw new Error('entidad_id es obligatorio')

  const [favorite, created] = await Favorite.findOrCreate({
    where: { user_id, entidad_id, entidad_tipo },
    defaults: { user_id, entidad_id, entidad_tipo },
  })

  if (!created) throw new Error('Ya existe en favoritos')
  return favorite
}

// ── removeFavorite ───────────────────────────────────────────
export const removeFavorite = async (user_id, entidad_tipo, entidad_id) => {
  const deleted = await Favorite.destroy({
    where: { user_id, entidad_id, entidad_tipo },
  })
  if (!deleted) throw new Error('Favorito no encontrado')
  return { ok: true }
}