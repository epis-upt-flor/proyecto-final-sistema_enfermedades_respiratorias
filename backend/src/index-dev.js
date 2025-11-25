/**
 * RespiCare Backend API - Development Version (JavaScript)
 * Temporary version while fixing TypeScript errors
 */

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const mongoose = require('mongoose');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3001;

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RespiCare API',
      version: '1.0.0',
      description: 'Sistema Integral de Enfermedades Respiratorias - API Documentation',
      contact: {
        name: 'RespiCare Team',
        email: 'support@respicare.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: [
    path.join(__dirname, 'routes/*.js'),
    path.join(__dirname, 'index-dev.js')
  ]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

const DEFAULT_MONGO_URI = 'mongodb://admin:change_this_password@mongodb:27017/respicare_dev?authSource=admin';
const MONGODB_URI = process.env.MONGODB_URI || DEFAULT_MONGO_URI;

mongoose.set('strictQuery', false);

mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 20000
  })
  .then(() => {
    console.log('[MongoDB] Conexión establecida correctamente');
  })
  .catch((error) => {
    console.error('[MongoDB] Error al conectar:', error.message);
  });

// Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'RespiCare API Documentation'
}));

/**
 * @swagger
 * /:
 *   get:
 *     summary: Root endpoint
 *     description: Returns basic API information
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 version:
 *                   type: string
 *                 status:
 *                   type: string
 *                 environment:
 *                   type: string
 *                 timestamp:
 *                   type: string
 */
app.get('/', (req, res) => {
  res.json({
    message: 'RespiCare Backend API',
    version: '1.0.0',
    status: 'running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check
 *     description: Returns system health status
 *     tags: [System]
 *     responses:
 *       200:
 *         description: System health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 service:
 *                   type: string
 *                 version:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                 uptime:
 *                   type: number
 *                 memory:
 *                   type: object
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Legacy health check
 *     description: Compatibility endpoint that mirrors /api/health
 *     tags: [System]
 *     responses:
 *       200:
 *         description: System health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 service:
 *                   type: string
 *                 version:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                 uptime:
 *                   type: number
 *                 memory:
 *                   type: object
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    metadata: {
      aliasOf: '/api/health'
    }
  });
});

/**
 * @swagger
 * /api:
 *   get:
 *     summary: API information
 *     description: Returns detailed API information and available endpoints
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API information and endpoints
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 version:
 *                   type: string
 *                 status:
 *                   type: string
 *                 endpoints:
 *                   type: object
 *                 database:
 *                   type: object
 */
app.get('/api', (req, res) => {
  res.json({
    message: 'RespiCare API',
    version: '1.0.0',
    status: 'operational',
    endpoints: {
      root: '/',
      health: '/api/health',
      info: '/api',
      docs: '/api-docs',
      auth: '/api/auth/* (coming soon)',
      patients: '/api/patients/* (coming soon)',
      medicalHistory: '/api/medical-history/* (coming soon)',
      aiAnalysis: '/api/ai-analysis/* (coming soon)',
          symptomReports: '/api/symptom-reports/* (ACTIVE)',
          heatmap: '/api/symptom-reports/heatmap (ACTIVE)',
          statistics: '/api/symptom-reports/statistics (ACTIVE)',
          chatConversations: '/api/chat-conversations/* (ACTIVE)',
          chatMessages: '/api/chat-conversations/:sessionId/messages (ACTIVE)',
          analytics: '/api/analytics/* (ACTIVE)',
          temporalTrends: '/api/analytics/temporal-trends (ACTIVE)',
          diseaseReports: '/api/analytics/disease-reports (ACTIVE)',
          dashboard: '/api/analytics/dashboard (ACTIVE)',
          mlMonitoring: '/api/analytics/ml/monitoring (ACTIVE)',
          mlFeatures: '/api/analytics/ml/features (ACTIVE)',
          mlFairness: '/api/analytics/ml/fairness (ACTIVE)'
    },
    database: {
      mongodb: 'Connected (placeholder)',
      redis: 'Connected (placeholder)'
    }
  });
});

// Authentication Routes
const authRoutesDev = require('./routes/authRoutesDev');
app.use('/api/v1/auth', authRoutesDev);
app.use('/api/auth', authRoutesDev); // Legacy support

