const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

async function request(method, path, body) {
  const res = await fetch(`${BASE_URL}/api/auth${path}`, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Error en la solicitud')
  return data
}

export function login({ email, password }) {
  return request('POST', '/login', { email, password })
}

export function register({ nombre, apellido, email, password, tlf, municipality_id, sexo, age }) {
  return request('POST', '/register', { nombre, apellido, email, password, tlf, municipality_id, sexo, age })
}

export function logout() {
  return request('POST', '/logout')
}

export function refresh() {
  return request('POST', '/refresh')
}

export function getMe() {
  return fetch(`${BASE_URL}/api/auth/me`, {
    credentials: 'include',
  }).then(async (res) => {
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'No autenticado')
    return data
  })
}
