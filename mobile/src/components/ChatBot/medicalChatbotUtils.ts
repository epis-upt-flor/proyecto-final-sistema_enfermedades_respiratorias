import { AISymptomAnalysis } from '../../services/aiService';

export const EMERGENCY_KEYWORDS = [
  'emergencia',
  'urgencia',
  'grave',
  'crítico',
  'morir',
  'muerte',
  'infarto',
  'derrame',
  'convulsión',
  'sangrado severo',
  'dificultad respiratoria severa',
  'dolor pecho intenso',
];

export const SYMPTOM_KEYWORDS = [
  'tengo',
  'siento',
  'me duele',
  'tengo dolor',
  'síntoma',
  'tos',
  'fiebre',
  'dolor',
  'fatiga',
  'nausea',
  'vomito',
];

export const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  respiratory: 'Respiratorias',
  fever: 'Fiebre',
  pain: 'Dolor',
  general: 'Generales',
};

export const TREND_EMOJIS: Record<string, string> = {
  improving: '📈',
  worsening: '📉',
  stable: '➡️',
  insufficient_data: '❓',
};

export const TREND_TEXTS: Record<string, string> = {
  improving: 'Mejorando',
  worsening: 'Empeorando',
  stable: 'Estable',
  insufficient_data: 'Datos insuficientes',
};

export const URGENCY_EMOJIS: Record<string, string> = {
  low: '🟢',
  medium: '🟡',
  high: '🔴',
};

export const URGENCY_TEXTS: Record<string, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
};

export const isEmergencyMessage = (message: string): boolean =>
  EMERGENCY_KEYWORDS.some((keyword) => message.includes(keyword));

export const isSymptomDescription = (message: string): boolean =>
  SYMPTOM_KEYWORDS.some((keyword) => message.includes(keyword));

export const getCategoryDisplayName = (category: string): string =>
  CATEGORY_DISPLAY_NAMES[category] || category;

export const getTrendEmoji = (trend: string): string => TREND_EMOJIS[trend] || '❓';

export const getTrendText = (trend: string): string => TREND_TEXTS[trend] || 'Desconocido';

export const getUrgencyEmoji = (urgency: string): string => URGENCY_EMOJIS[urgency] || '❓';

export const getUrgencyText = (urgency: string): string => URGENCY_TEXTS[urgency] || 'Desconocida';

export const parseSymptomsFromText = (text: string) => {
  const symptoms: Array<{ symptom: string; severity: 'mild' | 'moderate' | 'severe'; duration: string }> = [];

  const symptomPatterns = [
    { pattern: /tos/i, symptom: 'tos', severity: 'moderate' as const },
    { pattern: /fiebre/i, symptom: 'fiebre', severity: 'moderate' as const },
    { pattern: /dolor.*pecho/i, symptom: 'dolor en el pecho', severity: 'severe' as const },
    { pattern: /dificultad.*respir/i, symptom: 'dificultad respiratoria', severity: 'severe' as const },
    { pattern: /dolor.*cabeza/i, symptom: 'dolor de cabeza', severity: 'moderate' as const },
    { pattern: /fatiga|cansancio/i, symptom: 'fatiga', severity: 'mild' as const },
    { pattern: /nausea|vomito/i, symptom: 'nausea', severity: 'moderate' as const },
  ];

  symptomPatterns.forEach(({ pattern, symptom, severity }) => {
    if (pattern.test(text)) {
      symptoms.push({
        symptom,
        severity,
        duration: 'desconocida',
      });
    }
  });

  return symptoms;
};

export const generateAnalysisResponse = (analysis: AISymptomAnalysis) => {
  const urgencyEmoji = getUrgencyEmoji(analysis.urgencyLevel);
  const urgencyText = getUrgencyText(analysis.urgencyLevel);

  let response = `${urgencyEmoji} **Análisis de Síntomas**\n\n`;
  response += `**Nivel de Urgencia:** ${urgencyText}\n`;
  response += `**Puntuación de Severidad:** ${(analysis.severityScore * 100).toFixed(0)}%\n`;
  response += `**Confianza del Análisis:** ${(analysis.confidenceScore * 100).toFixed(0)}%\n\n`;

  if (analysis.classification.possibleConditions.length > 0) {
    response += `**Posibles Condiciones:**\n`;
    analysis.classification.possibleConditions.forEach((condition) => {
      response += `• ${condition.condition} (${(condition.probability * 100).toFixed(0)}%)\n`;
    });
    response += '\n';
  }

  if (analysis.recommendations.immediate.length > 0) {
    response += `**Acciones Inmediatas:**\n`;
    analysis.recommendations.immediate.forEach((rec) => {
      response += `• ${rec}\n`;
    });
    response += '\n';
  }

  if (analysis.warningSigns.length > 0) {
    response += `**⚠️ Signos de Alerta:**\n`;
    analysis.warningSigns.forEach((sign) => {
      response += `• ${sign}\n`;
    });
    response += '\n';
  }

  if (analysis.followUpRequired) {
    response += `**📋 Seguimiento Requerido:** Sí\n\n`;
  }

  const suggestions = [
    'Ver recomendaciones detalladas',
    'Analizar tendencias',
    'Contactar médico',
  ];

  if (analysis.urgencyLevel === 'high') {
    suggestions.unshift('🚨 EMERGENCIA - Llamar 911');
  }

  return { content: response, suggestions };
};

