import { EventReview, GastronomyReview, CultureReview, User } from '../models/index.js'

const MODEL_MAP = {
  gastronomy: { Model: GastronomyReview, fk: 'gastro_id'  },
  culture:    { Model: CultureReview,    fk: 'culture_id' },
  event:      { Model: EventReview,      fk: 'event_id'   },
}

const getConfig = (tipo) => {
  const config = MODEL_MAP[tipo]
  if (!config) throw new Error(`tipo inválido. Valores permitidos: ${Object.keys(MODEL_MAP).join(', ')}`)
  return config
}

export const getReviewsByEntity = async (tipo, entity_id) => {
  const { Model, fk } = getConfig(tipo)
  return Model.findAll({
    where: { [fk]: entity_id },
    include: [{ model: User, attributes: [['nombre', 'autor']] }],
    order: [['created_at', 'DESC']],
  })
}

export const createReview = async (tipo, user_id, entity_id, { puntuacion, texto }) => {
  if (!puntuacion || puntuacion < 1 || puntuacion > 5)
    throw new Error('puntuacion debe ser un número entre 1 y 5')
  const { Model, fk } = getConfig(tipo)
  return Model.create({ user_id, [fk]: entity_id, puntuacion, texto: texto ?? null })
}

export const deleteReview = async (tipo, review_id, user_id) => {
  const { Model } = getConfig(tipo)
  const deleted = await Model.destroy({ where: { id: review_id, user_id } })
  if (deleted === 0) throw new Error('Review no encontrada o no tienes permiso')
  return { ok: true }
}

export const getMyReviews = async (user_id) => {
  const queries = Object.entries(MODEL_MAP).map(async ([tipo, { Model, fk }]) => {
    const rows = await Model.findAll({ where: { user_id }, raw: true })
    return rows.map((r) => ({ ...r, entity_id: r[fk], tipo }))
  })
  const results = (await Promise.all(queries)).flat()
  results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  return results
}
