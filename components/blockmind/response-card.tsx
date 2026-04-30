"use client"

import { Shield, FileText, BadgeCheck, AlertTriangle, CheckCircle2, Info } from "lucide-react"

interface ResponseData {
  summary: string
  securityLevel: "high" | "medium" | "low"
  details?: string[]
}

interface ResponseCardProps {
  data: ResponseData
}

const securityConfig = {
  high: {
    label: "Alto",
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    icon: CheckCircle2,
  },
  medium: {
    label: "Medio",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
    icon: AlertTriangle,
  },
  low: {
    label: "Bajo",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    icon: AlertTriangle,
  },
}

export function ResponseCard({ data }: ResponseCardProps) {
  const security = securityConfig[data.securityLevel]
  const SecurityIcon = security.icon

  return (
    <div className="w-full glass-intense rounded-2xl overflow-hidden card-enter neon-shadow-purple">
      {/* AI Verified Badge */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-glass-border bg-gradient-to-r from-cyan/5 to-purple/5">
        <div className="flex items-center gap-2">
          <BadgeCheck className="w-5 h-5 text-cyan" />
          <span className="text-xs font-mono text-cyan uppercase tracking-wider">
            Verificado por IA
          </span>
        </div>
        <div className="h-1 w-16 rounded-full bg-gradient-to-r from-cyan to-purple" />
      </div>

      <div className="p-5 space-y-5">
        {/* Technical Summary Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-purple">
              Resumen Técnico
            </h3>
          </div>
          <p className="text-foreground/90 text-sm leading-relaxed pl-6">
            {data.summary}
          </p>
        </div>

        {/* Security Level Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyan">
              Nivel de Seguridad
            </h3>
          </div>
          <div className={`flex items-center gap-3 pl-6 py-3 px-4 rounded-lg ${security.bgColor} border ${security.borderColor}`}>
            <SecurityIcon className={`w-5 h-5 ${security.color}`} />
            <span className={`font-mono font-bold ${security.color}`}>
              {security.label}
            </span>
          </div>
        </div>

        {/* Details Section */}
        {data.details && data.details.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Detalles Adicionales
              </h3>
            </div>
            <ul className="space-y-2 pl-6">
              {data.details.map((detail, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-foreground/80">
                  <span className="text-cyan mt-1">•</span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Bottom Gradient Bar */}
      <div className="h-1 w-full bg-gradient-to-r from-cyan via-purple to-cyan" />
    </div>
  )
}