// Dashboard Routes - Simple implementation for development
// IMPORTANTE: Estas rutas deben estar ANTES de las rutas de analytics para evitar conflictos
app.get('/api/v1/dashboard/patient', async (req, res) => {
  console.log('📊 Dashboard patient route called');
  try {
    const mongoose = require('mongoose');
    const jwt = require('jsonwebtoken');
    
    // Intentar obtener userId del token de autenticación
    let authenticatedUserId = null;
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const secret = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
        const decoded = jwt.verify(token, secret);
        authenticatedUserId = decoded.userId || decoded.id || decoded._id;
        console.log('✅ User authenticated for dashboard:', authenticatedUserId);
      } catch (e) {
        console.warn('⚠️ Invalid token in dashboard request:', e.message);
        return res.status(401).json({
          success: false,
          message: 'Token de autenticación inválido'
        });
      }
    }
    
    if (!authenticatedUserId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }
    
    // Convertir userId a ObjectId
    let userIdObj;
    try {
      userIdObj = typeof authenticatedUserId === 'string'
        ? new mongoose.Types.ObjectId(authenticatedUserId)
        : authenticatedUserId;
    } catch (e) {
      userIdObj = authenticatedUserId;
    }
    
    // Obtener estadísticas básicas del paciente
    let MedicalHistory, Appointment, Alert;
    
    try {
      MedicalHistory = mongoose.model('MedicalHistory');
    } catch (e) {
      const schema = new mongoose.Schema({}, { strict: false, timestamps: true });
      MedicalHistory = mongoose.model('MedicalHistory', schema);
    }
    
    try {
      Appointment = mongoose.model('Appointment');
    } catch (e) {
      const schema = new mongoose.Schema({}, { strict: false, timestamps: true });
      Appointment = mongoose.model('Appointment', schema);
    }
    
    try {
      Alert = mongoose.model('Alert');
    } catch (e) {
      const schema = new mongoose.Schema({}, { strict: false, timestamps: true });
      Alert = mongoose.model('Alert', schema);
    }
    
    // Contar historias médicas del paciente (usar ObjectId)
    const totalHistories = await MedicalHistory.countDocuments({
      $or: [
        { patientId: userIdObj },
        { patientId: authenticatedUserId },
        { patientId: authenticatedUserId.toString() }
      ]
    }).catch(() => 0);
    
    // Contar todas las citas del paciente
    const totalAppointments = await Appointment.countDocuments({
      $or: [
        { patientId: userIdObj },
        { patientId: authenticatedUserId },
        { patientId: authenticatedUserId.toString() }
      ]
    }).catch(() => 0);
    
    // Contar citas próximas (con fecha mayor o igual a hoy)
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Resetear a inicio del día
    
    const upcomingAppointments = await Appointment.countDocuments({
      $or: [
        { patientId: userIdObj },
        { patientId: authenticatedUserId },
        { patientId: authenticatedUserId.toString() }
      ],
      status: { $in: ['scheduled', 'rescheduled'] },
      $or: [
        { date: { $gte: now } },
        { scheduledAt: { $gte: now } }
      ]
    }).catch(() => 0);
    
    // Contar alertas activas (no reconocidas)
    const activeAlerts = await Alert.countDocuments({
      $or: [
        { userId: userIdObj },
        { userId: authenticatedUserId },
        { userId: authenticatedUserId.toString() },
        { patientId: userIdObj },
        { patientId: authenticatedUserId },
        { patientId: authenticatedUserId.toString() }
      ],
      $or: [
        { acknowledged: false },
        { acknowledged: { $exists: false } },
        { status: { $ne: 'acknowledged' } }
      ]
    }).catch(() => 0);
    
    console.log(`📊 Dashboard stats for user ${authenticatedUserId}:`, {
      totalHistories,
      totalAppointments,
      upcomingAppointments,
      activeAlerts
    });
    
    res.json({
      success: true,
      data: {
        totalHistories,
        totalMedicalHistories: totalHistories,
        upcomingAppointments,
        totalAppointments,
        activeAlerts,
        totalAlerts: activeAlerts,
        recentActivity: [],
        healthScore: null,
        lastCheckup: null
      }
    });
  } catch (error) {
    console.error('❌ Error fetching patient dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener datos del dashboard',
      error: error.message
    });
  }
});

app.get('/api/v1/dashboard/doctor', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        totalPatients: 0,
        todayAppointments: 0,
        pendingReports: 0,
        recentActivity: []
      }
    });
  } catch (error) {
    console.error('Error fetching doctor dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener datos del dashboard',
      error: error.message
    });
  }
});

app.get('/api/v1/dashboard/admin', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        totalUsers: 0,
        totalPatients: 0,
        totalDoctors: 0,
        systemHealth: 'operational'
      }
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener datos del dashboard',
      error: error.message
    });
  }
});

// Temporary patients endpoint
app.get('/api/patients', (req, res) => {
  res.json({
    message: 'Patients endpoint',
    status: 'placeholder',
    data: []
  });
});

