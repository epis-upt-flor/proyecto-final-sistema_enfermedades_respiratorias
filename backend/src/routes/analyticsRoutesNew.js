const express = require('express');
const router = express.Router();

// GET /api/analytics/dashboard - Get comprehensive dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const now = new Date();
    
    // Generate dynamic mock data that changes over time
    const baseTime = Math.floor(now.getTime() / (1000 * 60 * 5)); // Change every 5 minutes
    const randomSeed = baseTime % 1000;
    
    // Create deterministic but changing data
    const generateValue = (base, variation, seed) => {
      return base + (Math.sin(seed + baseTime) * variation) + (Math.random() * variation * 0.1);
    };
    
    const dashboardData = {
      overview: {
        totalReports: Math.floor(generateValue(750, 200, randomSeed)),
        recentReports: Math.floor(generateValue(75, 25, randomSeed + 1)),
        urgentReports: Math.floor(generateValue(25, 15, randomSeed + 2)),
        totalConversations: Math.floor(generateValue(150, 50, randomSeed + 3)),
        recentConversations: Math.floor(generateValue(20, 10, randomSeed + 4))
      },
      distributions: {
        severity: [
          { _id: 'low', count: Math.floor(generateValue(400, 100, randomSeed + 5)) },
          { _id: 'medium', count: Math.floor(generateValue(250, 75, randomSeed + 6)) },
          { _id: 'high', count: Math.floor(generateValue(100, 50, randomSeed + 7)) }
        ],
        category: [
          { _id: 'respiratory', count: Math.floor(generateValue(200, 50, randomSeed + 8)) },
          { _id: 'fever', count: Math.floor(generateValue(150, 40, randomSeed + 9)) },
          { _id: 'pain', count: Math.floor(generateValue(100, 30, randomSeed + 10)) },
          { _id: 'fatigue', count: Math.floor(generateValue(80, 25, randomSeed + 11)) },
          { _id: 'digestive', count: Math.floor(generateValue(60, 20, randomSeed + 12)) },
          { _id: 'neurological', count: Math.floor(generateValue(40, 15, randomSeed + 13)) }
        ]
      },
      topDistricts: [
        { _id: 'Centro de Tacna', count: Math.floor(generateValue(80, 20, randomSeed + 14)) },
        { _id: 'Gregorio Albarracín', count: Math.floor(generateValue(65, 15, randomSeed + 15)) },
        { _id: 'Ciudad Nueva', count: Math.floor(generateValue(50, 12, randomSeed + 16)) },
        { _id: 'Pocollay', count: Math.floor(generateValue(35, 10, randomSeed + 17)) },
        { _id: 'Alto de la Alianza', count: Math.floor(generateValue(25, 8, randomSeed + 18)) }
      ],
      recentActivity: [
        {
          district: 'Centro de Tacna',
          symptoms: ['Tos seca', 'Dificultad respiratoria'],
          severity: 'high',
          reportedAt: new Date(now.getTime() - Math.random() * 2 * 60 * 60 * 1000),
          category: 'respiratory'
        },
        {
          district: 'Gregorio Albarracín',
          symptoms: ['Fiebre', 'Dolor de cabeza'],
          severity: 'medium',
          reportedAt: new Date(now.getTime() - Math.random() * 4 * 60 * 60 * 1000),
          category: 'fever'
        },
        {
          district: 'Ciudad Nueva',
          symptoms: ['Fatiga', 'Dolor muscular'],
          severity: 'low',
          reportedAt: new Date(now.getTime() - Math.random() * 6 * 60 * 60 * 1000),
          category: 'fatigue'
        },
        {
          district: 'Pocollay',
          symptoms: ['Dolor de garganta', 'Congestión nasal'],
          severity: 'medium',
          reportedAt: new Date(now.getTime() - Math.random() * 8 * 60 * 60 * 1000),
          category: 'respiratory'
        },
        {
          district: 'Alto de la Alianza',
          symptoms: ['Náuseas', 'Dolor abdominal'],
          severity: 'low',
          reportedAt: new Date(now.getTime() - Math.random() * 12 * 60 * 60 * 1000),
          category: 'digestive'
        }
      ],
      lastUpdated: now,
      dataSource: 'dynamic-mock'
    };

    res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
});

