const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export async function sendMessage({ message, sessionId }) {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, session_id: sessionId }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Error en el chatbot')
  return data.data
}