// Medical History Routes - Simple implementation for development
app.get('/api/v1/medical-histories', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const jwt = require('jsonwebtoken');
    const { patientId, limit = 50, page = 1 } = req.query;
    
    // Intentar obtener userId del token de autenticación
    let authenticatedUserId = null;
    let userRole = null;
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const secret = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
        const decoded = jwt.verify(token, secret);
        authenticatedUserId = decoded.userId || decoded.id || decoded._id;
        
        // Obtener el rol del usuario
        try {
          const UserModel = mongoose.model('User');
          const user = await UserModel.findById(authenticatedUserId).lean();
          if (user) {
            userRole = user.role;
          }
        } catch (e) {
          // Si no se puede obtener el usuario, continuar sin rol
        }
      } catch (e) {
        console.warn('Invalid token in medical histories request:', e.message);
      }
    }
    
    // Intentar obtener el modelo MedicalHistory si existe
    let MedicalHistory;
    try {
      MedicalHistory = mongoose.model('MedicalHistory');
    } catch (e) {
      // Si no existe, crear un schema simple
      const medicalHistorySchema = new mongoose.Schema({
        patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
        patientName: String,
        age: Number,
        diagnosis: String,
        symptoms: [{
          name: String,
          severity: String,
          duration: String
        }],
        description: String,
        date: { type: Date, default: Date.now },
        location: {
          latitude: Number,
          longitude: Number,
          address: String
        },
        images: [String],
        audioNotes: String,
        isOffline: Boolean,
        syncStatus: String
      }, { timestamps: true });
      
      medicalHistorySchema.index({ patientId: 1, createdAt: -1 });
      MedicalHistory = mongoose.model('MedicalHistory', medicalHistorySchema);
    }
    
    // Construir query
    const query = {};
    
    // Si el usuario autenticado es un paciente, solo mostrar sus historias
    if (userRole === 'patient' && authenticatedUserId) {
      // Para pacientes, filtrar automáticamente por su ID usando ObjectId
      try {
        const userIdObj = typeof authenticatedUserId === 'string' 
          ? new mongoose.Types.ObjectId(authenticatedUserId)
          : authenticatedUserId;
        query.patientId = userIdObj;
        console.log(`🔒 Filtering medical histories for patient: ${authenticatedUserId}`);
      } catch (e) {
        query.patientId = authenticatedUserId;
      }
    } else if (patientId) {
      // Si se proporciona patientId explícitamente (para doctores o admins)
      try {
        const patientIdObj = typeof patientId === 'string'
          ? new mongoose.Types.ObjectId(patientId)
          : patientId;
        query.patientId = patientIdObj;
      } catch (e) {
        query.patientId = patientId;
      }
    } else if (authenticatedUserId) {
      // Si hay usuario autenticado pero no sabemos el rol, asumir paciente
      try {
        const userIdObj = typeof authenticatedUserId === 'string'
          ? new mongoose.Types.ObjectId(authenticatedUserId)
          : authenticatedUserId;
        query.patientId = userIdObj;
        console.log(`🔒 Filtering medical histories for authenticated user: ${authenticatedUserId}`);
      } catch (e) {
        query.patientId = authenticatedUserId;
      }
    }
    
    // Obtener historias médicas
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const histories = await MedicalHistory.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();
    
    const total = await MedicalHistory.countDocuments(query);
    
    console.log(`📋 Medical histories query - User: ${authenticatedUserId}, Role: ${userRole}, Found: ${histories.length}`);
    
    res.json({
      success: true,
      data: histories,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching medical histories:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historias médicas',
      error: error.message
    });
  }
});

app.get('/api/v1/medical-histories/:id', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const MedicalHistory = mongoose.model('MedicalHistory');
    const history = await MedicalHistory.findById(req.params.id).lean();
    
    if (!history) {
      return res.status(404).json({
        success: false,
        message: 'Historia médica no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error fetching medical history:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historia médica',
      error: error.message
    });
  }
});

// Symptom Reports Routes
const symptomReportsRoutes = require('./routes/symptomReportsRoutes');
app.use('/api/symptom-reports', symptomReportsRoutes);

// Chat Conversations Routes
const chatConversationsRoutes = require('./routes/chatConversationsRoutes');
app.use('/api/chat-conversations', chatConversationsRoutes);

// Chat Audio Routes (Transcription & Cough Analysis)
const chatAudioRoutes = require('./routes/chatAudioRoutes');
app.use('/api/v1/chat', chatAudioRoutes);

// Chat Image Routes (Image Analysis)
const chatImageRoutes = require('./routes/chatImageRoutes');
app.use('/api/v1/chat', chatImageRoutes);

// Analytics Routes
const analyticsRoutes = require('./routes/analyticsRoutesNew');
app.use('/api/analytics', analyticsRoutes);

// Simple Analytics Routes (for better performance)
const simpleAnalyticsRoutes = require('./routes/simpleAnalyticsRoutes');
app.use('/api/analytics', simpleAnalyticsRoutes);

// Mock Analytics Routes (for demonstration)
const mockAnalyticsRoutes = require('./routes/mockAnalyticsRoutes');
app.use('/api/analytics', mockAnalyticsRoutes);

