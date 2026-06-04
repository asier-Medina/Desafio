const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

async function request(method, path, body) {
  const res = await fetch(`${BASE_URL}/api/users/me/favorites${path}`, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Error en la solicitud')
  return data
}

export function list() {
  return request('GET', '')
}

export function add(entidad_id, entidad_tipo) {
  return request('POST', '', { entidad_id, entidad_tipo })
}

export function remove(entidad_tipo, entidad_id) {
  return request('DELETE', `/${entidad_tipo}/${entidad_id}`)
}