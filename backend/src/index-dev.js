/**
 * RespiCare Backend API - Development Version (JavaScript)
 * Temporary version while fixing TypeScript errors
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'RespiCare Backend API',
    version: '1.0.0',
    status: 'running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
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

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'RespiCare API',
    version: '1.0.0',
    status: 'operational',
    endpoints: {
      root: '/',
      health: '/api/health',
      info: '/api',
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
const analyticsRoutes = require('./routes/analyticsRoutes');
app.use('/api/analytics', analyticsRoutes);

// Simple Analytics Routes (for better performance)
const simpleAnalyticsRoutes = require('./routes/simpleAnalyticsRoutes');
app.use('/api/analytics', simpleAnalyticsRoutes);

// Mock Analytics Routes (for demonstration)
const mockAnalyticsRoutes = require('./routes/mockAnalyticsRoutes');
app.use('/api/analytics', mockAnalyticsRoutes);

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

