"use client"

import { useEffect, useState } from "react"

const loadingMessages = [
  "Sincronizando con la cadena...",
  "Consultando Oráculo...",
  "Verificando contratos...",
  "Analizando datos on-chain...",
  "Procesando transacciones...",
]

export function LoadingState() {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full glass-intense rounded-2xl p-6 neon-shadow-cyan">
      {/* Block Scanner Animation */}
      <div className="relative h-24 mb-6 overflow-hidden rounded-lg bg-obsidian/50 border border-glass-border">
        {/* Grid Lines */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-full h-px bg-cyan/50"
              style={{ top: `${(i + 1) * 12.5}%` }}
            />
          ))}
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute h-full w-px bg-cyan/50"
              style={{ left: `${(i + 1) * 8.33}%` }}
            />
          ))}
        </div>

        {/* Scanning Line */}
        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan to-transparent scan-line shadow-[0_0_20px_rgba(0,240,255,0.8)]" />

        {/* Block Icons */}
        <div className="absolute inset-0 flex items-center justify-center gap-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-8 h-8 border-2 border-cyan/60 rounded-md opacity-60"
              style={{
                animationDelay: `${i * 0.2}s`,
              }}
            >
              <div className="w-full h-full bg-cyan/10" />
            </div>
          ))}
        </div>
      </div>

      {/* Loading Text */}
      <div className="flex items-center justify-center gap-3">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-cyan"
              style={{
                animation: "pulse 1s ease-in-out infinite",
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
        <p className="font-mono text-sm text-cyan text-flicker">
          {loadingMessages[messageIndex]}
        </p>
      </div>
    </div>
  )
}
