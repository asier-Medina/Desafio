const API_URL = 'https://api.itzuli.vicomtech.org/translation/get'
const API_KEY = import.meta.env.VITE_ITZULI_API_KEY || ''
const SOURCE_LANG = 'es'

const cache = new Map()

function cacheKey(text, target) {
  return `${text}:${target}`
}

export async function translateText(text, targetLang) {
  if (!text || typeof text !== 'string') return text
  if (targetLang === SOURCE_LANG || !API_KEY) return text

  const key = cacheKey(text, targetLang)
  if (cache.has(key)) return cache.get(key)

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        sourcelanguage: SOURCE_LANG,
        targetlanguage: targetLang,
        text,
      }),
    })
    if (!res.ok) throw new Error(`Itzuli error: ${res.status}`)
    const data = await res.json()
    const translated = data.translatedText || data.TranslatedText || text
    cache.set(key, translated)
    return translated
  } catch {
    return text
  }
}

export async function translateData(data, fields, targetLang) {
  if (!data || targetLang === SOURCE_LANG || !API_KEY) return data

  if (Array.isArray(data)) {
    return Promise.all(data.map((item) => translateData(item, fields, targetLang)))
  }

  const result = { ...data }
  const translations = await Promise.all(
    fields.map(async (field) => {
      const value = result[field]
      if (typeof value === 'string') {
        return { field, translated: await translateText(value, targetLang) }
      }
      return { field, translated: value }
    }),
  )
  for (const { field, translated } of translations) {
    result[field] = translated
  }
  return result
}

export function clearCache() {
  cache.clear()
}
