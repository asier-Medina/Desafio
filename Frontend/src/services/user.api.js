const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

async function request(method, path, body) {
  const res = await fetch(`${BASE_URL}/api/users${path}`, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Error en la solicitud')
  return data
}

export function getInterestsCatalog() {
  return fetch(`${BASE_URL}/api/users/interests/catalog`, {
    credentials: 'include',
  }).then(async (res) => {
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'Error')
    return data
  })
}

export function updateInterests(interest_ids) {
  return request('PUT', '/me/interests', { interest_ids })
}

export function updatePreferences(data) {
  return request('PUT', '/me/preferences', data)
}
