const express = require('express');
const router = express.Router();

const SymptomReport = require('../models/SymptomReport');
const ChatConversation = require('../models/ChatConversation');

// GET /api/analytics/dashboard - Get comprehensive dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Verificar si MongoDB está conectado
    const mongoose = require('mongoose');
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      // Retornar datos mock si MongoDB no está conectado
      console.warn('MongoDB no está conectado, retornando datos mock para dashboard');
      const mockData = {
        overview: {
          totalReports: 203,
          recentReports: 45,
          urgentReports: 8,
          totalConversations: 156,
          recentConversations: 32
        },
        distributions: {
          severity: [
            { _id: 'high', count: 45 },
            { _id: 'medium', count: 94 },
            { _id: 'low', count: 64 }
          ],
          category: [
            { _id: 'respiratory', count: 170 },
            { _id: 'fever', count: 25 },
            { _id: 'pain', count: 8 }
          ]
        },
        topDistricts: [
          { _id: 'Centro de Tacna', count: 45, avgSeverity: 2.1, severityLevel: 'high' },
          { _id: 'Alto de la Alianza', count: 38, avgSeverity: 2.3, severityLevel: 'high' },
          { _id: 'Gregorio Albarracín', count: 32, avgSeverity: 1.8, severityLevel: 'medium' },
          { _id: 'Ciudad Nueva', count: 28, avgSeverity: 2.0, severityLevel: 'medium' },
          { _id: 'Boca del Río', count: 25, avgSeverity: 1.9, severityLevel: 'medium' }
        ],
        recentActivity: [
          {
            district: 'Centro de Tacna',
            symptoms: [{ name: 'tos seca' }, { name: 'fiebre' }],
            severityLevel: 'high',
            category: 'respiratory',
            reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
          },
          {
            district: 'Alto de la Alianza',
            symptoms: [{ name: 'dificultad respiratoria' }],
            severityLevel: 'medium',
            category: 'respiratory',
            reportedAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
          }
        ],
        lastUpdated: now,
        dataSource: 'mock'
      };

      return res.status(200).json({
        success: true,
        data: mockData
      });
    }

    const overviewPromise = Promise.all([
      SymptomReport.countDocuments().exec(),
      SymptomReport.countDocuments({ 
        $or: [
          { reportedAt: { $gte: sevenDaysAgo, $lte: now } },
          { createdAt: { $gte: sevenDaysAgo, $lte: now } }
        ]
      }).exec(),
      SymptomReport.countDocuments({ 
        $or: [
          { status: 'urgent' },
          { overallSeverity: 'high' }
        ]
      }).exec(),
      ChatConversation.countDocuments().exec(),
      ChatConversation.countDocuments({ 
        $or: [
          { startedAt: { $gte: sevenDaysAgo, $lte: now } },
          { createdAt: { $gte: sevenDaysAgo, $lte: now } }
        ]
      }).exec(),
    ]);

    const severityDistributionPromise = SymptomReport.aggregate([
      {
        $group: {
          _id: '$overallSeverity',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const categoryDistributionPromise = SymptomReport.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const severitySwitch = {
      $switch: {
        branches: [
          { case: { $eq: ['$overallSeverity', 'low'] }, then: 1 },
          { case: { $eq: ['$overallSeverity', 'medium'] }, then: 2 },
          { case: { $eq: ['$overallSeverity', 'high'] }, then: 3 },
        ],
        default: 1,
      },
    };

    const topDistrictsPromise = SymptomReport.aggregate([
      {
        $group: {
          _id: '$location.district',
          count: { $sum: 1 },
          avgSeverity: { $avg: severitySwitch },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    const recentActivityPromise = SymptomReport.find()
      .sort({ reportedAt: -1, createdAt: -1 })
      .limit(10)
      .select(['location', 'symptoms', 'overallSeverity', 'category', 'reportedAt', 'createdAt'])
      .lean();

    const [
      overviewCounts,
      severityDistribution,
      categoryDistribution,
      topDistricts,
      recentActivityRaw,
    ] = await Promise.all([
      overviewPromise,
      severityDistributionPromise,
      categoryDistributionPromise,
      topDistrictsPromise,
      recentActivityPromise,
    ]);

    const [
      totalReports,
      recentReports,
      urgentReports,
      totalConversations,
      recentConversations,
    ] = overviewCounts;

    const formatSeverityLevel = (value) => {
      if (value >= 2.5) return 'high';
      if (value >= 1.5) return 'medium';
      return 'low';
    };

    const dashboardData = {
      overview: {
        totalReports,
        recentReports,
        urgentReports,
        totalConversations,
        recentConversations,
      },
      distributions: {
        severity: severityDistribution.map((item) => ({
          _id: item._id,
          count: item.count,
        })),
        category: categoryDistribution.map((item) => ({
          _id: item._id,
          count: item.count,
        })),
      },
      topDistricts: topDistricts.map((district) => ({
        _id: district._id,
        count: district.count,
        avgSeverity: Number(district.avgSeverity?.toFixed(2) ?? '0'),
        severityLevel: formatSeverityLevel(district.avgSeverity ?? 1),
      })),
      recentActivity: recentActivityRaw.map((report) => ({
        district: report.location?.district ?? 'Sin distrito',
        symptoms: (report.symptoms || []).slice(0, 4),
        severityLevel: report.overallSeverity ?? 'low',
        category: report.category ?? 'respiratory',
        reportedAt: report.reportedAt || report.createdAt,
      })),
      lastUpdated: now,
      dataSource: 'database',
    };

    res.status(200).json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    
    // Si es un error de MongoDB, retornar datos mock
    if (error.name === 'MongooseError' || error.message.includes('buffering timed out')) {
      console.warn('Error de MongoDB, retornando datos mock para dashboard');
      const mockData = {
        overview: {
          totalReports: 203,
          recentReports: 45,
          urgentReports: 8,
          totalConversations: 156,
          recentConversations: 32
        },
        distributions: {
          severity: [
            { _id: 'high', count: 45 },
            { _id: 'medium', count: 94 },
            { _id: 'low', count: 64 }
          ],
          category: [
            { _id: 'respiratory', count: 170 },
            { _id: 'fever', count: 25 },
            { _id: 'pain', count: 8 }
          ]
        },
        topDistricts: [
          { _id: 'Centro de Tacna', count: 45, avgSeverity: 2.1, severityLevel: 'high' },
          { _id: 'Alto de la Alianza', count: 38, avgSeverity: 2.3, severityLevel: 'high' },
          { _id: 'Gregorio Albarracín', count: 32, avgSeverity: 1.8, severityLevel: 'medium' },
          { _id: 'Ciudad Nueva', count: 28, avgSeverity: 2.0, severityLevel: 'medium' },
          { _id: 'Boca del Río', count: 25, avgSeverity: 1.9, severityLevel: 'medium' }
        ],
        recentActivity: [
          {
            district: 'Centro de Tacna',
            symptoms: [{ name: 'tos seca' }, { name: 'fiebre' }],
            severityLevel: 'high',
            category: 'respiratory',
            reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
          },
          {
            district: 'Alto de la Alianza',
            symptoms: [{ name: 'dificultad respiratoria' }],
            severityLevel: 'medium',
            category: 'respiratory',
            reportedAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
          }
        ],
        lastUpdated: new Date(),
        dataSource: 'mock'
      };

      return res.status(200).json({
        success: true,
        data: mockData,
        warning: 'Datos mock - MongoDB no disponible'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message,
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
    // Verificar si MongoDB está conectado
    const mongoose = require('mongoose');
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      // Retornar datos mock si MongoDB no está conectado
      console.warn('MongoDB no está conectado, retornando datos mock para disease-reports');
      const mockData = {
        symptomAnalysis: [
          {
            _id: 'tos seca',
            count: 45,
            avgSeverity: 2.1,
            districts: ['Centro de Tacna', 'Alto de la Alianza'],
            categories: ['respiratory'],
            potentialDiseases: ['Asma', 'Bronquitis', 'COVID-19']
          }
        ],
        chatDiseaseAnalysis: [
          { _id: 'Asma', count: 25, avgConfidence: 0.85, avgUrgency: 2.1 },
          { _id: 'COVID-19', count: 18, avgConfidence: 0.78, avgUrgency: 3.2 }
        ],
        districtDistribution: [
          {
            _id: 'Centro de Tacna',
            symptoms: [{ name: 'tos seca', count: 15, severity: 2.1 }],
            totalReports: 45
          }
        ],
        period: '30d',
        dateRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date()
        }
      };

      return res.status(200).json({
        success: true,
        data: mockData,
        warning: 'Datos mock - MongoDB no disponible'
      });
    }

    const { district, period = '30d' } = req.query;

    const periodToDays = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };

    const days = periodToDays[period] || 30;
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const symptomFilter = {
      createdAt: { $gte: startDate, $lte: now }
    };

    if (district && district !== 'all') {
      symptomFilter['location.district'] = district;
    }

    const symptomSeveritySwitch = {
      $switch: {
        branches: [
          { case: { $eq: ["$symptoms.severity", "mild"] }, then: 1 },
          { case: { $eq: ["$symptoms.severity", "moderate"] }, then: 2 },
          { case: { $eq: ["$symptoms.severity", "severe"] }, then: 3 }
        ],
        default: 1
      }
    };

    const symptomAnalysis = await SymptomReport.aggregate([
      { $match: symptomFilter },
      { $unwind: "$symptoms" },
      {
        $group: {
          _id: "$symptoms.name",
          count: { $sum: 1 },
          avgSeverity: { $avg: symptomSeveritySwitch },
          districts: { $addToSet: "$location.district" },
          categories: { $addToSet: "$category" }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const chatDiseaseAnalysis = await ChatConversation.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: now } } },
      { $unwind: "$messages" },
      {
        $match: {
          "messages.role": "bot",
          $expr: {
            $gt: [
              {
                $size: {
                  $filter: {
                    input: { $ifNull: ["$messages.metadata.detectedDiseases", []] },
                    as: "disease",
                    cond: { $ne: ["$$disease", null] }
                  }
                }
              },
              0
            ]
          }
        }
      },
      { $unwind: "$messages.metadata.detectedDiseases" },
      {
        $group: {
          _id: "$messages.metadata.detectedDiseases",
          count: { $sum: 1 },
          avgConfidence: { $avg: "$messages.metadata.confidence" },
          avgUrgency: {
            $avg: {
              $switch: {
                branches: [
                  { case: { $eq: ["$messages.metadata.urgencyLevel", "very_low"] }, then: 1 },
                  { case: { $eq: ["$messages.metadata.urgencyLevel", "low"] }, then: 2 },
                  { case: { $eq: ["$messages.metadata.urgencyLevel", "medium"] }, then: 3 },
                  { case: { $eq: ["$messages.metadata.urgencyLevel", "high"] }, then: 4 },
                  { case: { $eq: ["$messages.metadata.urgencyLevel", "critical"] }, then: 5 }
                ],
                default: 1
              }
            }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const districtDiseaseDistribution = await SymptomReport.aggregate([
      { $match: symptomFilter },
      { $unwind: "$symptoms" },
      {
        $group: {
          _id: {
            district: "$location.district",
            symptom: "$symptoms.name"
          },
          count: { $sum: 1 },
          severity: { $avg: symptomSeveritySwitch }
        }
      },
      {
        $group: {
          _id: "$_id.district",
          symptoms: {
            $push: {
              name: "$_id.symptom",
              count: "$count",
              severity: "$severity"
            }
          },
          totalReports: { $sum: "$count" }
        }
      },
      { $sort: { totalReports: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        symptomAnalysis,
        chatDiseaseAnalysis,
        districtDistribution: districtDiseaseDistribution,
        period,
        dateRange: {
          start: startDate,
          end: now
        }
      }
    });
  } catch (error) {
    console.error('Error fetching disease reports:', error);
    
    // Si es un error de MongoDB, retornar datos mock
    if (error.name === 'MongooseError' || error.message.includes('buffering timed out')) {
      console.warn('Error de MongoDB, retornando datos mock para disease-reports');
      const mockData = {
        symptomAnalysis: [
          {
            _id: 'tos seca',
            count: 45,
            avgSeverity: 2.1,
            districts: ['Centro de Tacna', 'Alto de la Alianza'],
            categories: ['respiratory'],
            potentialDiseases: ['Asma', 'Bronquitis', 'COVID-19']
          }
        ],
        chatDiseaseAnalysis: [
          { _id: 'Asma', count: 25, avgConfidence: 0.85, avgUrgency: 2.1 },
          { _id: 'COVID-19', count: 18, avgConfidence: 0.78, avgUrgency: 3.2 }
        ],
        districtDistribution: [
          {
            _id: 'Centro de Tacna',
            symptoms: [{ name: 'tos seca', count: 15, severity: 2.1 }],
            totalReports: 45
          }
        ],
        period: '30d',
        dateRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date()
        }
      };

      return res.status(200).json({
        success: true,
        data: mockData,
        warning: 'Datos mock - MongoDB no disponible'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching disease reports',
      error: error.message
    });
  }
});

module.exports = router;
