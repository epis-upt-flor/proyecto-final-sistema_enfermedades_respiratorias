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
          dashboard: '/api/analytics/dashboard (ACTIVE)'
    },
    database: {
      mongodb: 'Connected (placeholder)',
      redis: 'Connected (placeholder)'
    }
  });
});

// Temporary auth endpoints
app.post('/api/auth/login', (req, res) => {
  console.log('Login attempt:', req.body);
  res.json({
    message: 'Login endpoint - implementation in progress',
    status: 'placeholder',
    note: 'This is a temporary endpoint for testing'
  });
});

app.post('/api/auth/register', (req, res) => {
  console.log('Register attempt:', req.body);
  res.json({
    message: 'Register endpoint - implementation in progress',
    status: 'placeholder',
    note: 'This is a temporary endpoint for testing'
  });
});

// Temporary patients endpoint
app.get('/api/patients', (req, res) => {
  res.json({
    message: 'Patients endpoint',
    status: 'placeholder',
    data: []
  });
});

// Temporary medical history endpoint
app.get('/api/medical-history', (req, res) => {
  res.json({
    message: 'Medical history endpoint',
    status: 'placeholder',
    data: []
  });
});

// Symptom Reports Routes
const symptomReportsRoutes = require('./routes/symptomReportsRoutes');
app.use('/api/symptom-reports', symptomReportsRoutes);

// Chat Conversations Routes
const chatConversationsRoutes = require('./routes/chatConversationsRoutes');
app.use('/api/chat-conversations', chatConversationsRoutes);

// Analytics Routes
const analyticsRoutes = require('./routes/analyticsRoutesNew');
app.use('/api/analytics', analyticsRoutes);

// Simple Analytics Routes (for better performance)
const simpleAnalyticsRoutes = require('./routes/simpleAnalyticsRoutes');
app.use('/api/analytics', simpleAnalyticsRoutes);

// Mock Analytics Routes (for demonstration)
const mockAnalyticsRoutes = require('./routes/mockAnalyticsRoutes');
app.use('/api/analytics', mockAnalyticsRoutes);

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

