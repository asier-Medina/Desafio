const DB_KEY = 'sustrai_mock_db'
const SESSION_KEY = 'sustrai_mock_session'

function getDB() {
  try {
    const raw = localStorage.getItem(DB_KEY)
    return raw ? JSON.parse(raw) : { users: [], nextId: 1 }
  } catch {
    return { users: [], nextId: 1 }
  }
}

function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db))
}

function delay(ms = 600) {
  return new Promise(r => setTimeout(r, ms))
}

function hashPassword(password) {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return btoa(String(hash))
}

function safeUser(user) {
  const u = { ...user }
  delete u.passwordHash
  return u
}

export async function login({ email, password }) {
  await delay()
  const db = getDB()
  const user = db.users.find(u => u.email === email)
  if (!user) throw new Error('Credenciales inválidas')
  if (user.passwordHash !== hashPassword(password)) throw new Error('Credenciales inválidas')
  const safe = safeUser(user)
  localStorage.setItem(SESSION_KEY, JSON.stringify(safe))
  return { user: safe }
}

export async function register({ nombre, apellido, email, password, tlf, municipality_id, sexo, age }) {
  await delay()
  const db = getDB()
  if (db.users.find(u => u.email === email)) throw new Error('El correo ya está registrado')

  const newUser = {
    id:            db.nextId++,
    nombre,
    apellido,
    email,
    passwordHash:  hashPassword(password),
    tlf:           tlf || null,
    municipality_id: municipality_id || null,
    sexo:          sexo || null,
    age:           age || null,
    role:          'user',
    createdAt:     new Date().toISOString(),
    updatedAt:     new Date().toISOString(),
  }

  db.users.push(newUser)
  saveDB(db)
  const safe = safeUser(newUser)
  localStorage.setItem(SESSION_KEY, JSON.stringify(safe))
  return { user: safe }
}

export async function logout() {
  await delay(200)
  localStorage.removeItem(SESSION_KEY)
}

export async function refresh() {
  await delay(300)
  const stored = localStorage.getItem(SESSION_KEY)
  if (!stored) throw new Error('No hay sesión activa')
  const parsed = JSON.parse(stored)
  const db = getDB()
  const exists = db.users.find(u => u.id === parsed.id)
  if (!exists) throw new Error('Sesión expirada')
  return { ok: true }
}

export async function getMe() {
  await delay(200)
  const stored = localStorage.getItem(SESSION_KEY)
  if (!stored) throw new Error('No autenticado')
  return JSON.parse(stored)
}