// ML Analytics Routes (for SHAP and ML monitoring)
const mlAnalyticsRoutes = require('./routes/mlAnalyticsRoutes');
app.use('/api/analytics', mlAnalyticsRoutes);
app.use('/api/v1/analytics', mlAnalyticsRoutes);

// Alert Routes - Rutas temporales para desarrollo
// Nota: Las rutas completas están en alertRoutes.ts (TypeScript)
// Estas son rutas temporales hasta que se compile TypeScript o se migre a JS

app.get('/api/v1/alerts/test', (req, res) => {
  res.json({ success: true, message: 'Alert routes are working (temporary mock)' });
});

app.get('/api/v1/alerts', (req, res) => {
  // Verificar autenticación básica
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Token de acceso requerido',
      error: 'Unauthorized'
    });
  }
  
  // Retornar datos mock para desarrollo
  res.json({
    success: true,
    message: 'Alertas (mock - desarrollo)',
    data: [],
    note: 'Esta es una implementación temporal. Las rutas completas están en alertRoutes.ts'
  });
});

app.get('/api/v1/alerts/monitoring', (req, res) => {
  // Verificar autenticación básica
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Token de acceso requerido',
      error: 'Unauthorized'
    });
  }
  
  // Retornar datos mock para desarrollo
  res.json({
    success: true,
    message: 'Métricas de monitoreo (mock - desarrollo)',
    data: {
      queueSize: 0,
      processingRate: 0,
      errorRate: 0,
      lastProcessed: null
    },
    note: 'Esta es una implementación temporal. Las rutas completas están en alertRoutes.ts'
  });
});

// ---------------------------------------------------------------------------
// Automatic Reports Routes - Rutas temporales para desarrollo
// ---------------------------------------------------------------------------

// GET /api/v1/reports/automatic - Listar reportes automáticos
app.get('/api/v1/reports/automatic', (req, res) => {
  try {
    const { type } = req.query;
    
    // Datos mock de reportes con la estructura esperada por el frontend
    const mockReports = [
      {
        _id: 'report-001',
        reportType: 'daily',
        status: 'completed',
        generatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        period: {
          startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString()
        },
        metrics: {
          totalMedicalHistories: 45,
          totalAlerts: 12,
          totalPatients: 38,
          totalDoctors: 8,
          totalAdmins: 2,
          criticalAlerts: 3,
          totalAppointments: 25,
          completedAppointments: 20,
          aiAnalyses: 45,
          averageAIConfidence: 0.87
        },
        growthMetrics: {
          patientsGrowth: 5.2,
          historiesGrowth: 8.1,
          alertsGrowth: -2.3
        },
        anomalies: [
          {
            metric: 'Alertas críticas',
            value: 3,
            severity: 'high',
            description: 'Aumento inusual de alertas críticas en las últimas 24 horas',
            expectedRange: { min: 0, max: 1 }
          }
        ],
        topDiagnoses: [
          { diagnosis: 'Asma', count: 12 },
          { diagnosis: 'COVID-19', count: 8 },
          { diagnosis: 'Bronquitis', count: 6 }
        ],
        exportFormats: ['pdf', 'csv'],
        exportedAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: 'report-002',
        reportType: 'weekly',
        status: 'completed',
        generatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        period: {
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString()
        },
        metrics: {
          totalMedicalHistories: 312,
          totalAlerts: 89,
          totalPatients: 245,
          totalDoctors: 12,
          totalAdmins: 3,
          criticalAlerts: 15,
          totalAppointments: 156,
          completedAppointments: 142,
          aiAnalyses: 312,
          averageAIConfidence: 0.85
        },
        growthMetrics: {
          patientsGrowth: 12.5,
          historiesGrowth: 15.3,
          alertsGrowth: 8.7
        },
        anomalies: [
          {
            metric: 'Crecimiento de pacientes',
            value: 12.5,
            severity: 'medium',
            description: 'Crecimiento significativo en el número de pacientes',
            expectedRange: { min: 0, max: 10 }
          },
          {
            metric: 'Alertas críticas',
            value: 15,
            severity: 'high',
            description: 'Aumento considerable de alertas críticas',
            expectedRange: { min: 0, max: 8 }
          }
        ],
        topDiagnoses: [
          { diagnosis: 'Asma', count: 85 },
          { diagnosis: 'COVID-19', count: 62 },
          { diagnosis: 'Bronquitis', count: 48 },
          { diagnosis: 'Gripe', count: 35 }
        ],
        exportFormats: ['pdf', 'csv', 'json'],
        exportedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: 'report-003',
        reportType: 'monthly',
        status: 'generating',
        generatedAt: null,
        period: {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString()
        },
        metrics: {
          totalMedicalHistories: 0,
          totalAlerts: 0,
          totalPatients: 0,
          totalDoctors: 0,
          totalAdmins: 0,
          criticalAlerts: 0,
          totalAppointments: 0,
          completedAppointments: 0,
          aiAnalyses: 0,
          averageAIConfidence: 0
        },
        growthMetrics: {
          patientsGrowth: 0,
          historiesGrowth: 0,
          alertsGrowth: 0
        },
        anomalies: [],
        exportFormats: []
      }
    ];

    // Filtrar por tipo si se especifica
    let filteredReports = mockReports;
    if (type && type !== 'all') {
      filteredReports = mockReports.filter(r => r.reportType === type);
    }

    res.json({
      success: true,
      data: {
        reports: filteredReports,
        total: filteredReports.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching automatic reports',
      error: error.message
    });
  }
});

// GET /api/v1/reports/automatic/stats - Estadísticas de reportes
app.get('/api/v1/reports/automatic/stats', (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        total: 12,
        byType: {
          daily: 8,
          weekly: 3,
          monthly: 1
        },
        byStatus: {
          completed: 10,
          pending: 1,
          generating: 1,
          failed: 0
        },
        lastGenerated: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        nextScheduled: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching report statistics',
      error: error.message
    });
  }
});

