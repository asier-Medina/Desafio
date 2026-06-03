const DB_KEY = 'sustrai_mock_db'

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

export async function login({ email, password }) {
  await delay()
  const db = getDB()
  const user = db.users.find(u => u.email === email)
  if (!user) throw new Error('Credenciales inválidas')

  if (user.passwordHash !== hashPassword(password)) {
    throw new Error('Credenciales inválidas')
  }

  const safeUser = { ...user }
  delete safeUser.passwordHash
  return { user: safeUser }
}

export async function register({ name, lastName, email, password, tlf, municipality_id, sexo, age }) {
  await delay()
  const db = getDB()

  if (db.users.find(u => u.email === email)) {
    throw new Error('El correo ya está registrado')
  }

  const newUser = {
    id: db.nextId++,
    name,
    lastName,
    email,
    passwordHash: hashPassword(password),
    tlf: tlf || null,
    municipality_id: municipality_id || null,
    sexo: sexo || null,
    age: age || null,
    role: 'user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  db.users.push(newUser)
  saveDB(db)

  const safeUser = { ...newUser }
  delete safeUser.passwordHash
  return { user: safeUser }
}

export async function logout() {
  await delay(200)
}

export async function refresh() {
  await delay(300)
  const stored = localStorage.getItem('user')
  if (!stored) throw new Error('No hay sesión activa')

  const parsed = JSON.parse(stored)
  const db = getDB()
  const exists = db.users.find(u => u.id === parsed.id)
  if (!exists) throw new Error('Sesión expirada')

  const safeUser = { ...exists }
  delete safeUser.passwordHash
  return { user: safeUser }
}
