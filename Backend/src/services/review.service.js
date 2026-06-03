import { EventReview, GastronomyReview, CultureReview, User } from '../models/index.js'

// ── Mapa de modelos por tipo ──────────────────────────────────
const MODEL_MAP = {
  evento:      { Model: EventReview,      fk: 'event_id'   },
  gastronomia: { Model: GastronomyReview, fk: 'gastro_id'  },
  cultura:     { Model: CultureReview,    fk: 'culture_id' },
}

const getConfig = (tipo) => {
  const config = MODEL_MAP[tipo]
  if (!config) throw new Error(`tipo inválido. Valores permitidos: ${Object.keys(MODEL_MAP).join(', ')}`)
  return config
}

const USER_ATTR = [['nombre', 'autor']]

// ── getReviewsByEntidad ───────────────────────────────────────
// Reviews de una entidad concreta (público, sin auth)
export const getReviewsByEntidad = async (tipo, entidad_id) => {
  const { Model, fk } = getConfig(tipo)
  return Model.findAll({
    where: { [fk]: entidad_id },
    include: [{ model: User, attributes: USER_ATTR }],
    order: [['created_at', 'DESC']],
  })
}

// ── createReview ──────────────────────────────────────────────
export const createReview = async (tipo, user_id, entidad_id, { puntuacion, texto }) => {
  if (!puntuacion || puntuacion < 1 || puntuacion > 5)
    throw new Error('puntuacion debe ser un número entre 1 y 5')

  const { Model, fk } = getConfig(tipo)
  return Model.create({ user_id, [fk]: entidad_id, puntuacion, texto: texto ?? null })
}

// ── updateReview ──────────────────────────────────────────────
export const updateReview = async (tipo, user_id, entidad_id, { puntuacion, texto }) => {
  if (puntuacion !== undefined && (puntuacion < 1 || puntuacion > 5))
    throw new Error('puntuacion debe ser un número entre 1 y 5')

  const { Model, fk } = getConfig(tipo)

  const fields = {}
  if (puntuacion !== undefined) fields.puntuacion = puntuacion
  if (texto !== undefined)      fields.texto = texto
  if (Object.keys(fields).length === 0) throw new Error('Sin campos válidos para actualizar')

  const [count, rows] = await Model.update(fields, {
    where: { user_id, [fk]: entidad_id },
    returning: true,
  })
  if (count === 0) throw new Error('Review no encontrada o no tienes permiso')
  return rows[0]
}

// ── deleteReview ──────────────────────────────────────────────
export const deleteReview = async (tipo, user_id, entidad_id) => {
  const { Model, fk } = getConfig(tipo)
  const deleted = await Model.destroy({ where: { user_id, [fk]: entidad_id } })
  if (deleted === 0) throw new Error('Review no encontrada o no tienes permiso')
  return { ok: true }
}

// ── getMyReviews ──────────────────────────────────────────────
// Todas las reviews del usuario — las 3 tablas en paralelo, ordenadas por fecha
export const getMyReviews = async (user_id, tipo = null) => {
  const tipos = tipo ? [tipo] : Object.keys(MODEL_MAP)
  if (tipo) getConfig(tipo) // valida el tipo si se pasa

  const queries = tipos.map(async (t) => {
    const { Model, fk } = MODEL_MAP[t]
    const rows = await Model.findAll({ where: { user_id }, raw: true })
    return rows.map((r) => ({ ...r, entidad_id: r[fk], tipo: t }))
  })

  const results = (await Promise.all(queries)).flat()
  results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  return results
}