// GET /api/analytics/temporal-trends - Get temporal trends data
router.get('/temporal-trends', async (req, res) => {
  try {
    const { period = '30d', district, category } = req.query;
    
    const now = new Date();
    const baseTime = Math.floor(now.getTime() / (1000 * 60 * 5)); // Change every 5 minutes
    const randomSeed = baseTime % 1000;
    
    const generateValue = (base, variation, seed) => {
      return base + (Math.sin(seed + baseTime) * variation) + (Math.random() * variation * 0.1);
    };
    
    // Generate daily trends
    const dailyTrends = [];
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      dailyTrends.push({
        _id: dateStr,
        data: [
          { severity: 'low', count: Math.floor(generateValue(12, 5, randomSeed + i + 100)) },
          { severity: 'medium', count: Math.floor(generateValue(6, 3, randomSeed + i + 200)) },
          { severity: 'high', count: Math.floor(generateValue(2, 2, randomSeed + i + 300)) }
        ],
        total: Math.floor(generateValue(20, 10, randomSeed + i))
      });
    }
    
    // Generate weekly trends
    const weeklyTrends = [];
    const weeks = Math.ceil(days / 7);
    
    for (let i = weeks - 1; i >= 0; i--) {
      const weekDate = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const year = weekDate.getFullYear();
      const week = Math.ceil((weekDate - new Date(year, 0, 1)) / (7 * 24 * 60 * 60 * 1000));
      
      weeklyTrends.push({
        _id: { year, week },
        count: Math.floor(generateValue(140, 50, randomSeed + i)),
        avgSeverity: generateValue(1.5, 0.5, randomSeed + i + 400)
      });
    }
    
    // Generate top symptoms
    const topSymptoms = [
      { _id: 'Tos seca', totalCount: Math.floor(generateValue(45, 15, randomSeed + 700)), dailyData: [] },
      { _id: 'Dificultad respiratoria', totalCount: Math.floor(generateValue(35, 12, randomSeed + 800)), dailyData: [] },
      { _id: 'Fiebre', totalCount: Math.floor(generateValue(30, 10, randomSeed + 900)), dailyData: [] },
      { _id: 'Dolor de cabeza', totalCount: Math.floor(generateValue(25, 8, randomSeed + 1000)), dailyData: [] },
      { _id: 'Fatiga', totalCount: Math.floor(generateValue(20, 6, randomSeed + 1100)), dailyData: [] },
      { _id: 'Dolor muscular', totalCount: Math.floor(generateValue(18, 5, randomSeed + 1200)), dailyData: [] },
      { _id: 'Congestión nasal', totalCount: Math.floor(generateValue(15, 4, randomSeed + 1300)), dailyData: [] },
      { _id: 'Dolor de garganta', totalCount: Math.floor(generateValue(12, 3, randomSeed + 1400)), dailyData: [] },
      { _id: 'Náuseas', totalCount: Math.floor(generateValue(10, 2, randomSeed + 1500)), dailyData: [] },
      { _id: 'Dolor abdominal', totalCount: Math.floor(generateValue(8, 2, randomSeed + 1600)), dailyData: [] }
    ];

    res.status(200).json({
      success: true,
      data: {
        dailyTrends,
        weeklyTrends,
        topSymptoms
      }
    });
  } catch (error) {
    console.error('Error fetching temporal trends:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching temporal trends',
      error: error.message
    });
  }
});

