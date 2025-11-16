/**
 * Servicio de Internacionalización (i18n)
 * 
 * Soporta múltiples idiomas para la aplicación móvil
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export type SupportedLanguage = 'es' | 'en' | 'pt' | 'fr' | 'qu'; // qu = Quechua

export interface Translations {
  [key: string]: string | Translations;
}

// Traducciones
const translations: Record<SupportedLanguage, Translations> = {
  es: {
    common: {
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      search: 'Buscar',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      retry: 'Reintentar',
      close: 'Cerrar',
      next: 'Siguiente',
      back: 'Atrás',
      done: 'Hecho',
    },
    home: {
      quickActions: 'Acciones Rápidas',
      recentHistories: 'Historiales Recientes',
      recentAnalyses: 'Análisis Recientes',
      statistics: 'Estadísticas',
      alerts: 'Alertas',
      upcomingAppointments: 'Próximas Citas',
      predictiveAnalysis: 'Análisis Predictivo',
      emergencyTitle: 'Emergencia Médica',
      emergencyDescription: 'En caso de emergencia médica, llama inmediatamente al 911 o acude al servicio de urgencias más cercano.',
      call911: 'Llamar 911',
      sync: {
        offline: 'Sin conexión',
        syncing: 'Sincronizando...',
        synced: 'Sincronizado',
        pending: '{{count}} pendientes',
      },
    },
    auth: {
      login: 'Iniciar Sesión',
      logout: 'Cerrar Sesión',
      register: 'Registrarse',
      email: 'Correo Electrónico',
      password: 'Contraseña',
      forgotPassword: '¿Olvidaste tu contraseña?',
      loginError: 'Error al iniciar sesión',
    },
    symptoms: {
      title: 'Síntomas',
      addSymptom: 'Agregar Síntoma',
      severity: 'Severidad',
      mild: 'Leve',
      moderate: 'Moderado',
      severe: 'Severo',
      description: 'Descripción',
      analyze: 'Analizar Síntomas',
      analysisResult: 'Resultado del Análisis',
    },
    chatbot: {
      title: 'Chatbot Médico',
      placeholder: 'Escribe tu mensaje...',
      send: 'Enviar',
      voiceInput: 'Entrada de Voz',
      suggestions: 'Sugerencias',
      emergency: 'Emergencia',
    },
    medicalHistory: {
      title: 'Historial Médico',
      add: 'Agregar Historia',
      edit: 'Editar Historia',
      delete: 'Eliminar Historia',
      patientName: 'Nombre del Paciente',
      age: 'Edad',
      diagnosis: 'Diagnóstico',
      date: 'Fecha',
      location: 'Ubicación',
    },
    notifications: {
      title: 'Notificaciones',
      noNotifications: 'No hay notificaciones',
      markAsRead: 'Marcar como Leído',
      clearAll: 'Limpiar Todo',
    },
    settings: {
      title: 'Configuración',
      language: 'Idioma',
      theme: 'Tema',
      darkMode: 'Modo Oscuro',
      notifications: 'Notificaciones',
      about: 'Acerca de',
      version: 'Versión',
    },
    wearables: {
      title: 'Dispositivos Wearables',
      connect: 'Conectar',
      disconnect: 'Desconectar',
      heartRate: 'Ritmo Cardíaco',
      oxygenSaturation: 'Oxigenación',
      steps: 'Pasos',
      distance: 'Distancia',
    },
    telemedicine: {
      title: 'Telemedicina',
      startCall: 'Iniciar Llamada',
      endCall: 'Finalizar Llamada',
      joinCall: 'Unirse a Llamada',
      waiting: 'Esperando...',
    },
  },
  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      search: 'Search',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      retry: 'Retry',
      close: 'Close',
      next: 'Next',
      back: 'Back',
      done: 'Done',
    },
    home: {
      quickActions: 'Quick Actions',
      recentHistories: 'Recent Histories',
      recentAnalyses: 'Recent Analyses',
      statistics: 'Statistics',
      alerts: 'Alerts',
      upcomingAppointments: 'Upcoming Appointments',
      predictiveAnalysis: 'Predictive Analysis',
      emergencyTitle: 'Medical Emergency',
      emergencyDescription: 'In case of a medical emergency, call 911 immediately or go to the nearest emergency service.',
      call911: 'Call 911',
      sync: {
        offline: 'Offline',
        syncing: 'Syncing...',
        synced: 'Synced',
        pending: '{{count}} pending',
      },
    },
    auth: {
      login: 'Login',
      logout: 'Logout',
      register: 'Register',
      email: 'Email',
      password: 'Password',
      forgotPassword: 'Forgot Password?',
      loginError: 'Login error',
    },
    symptoms: {
      title: 'Symptoms',
      addSymptom: 'Add Symptom',
      severity: 'Severity',
      mild: 'Mild',
      moderate: 'Moderate',
      severe: 'Severe',
      description: 'Description',
      analyze: 'Analyze Symptoms',
      analysisResult: 'Analysis Result',
    },
    chatbot: {
      title: 'Medical Chatbot',
      placeholder: 'Type your message...',
      send: 'Send',
      voiceInput: 'Voice Input',
      suggestions: 'Suggestions',
      emergency: 'Emergency',
    },
    medicalHistory: {
      title: 'Medical History',
      add: 'Add History',
      edit: 'Edit History',
      delete: 'Delete History',
      patientName: 'Patient Name',
      age: 'Age',
      diagnosis: 'Diagnosis',
      date: 'Date',
      location: 'Location',
    },
    notifications: {
      title: 'Notifications',
      noNotifications: 'No notifications',
      markAsRead: 'Mark as Read',
      clearAll: 'Clear All',
    },
    settings: {
      title: 'Settings',
      language: 'Language',
      theme: 'Theme',
      darkMode: 'Dark Mode',
      notifications: 'Notifications',
      about: 'About',
      version: 'Version',
    },
    wearables: {
      title: 'Wearable Devices',
      connect: 'Connect',
      disconnect: 'Disconnect',
      heartRate: 'Heart Rate',
      oxygenSaturation: 'Oxygen Saturation',
      steps: 'Steps',
      distance: 'Distance',
    },
    telemedicine: {
      title: 'Telemedicine',
      startCall: 'Start Call',
      endCall: 'End Call',
      joinCall: 'Join Call',
      waiting: 'Waiting...',
    },
  },
  pt: {
    common: {
      save: 'Salvar',
      cancel: 'Cancelar',
      delete: 'Excluir',
      edit: 'Editar',
      search: 'Buscar',
      loading: 'Carregando...',
      error: 'Erro',
      success: 'Sucesso',
      retry: 'Tentar Novamente',
      close: 'Fechar',
      next: 'Próximo',
      back: 'Voltar',
      done: 'Concluído',
    },
    auth: {
      login: 'Entrar',
      logout: 'Sair',
      register: 'Registrar',
      email: 'E-mail',
      password: 'Senha',
      forgotPassword: 'Esqueceu sua senha?',
      loginError: 'Erro ao fazer login',
    },
    symptoms: {
      title: 'Sintomas',
      addSymptom: 'Adicionar Sintoma',
      severity: 'Severidade',
      mild: 'Leve',
      moderate: 'Moderado',
      severe: 'Severo',
      description: 'Descrição',
      analyze: 'Analisar Sintomas',
      analysisResult: 'Resultado da Análise',
    },
    chatbot: {
      title: 'Chatbot Médico',
      placeholder: 'Digite sua mensagem...',
      send: 'Enviar',
      voiceInput: 'Entrada de Voz',
      suggestions: 'Sugestões',
      emergency: 'Emergência',
    },
    medicalHistory: {
      title: 'Histórico Médico',
      add: 'Adicionar Histórico',
      edit: 'Editar Histórico',
      delete: 'Excluir Histórico',
      patientName: 'Nome do Paciente',
      age: 'Idade',
      diagnosis: 'Diagnóstico',
      date: 'Data',
      location: 'Localização',
    },
    notifications: {
      title: 'Notificações',
      noNotifications: 'Sem notificações',
      markAsRead: 'Marcar como Lido',
      clearAll: 'Limpar Tudo',
    },
    settings: {
      title: 'Configurações',
      language: 'Idioma',
      theme: 'Tema',
      darkMode: 'Modo Escuro',
      notifications: 'Notificações',
      about: 'Sobre',
      version: 'Versão',
    },
    wearables: {
      title: 'Dispositivos Wearables',
      connect: 'Conectar',
      disconnect: 'Desconectar',
      heartRate: 'Frequência Cardíaca',
      oxygenSaturation: 'Saturação de Oxigênio',
      steps: 'Passos',
      distance: 'Distância',
    },
    telemedicine: {
      title: 'Telemedicina',
      startCall: 'Iniciar Chamada',
      endCall: 'Finalizar Chamada',
      joinCall: 'Entrar na Chamada',
      waiting: 'Aguardando...',
    },
  },
  fr: {
    common: {
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      search: 'Rechercher',
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      retry: 'Réessayer',
      close: 'Fermer',
      next: 'Suivant',
      back: 'Retour',
      done: 'Terminé',
    },
    auth: {
      login: 'Connexion',
      logout: 'Déconnexion',
      register: "S'inscrire",
      email: 'E-mail',
      password: 'Mot de passe',
      forgotPassword: 'Mot de passe oublié?',
      loginError: 'Erreur de connexion',
    },
    symptoms: {
      title: 'Symptômes',
      addSymptom: 'Ajouter un Symptôme',
      severity: 'Gravité',
      mild: 'Léger',
      moderate: 'Modéré',
      severe: 'Sévère',
      description: 'Description',
      analyze: 'Analyser les Symptômes',
      analysisResult: 'Résultat de l\'Analyse',
    },
    chatbot: {
      title: 'Chatbot Médical',
      placeholder: 'Tapez votre message...',
      send: 'Envoyer',
      voiceInput: 'Entrée Vocale',
      suggestions: 'Suggestions',
      emergency: 'Urgence',
    },
    medicalHistory: {
      title: 'Historique Médical',
      add: 'Ajouter un Historique',
      edit: 'Modifier l\'Historique',
      delete: 'Supprimer l\'Historique',
      patientName: 'Nom du Patient',
      age: 'Âge',
      diagnosis: 'Diagnostic',
      date: 'Date',
      location: 'Emplacement',
    },
    notifications: {
      title: 'Notifications',
      noNotifications: 'Aucune notification',
      markAsRead: 'Marquer comme Lu',
      clearAll: 'Tout Effacer',
    },
    settings: {
      title: 'Paramètres',
      language: 'Langue',
      theme: 'Thème',
      darkMode: 'Mode Sombre',
      notifications: 'Notifications',
      about: 'À Propos',
      version: 'Version',
    },
    wearables: {
      title: 'Dispositifs Wearables',
      connect: 'Connecter',
      disconnect: 'Déconnecter',
      heartRate: 'Fréquence Cardiaque',
      oxygenSaturation: 'Saturation en Oxygène',
      steps: 'Pas',
      distance: 'Distance',
    },
    telemedicine: {
      title: 'Télémédecine',
      startCall: 'Démarrer l\'Appel',
      endCall: 'Terminer l\'Appel',
      joinCall: 'Rejoindre l\'Appel',
      waiting: 'En Attente...',
    },
  },
  qu: {
    common: {
      save: 'Waqaychay',
      cancel: 'Amanachay',
      delete: 'Qulluy',
      edit: 'Llamk\'apuy',
      search: 'Maskay',
      loading: 'Cargando...',
      error: 'Pantay',
      success: 'Allin',
      retry: 'Kutipay',
      close: 'Wichqay',
      next: 'Qhipaman',
      back: 'Qhipaman',
      done: 'Ruwasqa',
    },
    auth: {
      login: 'Yaykuy',
      logout: 'Lluqsiy',
      register: 'Registrarse',
      email: 'Correo',
      password: 'Yachay',
      forgotPassword: '¿Yachayta qunqarqankichu?',
      loginError: 'Yaykuy pantay',
    },
    symptoms: {
      title: 'Unqay',
      addSymptom: 'Unqayta Yapay',
      severity: 'Sasachay',
      mild: 'Aslla',
      moderate: 'Chawpi',
      severe: 'Ancha',
      description: 'Willay',
      analyze: 'Unqayta Tanteay',
      analysisResult: 'Tanteay Resultado',
    },
    chatbot: {
      title: 'Hampi Chatbot',
      placeholder: 'Willayta qillqay...',
      send: 'Kachay',
      voiceInput: 'Simi Yaykuy',
      suggestions: 'Yanapay',
      emergency: 'Urgencia',
    },
    medicalHistory: {
      title: 'Hampi Willay',
      add: 'Willayta Yapay',
      edit: 'Willayta Llamk\'apuy',
      delete: 'Willayta Qulluy',
      patientName: 'Unquq Suti',
      age: 'Watakuna',
      diagnosis: 'Diagnóstico',
      date: 'P\'unchay',
      location: 'Kay',
    },
    notifications: {
      title: 'Willaykuna',
      noNotifications: 'Manan willaykuna kanchu',
      markAsRead: 'Ñawiyta Qhaway',
      clearAll: 'Tukuyta Pichay',
    },
    settings: {
      title: 'Configuración',
      language: 'Simi',
      theme: 'Tema',
      darkMode: 'Tuta Modo',
      notifications: 'Willaykuna',
      about: 'Manta',
      version: 'Versión',
    },
    wearables: {
      title: 'Wearable Dispositivos',
      connect: 'Tinkiy',
      disconnect: 'Ch\'aqay',
      heartRate: 'Sunqu K\'iti',
      oxygenSaturation: 'Oxígeno',
      steps: 'Taki',
      distance: 'Saya',
    },
    telemedicine: {
      title: 'Telemedicina',
      startCall: 'Llamada Qallariy',
      endCall: 'Llamada Tukuchiy',
      joinCall: 'Llamadaman Yaykuy',
      waiting: 'Suyay...',
    },
  },
};

class I18nService {
  private currentLanguage: SupportedLanguage = 'es';
  private translations: Translations = translations.es;

  /**
   * Inicializa el servicio i18n
   */
  async initialize(): Promise<void> {
    try {
      const savedLanguage = await AsyncStorage.getItem('app_language');
      if (savedLanguage && this.isSupportedLanguage(savedLanguage)) {
        this.setLanguage(savedLanguage as SupportedLanguage);
      }
    } catch (error) {
      console.error('Error initializing i18n:', error);
    }
  }

  /**
   * Establece el idioma actual
   */
  setLanguage(language: SupportedLanguage): void {
    this.currentLanguage = language;
    this.translations = translations[language];
    AsyncStorage.setItem('app_language', language).catch(console.error);
  }

  /**
   * Obtiene el idioma actual
   */
  getLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  /**
   * Obtiene una traducción
   */
  t(key: string, params?: Record<string, string>): string {
    const keys = key.split('.');
    let value: any = this.translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Devolver la clave si no se encuentra
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    // Reemplazar parámetros
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey] || match;
      });
    }

    return value;
  }

  /**
   * Verifica si un idioma está soportado
   */
  private isSupportedLanguage(language: string): boolean {
    return Object.keys(translations).includes(language);
  }

  /**
   * Obtiene los idiomas disponibles
   */
  getAvailableLanguages(): Array<{ code: SupportedLanguage; name: string }> {
    return [
      { code: 'es', name: 'Español' },
      { code: 'en', name: 'English' },
      { code: 'pt', name: 'Português' },
      { code: 'fr', name: 'Français' },
      { code: 'qu', name: 'Runa Simi (Quechua)' },
    ];
  }
}

// Instancia singleton
export const i18nService = new I18nService();

// Hook para usar traducciones
export function useTranslation() {
  return {
    t: (key: string, params?: Record<string, string>) => i18nService.t(key, params),
    language: i18nService.getLanguage(),
    setLanguage: (lang: SupportedLanguage) => i18nService.setLanguage(lang),
    availableLanguages: i18nService.getAvailableLanguages(),
  };
}

