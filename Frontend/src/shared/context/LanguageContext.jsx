import { createContext, useContext, useState, useCallback } from 'react'
import translations from '@shared/locales/translations'
import { translateData, clearCache } from '@services/translateService'

const LanguageContext = createContext(null)
const STORAGE_KEY = 'sustrai_lang'
const SUPPORTED = ['es', 'eu', 'en']

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return SUPPORTED.includes(stored) ? stored : 'es'
    } catch {
      return 'es'
    }
  })

  const setLang = useCallback((newLang) => {
    if (!SUPPORTED.includes(newLang)) return
    setLangState(newLang)
    try {
      localStorage.setItem(STORAGE_KEY, newLang)
    } catch {}
    clearCache()
  }, [])

  const t = translations[lang] ?? translations.es

  const translate = useCallback(
    (data, fields) => translateData(data, fields, lang),
    [lang],
  )

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, translate }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
