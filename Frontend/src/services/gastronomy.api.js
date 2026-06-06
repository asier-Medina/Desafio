const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

async function request(method, path, body) {
  const res = await fetch(`${BASE_URL}/api/gastronomy${path}`, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Error en la solicitud')
  return data
}

export const list              = ()              => request('GET', '')
export const getById           = (id)            => request('GET', `/${id}`)
export const getMejorValorados = ()              => request('GET', '/mejor-valorados')
export const getMichelinRepsol = ()              => request('GET', '/michelin-repsol')
export const getEntornoEspecial = ()             => request('GET', '/entorno-especial')
export const getCercaDeTi      = (municipalityId) => {
  const params = new URLSearchParams()
  if (municipalityId) params.set('municipality_id', municipalityId)
  return request('GET', `/cerca-de-ti?${params}`)
}
