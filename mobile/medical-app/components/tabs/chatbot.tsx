"use client"

import { useState, useEffect, useRef } from "react"
import { Bot, Mic, ImageIcon, Send, Loader2 } from "lucide-react"
import { ModernButton } from "@/components/ui/ModernButton"
import type { Translation } from "@/lib/translations"
import { chatService } from "@/lib/api/services/chatService"
import { useAppStore } from "@/store/useAppStore"
import { toast } from "sonner"
import type { ChatMessage } from "@/lib/api/services/chatService"

interface ChatViewProps {
  t: Translation
}

export function ChatView({ t }: ChatViewProps) {
  const user = useAppStore((state) => state.user)
  const isEmergencyMode = useAppStore((state) => state.isEmergencyMode)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Inicializar conversación al montar
  useEffect(() => {
    const initializeChat = async () => {
      // En modo emergencia, usar un userId temporal
      const userId = user?._id || `emergency_${Date.now()}`
      
      try {
        setIsInitializing(true)
        const result = await chatService.createConversation({
          userId: userId,
          userInfo: {
            name: user?.name || 'Usuario de Emergencia',
            email: user?.email || 'emergency@respicare.com',
            role: user?.role || 'patient',
            isEmergency: isEmergencyMode
          },
          location: {
            city: 'Tacna',
            country: 'Perú'
          },
          metadata: {
            isEmergencyMode: isEmergencyMode
          }
        })
        setSessionId(result.sessionId)
        
        // Cargar mensajes existentes si hay
        const conversation = await chatService.getConversation(result.sessionId)
        if (conversation.messages && conversation.messages.length > 0) {
          setMessages(conversation.messages)
        } else {
          // Mensaje de bienvenida inicial
          const welcomeMessage: ChatMessage = {
            role: 'assistant',
            content: isEmergencyMode 
              ? "Hola, estás en modo de emergencia. ¿Cómo puedo ayudarte con tu situación médica urgente? Describe tus síntomas y te proporcionaré orientación inmediata."
              : t.chat.welcome,
            timestamp: new Date().toISOString()
          }
          setMessages([welcomeMessage])
        }
      } catch (error: any) {
        console.error("Error al inicializar chat:", error)
        toast.error("Error al conectar con el asistente médico")
      } finally {
        setIsInitializing(false)
      }
    }

    initializeChat()
  }, [user, isEmergencyMode])

  // Scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (content?: string) => {
    const messageContent = content || inputValue.trim()
    
    if (!messageContent || isLoading || !sessionId) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: messageContent,
      timestamp: new Date().toISOString()
    }

    // Agregar mensaje del usuario inmediatamente
    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      // Enviar mensaje y obtener respuesta
      const result = await chatService.sendMessage(sessionId, messageContent)
      
      // Agregar respuesta del asistente
      if (result.assistantMessage) {
        setMessages((prev) => [...prev, result.assistantMessage!])
      } else {
        // Si no hay respuesta, agregar mensaje de error
        setMessages((prev) => [...prev, {
          role: 'assistant',
          content: 'Lo siento, no pude procesar tu mensaje. Por favor intenta de nuevo.',
          timestamp: new Date().toISOString()
        }])
      }
    } catch (error: any) {
      console.error("Error al enviar mensaje:", error)
      toast.error(error?.message || "Error al enviar mensaje")
      
      // Remover mensaje del usuario si falló
      setMessages((prev) => prev.filter((msg, idx) => 
        !(idx === prev.length - 1 && msg.role === 'user')
      ))
      
      // Agregar mensaje de error
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Lo siento, hubo un error. Por favor intenta de nuevo.',
        timestamp: new Date().toISOString()
      }])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Conectando con el asistente médico...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300 bg-slate-50/50 dark:bg-[#0f172a]">
      {/* Floating Header */}
      <div className="sticky top-0 left-0 right-0 z-20 p-4 pb-2">
        <div className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl p-3 shadow-sm flex items-center gap-3 border border-white/20 dark:border-slate-700">
          <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm dark:text-white">
              {isEmergencyMode ? "Asistente de Emergencia" : "Asistente Médico"}
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-blue-300 font-medium">
              {sessionId ? (isEmergencyMode ? "Modo Emergencia - Conectado" : "Conectado") : "Conectando..."}
            </p>
          </div>
          <div className="ml-auto pr-2">
            <span className={`w-2 h-2 rounded-full block ${
              sessionId ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-yellow-500'
            }`} />
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-6 min-h-0">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 border dark:border-slate-600 shadow-sm flex items-center justify-center shrink-0 mt-auto">
                <Bot className="w-5 h-5 text-primary dark:text-blue-300" />
              </div>
            )}
            <div
              className={`p-4 rounded-2xl shadow-sm border max-w-[85%] ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-none'
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-slate-100 dark:border-slate-700 rounded-bl-none'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              {message.timestamp && (
                <p className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 border dark:border-slate-600 shadow-sm flex items-center justify-center shrink-0 mt-auto">
              <Bot className="w-5 h-5 text-primary dark:text-blue-300" />
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 dark:border-slate-700">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions & Input - Fixed at bottom */}
      <div className="flex-shrink-0 p-4 bg-white dark:bg-[#1e293b] border-t border-border/50 dark:border-slate-700 rounded-t-[2rem] shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)] space-y-4">
        {messages.length === 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {t.chat.suggestions.map((sug, i) => (
              <button
                key={i}
                onClick={() => handleSuggestionClick(sug)}
                disabled={isLoading}
                className="px-4 py-2 rounded-full bg-secondary dark:bg-slate-700 text-secondary-foreground dark:text-white text-xs font-medium whitespace-nowrap hover:bg-secondary/80 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sug}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <div className="flex-1 bg-muted/50 dark:bg-[#0f172a] rounded-[1.5rem] p-1 flex items-center relative transition-all focus-within:ring-2 ring-primary/20 focus-within:bg-background dark:focus-within:bg-black">
            <ModernButton
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10"
              disabled
            >
              <Mic className="w-5 h-5" />
            </ModernButton>
            <input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading || !sessionId}
              className="flex-1 bg-transparent border-none focus:outline-none text-sm px-2 h-10 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-foreground dark:text-white disabled:opacity-50"
              placeholder={t.chat.placeholder}
            />
            <ModernButton
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10"
              disabled
            >
              <ImageIcon className="w-5 h-5" />
            </ModernButton>
          </div>

          <ModernButton
            size="icon"
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isLoading || !sessionId}
            className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : (
              <Send className="w-5 h-5 text-white" />
            )}
          </ModernButton>
        </div>
      </div>
    </div>
  )
}
