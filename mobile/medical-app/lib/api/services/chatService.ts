/**
 * Servicio de chat/conversaciones
 */

import { apiClient } from '../client'
import { API_ENDPOINTS } from '../config'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
  metadata?: any
}

export interface ChatConversation {
  _id: string
  sessionId: string
  userId: string
  messages: ChatMessage[]
  location?: {
    city: string
    country: string
  }
  metadata?: any
  createdAt: string
  updatedAt: string
}

export interface CreateConversationRequest {
  userId: string
  userInfo?: any
  location?: {
    district?: string
    city: string
    country: string
  }
  metadata?: any
}

export class ChatService {
  async createConversation(data: CreateConversationRequest): Promise<{ sessionId: string; _id: string }> {
    return apiClient.post<{ sessionId: string; _id: string }>(
      API_ENDPOINTS.chat.conversations,
      data
    )
  }

  async getConversation(sessionId: string): Promise<ChatConversation> {
    const response = await apiClient.get<{ data: ChatConversation }>(
      API_ENDPOINTS.chat.getConversation(sessionId)
    )
    return response.data || response as ChatConversation
  }

  async getConversations(filters?: {
    userId?: string
    limit?: number
  }): Promise<ChatConversation[]> {
    const params = new URLSearchParams()
    if (filters?.userId) params.append('userId', filters.userId)
    if (filters?.limit) params.append('limit', filters.limit.toString())

    const query = params.toString()
    const endpoint = query ? `${API_ENDPOINTS.chat.conversations}?${query}` : API_ENDPOINTS.chat.conversations

    const response = await apiClient.get<{ data: ChatConversation[]; count: number }>(endpoint)
    return Array.isArray(response.data) ? response.data : response.data || []
  }

  async sendMessage(
    sessionId: string,
    content: string,
    metadata?: any
  ): Promise<{ userMessage: ChatMessage; assistantMessage?: ChatMessage }> {
    // Enviar mensaje del usuario
    await apiClient.post(
      API_ENDPOINTS.chat.messages(sessionId),
      {
        role: 'user',
        content,
        metadata,
      }
    )
    
    // El backend procesa el mensaje y genera respuesta automáticamente
    // Esperar un momento para que el backend procese
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Obtener la conversación actualizada
    const conversation = await this.getConversation(sessionId)
    const messages = conversation.messages || []
    const userMessage = messages[messages.length - 2] // Último mensaje del usuario
    const assistantMessage = messages[messages.length - 1] // Respuesta del asistente
    
    return {
      userMessage: userMessage || { role: 'user', content, timestamp: new Date().toISOString() },
      assistantMessage
    }
  }

  async completeConversation(sessionId: string): Promise<void> {
    await apiClient.put(API_ENDPOINTS.chat.completeConversation(sessionId))
  }
}

export const chatService = new ChatService()

