"use client"

import { useState, useRef, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import { Send, BarChart2, Plus, Database } from "lucide-react"

// ─── Types ───────────────────────────────────────────────────────────────────
interface Message {
  role: "user" | "ai"
  content: string
}

// ─── Orb ────────────────────────────────────────────────────────────────────
function AiOrb() {
  return (
    <div className="ai-orb mx-auto">
      <div className="ai-orb-inner" />
      <div className="ai-orb-center" />
    </div>
  )
}

// ─── Thinking indicator ──────────────────────────────────────────────────────
function ThinkingBubble() {
  return (
    <div className="flex items-end gap-3 msg-enter">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center flex-shrink-0">
        <BarChart2 className="w-4 h-4 text-white" />
      </div>
      <div className="chat-bubble-ai px-4 py-3">
        <div className="flex gap-1.5 items-center h-4">
          <span className="thinking-dot w-2 h-2 rounded-full bg-indigo-400 inline-block" />
          <span className="thinking-dot w-2 h-2 rounded-full bg-indigo-400 inline-block" />
          <span className="thinking-dot w-2 h-2 rounded-full bg-indigo-400 inline-block" />
        </div>
      </div>
    </div>
  )
}

// ─── Message bubble ──────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: Message }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end msg-enter">
        <div className="chat-bubble-user px-4 py-3 max-w-[80%] text-sm leading-relaxed">
          {msg.content}
        </div>
      </div>
    )
  }
  return (
    <div className="flex items-end gap-3 msg-enter">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
        <BarChart2 className="w-4 h-4 text-white" />
      </div>
      <div className="chat-bubble-ai px-4 py-3 max-w-[80%]">
        <div className="ai-prose">
          <ReactMarkdown>{msg.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}

// ─── Empty state ─────────────────────────────────────────────────────────────
function EmptyState({ onSuggestion }: { onSuggestion: (q: string) => void }) {
  const suggestions = [
    "¿Cuál es el producto con mayor stock?",
    "¿Cuántos clientes tenemos registrados?",
    "¿Cuál fue el ticket promedio de ventas?",
    "Muéstrame los últimos pedidos",
  ]
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-8 px-6 py-12 text-center">
      <div className="flex flex-col items-center gap-4">
        <AiOrb />
        <div>
          <h1 className="text-xl font-semibold text-gray-800 mt-4">
            Hola, soy Satoshi!<br />tu Analista de Datos
          </h1>
          <p className="text-sm text-gray-500 mt-1 max-w-xs">
            Hazme una pregunta sobre tu negocio y consultaré tus datos en tiempo real.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => onSuggestion(s)}
            className="text-left px-4 py-3 rounded-xl border border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm text-sm text-gray-600 hover:text-indigo-700 transition-all duration-150"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function DataMindApp() {
  const [messages, setMessages] = useState<Message[]>([])
  const [history, setHistory] = useState<object[]>([])
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  const handleSubmit = async (questionOverride?: string) => {
    const question = questionOverride ?? query
    if (!question.trim() || isLoading) return

    const userMsg: Message = { role: "user", content: question }
    setMessages((prev) => [...prev, userMsg])
    setQuery("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, history }),
      })
      const data = await res.json()

      const aiMsg: Message = { role: "ai", content: data.message }
      setMessages((prev) => [...prev, aiMsg])
      if (data.newHistory) setHistory(data.newHistory)
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Error de conexión. Por favor, intenta de nuevo." },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const resetChat = () => {
    setMessages([])
    setHistory([])
    setQuery("")
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* ── Chat Panel ──────────────────────── */}
      <div className="flex flex-col w-full h-full">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-medium text-gray-700">Satoshi Agent</span>
          </div>
          <button 
            onClick={resetChat} 
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva consulta
          </button>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto chat-scroll bg-[#f8f9fb]">
          {messages.length === 0 && !isLoading ? (
            <EmptyState onSuggestion={(q) => handleSubmit(q)} />
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
              {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} />
              ))}
              {isLoading && <ThinkingBubble />}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-4 pb-6 pt-2 bg-transparent">
          <div className="max-w-3xl mx-auto">
            <div className="input-bar px-4 py-3 flex items-end gap-3">
              <textarea
                ref={textareaRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu consulta... (Enter para enviar)"
                rows={1}
                className="flex-1 resize-none bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none leading-relaxed max-h-40"
                style={{ scrollbarWidth: "none" }}
              />
              <button
                id="send-btn"
                onClick={() => handleSubmit()}
                disabled={isLoading || !query.trim()}
                className="send-btn flex-shrink-0"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
            <p className="text-center text-xs text-gray-400 mt-2">
              Shift + Enter para nueva línea
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
