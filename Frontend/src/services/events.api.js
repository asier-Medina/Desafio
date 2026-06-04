const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

async function request(method, path, body) {
  const res = await fetch(`${BASE_URL}/api/events${path}`, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Error en la solicitud')
  return data
}

export function list({ limit, offset } = {}) {
  const params = new URLSearchParams()
  if (limit) params.set('limit', limit)
  if (offset) params.set('offset', offset)
  const qs = params.toString()
  return request('GET', qs ? `?${qs}` : '')
}

export function getById(id) {
  return request('GET', `/${id}`)
}

export function getFeatured({ limit, offset } = {}) {
  const params = new URLSearchParams()
  if (limit) params.set('limit', limit)
  if (offset) params.set('offset', offset)
  params.set('featured', 'true')
  return request('GET', `?${params.toString()}`)
}

export function getCercaDeTi({ limit, offset } = {}) {
  const params = new URLSearchParams()
  if (limit) params.set('limit', limit)
  if (offset) params.set('offset', offset)
  return request('GET', `/cerca-de-ti?${params.toString()}`)
}

export function getMejorValorados({ limit, offset } = {}) {
  const params = new URLSearchParams()
  if (limit) params.set('limit', limit)
  if (offset) params.set('offset', offset)
  return request('GET', `/mejor-valorados?${params.toString()}`)
}
