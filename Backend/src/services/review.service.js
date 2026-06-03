import sequelize from '../config/postgres.js'

// ── Mapa de configuración por tipo ───────────────────────────
const TIPO_MAP = {
  evento: {
    table: 'user_data.event_reviews',
    fk:    'event_id',
  },
  gastronomia: {
    table: 'user_data.gastronomy_reviews',
    fk:    'gastro_id',
  },
  cultura: {
    table: 'user_data.culture_reviews',
    fk:    'culture_id',
  },
}

const getConfig = (tipo) => {
  const config = TIPO_MAP[tipo]
  if (!config) throw new Error(`tipo inválido. Valores permitidos: ${Object.keys(TIPO_MAP).join(', ')}`)
  return config
}

// ── getReviewsByEntidad ───────────────────────────────────────
// Reviews de una entidad concreta (público, sin auth)
export const getReviewsByEntidad = async (tipo, entidad_id) => {
  const { table, fk } = getConfig(tipo)
  return sequelize.query(
    `SELECT r.id, r.user_id, u.nombre AS autor, r.puntuacion, r.texto, r.created_at
     FROM ${table} r
     JOIN user_data.users u ON u.id_user = r.user_id
     WHERE r.${fk} = :entidad_id
     ORDER BY r.created_at DESC`,
    { replacements: { entidad_id }, type: sequelize.QueryTypes.SELECT }
  )
}

// ── createReview ──────────────────────────────────────────────
export const createReview = async (tipo, user_id, entidad_id, { puntuacion, texto }) => {
  const { table, fk } = getConfig(tipo)
  if (!puntuacion || puntuacion < 1 || puntuacion > 5) {
    throw new Error('puntuacion debe ser un número entre 1 y 5')
  }

  const [result] = await sequelize.query(
    `INSERT INTO ${table} (user_id, ${fk}, puntuacion, texto)
     VALUES (:user_id, :entidad_id, :puntuacion, :texto)
     RETURNING *`,
    { replacements: { user_id, entidad_id, puntuacion, texto: texto ?? null }, type: sequelize.QueryTypes.INSERT }
  )
  return result[0]
}

// ── updateReview ──────────────────────────────────────────────
export const updateReview = async (tipo, user_id, entidad_id, { puntuacion, texto }) => {
  const { table, fk } = getConfig(tipo)
  if (puntuacion && (puntuacion < 1 || puntuacion > 5)) {
    throw new Error('puntuacion debe ser un número entre 1 y 5')
  }

  const fields = []
  const replacements = { user_id, entidad_id }

  if (puntuacion !== undefined) { fields.push('puntuacion = :puntuacion'); replacements.puntuacion = puntuacion }
  if (texto !== undefined)      { fields.push('texto = :texto');           replacements.texto = texto }
  if (fields.length === 0) throw new Error('Sin campos válidos para actualizar')

  const [result] = await sequelize.query(
    `UPDATE ${table}
     SET ${fields.join(', ')}
     WHERE user_id = :user_id AND ${fk} = :entidad_id
     RETURNING *`,
    { replacements, type: sequelize.QueryTypes.UPDATE }
  )
  if (!result[0]) throw new Error('Review no encontrada o no tienes permiso')
  return result[0]
}

// ── deleteReview ──────────────────────────────────────────────
export const deleteReview = async (tipo, user_id, entidad_id) => {
  const { table, fk } = getConfig(tipo)
  const [, deleted] = await sequelize.query(
    `DELETE FROM ${table}
     WHERE user_id = :user_id AND ${fk} = :entidad_id`,
    { replacements: { user_id, entidad_id }, type: sequelize.QueryTypes.DELETE }
  )
  if (deleted === 0) throw new Error('Review no encontrada o no tienes permiso')
  return { ok: true }
}

// ── getMyReviews ──────────────────────────────────────────────
// Todas las reviews del usuario — UNION de las 3 tablas
// Con filtro opcional por tipo
export const getMyReviews = async (user_id, tipo = null) => {
  const tipos = tipo ? [tipo] : Object.keys(TIPO_MAP)
  if (tipo) getConfig(tipo) // valida el tipo si se pasa

  const parts = tipos.map((t) => {
    const { table, fk } = TIPO_MAP[t]
    return `SELECT id, user_id, ${fk} AS entidad_id, '${t}' AS tipo, puntuacion, texto, created_at
            FROM ${table}
            WHERE user_id = :user_id`
  })

  return sequelize.query(
    `${parts.join(' UNION ALL ')} ORDER BY created_at DESC`,
    { replacements: { user_id }, type: sequelize.QueryTypes.SELECT }
  )
}