// GET /api/v1/reports/automatic/:reportId - Obtener detalles de un reporte
app.get('/api/v1/reports/automatic/:reportId', (req, res) => {
  try {
    const { reportId } = req.params;
    
    // Datos mock de un reporte detallado con la estructura esperada por el frontend
    const mockReport = {
      _id: reportId,
      reportType: 'daily',
      status: 'completed',
      generatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      period: {
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString()
      },
      metrics: {
        totalMedicalHistories: 45,
        totalAlerts: 12,
        totalPatients: 38,
        totalDoctors: 8,
        totalAdmins: 2,
        criticalAlerts: 3,
        totalAppointments: 25,
        completedAppointments: 20,
        aiAnalyses: 45,
        averageAIConfidence: 0.87,
        topDiagnoses: [
          { diagnosis: 'Asma', count: 12 },
          { diagnosis: 'COVID-19', count: 8 },
          { diagnosis: 'Bronquitis', count: 6 },
          { diagnosis: 'Gripe', count: 5 },
          { diagnosis: 'Neumonía', count: 4 }
        ]
      },
      growthMetrics: {
        patientsGrowth: 5.2,
        historiesGrowth: 8.1,
        alertsGrowth: -2.3
      },
      anomalies: [
        {
          metric: 'Alertas críticas',
          value: 3,
          severity: 'high',
          description: 'Aumento inusual de alertas críticas en las últimas 24 horas',
          expectedRange: { min: 0, max: 1 }
        },
        {
          metric: 'Crecimiento de historias',
          value: 8.1,
          severity: 'medium',
          description: 'Crecimiento significativo en el número de historias médicas',
          expectedRange: { min: 0, max: 5 }
        }
      ],
      exportFormats: ['pdf', 'csv'],
      exportedAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString()
    };

    res.json({
      success: true,
      data: mockReport
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching report details',
      error: error.message
    });
  }
});

