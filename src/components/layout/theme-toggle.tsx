'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-14 h-8 bg-muted rounded-full opacity-20" />
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative w-16 h-9 rounded-full bg-muted/50 p-1 transition-colors duration-500 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/20 border border-border/50 shadow-inner"
      aria-label="Toggle theme"
    >
      <div className="flex justify-between items-center w-full px-1.5">
        <Sun className={`h-3.5 w-3.5 transition-all duration-500 ${!isDark ? 'text-amber-500 scale-110' : 'text-muted-foreground/30'}`} />
        <Moon className={`h-3.5 w-3.5 transition-all duration-500 ${isDark ? 'text-primary scale-110' : 'text-muted-foreground/30'}`} />
      </div>
      
      <motion.div
        className="absolute top-1 left-1 w-7 h-7 rounded-full bg-background shadow-lg border border-border flex items-center justify-center overflow-hidden"
        initial={false}
        animate={{
          x: isDark ? 28 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              <Moon className="h-4 w-4 text-primary fill-primary/10" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              <Sun className="h-4 w-4 text-amber-500 fill-amber-500/10" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </button>
  )
}
