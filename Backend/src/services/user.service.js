import { User, Municipality, Interest, Preferences } from '../models/index.js'

// ── getMe ────────────────────────────────────────────────────
export const getMe = async (id_user) => {
  const user = await User.findByPk(id_user, {
    attributes: { exclude: ['password_hash'] },
    include: [
      { model: Municipality, attributes: ['id', 'nombre', 'provincia'] },
      { model: Preferences },
    ],
  })
  if (!user) throw new Error('Usuario no encontrado')

  const interests = await user.getInterests({
    attributes: ['id_interes', 'nombre', 'level', 'father_id'],
    through: { attributes: [] },
    order: [['level', 'ASC'], ['nombre', 'ASC']],
  })

  return { ...user.toJSON(), interests }
}

// ── updateMe ─────────────────────────────────────────────────
export const updateMe = async (id_user, data) => {
  const ALLOWED = ['nombre', 'apellido', 'tlf', 'municipality_id', 'sexo', 'age']
  const update = Object.fromEntries(
    Object.entries(data).filter(([k]) => ALLOWED.includes(k))
  )
  if (Object.keys(update).length === 0)
    throw new Error('No se pueden actualizar esos campos')

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
  const user = await User.findByPk(id_user)
  if (!user) throw new Error('Usuario no encontrado')
  return user.getInterests({
    attributes: ['id_interes', 'nombre', 'level', 'father_id'],
    through: { attributes: [] },
    order: [['level', 'ASC'], ['nombre', 'ASC']],
  })
}

// ── updateInterests ──────────────────────────────────────────
// Recibe array de id_interes y reemplaza todos los intereses del usuario.
// setInterests gestiona el DELETE + INSERT en una sola transacción.
export const updateInterests = async (id_user, interest_ids) => {
  if (!Array.isArray(interest_ids)) throw new Error('interest_ids debe ser un array')

  const user = await User.findByPk(id_user)
  if (!user) throw new Error('Usuario no encontrado')

  await user.setInterests(interest_ids)
  return getInterests(id_user)
}

// ── getPreferences ───────────────────────────────────────────
export const getPreferences = async (id_user) => {
  return Preferences.findOne({ where: { user_id: id_user } })
}

// ── updatePreferences ────────────────────────────────────────
export const updatePreferences = async (id_user, data) => {
  const ALLOWED = ['rango_precio', 'movilidad_reducida', 'municipios_interes']
  const update = Object.fromEntries(
    Object.entries(data).filter(([k]) => ALLOWED.includes(k))
  )
  if (Object.keys(update).length === 0)
    throw new Error('Sin campos válidos para actualizar')

  const [prefs] = await Preferences.upsert(
    { user_id: id_user, ...update, updated_at: new Date() },
    { returning: true }
  )
  return prefs
}

// ── getAllInterests ───────────────────────────────────────────
// Catálogo completo disponible (para el front al registrarse o editar perfil)
export const getAllInterests = async () => {
  return Interest.findAll({
    order: [['level', 'ASC'], ['nombre', 'ASC']],
  })
}