// POST /api/v1/reports/automatic/generate - Generar un nuevo reporte
app.post('/api/v1/reports/automatic/generate', (req, res) => {
  try {
    const { reportType, includeAnomalies, autoExport, exportFormat } = req.body;
    
    // Simular generación de reporte
    const newReport = {
      _id: `report-${Date.now()}`,
      reportType: reportType || 'daily',
      status: 'generating',
      generatedAt: null,
      period: {
        start: new Date(Date.now() - (reportType === 'daily' ? 24 : reportType === 'weekly' ? 7 * 24 : 30 * 24) * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString()
      },
      summary: null,
      exportFormats: exportFormat ? [exportFormat] : []
    };

    // Simular que el reporte se completa después de un tiempo
    setTimeout(() => {
      newReport.status = 'completed';
      newReport.generatedAt = new Date().toISOString();
      newReport.summary = {
        totalCases: Math.floor(Math.random() * 100) + 20,
        highSeverity: Math.floor(Math.random() * 20),
        mediumSeverity: Math.floor(Math.random() * 40),
        lowSeverity: Math.floor(Math.random() * 30),
        anomalies: includeAnomalies ? Math.floor(Math.random() * 5) : 0
      };
    }, 2000);

    res.status(201).json({
      success: true,
      message: `Reporte ${reportType} en proceso de generación`,
      data: newReport
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating report',
      error: error.message
    });
  }
});

// POST /api/v1/reports/automatic/:reportId/export - Exportar un reporte
app.post('/api/v1/reports/automatic/:reportId/export', (req, res) => {
  try {
    const { reportId } = req.params;
    const { format = 'pdf' } = req.body;
    
    // Simular exportación
    res.json({
      success: true,
      message: `Reporte exportado en formato ${format}`,
      data: {
        reportId,
        format,
        downloadUrl: `/api/v1/reports/automatic/${reportId}/download?format=${format}`,
        exportedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error exporting report',
      error: error.message
    });
  }
});

// ---------------------------------------------------------------------------
// Mocked Appointments API (development-only)
// ---------------------------------------------------------------------------

const SAMPLE_APPOINTMENTS = [
  {
    id: 'apt-001',
    patientId: 'patient-456',
    doctorId: 'doctor-123',
    scheduledAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    durationMinutes: 30,
    status: 'scheduled',
    reason: 'Consulta de control',
    notes: 'Paciente con historial de asma leve',
  },
  {
    id: 'apt-002',
    patientId: 'patient-789',
    doctorId: 'doctor-123',
    scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    durationMinutes: 30,
    status: 'scheduled',
    reason: 'Evaluación de tos persistente',
  },
  {
    id: 'apt-003',
    patientId: 'patient-123',
    doctorId: 'doctor-999',
    scheduledAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    durationMinutes: 45,
    status: 'completed',
    reason: 'Control post tratamiento',
  },
];

const normalizeArrayParam = (value) => {
  if (!value) return undefined;
  if (Array.isArray(value)) return value.flatMap((item) => String(item).split(','));
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

app.get('/api/v1/appointments', (req, res) => {
  const { doctorId, patientId, status, from, to } = req.query;

  let results = [...SAMPLE_APPOINTMENTS];

  if (doctorId) {
    results = results.filter((appointment) => appointment.doctorId === String(doctorId));
  }

  if (patientId) {
    results = results.filter((appointment) => appointment.patientId === String(patientId));
  }

  const statusFilter = normalizeArrayParam(status);
  if (statusFilter && statusFilter.length > 0) {
    results = results.filter((appointment) => statusFilter.includes(appointment.status));
  }

  if (from) {
    const fromDate = new Date(String(from));
    results = results.filter(
      (appointment) => new Date(appointment.scheduledAt).getTime() >= fromDate.getTime(),
    );
  }

  if (to) {
    const toDate = new Date(String(to));
    results = results.filter(
      (appointment) => new Date(appointment.scheduledAt).getTime() <= toDate.getTime(),
    );
  }

  res.json({
    success: true,
    message: 'Listado de citas (mock)',
    data: results,
  });
});

// Ruta para obtener citas próximas del usuario autenticado
app.get('/api/v1/appointments/me/upcoming', async (req, res) => {
  console.log('📅 Upcoming appointments route called');
  try {
    const mongoose = require('mongoose');
    const jwt = require('jsonwebtoken');
    
    // Intentar obtener userId del token de autenticación
    let userId = null;
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const secret = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
        const decoded = jwt.verify(token, secret);
        userId = decoded.userId || decoded.id || decoded._id;
        console.log('✅ User authenticated:', userId);
      } catch (e) {
        console.warn('⚠️ Invalid token in appointments request:', e.message);
        return res.status(401).json({
          success: false,
          message: 'Token de autenticación inválido',
          error: e.message
        });
      }
    } else {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticación requerido'
      });
    }
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'No se pudo identificar al usuario'
      });
    }
    
    // Intentar obtener citas de la base de datos
    let Appointment;
    try {
      Appointment = mongoose.model('Appointment');
    } catch (e) {
      // Si no existe el modelo, usar datos mock
      console.log('⚠️ Appointment model not found, using mock data');
      const now = new Date();
      const mockAppointments = SAMPLE_APPOINTMENTS.filter(
        (appointment) => 
          appointment.patientId === String(userId) &&
          (appointment.status === 'scheduled' || appointment.status === 'rescheduled') &&
          new Date(appointment.scheduledAt) >= now
      ).sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
      
      return res.json({
        success: true,
        data: mockAppointments
      });
    }
    
    // Buscar citas próximas en la base de datos
    const now = new Date();
    const upcomingAppointments = await Appointment.find({
      patientId: userId,
      status: { $in: ['scheduled', 'rescheduled'] },
      scheduledAt: { $gte: now }
    })
      .sort({ scheduledAt: 1 }) // Ordenar por fecha ascendente
      .limit(10) // Limitar a 10 citas
      .lean();
    
    console.log(`✅ Found ${upcomingAppointments.length} upcoming appointments for user ${userId}`);
    
    res.json({
      success: true,
      data: upcomingAppointments
    });
  } catch (error) {
    console.error('❌ Error fetching upcoming appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener citas próximas',
      error: error.message
    });
  }
});

