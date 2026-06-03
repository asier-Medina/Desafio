import User from '../models/User.js'
import Interest from '../models/Interest.js'
import Preference from '../models/Preference.js'
import sequelize from '../config/postgres.js'

// ── getMe ────────────────────────────────────────────────────
export const getMe = async (id_user) => {
  const user = await User.findByPk(id_user, {
    attributes: { exclude: ['password_hash'] },
  })
  if (!user) throw new Error('Usuario no encontrado')

  // Municipio: query directa, sin modelo
  const [municipio] = await sequelize.query(
    `SELECT id, nombre, provincia FROM shared.municipalities WHERE id = :id`,
    { replacements: { id: user.municipality_id }, type: sequelize.QueryTypes.SELECT }
  )

  // Intereses: query directa sobre tabla pivote
  const interests = await sequelize.query(
    `SELECT i.id_interes, i.nombre, i.level, i.father_id
     FROM user_data.user_interests ui
     JOIN user_data.interests i ON i.id_interes = ui.id_interes
     WHERE ui.id_user = :id_user
     ORDER BY i.level, i.nombre`,
    { replacements: { id_user }, type: sequelize.QueryTypes.SELECT }
  )

  const preferences = await Preference.findOne({ where: { user_id: id_user } })

  return {
    ...user.toJSON(),
    municipio: municipio ?? null,
    interests,
    preferences: preferences ?? null,
  }
}

// ── updateMe ─────────────────────────────────────────────────
export const updateMe = async (id_user, data) => {
  const allowed = ['nombre', 'apellido', 'tlf', 'municipality_id', 'sexo', 'age']
  const update = Object.fromEntries(
    Object.entries(data).filter(([k]) => allowed.includes(k))
  )
  if (Object.keys(update).length === 0) throw new Error('No se pueden actualizar esos campos')

  await User.update(update, { where: { id_user } })
  return getMe(id_user)
}

// ── deleteMe ─────────────────────────────────────────────────
export const deleteMe = async (id_user) => {
  const deleted = await User.destroy({ where: { id_user } })
  if (!deleted) throw new Error('Usuario no encontrado')
  return { ok: true }
}

// ── getInterests ─────────────────────────────────────────────
export const getInterests = async (id_user) => {
  const interests = await sequelize.query(
    `SELECT i.id_interes, i.nombre, i.level, i.father_id
     FROM user_data.user_interests ui
     JOIN user_data.interests i ON i.id_interes = ui.id_interes
     WHERE ui.id_user = :id_user
     ORDER BY i.level, i.nombre`,
    { replacements: { id_user }, type: sequelize.QueryTypes.SELECT }
  )
  return interests
}

// ── updateInterests ──────────────────────────────────────────
// Recibe array de id_interes y reemplaza todos los intereses del usuario
export const updateInterests = async (id_user, interest_ids) => {
  if (!Array.isArray(interest_ids)) throw new Error('interest_ids debe ser un array')

  await sequelize.transaction(async (t) => {
    await sequelize.query(
      `DELETE FROM user_data.user_interests WHERE id_user = :id_user`,
      { replacements: { id_user }, transaction: t }
    )
    if (interest_ids.length > 0) {
      const placeholders = interest_ids.map((_, i) => `(:id_user, :id_${i})`).join(', ')
      const replacements = { id_user }
      interest_ids.forEach((id, i) => { replacements[`id_${i}`] = id })
      await sequelize.query(
        `INSERT INTO user_data.user_interests (id_user, id_interes) VALUES ${placeholders}`,
        { replacements, transaction: t }
      )
    }
  })

  return getInterests(id_user)
}

// ── getPreferences ───────────────────────────────────────────
export const getPreferences = async (id_user) => {
  const prefs = await Preference.findOne({ where: { user_id: id_user } })
  return prefs ?? null
}

// ── updatePreferences ────────────────────────────────────────
export const updatePreferences = async (id_user, data) => {
  const allowed = ['rango_precio', 'movilidad_reducida', 'municipios_interes']
  const update = Object.fromEntries(
    Object.entries(data).filter(([k]) => allowed.includes(k))
  )
  if (Object.keys(update).length === 0) throw new Error('Sin campos válidos para actualizar')

  const [prefs] = await Preference.upsert(
    { user_id: id_user, ...update, updated_at: new Date() },
    { returning: true }
  )
  return prefs
}

// ── getAllInterests ───────────────────────────────────────────
// Catálogo completo disponible (para el front al registrarse o editar perfil)
export const getAllInterests = async () => {
  const interests = await Interest.findAll({
    order: [['level', 'ASC'], ['nombre', 'ASC']],
  })
  return interests
}