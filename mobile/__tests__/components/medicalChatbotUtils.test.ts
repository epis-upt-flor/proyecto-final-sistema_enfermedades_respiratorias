import {
  isEmergencyMessage,
  isSymptomDescription,
  getCategoryDisplayName,
  getTrendEmoji,
  getTrendText,
  getUrgencyEmoji,
  getUrgencyText,
  parseSymptomsFromText,
  generateAnalysisResponse,
} from '../../src/components/ChatBot/medicalChatbotUtils';

describe('medicalChatbotUtils', () => {
  it('detecta mensajes de emergencia correctamente', () => {
    expect(isEmergencyMessage('esto es una emergencia grave')).toBe(true);
    expect(isEmergencyMessage('todo está bien')).toBe(false);
  });

  it('identifica descripciones de síntomas', () => {
    expect(isSymptomDescription('tengo fiebre y tos')).toBe(true);
    expect(isSymptomDescription('necesito información')).toBe(false);
  });

  it('obtiene nombres de categoría legibles', () => {
    expect(getCategoryDisplayName('respiratory')).toBe('Respiratorias');
    expect(getCategoryDisplayName('unknown')).toBe('unknown');
  });

  it('retorna emojis y textos de tendencia y urgencia', () => {
    expect(getTrendEmoji('improving')).toBe('📈');
    expect(getTrendEmoji('desconocido')).toBe('❓');
    expect(getTrendText('worsening')).toBe('Empeorando');
    expect(getTrendText('otro')).toBe('Desconocido');

    expect(getUrgencyEmoji('high')).toBe('🔴');
    expect(getUrgencyEmoji('foo')).toBe('❓');
    expect(getUrgencyText('medium')).toBe('Media');
    expect(getUrgencyText('bar')).toBe('Desconocida');
  });

  it('parsea síntomas desde un texto libre', () => {
    const symptoms = parseSymptomsFromText('Tengo fiebre, tos con flema y dolor en el pecho.');
    const symptomNames = symptoms.map((s) => s.symptom);

    expect(symptomNames).toEqual(
      expect.arrayContaining(['fiebre', 'tos', 'dolor en el pecho'])
    );
  });

  it('genera respuesta detallada para análisis con urgencia alta', () => {
    const analysis = {
      id: 'a1',
      patientId: 'p1',
      symptoms: [],
      urgencyLevel: 'high',
      severityScore: 0.9,
      classification: {
        categories: ['respiratory'],
        confidence: 0.85,
        urgency: 'high',
        possibleConditions: [
          { condition: 'Neumonía', probability: 0.8, description: 'Inflamación pulmonar' },
        ],
      },
      recommendations: {
        immediate: ['Buscar atención médica inmediata'],
        shortTerm: [],
        longTerm: [],
        emergency: [],
      },
      warningSigns: ['Dificultad respiratoria'],
      followUpRequired: true,
      confidenceScore: 0.85,
      analyzedAt: new Date().toISOString(),
      processingTimeMs: 1000,
      analysisMethod: 'ai_service',
    };

    const { content, suggestions } = generateAnalysisResponse(analysis as any);

    expect(content).toContain('Análisis de Síntomas');
    expect(content).toContain('Acciones Inmediatas');
    expect(suggestions[0]).toContain('EMERGENCIA');
  });

  it('genera respuesta para análisis con urgencia baja', () => {
    const analysis = {
      id: 'a2',
      patientId: 'p1',
      symptoms: [],
      urgencyLevel: 'low',
      severityScore: 0.2,
      classification: {
        categories: ['general'],
        confidence: 0.5,
        urgency: 'low',
        possibleConditions: [],
      },
      recommendations: {
        immediate: [],
        shortTerm: ['Reposo'],
        longTerm: [],
        emergency: [],
      },
      warningSigns: [],
      followUpRequired: false,
      confidenceScore: 0.5,
      analyzedAt: new Date().toISOString(),
      processingTimeMs: 500,
      analysisMethod: 'local_rules',
    };

    const { content, suggestions } = generateAnalysisResponse(analysis as any);

    expect(content).toContain('Nivel de Urgencia');
    expect(suggestions).not.toContain('🚨 EMERGENCIA - Llamar 911');
  });
});

