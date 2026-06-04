import { createContext, useContext, useState, useCallback } from 'react'
import { translateData, clearCache } from '@services/translateService'

const LanguageContext = createContext(null)

const STORAGE_KEY = 'sustrai_lang'

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'es'
    } catch {
      return 'es'
    }
  })

  const setLanguage = useCallback((lang) => {
    setLanguageState(lang)
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {}
    clearCache()
  }, [])

  const translate = useCallback(
    (data, fields) => translateData(data, fields, language),
    [language],
  )

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translate }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