// GET /api/analytics/disease-reports - Get disease reports data
router.get('/disease-reports', async (req, res) => {
  try {
    const { district, period = '30d' } = req.query;
    
    const now = new Date();
    const baseTime = Math.floor(now.getTime() / (1000 * 60 * 5)); // Change every 5 minutes
    const randomSeed = baseTime % 1000;
    
    const generateValue = (base, variation, seed) => {
      return base + (Math.sin(seed + baseTime) * variation) + (Math.random() * variation * 0.1);
    };
    
    const diseaseData = {
      summary: {
        totalDiseases: 7,
        totalReports: Math.floor(generateValue(150, 30, randomSeed)),
        urgentCases: Math.floor(generateValue(25, 10, randomSeed + 1)),
        recoveredCases: Math.floor(generateValue(120, 20, randomSeed + 2))
      },
      diseases: [
        {
          name: 'Asma',
          count: Math.floor(generateValue(35, 10, randomSeed + 3)),
          severity: 'medium',
          trend: 'increasing',
          symptoms: ['Tos seca', 'Dificultad respiratoria', 'Sibilancias'],
          districts: [
            { name: 'Centro de Tacna', count: Math.floor(generateValue(15, 5, randomSeed + 4)) },
            { name: 'Gregorio Albarracín', count: Math.floor(generateValue(12, 3, randomSeed + 5)) },
            { name: 'Ciudad Nueva', count: Math.floor(generateValue(8, 2, randomSeed + 6)) }
          ]
        },
        {
          name: 'Bronquitis',
          count: Math.floor(generateValue(28, 8, randomSeed + 7)),
          severity: 'medium',
          trend: 'stable',
          symptoms: ['Tos con flema', 'Dificultad respiratoria', 'Fatiga'],
          districts: [
            { name: 'Centro de Tacna', count: Math.floor(generateValue(12, 4, randomSeed + 8)) },
            { name: 'Pocollay', count: Math.floor(generateValue(10, 3, randomSeed + 9)) },
            { name: 'Alto de la Alianza', count: Math.floor(generateValue(6, 2, randomSeed + 10)) }
          ]
        },
        {
          name: 'COVID-19',
          count: Math.floor(generateValue(25, 12, randomSeed + 11)),
          severity: 'high',
          trend: 'decreasing',
          symptoms: ['Fiebre', 'Tos seca', 'Dificultad respiratoria', 'Fatiga'],
          districts: [
            { name: 'Centro de Tacna', count: Math.floor(generateValue(10, 5, randomSeed + 12)) },
            { name: 'Gregorio Albarracín', count: Math.floor(generateValue(8, 3, randomSeed + 13)) },
            { name: 'Ciudad Nueva', count: Math.floor(generateValue(7, 2, randomSeed + 14)) }
          ]
        },
        {
          name: 'Gripe',
          count: Math.floor(generateValue(22, 6, randomSeed + 15)),
          severity: 'low',
          trend: 'increasing',
          symptoms: ['Fiebre', 'Dolor de cabeza', 'Dolor muscular', 'Fatiga'],
          districts: [
            { name: 'Centro de Tacna', count: Math.floor(generateValue(8, 3, randomSeed + 16)) },
            { name: 'Pocollay', count: Math.floor(generateValue(7, 2, randomSeed + 17)) },
            { name: 'Alto de la Alianza', count: Math.floor(generateValue(7, 2, randomSeed + 18)) }
          ]
        },
        {
          name: 'Neumonía',
          count: Math.floor(generateValue(18, 5, randomSeed + 19)),
          severity: 'high',
          trend: 'stable',
          symptoms: ['Fiebre alta', 'Tos con flema', 'Dificultad respiratoria', 'Dolor en el pecho'],
          districts: [
            { name: 'Centro de Tacna', count: Math.floor(generateValue(6, 2, randomSeed + 20)) },
            { name: 'Gregorio Albarracín', count: Math.floor(generateValue(5, 2, randomSeed + 21)) },
            { name: 'Ciudad Nueva', count: Math.floor(generateValue(4, 1, randomSeed + 22)) }
          ]
        },
        {
          name: 'EPOC',
          count: Math.floor(generateValue(15, 4, randomSeed + 23)),
          severity: 'high',
          trend: 'stable',
          symptoms: ['Tos crónica', 'Dificultad respiratoria', 'Fatiga', 'Sibilancias'],
          districts: [
            { name: 'Centro de Tacna', count: Math.floor(generateValue(5, 2, randomSeed + 24)) },
            { name: 'Gregorio Albarracín', count: Math.floor(generateValue(4, 1, randomSeed + 25)) },
            { name: 'Pocollay', count: Math.floor(generateValue(3, 1, randomSeed + 26)) }
          ]
        },
        {
          name: 'Resfriado',
          count: Math.floor(generateValue(12, 3, randomSeed + 27)),
          severity: 'low',
          trend: 'decreasing',
          symptoms: ['Congestión nasal', 'Dolor de garganta', 'Estornudos', 'Fatiga leve'],
          districts: [
            { name: 'Centro de Tacna', count: Math.floor(generateValue(4, 1, randomSeed + 28)) },
            { name: 'Ciudad Nueva', count: Math.floor(generateValue(3, 1, randomSeed + 29)) },
            { name: 'Alto de la Alianza', count: Math.floor(generateValue(3, 1, randomSeed + 30)) }
          ]
        }
      ],
      chatAnalysis: {
        totalConsultations: Math.floor(generateValue(45, 10, randomSeed + 31)),
        diseasesDetected: [
          { name: 'Asma', count: Math.floor(generateValue(12, 3, randomSeed + 32)), confidence: 0.85 },
          { name: 'Bronquitis', count: Math.floor(generateValue(10, 2, randomSeed + 33)), confidence: 0.78 },
          { name: 'COVID-19', count: Math.floor(generateValue(8, 2, randomSeed + 34)), confidence: 0.92 },
          { name: 'Gripe', count: Math.floor(generateValue(7, 2, randomSeed + 35)), confidence: 0.80 },
          { name: 'Neumonía', count: Math.floor(generateValue(5, 1, randomSeed + 36)), confidence: 0.88 },
          { name: 'EPOC', count: Math.floor(generateValue(3, 1, randomSeed + 37)), confidence: 0.75 }
        ],
        urgencyLevels: {
          low: Math.floor(generateValue(15, 5, randomSeed + 38)),
          medium: Math.floor(generateValue(20, 5, randomSeed + 39)),
          high: Math.floor(generateValue(10, 3, randomSeed + 40))
        }
      }
    };

    res.status(200).json({
      success: true,
      data: diseaseData
    });
  } catch (error) {
    console.error('Error fetching disease reports:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching disease reports',
      error: error.message
    });
  }
});

module.exports = router;
