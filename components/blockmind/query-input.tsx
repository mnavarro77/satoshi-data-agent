"use client"

import { Sparkles } from "lucide-react"

interface QueryInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  isLoading: boolean
}

export function QueryInput({ value, onChange, onSubmit, isLoading }: QueryInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <div className="w-full space-y-4">
      {/* Textarea with Glassmorphism */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan/30 via-purple/30 to-cyan/30 rounded-2xl opacity-0 group-focus-within:opacity-100 blur transition-opacity duration-300" />
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="¿Qué protocolo o token vamos a analizar hoy?..."
          disabled={isLoading}
          className="relative w-full min-h-[120px] p-4 glass-intense rounded-2xl resize-none text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus-glow font-sans text-base transition-all duration-300 disabled:opacity-50"
        />
      </div>

      {/* Action Button */}
      <button
        onClick={onSubmit}
        disabled={isLoading || !value.trim()}
        suppressHydrationWarning
        className="w-full py-4 px-6 rounded-xl metallic-btn text-background font-bold tracking-wider uppercase text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all duration-300 group"
      >
        <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        <span>Ejecutar Consulta</span>
      </button>
    </div>
  )
}
