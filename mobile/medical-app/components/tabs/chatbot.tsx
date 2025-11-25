"use client"

import { useState, useEffect, useRef } from "react"
import { Bot, Mic, ImageIcon, Send, Loader2, MessageSquare, Activity, X, Radio, Camera, Scissors, Droplet, Heart, Scan, Thermometer, AlertCircle, FileImage } from "lucide-react"
import { ModernButton } from "@/components/ui/ModernButton"
import { ModernCard } from "@/components/ui/ModernCard"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  
  // Estado para el modal de voz
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingType, setRecordingType] = useState<'transcribe' | 'cough' | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // Estado para el modal de imágenes
  const [showImageModal, setShowImageModal] = useState(false)
  const [imageType, setImageType] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // Inicializar conversación al montar
  useEffect(() => {
    const initializeChat = async () => {
      // En modo emergencia, usar un userId temporal
      const userId = user?._id || `emergency_${Date.now()}`
      
      try {
        setIsInitializing(true)
        
        // Log de diagnóstico
        console.log('Inicializando chat con:', {
          userId,
          isEmergencyMode,
          apiURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        })
        
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
      } catch (error: unknown) {
        // Log detallado del error para diagnóstico
        if (error instanceof Error) {
          console.error("Error al inicializar chat:", {
            message: error.message,
            name: error.name,
            stack: error.stack,
          })
        } else if (error && typeof error === 'object' && 'message' in error) {
          console.error("Error al inicializar chat:", {
            message: (error as any).message,
            status: (error as any).status,
            errors: (error as any).errors,
          })
        } else {
          console.error("Error al inicializar chat (desconocido):", error)
        }
        
        // Mensaje de error más informativo
        const errorMessage = error instanceof Error 
          ? error.message 
          : (error && typeof error === 'object' && 'message' in error)
          ? (error as any).message
          : "Error al conectar con el asistente médico"
        
        toast.error(errorMessage || "Error al conectar con el asistente médico")
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
    } catch (error: unknown) {
      console.error("Error al enviar mensaje:", error)
      const errorMessage = error instanceof Error ? error.message : "Error al enviar mensaje"
      toast.error(errorMessage)
      
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

  // Funciones para el modal de voz
  const openVoiceModal = () => {
    setShowVoiceModal(true)
  }

  const closeVoiceModal = () => {
    setShowVoiceModal(false)
    if (isRecording) {
      stopRecording()
    }
    setRecordingType(null)
    setRecordingTime(0)
  }

  const startRecording = async (type: 'transcribe' | 'cough') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      setRecordingType(type)

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: mediaRecorder.mimeType || 'audio/webm' 
        })
        
        try {
          if (type === 'transcribe') {
            await handleTranscribeAudio(audioBlob)
          } else if (type === 'cough') {
            await handleAnalyzeCough(audioBlob)
          }
        } catch (error) {
          console.error('Error processing audio:', error)
          toast.error('Error al procesar el audio')
        }
        
        // Limpiar
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
        setRecordingType(null)
        setRecordingTime(0)
        setShowVoiceModal(false)
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      // Iniciar temporizador
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
      
      toast.info(type === 'transcribe' 
        ? 'Grabando mensaje de voz...' 
        : 'Grabando tos para análisis...')
    } catch (error) {
      console.error('Error accessing microphone:', error)
      toast.error('No se pudo acceder al micrófono. Verifica los permisos.')
      setRecordingType(null)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
        recordingTimerRef.current = null
      }
      
      toast.success('Grabación completada. Procesando...')
    }
  }

  const handleTranscribeAudio = async (audioBlob: Blob) => {
    if (!sessionId) {
      toast.error('No hay sesión activa')
      return
    }

    try {
      setIsLoading(true)
      
      // Crear FormData para enviar el audio
      const formData = new FormData()
      formData.append('audio', audioBlob, 'voice-message.webm')
      formData.append('type', 'transcribe')
      
      // Enviar al backend para transcripción
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/chat/transcribe`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          },
          body: formData
        }
      )

      if (!response.ok) {
        throw new Error('Error en la transcripción')
      }

      const data = await response.json()
      const transcribedText = data.text || data.transcription || 'No se pudo transcribir el audio'

      // Enviar el texto transcrito como mensaje
      await handleSendMessage(transcribedText)
      toast.success('Mensaje transcrito y enviado')
    } catch (error) {
      console.error('Error transcribing audio:', error)
      toast.error('Error al transcribir el audio. Intenta escribiendo el mensaje.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnalyzeCough = async (audioBlob: Blob) => {
    if (!sessionId) {
      toast.error('No hay sesión activa')
      return
    }

    try {
      setIsLoading(true)
      
      // Crear FormData para enviar el audio
      const formData = new FormData()
      formData.append('audio', audioBlob, 'cough-audio.webm')
      formData.append('type', 'cough_analysis')
      formData.append('sessionId', sessionId)
      
      // Enviar al backend para análisis de tos
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/chat/analyze-cough`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          },
          body: formData
        }
      )

      if (!response.ok) {
        throw new Error('Error en el análisis de tos')
      }

      const data = await response.json()
      
      // Agregar mensaje del usuario
      const userMessage: ChatMessage = {
        role: 'user',
        content: 'He grabado mi tos para análisis',
        timestamp: new Date().toISOString(),
        metadata: { type: 'cough_analysis' }
      }
      setMessages((prev) => [...prev, userMessage])
      
      // Agregar respuesta del asistente con el análisis
      const analysisResult = data.analysis || data.result || 'Análisis completado'
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: typeof analysisResult === 'string' 
          ? analysisResult 
          : `Análisis de tos completado:\n${JSON.stringify(analysisResult, null, 2)}`,
        timestamp: new Date().toISOString(),
        metadata: { type: 'cough_analysis', data: data }
      }
      setMessages((prev) => [...prev, assistantMessage])
      
      toast.success('Análisis de tos completado')
    } catch (error) {
      console.error('Error analyzing cough:', error)
      toast.error('Error al analizar la tos. Intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  // Funciones para el modal de imágenes
  const openImageModal = () => {
    setShowImageModal(true)
  }

  const closeImageModal = () => {
    setShowImageModal(false)
    setImageType(null)
    setSelectedImage(null)
    setImagePreview(null)
  }

  const handleImageTypeSelect = (type: string) => {
    setImageType(type)
  }

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen válida')
      return
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('La imagen es muy grande. Máximo 10MB')
      return
    }

    setSelectedImage(file)

    // Crear preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const analyzeImage = async () => {
    if (!selectedImage || !imageType || !sessionId) {
      toast.error('Por favor selecciona una imagen y un tipo')
      return
    }

    setIsAnalyzingImage(true)
    closeImageModal()

    try {
      // Convertir imagen a base64
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result as string
          // Remover el prefijo data:image/...;base64, para enviar solo el base64
          const base64 = result.split(',')[1]
          resolve(base64)
        }
        reader.onerror = reject
        reader.readAsDataURL(selectedImage)
      })

      // Enviar al backend para análisis
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/chat/analyze-image`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            image: base64Image,
            image_type: imageType,
            sessionId: sessionId
          })
        }
      )

      if (!response.ok) {
        throw new Error('Error en el análisis de imagen')
      }

      const data = await response.json()
      
      // Agregar mensaje del usuario
      const userMessage: ChatMessage = {
        role: 'user',
        content: `He enviado una imagen de ${getImageTypeLabel(imageType)} para análisis`,
        timestamp: new Date().toISOString(),
        metadata: { type: 'image_analysis', imageType }
      }
      setMessages((prev) => [...prev, userMessage])
      
      // Agregar respuesta del asistente con el análisis
      const analysisResult = data.analysis || data.result || 'Análisis completado'
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: typeof analysisResult === 'string' 
          ? analysisResult 
          : `Análisis de imagen completado:\n${JSON.stringify(analysisResult, null, 2)}`,
        timestamp: new Date().toISOString(),
        metadata: { type: 'image_analysis', data: data }
      }
      setMessages((prev) => [...prev, assistantMessage])
      
      toast.success('Análisis de imagen completado')
    } catch (error) {
      console.error('Error analyzing image:', error)
      toast.error('Error al analizar la imagen. Intenta de nuevo.')
    } finally {
      setIsAnalyzingImage(false)
      setSelectedImage(null)
      setImagePreview(null)
      setImageType(null)
    }
  }

  const getImageTypeLabel = (type: string | null): string => {
    const labels: Record<string, string> = {
      'chest_xray': 'radiografía de tórax',
      'chest_ct': 'tomografía computarizada',
      'spirometry': 'espirometría',
      'oximetry': 'oximetría',
      'sputum': 'expectoración',
      'skin_rash': 'erupción cutánea',
      'cyanosis': 'cianosis',
      'other': 'imagen médica'
    }
    return labels[type || 'other'] || 'imagen médica'
  }

  const openImageSource = (source: 'gallery' | 'camera') => {
    const input = source === 'camera' ? cameraInputRef.current : imageInputRef.current
    if (input) {
      input.click()
    }
  }

  // Limpiar recursos al desmontar
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

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
              disabled={isLoading || !sessionId || isRecording}
              onClick={openVoiceModal}
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
              disabled={isLoading || !sessionId || isAnalyzingImage}
              onClick={openImageModal}
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

      {/* Modal de opciones de voz */}
      <Dialog open={showVoiceModal} onOpenChange={(open) => {
        if (!open && !isRecording) {
          closeVoiceModal()
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Opciones de Voz</DialogTitle>
            <DialogDescription>
              Selecciona qué deseas hacer con el micrófono
            </DialogDescription>
          </DialogHeader>
          
          {!isRecording ? (
            <div className="space-y-3 mt-4">
              <ModernCard
                className="p-4 cursor-pointer hover:bg-primary/5 transition-colors border-2 border-transparent hover:border-primary/20"
                onClick={() => startRecording('transcribe')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base">Transcribir mensaje de voz</h3>
                    <p className="text-sm text-muted-foreground">
                      Graba tu mensaje y lo convertiré en texto para enviarlo al chat
                    </p>
                  </div>
                </div>
              </ModernCard>

              <ModernCard
                className="p-4 cursor-pointer hover:bg-primary/5 transition-colors border-2 border-transparent hover:border-primary/20"
                onClick={() => startRecording('cough')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base">Analizar mi tos</h3>
                    <p className="text-sm text-muted-foreground">
                      Graba tu tos para que pueda analizarla y darte recomendaciones
                    </p>
                  </div>
                </div>
              </ModernCard>
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              <div className="text-center py-8">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
                  <div className="absolute inset-0 rounded-full bg-red-500/30 animate-pulse" />
                  <div className="absolute inset-2 rounded-full bg-red-500 flex items-center justify-center">
                    <Mic className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-2">
                  {recordingType === 'transcribe' ? 'Grabando mensaje...' : 'Grabando tos...'}
                </h3>
                <p className="text-2xl font-mono text-primary mb-4">
                  {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  {recordingType === 'transcribe' 
                    ? 'Habla tu mensaje claramente' 
                    : 'Tose cerca del micrófono para un mejor análisis'}
                </p>
                <div className="flex gap-3 justify-center">
                  <ModernButton
                    variant="outline"
                    onClick={() => {
                      closeVoiceModal()
                      toast.info('Grabación cancelada')
                    }}
                  >
                    Cancelar
                  </ModernButton>
                  <ModernButton
                    onClick={stopRecording}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    Detener grabación
                  </ModernButton>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de opciones de imágenes */}
      <Dialog open={showImageModal} onOpenChange={(open) => {
        if (!open && !isAnalyzingImage) {
          closeImageModal()
        }
      }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Análisis de Imagen Médica</DialogTitle>
            <DialogDescription>
              {!imageType ? 'Selecciona el tipo de imagen que deseas analizar' : 'Selecciona la imagen desde tu galería o cámara'}
            </DialogDescription>
          </DialogHeader>
          
          {!imageType ? (
            <div className="space-y-3 mt-4">
              <ModernCard
                className="p-4 cursor-pointer hover:bg-primary/5 transition-colors border-2 border-transparent hover:border-primary/20"
                onClick={() => handleImageTypeSelect('chest_xray')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Scan className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base">Radiografía de Tórax</h3>
                    <p className="text-sm text-muted-foreground">
                      Analiza radiografías para detectar neumonía, neumotórax, y otras condiciones
                    </p>
                  </div>
                </div>
              </ModernCard>

              <ModernCard
                className="p-4 cursor-pointer hover:bg-primary/5 transition-colors border-2 border-transparent hover:border-primary/20"
                onClick={() => handleImageTypeSelect('chest_ct')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Scan className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base">Tomografía Computarizada</h3>
                    <p className="text-sm text-muted-foreground">
                      Analiza tomografías del tórax para diagnóstico avanzado
                    </p>
                  </div>
                </div>
              </ModernCard>

              <ModernCard
                className="p-4 cursor-pointer hover:bg-primary/5 transition-colors border-2 border-transparent hover:border-primary/20"
                onClick={() => handleImageTypeSelect('spirometry')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base">Espirometría</h3>
                    <p className="text-sm text-muted-foreground">
                      Analiza gráficos de pruebas de función pulmonar
                    </p>
                  </div>
                </div>
              </ModernCard>

              <ModernCard
                className="p-4 cursor-pointer hover:bg-primary/5 transition-colors border-2 border-transparent hover:border-primary/20"
                onClick={() => handleImageTypeSelect('oximetry')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base">Oximetría</h3>
                    <p className="text-sm text-muted-foreground">
                      Analiza lecturas de saturación de oxígeno
                    </p>
                  </div>
                </div>
              </ModernCard>

              <ModernCard
                className="p-4 cursor-pointer hover:bg-primary/5 transition-colors border-2 border-transparent hover:border-primary/20"
                onClick={() => handleImageTypeSelect('sputum')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <Droplet className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base">Expectoración</h3>
                    <p className="text-sm text-muted-foreground">
                      Analiza muestras de flema o esputo
                    </p>
                  </div>
                </div>
              </ModernCard>

              <ModernCard
                className="p-4 cursor-pointer hover:bg-primary/5 transition-colors border-2 border-transparent hover:border-primary/20"
                onClick={() => handleImageTypeSelect('skin_rash')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base">Erupción Cutánea</h3>
                    <p className="text-sm text-muted-foreground">
                      Analiza erupciones o lesiones en la piel
                    </p>
                  </div>
                </div>
              </ModernCard>

              <ModernCard
                className="p-4 cursor-pointer hover:bg-primary/5 transition-colors border-2 border-transparent hover:border-primary/20"
                onClick={() => handleImageTypeSelect('cyanosis')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                    <Thermometer className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base">Cianosis</h3>
                    <p className="text-sm text-muted-foreground">
                      Analiza signos de cianosis (coloración azulada)
                    </p>
                  </div>
                </div>
              </ModernCard>

              <ModernCard
                className="p-4 cursor-pointer hover:bg-primary/5 transition-colors border-2 border-transparent hover:border-primary/20"
                onClick={() => handleImageTypeSelect('other')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-900/30 flex items-center justify-center">
                    <FileImage className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base">Otra Imagen Médica</h3>
                    <p className="text-sm text-muted-foreground">
                      Analiza otras imágenes médicas relevantes
                    </p>
                  </div>
                </div>
              </ModernCard>
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              {/* Inputs ocultos para seleccionar imagen */}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageSelect}
                className="hidden"
              />

              {/* Tipo de imagen seleccionado */}
              <div className="bg-primary/10 rounded-lg p-3">
                <p className="text-sm text-muted-foreground mb-1">Tipo seleccionado:</p>
                <p className="font-semibold">{getImageTypeLabel(imageType)}</p>
              </div>

              {/* Preview de imagen o botones de selección */}
              {imagePreview ? (
                <div className="space-y-3">
                  <div className="relative rounded-lg overflow-hidden border-2 border-primary/20">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-contain bg-secondary"
                    />
                    <button
                      onClick={() => {
                        setSelectedImage(null)
                        setImagePreview(null)
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <ModernButton
                      variant="outline"
                      onClick={() => {
                        closeImageModal()
                        toast.info('Análisis cancelado')
                      }}
                      className="flex-1"
                    >
                      Cancelar
                    </ModernButton>
                    <ModernButton
                      onClick={analyzeImage}
                      disabled={isAnalyzingImage}
                      className="flex-1"
                    >
                      {isAnalyzingImage ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analizando...
                        </>
                      ) : (
                        'Analizar Imagen'
                      )}
                    </ModernButton>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground text-center">
                    Selecciona la imagen desde:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <ModernButton
                      variant="outline"
                      onClick={() => openImageSource('gallery')}
                      className="flex flex-col items-center gap-2 py-4"
                    >
                      <ImageIcon className="w-6 h-6" />
                      <span>Galería</span>
                    </ModernButton>
                    <ModernButton
                      variant="outline"
                      onClick={() => openImageSource('camera')}
                      className="flex flex-col items-center gap-2 py-4"
                    >
                      <Camera className="w-6 h-6" />
                      <span>Cámara</span>
                    </ModernButton>
                  </div>
                  <ModernButton
                    variant="ghost"
                    onClick={() => {
                      setImageType(null)
                      setSelectedImage(null)
                      setImagePreview(null)
                    }}
                    className="w-full"
                  >
                    Volver a tipos de imagen
                  </ModernButton>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