const buildAvailabilitySlots = ({ doctorId, start, end, slotMinutes = 30 }) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const slots = [];

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return slots;
  }

  const busySlots = SAMPLE_APPOINTMENTS.filter(
    (appointment) => appointment.doctorId === doctorId && appointment.status !== 'cancelled',
  ).map((appointment) => {
    const slotStart = new Date(appointment.scheduledAt);
    const slotEnd = new Date(slotStart.getTime() + appointment.durationMinutes * 60 * 1000);
    return { start: slotStart, end: slotEnd };
  });

  for (let cursor = new Date(startDate); cursor < endDate; cursor = new Date(cursor.getTime() + slotMinutes * 60 * 1000)) {
    const slotEnd = new Date(cursor.getTime() + slotMinutes * 60 * 1000);
    if (slotEnd > endDate) {
      break;
    }

    const overlap = busySlots.some(
      (busy) => cursor < busy.end && slotEnd > busy.start,
    );

    slots.push({
      start: cursor.toISOString(),
      end: slotEnd.toISOString(),
      available: !overlap,
    });
  }

  return slots;
};

// Helper function to get or create WearableMetrics model
const getWearableMetricsModel = () => {
  const mongoose = require('mongoose');
  try {
    return mongoose.model('WearableMetrics');
  } catch (e) {
    // Si no existe el modelo, crearlo
    const schema = new mongoose.Schema({
      userId: { type: String, required: true, index: true },
      heartRate: Number,
      steps: Number,
      spO2: Number,
      provider: String,
      lastSync: { type: Date, default: Date.now }
    }, { timestamps: true });
    
    return mongoose.model('WearableMetrics', schema);
  }
};

// Wearables Routes
app.get('/api/v1/wearables/metrics', async (req, res) => {
  console.log('⌚ Wearables metrics route called');
  try {
    const mongoose = require('mongoose');
    const jwt = require('jsonwebtoken');
    
    // Intentar obtener userId del token de autenticación
    let userId = null;
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const secret = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
        const decoded = jwt.verify(token, secret);
        userId = decoded.userId || decoded.id || decoded._id;
        console.log('✅ User authenticated for wearables:', userId);
      } catch (e) {
        console.warn('⚠️ Invalid token in wearables request:', e.message);
        return res.status(401).json({
          success: false,
          message: 'Token de autenticación inválido',
          error: e.message
        });
      }
    } else {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticación requerido'
      });
    }
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'No se pudo identificar al usuario'
      });
    }
    
    // Obtener o crear el modelo
    const WearableMetrics = getWearableMetricsModel();
    
    // Buscar las métricas más recientes del usuario
    const latestMetrics = await WearableMetrics.findOne({ userId })
      .sort({ lastSync: -1 })
      .lean();
    
    if (!latestMetrics) {
      console.log(`ℹ️ No wearable metrics found for user ${userId}`);
      return res.json({
        success: true,
        heartRate: null,
        steps: null,
        spO2: null,
        lastSync: null,
        provider: null
      });
    }
    
    console.log(`✅ Found wearable metrics for user ${userId}:`, {
      heartRate: latestMetrics.heartRate,
      steps: latestMetrics.steps,
      spO2: latestMetrics.spO2,
      provider: latestMetrics.provider
    });
    
    res.json({
      success: true,
      heartRate: latestMetrics.heartRate || null,
      steps: latestMetrics.steps || null,
      spO2: latestMetrics.spO2 || null,
      lastSync: latestMetrics.lastSync?.toISOString() || null,
      provider: latestMetrics.provider || null
    });
  } catch (error) {
    console.error('❌ Error fetching wearable metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener métricas de wearables',
      error: error.message
    });
  }
});

app.post('/api/v1/wearables/sync', async (req, res) => {
  console.log('⌚ Wearables sync route called');
  try {
    const mongoose = require('mongoose');
    const jwt = require('jsonwebtoken');
    
    // Intentar obtener userId del token de autenticación
    let userId = null;
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const secret = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
        const decoded = jwt.verify(token, secret);
        userId = decoded.userId || decoded.id || decoded._id;
        console.log('✅ User authenticated for wearables sync:', userId);
      } catch (e) {
        console.warn('⚠️ Invalid token in wearables sync request:', e.message);
        return res.status(401).json({
          success: false,
          message: 'Token de autenticación inválido',
          error: e.message
        });
      }
    } else {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticación requerido'
      });
    }
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'No se pudo identificar al usuario'
      });
    }
    
    const { heartRate, steps, spO2, provider } = req.body;
    
    // Obtener o crear el modelo
    const WearableMetrics = getWearableMetricsModel();
    
    // Guardar o actualizar métricas
    const metricsData = {
      userId,
      heartRate: heartRate || null,
      steps: steps || null,
      spO2: spO2 || null,
      provider: provider || 'Unknown',
      lastSync: new Date()
    };
    
    const savedMetrics = await WearableMetrics.findOneAndUpdate(
      { userId },
      metricsData,
      { upsert: true, new: true }
    );
    
    console.log(`✅ Wearable metrics saved for user ${userId}`);
    
    res.json({
      success: true,
      heartRate: savedMetrics.heartRate || null,
      steps: savedMetrics.steps || null,
      spO2: savedMetrics.spO2 || null,
      lastSync: savedMetrics.lastSync?.toISOString() || new Date().toISOString(),
      provider: savedMetrics.provider || null
    });
  } catch (error) {
    console.error('❌ Error syncing wearable metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Error al sincronizar métricas de wearables',
      error: error.message
    });
  }
});

