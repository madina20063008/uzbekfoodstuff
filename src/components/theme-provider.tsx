import * as React from 'react'

interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: string
  defaultTheme?: string
  enableSystem?: boolean
  storageKey?: string
  themes?: string[]
  forcedTheme?: string
}

export function ThemeProvider({ 
  children, 
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
  storageKey = "vite-ui-theme",
  themes = ["light", "dark"],
  forcedTheme,
  ...props 
}: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)
  const [currentTheme, setCurrentTheme] = React.useState(defaultTheme)

  React.useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem(storageKey)
    if (savedTheme && themes.includes(savedTheme)) {
      setCurrentTheme(savedTheme)
    }
  }, [storageKey, themes])

  React.useEffect(() => {
    if (!mounted) return

    const root = window.document.documentElement

    // Remove all theme classes
    root.classList.remove(...themes)

    // Apply current theme or forced theme
    const themeToApply = forcedTheme || currentTheme
    
    if (themeToApply === 'system' && enableSystem) {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.add(systemTheme)
    } else if (themes.includes(themeToApply)) {
      root.classList.add(themeToApply)
    }

    // Set data attribute
    if (attribute === 'class') {
      root.classList.add(themeToApply)
    } else {
      root.setAttribute(attribute, themeToApply)
    }
  }, [mounted, currentTheme, forcedTheme, attribute, themes, enableSystem])

  const value = React.useMemo(() => ({
    theme: currentTheme,
    setTheme: (theme: string) => {
      if (themes.includes(theme) || theme === 'system') {
        setCurrentTheme(theme)
        localStorage.setItem(storageKey, theme)
      }
    },
    themes,
    forcedTheme,
  }), [currentTheme, themes, forcedTheme, storageKey])

  // Prevent flash of unstyled content
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>
  }

  return (
    <ThemeContext.Provider value={value} {...props}>
      {children}
    </ThemeContext.Provider>
  )
}

// Create context for theme
interface ThemeContextType {
  theme: string
  setTheme: (theme: string) => void
  themes: string[]
  forcedTheme?: string
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined)

// Hook to use theme
export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}