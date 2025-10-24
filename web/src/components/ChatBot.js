import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './ChatBot.css';

function ChatBot() {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: '¡Hola! Soy el asistente virtual de RespiCare. ¿En qué puedo ayudarte con tus consultas sobre enfermedades respiratorias?',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
      // Llamada al servicio de AI
      const response = await axios.post('http://localhost:8000/api/v1/analyze', {
        query: inputText,
        context: 'respiratory_diseases',
        include_recommendations: true
      });

      let botText = response.data.message || 'He procesado tu consulta.';
      
      // Add urgency indicator if available
      if (response.data.urgency_level) {
        const urgencyEmoji = {
          'critical': '🚨',
          'high': '⚠️',
          'medium': '⚡',
          'low': '✅',
          'very_low': '✅'
        }[response.data.urgency_level];
        
        if (urgencyEmoji && response.data.urgency_level !== 'low' && response.data.urgency_level !== 'very_low') {
          botText = `${urgencyEmoji} ${botText}`;
        }
      }

      const botMessage = {
        type: 'bot',
        text: botText,
        timestamp: new Date(),
        confidence: response.data.confidence,
        urgency: response.data.urgency_level
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Save bot message to database with metadata
      saveMessage('bot', botText, {
        urgencyLevel: response.data.urgency_level,
        confidence: response.data.confidence,
        detectedDiseases: response.data.analysis?.detected_diseases || [],
        detectedSymptoms: response.data.analysis?.detected_symptoms || [],
        questionType: response.data.analysis?.question_type
      });
    } catch (error) {
      console.error('Error al comunicarse con AI services:', error);
      
      // Respuestas de ejemplo basadas en palabras clave
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

  const quickQuestions = [
    '¿Qué es el asma?',
    '¿Cuáles son los síntomas de neumonía?',
    '¿Cómo prevenir enfermedades respiratorias?',
    '¿Qué hacer si tengo dificultad para respirar?'
  ];

  const handleQuickQuestion = (question) => {
    setInputText(question);
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="header-content">
          <span className="header-icon">🤖</span>
          <div>
            <h3>Asistente Virtual RespiCare</h3>
            <p className="header-subtitle">Consultas sobre Enfermedades Respiratorias</p>
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
              <div className="message-text">{message.text}</div>
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

      <div className="quick-questions">
        <p className="quick-questions-title">Preguntas rápidas:</p>
        <div className="quick-questions-list">
          {quickQuestions.map((question, index) => (
            <button
              key={index}
              className="quick-question-btn"
              onClick={() => handleQuickQuestion(question)}
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      <div className="chatbot-input">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Escribe tu consulta sobre enfermedades respiratorias..."
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

