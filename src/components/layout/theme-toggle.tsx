'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center space-x-2 opacity-0">
        <div className="h-6 w-10 bg-muted rounded-full" />
      </div>
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <div className="flex items-center gap-3 px-3 py-1.5 rounded-full border border-border bg-card/50 backdrop-blur-sm shadow-sm transition-all hover:bg-card">
      <Sun className={`h-4 w-4 transition-colors ${!isDark ? 'text-primary' : 'text-muted-foreground'}`} />
      <div className="flex items-center gap-2">
        <Switch
          id="theme-mode"
          checked={isDark}
          onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
          className="data-[state=checked]:bg-primary"
        />
        <Label htmlFor="theme-mode" className="sr-only">Toggle Theme</Label>
      </div>
      <Moon className={`h-4 w-4 transition-colors ${isDark ? 'text-primary' : 'text-muted-foreground'}`} />
    </div>
  )
}
