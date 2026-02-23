import { createContext, useContext, useState } from "react"
import type { ReactNode } from "react"
import es from "../locales/es.json"
import en from "../locales/en.json"

export type Language = "es" | "en"

type LanguageProviderState = {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const dictionaries = {
  es,
  en
}

const initialState: LanguageProviderState = {
  language: "es",
  setLanguage: () => null,
  t: (key: string) => key,
}

// eslint-disable-next-line react-refresh/only-export-components
export const LanguageContext = createContext<LanguageProviderState>(initialState)

export function LanguageProvider({
  children,
  defaultLanguage = "es",
  storageKey = "app-language",
}: {
  children: ReactNode
  defaultLanguage?: Language
  storageKey?: string
}) {
  const [language, setLanguage] = useState<Language>(
    () => (localStorage.getItem(storageKey) as Language) || defaultLanguage
  )

  const t = (key: string): string => {
    const keys = key.split('.')
    let val: unknown = dictionaries[language] as Record<string, unknown>
    for (const k of keys) {
      if (val === undefined) break
      val = (val as Record<string, unknown>)[k]
    }
    return val !== undefined ? (val as string) : key // fallback to key if missing
  }

  const value = {
    language,
    setLanguage: (lang: Language) => {
      localStorage.setItem(storageKey, lang)
      setLanguage(lang)
    },
    t,
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => {
  const context = useContext(LanguageContext)

  if (context === undefined)
    throw new Error("useLanguage must be used within a LanguageProvider")

  return context
}
