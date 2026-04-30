"use client"

import { Cpu } from "lucide-react"

export function Header() {
  return (
    <header className="w-full flex items-center justify-between px-4 py-4">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <Cpu className="w-8 h-8 text-cyan" />
          <div className="absolute inset-0 bg-cyan/20 blur-lg rounded-full" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight gradient-text">
          BLOCKMIND
        </h1>
      </div>

      {/* Network Status */}
      <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-full">
        <div className="w-2 h-2 rounded-full bg-green-500 pulse-dot" />
        <span className="text-xs font-mono text-green-400">Mainnet Online</span>
      </div>
    </header>
  )
}