app.get('/api/v1/appointments/doctor/:doctorId/availability', (req, res) => {
  const { doctorId } = req.params;
  const { start, end, slotMinutes } = req.query;

  if (!start || !end) {
    return res.status(400).json({
      success: false,
      message: 'Los parámetros start y end son obligatorios',
    });
  }

  const slots = buildAvailabilitySlots({
    doctorId,
    start,
    end,
    slotMinutes: slotMinutes ? Number(slotMinutes) : 30,
  });

  return res.json({
    success: true,
    message: 'Disponibilidad generada (mock)',
    data: slots,
  });
});

// ---------------------------------------------------------------------------
// ML Monitoring proxy endpoints (bridge to AI Services for dev)
// ---------------------------------------------------------------------------

const AI_SERVICE_CANDIDATES = [
  process.env.AI_SERVICE_URL ? process.env.AI_SERVICE_URL.replace(/\/$/, '') : null,
  'http://ai-services:8000/api/v1',
  'http://localhost:8000/api/v1',
].filter(Boolean);

const fetchFromAiService = async (path, options = {}) => {
  let lastError;

  for (const base of AI_SERVICE_CANDIDATES) {
    const url = `${base}${path}`;
    try {
      const response = await axios.get(url, {
        timeout: 8000,
        ...options,
      });
      // AI service returns {success: true, data: {...}}, extract only data
      const result = response.data;
      // Check if result has the expected structure {success: true, data: {...}}
      if (result && typeof result === 'object') {
        if (result.success === true && 'data' in result) {
          // Extract the inner data
          const innerData = result.data;
          // If innerData also has the same structure, extract again
          if (innerData && typeof innerData === 'object' && innerData.success === true && 'data' in innerData) {
            return innerData.data;
          }
          return innerData;
        }
        // If result itself is the data (no wrapper), return it
        if (!('success' in result)) {
          return result;
        }
      }
      return result || {};
    } catch (error) {
      lastError = error;
      console.warn(`AI service request failed for ${url}`, error.message);
    }
  }

  throw lastError;
};

const monitoringRoutes = ['/api/analytics/ml/monitoring', '/api/v1/analytics/ml/monitoring'];
const featureRoutes = ['/api/analytics/ml/features', '/api/v1/analytics/ml/features'];
const fairnessRoutes = ['/api/analytics/ml/fairness', '/api/v1/analytics/ml/fairness'];

app.get(monitoringRoutes, async (req, res) => {
  try {
    const params = {};
    if (req.query.days) {
      params.days = Number(req.query.days);
    }
    const data = await fetchFromAiService('/ml/monitoring/metrics', { params });
    res.json({ success: true, data });
  } catch (error) {
    const status = error?.response?.status || 502;
    res.status(status).json({
      success: false,
      message: error?.response?.data?.detail || error.message || 'Error al obtener métricas de monitoreo',
    });
  }
});

app.get(featureRoutes, async (req, res) => {
  try {
    const params = {};
    if (req.query.top) {
      params.top_n = Number(req.query.top);
    }
    const data = await fetchFromAiService('/ml/monitoring/features', { params });
    res.json({ success: true, data });
  } catch (error) {
    const status = error?.response?.status || 502;
    res.status(status).json({
      success: false,
      message: error?.response?.data?.detail || error.message || 'Error al obtener contribuciones de características',
    });
  }
});

app.get(fairnessRoutes, async (req, res) => {
  try {
    const params = {};
    if (req.query.groupField) {
      params.group_field = req.query.groupField;
    }
    if (req.query.highConfidenceThreshold) {
      params.high_confidence_threshold = Number(req.query.highConfidenceThreshold);
    }
    const data = await fetchFromAiService('/ml/monitoring/fairness', { params });
    res.json({ success: true, data });
  } catch (error) {
    const status = error?.response?.status || 502;
    res.status(status).json({
      success: false,
      message: error?.response?.data?.detail || error.message || 'Error al obtener métricas de equidad',
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
    availableEndpoints: {
      root: '/',
      health: '/api/health',
      info: '/api'
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log('🚀 RespiCare Backend API');
  console.log('='.repeat(50));
  console.log(`📍 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log(`❤️  Health: http://localhost:${PORT}/api/health`);
  console.log(`📚 Info: http://localhost:${PORT}/api`);
  console.log(`📖 API Docs: http://localhost:${PORT}/api-docs`);
  console.log('='.repeat(50) + '\n');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('\nSIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  process.exit(0);
});

module.exports = app;

