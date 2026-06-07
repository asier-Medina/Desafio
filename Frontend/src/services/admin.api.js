const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

async function request(method, path, body) {
  const res = await fetch(`${BASE_URL}/api/admin${path}`, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Error en la solicitud')
  return data
}

export const getUsers       = ()           => request('GET',    '/users')
export const updateUser     = (id, body)   => request('PATCH',  `/users/${id}`, body)
export const deleteUser     = (id)         => request('DELETE', `/users/${id}`)
export const getComercio    = ()           => request('GET',    '/comercios')
export const updateComercio = (id, body)   => request('PATCH',  `/comercios/${id}`, body)
