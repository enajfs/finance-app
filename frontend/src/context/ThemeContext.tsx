import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { Theme } from '../types'

export const THEMES: Record<string, Theme> = {
  ocean:  { name: 'Ocean Blue',    primary: '#2563EB', accent: '#3B82F6', light: '#EFF6FF' },
  forest: { name: 'Forest Green',  primary: '#16A34A', accent: '#22C55E', light: '#F0FDF4' },
  royal:  { name: 'Royal Purple',  primary: '#7C3AED', accent: '#8B5CF6', light: '#F5F3FF' },
  sunset: { name: 'Sunset Orange', primary: '#EA580C', accent: '#F97316', light: '#FFF7ED' },
  rose:   { name: 'Rose Pink',     primary: '#E11D48', accent: '#F43F5E', light: '#FFF1F2' },
}

interface ThemeCtx {
  themeKey: string
  theme: Theme
  setThemeKey: (key: string) => void
}

const ThemeContext = createContext<ThemeCtx | null>(null)

export const useTheme = (): ThemeCtx => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeKey, setThemeKeyState] = useState<string>(
    () => localStorage.getItem('theme') ?? 'ocean'
  )

  const setThemeKey = (key: string) => {
    localStorage.setItem('theme', key)
    setThemeKeyState(key)
  }

  const theme = THEMES[themeKey] ?? THEMES.ocean

  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', theme.primary)
    document.documentElement.style.setProperty('--color-accent', theme.accent)
    document.documentElement.style.setProperty('--color-light', theme.light)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ themeKey, theme, setThemeKey }}>
      {children}
    </ThemeContext.Provider>
  )
}
