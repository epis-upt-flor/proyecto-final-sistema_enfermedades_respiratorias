import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './ChatBot.css';

function ChatBot() {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: '¡Hola! 👋\n\nSoy tu asistente médico de Respicare. Estoy aquí para ayudarte con información sobre salud respiratoria, síntomas y orientación médica.\n\n**¿Cuál es tu consulta o problema?** Puedes:\n\n• Describirme tus síntomas\n• Preguntar sobre enfermedades respiratorias\n• Pedir orientación médica general',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false); // Cambiado a false para mostrar chat directamente
  const messagesEndRef = useRef(null);

  // Initialize conversation session
  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      const response = await axios.post('http://localhost:3001/api/chat-conversations', {
        metadata: {
          source: 'web',
          language: 'es'
        },
        location: {
          city: 'Tacna',
          country: 'Perú'
        }
      });
      
      if (response.data.success) {
        setSessionId(response.data.data.sessionId);
        console.log('✅ Chat session initialized:', response.data.data.sessionId);
      }
    } catch (error) {
      console.error('Error initializing session:', error);
      // Continue without session ID (graceful degradation)
    }
  };

  const saveMessage = async (role, content, metadata = {}) => {
    if (!sessionId) return; // Skip if no session
    
    try {
      await axios.post(
        `http://localhost:3001/api/chat-conversations/${sessionId}/messages`,
        {
          role,
          content,
          metadata
        }
      );
    } catch (error) {
      console.error('Error saving message:', error);
      // Don't block user experience if saving fails
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      type: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Save user message to database
    saveMessage('user', inputText);
    
    setInputText('');
    setIsLoading(true);

    try {
      // Prepare conversation history for context
      const conversationHistory = messages
        .filter(msg => msg.type === 'user' || msg.type === 'bot')
        .map(msg => ({
          type: msg.type,
          text: msg.text,
          timestamp: msg.timestamp
        }));
      
      // Call the new conversational AI service
      const response = await axios.post('http://localhost:8000/api/v1/analyze', {
        message: inputText,
        conversation_history: conversationHistory,
        context: {
          source: 'web_chat',
          location: {
            city: 'Tacna',
            country: 'Perú'
          }
        },
        session_id: sessionId
      });

      let botText = response.data.message || 'He procesado tu consulta.';
      
      // Build a more comprehensive response with urgency indicators
      if (response.data.success) {
        // Add urgency indicator if available
        if (response.data.urgency_level) {
          const urgencyEmoji = {
            'critical': '🚨',
            'high': '⚠️',
            'medium': '⚡',
            'low': '💚',
            'very_low': '💚'
          }[response.data.urgency_level];
          
          // Only add emoji if not already in the message
          if (urgencyEmoji && !botText.includes(urgencyEmoji)) {
            if (response.data.urgency_level !== 'low' && response.data.urgency_level !== 'very_low') {
              botText = `${urgencyEmoji} ${botText}`;
            }
          }
        }
        
        // Log analysis details for debugging and future improvements
        console.log('AI Analysis:', {
          symptomCount: response.data.symptom_count,
          categories: response.data.symptom_categories,
          urgencyLevel: response.data.urgency_level,
          needsMedicalAttention: response.data.needs_medical_attention,
          analysis: response.data.analysis
        });
      }

      const botMessage = {
        type: 'bot',
        text: botText,
        timestamp: new Date(),
        urgency: response.data.urgency_level,
        symptomCount: response.data.symptom_count,
        categories: response.data.symptom_categories
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Save bot message to database with enhanced metadata
      saveMessage('bot', botText, {
        urgencyLevel: response.data.urgency_level,
        symptomCount: response.data.symptom_count,
        symptomCategories: response.data.symptom_categories,
        needsMedicalAttention: response.data.needs_medical_attention,
        analysis: response.data.analysis,
        conversationContext: {
          totalMessages: messages.length,
          hasHistory: conversationHistory.length > 0
        }
      });
    } catch (error) {
      console.error('Error al comunicarse con AI services:', error);
      
      // Fallback: Basic keyword-based responses if AI service fails
      let responseText = '';
      const lowerInput = inputText.toLowerCase();
      
      if (lowerInput.includes('asma') || lowerInput.includes('asmático')) {
        responseText = '🫁 El asma es una enfermedad crónica que afecta las vías respiratorias. Los síntomas incluyen dificultad para respirar, sibilancias y opresión en el pecho. Es importante tener un inhalador de rescate y seguir el tratamiento indicado por tu médico.';
      } else if (lowerInput.includes('neumonía') || lowerInput.includes('neumonia')) {
        responseText = '🦠 La neumonía es una infección pulmonar que puede ser causada por bacterias, virus u hongos. Los síntomas incluyen fiebre alta, tos con flema, dolor en el pecho y dificultad para respirar. Es importante buscar atención médica inmediata.';
      } else if (lowerInput.includes('bronquitis')) {
        responseText = '🤒 La bronquitis es la inflamación de los bronquios. Puede ser aguda (temporal) o crónica (de larga duración). Los síntomas incluyen tos persistente, producción de mucosidad y dificultad para respirar.';
      } else if (lowerInput.includes('covid') || lowerInput.includes('coronavirus')) {
        responseText = '😷 El COVID-19 es una enfermedad respiratoria causada por el coronavirus SARS-CoV-2. Los síntomas pueden incluir fiebre, tos seca, fatiga y dificultad para respirar. Mantén el distanciamiento social y usa mascarilla.';
      } else if (lowerInput.includes('tos') || lowerInput.includes('toser')) {
        responseText = '🤧 La tos puede ser síntoma de diversas afecciones respiratorias. Si es persistente (más de 3 semanas), viene con fiebre, o dificulta la respiración, es importante consultar con un médico.';
      } else if (lowerInput.includes('gripe') || lowerInput.includes('influenza')) {
        responseText = '🤒 La gripe es una infección viral respiratoria. Los síntomas incluyen fiebre, dolores musculares, dolor de garganta y fatiga. El descanso y la hidratación son clave para la recuperación.';
      } else {
        responseText = 'Gracias por tu consulta sobre enfermedades respiratorias. Te recomiendo proporcionar más detalles sobre tus síntomas. Puedo ayudarte con información sobre: asma, neumonía, bronquitis, COVID-19, gripe, y otros problemas respiratorios.';
      }

      const botMessage = {
        type: 'bot',
        text: responseText + '\n\n⚠️ Recuerda: Esta es información general. Para un diagnóstico preciso, consulta con un profesional de la salud.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Save fallback bot message
      saveMessage('bot', botMessage.text, {
        urgencyLevel: 'low',
        confidence: 0.6
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    {
      id: 'flu-symptoms',
      title: 'Síntomas de gripe',
      icon: '🤒',
      description: 'Información sobre síntomas de gripe e influenza'
    },
    {
      id: 'respiratory-health',
      title: 'Salud respiratoria',
      icon: '🫁',
      description: 'Consejos para mantener una buena salud respiratoria'
    },
    {
      id: 'urgent-consultation',
      title: 'Consulta urgente',
      icon: '🚨',
      description: 'Síntomas que requieren atención médica inmediata'
    }
  ];

  const handleQuickAction = (action) => {
    setShowWelcome(false);
    let question = '';
    
    switch(action.id) {
      case 'flu-symptoms':
        question = '¿Cuáles son los síntomas de la gripe y cómo puedo diferenciarla de un resfriado común?';
        break;
      case 'respiratory-health':
        question = '¿Qué puedo hacer para mantener una buena salud respiratoria y prevenir enfermedades?';
        break;
      case 'urgent-consultation':
        question = '¿Cuáles son los síntomas respiratorios que requieren atención médica urgente?';
        break;
      default:
        question = action.title;
    }
    
    setInputText(question);
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  // Function to format markdown-like text for better display
  const formatMessage = (text) => {
    if (!text) return '';
    
    // Replace markdown bold (**text**) with spans for styling
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/#{3}\s?(.*?)$/gm, '<h4>$1</h4>')
      .replace(/#{2}\s?(.*?)$/gm, '<h3>$1</h3>')
      .replace(/#{1}\s?(.*?)$/gm, '<h2>$1</h2>')
      .replace(/^\•\s/gm, '• ')
      .replace(/^-\s/gm, '• ')
      .replace(/\n/g, '<br />');
    
    return formatted;
  };

  const renderFormattedMessage = (text) => {
    const formatted = formatMessage(text);
    return <div dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  const startConversation = () => {
    setShowWelcome(false);
    const welcomeMessage = {
      type: 'bot',
      text: '¡Hola! Soy tu asistente médico de Respicare. Estoy aquí para ayudarte con información sobre salud respiratoria, síntomas y orientación médica. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="header-content">
          <span className="header-icon">🤖</span>
          <div>
            <h3>Asistente Respicare</h3>
            <p className="header-subtitle">Tu asistente médico inteligente</p>
          </div>
        </div>
        <div className="status-indicator online">
          <span className="status-dot"></span>
          En línea
        </div>
      </div>

      <div className="chatbot-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
            <div className="message-avatar">
              {message.type === 'bot' ? '🤖' : '👤'}
            </div>
            <div className="message-content">
              <div className="message-text">{renderFormattedMessage(message.text)}</div>
              <div className="message-time">
                {message.timestamp.toLocaleTimeString('es-PE', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message bot">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions - Solo mostrar si hay pocos mensajes */}
      {messages.length <= 2 && (
        <div className="quick-actions-compact">
          <p className="quick-actions-title">Preguntas rápidas:</p>
          <div className="quick-actions-list">
            {quickActions.map((action) => (
              <button
                key={action.id}
                className="quick-action-btn-compact"
                onClick={() => handleQuickAction(action)}
              >
                <span className="action-icon">{action.icon}</span>
                <span className="action-title">{action.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="chatbot-input">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Describe tus síntomas o haz una pregunta..."
          rows="2"
          disabled={isLoading}
        />
        <button 
          onClick={handleSend} 
          disabled={isLoading || !inputText.trim()}
          className="send-button"
        >
          {isLoading ? '⏳' : '📤'}
        </button>
      </div>
    </div>
  );
}

export default ChatBot;

