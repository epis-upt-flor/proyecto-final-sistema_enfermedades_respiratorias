/**
 * Tipos de imágenes médicas soportadas por el sistema
 */

export interface MedicalImageType {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'diagnostic' | 'symptom' | 'monitoring';
}

export const MEDICAL_IMAGE_TYPES: MedicalImageType[] = [
  // Imágenes diagnósticas
  {
    id: 'chest_xray',
    name: 'Radiografía de Tórax',
    description: 'Radiografía de tórax para analizar patrones pulmonares, opacidades o consolidaciones',
    icon: '🫁',
    category: 'diagnostic',
  },
  {
    id: 'chest_ct',
    name: 'Tomografía Computarizada (TC)',
    description: 'TC del tórax para análisis más detallado de estructuras pulmonares',
    icon: '🔬',
    category: 'diagnostic',
  },
  {
    id: 'spirometry',
    name: 'Espirometría',
    description: 'Gráficas de función pulmonar y capacidad respiratoria',
    icon: '📊',
    category: 'monitoring',
  },
  {
    id: 'oximetry',
    name: 'Oximetría',
    description: 'Capturas de lecturas de saturación de oxígeno',
    icon: '💓',
    category: 'monitoring',
  },
  // Síntomas visibles
  {
    id: 'sputum',
    name: 'Expectoración',
    description: 'Fotos de esputo para analizar color y consistencia',
    icon: '🫧',
    category: 'symptom',
  },
  {
    id: 'skin_rash',
    name: 'Erupción Cutánea',
    description: 'Imágenes de erupciones cutáneas relacionadas con enfermedades respiratorias',
    icon: '🔴',
    category: 'symptom',
  },
  {
    id: 'cyanosis',
    name: 'Cianosis',
    description: 'Fotos de coloración azulada en labios o dedos',
    icon: '💙',
    category: 'symptom',
  },
  {
    id: 'other',
    name: 'Otra Imagen Médica',
    description: 'Otra imagen médica relacionada con síntomas respiratorios',
    icon: '📷',
    category: 'symptom',
  },
];

export const getImageTypeById = (id: string): MedicalImageType | undefined => {
  return MEDICAL_IMAGE_TYPES.find(type => type.id === id);
};

export const getImageTypesByCategory = (category: 'diagnostic' | 'symptom' | 'monitoring'): MedicalImageType[] => {
  return MEDICAL_IMAGE_TYPES.filter(type => type.category === category);
};

