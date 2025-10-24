const express = require('express');
const router = express.Router();
const SymptomReport = require('../models/SymptomReport');
const ChatConversation = require('../models/ChatConversation');

// GET /api/analytics/temporal-trends - Get temporal trends data
router.get('/temporal-trends', async (req, res) => {
  try {
    const { period = '30d', district, category } = req.body;
    
    // Calculate date range based on period
    const now = new Date();
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Build filter
    const filter = {
      reportedAt: { $gte: startDate }
    };
    if (district) filter['location.district'] = district;
    if (category) filter.category = category;

    // Aggregate by day with timeout
    const dailyTrends = await SymptomReport.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$reportedAt" } },
            severity: "$severityLevel"
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.date",
          data: {
            $push: {
              severity: "$_id.severity",
              count: "$count"
            }
          },
          total: { $sum: "$count" }
        }
      },
      { $sort: { _id: 1 } }
    ]).maxTimeMS(8000);

    // Aggregate by week
    const weeklyTrends = await SymptomReport.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: "$reportedAt" },
            week: { $week: "$reportedAt" }
          },
          count: { $sum: 1 },
          avgSeverity: { $avg: {
            $switch: {
              branches: [
                { case: { $eq: ["$severityLevel", "low"] }, then: 1 },
                { case: { $eq: ["$severityLevel", "medium"] }, then: 2 },
                { case: { $eq: ["$severityLevel", "high"] }, then: 3 }
              ],
              default: 1
            }
          }}
        }
      },
      { $sort: { "_id.year": 1, "_id.week": 1 } }
    ]);

    // Get top symptoms over time
    const topSymptoms = await SymptomReport.aggregate([
      { $match: filter },
      { $unwind: "$symptoms" },
      {
        $group: {
          _id: {
            symptom: "$symptoms.name",
            date: { $dateToString: { format: "%Y-%m-%d", date: "$reportedAt" } }
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.symptom",
          totalCount: { $sum: "$count" },
          dailyData: {
            $push: {
              date: "$_id.date",
              count: "$count"
            }
          }
        }
      },
      { $sort: { totalCount: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        dailyTrends,
        weeklyTrends,
        topSymptoms,
        period,
        dateRange: {
          start: startDate,
          end: now
        }
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

// GET /api/analytics/disease-reports - Get reports by disease type
router.get('/disease-reports', async (req, res) => {
  try {
    const { period = '30d', district } = req.body;
    
    // Calculate date range
    const now = new Date();
    const startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const filter = {
      reportedAt: { $gte: startDate }
    };
    if (district) filter['location.district'] = district;

    // Analyze symptoms to detect potential diseases
    const diseaseAnalysis = await SymptomReport.aggregate([
      { $match: filter },
      { $unwind: "$symptoms" },
      {
        $group: {
          _id: "$symptoms.name",
          count: { $sum: 1 },
          avgSeverity: { $avg: {
            $switch: {
              branches: [
                { case: { $eq: ["$symptoms.severity", "low"] }, then: 1 },
                { case: { $eq: ["$symptoms.severity", "moderate"] }, then: 2 },
                { case: { $eq: ["$symptoms.severity", "high"] }, then: 3 },
                { case: { $eq: ["$symptoms.severity", "severe"] }, then: 4 }
              ],
              default: 1
            }
          }},
          districts: { $addToSet: "$location.district" },
          categories: { $addToSet: "$category" }
        }
      },
      {
        $addFields: {
          // Map symptoms to potential diseases
          potentialDiseases: {
            $switch: {
              branches: [
                { 
                  case: { $regexMatch: { input: "$_id", regex: /tos|respir|asma/i } },
                  then: ["Asma", "Bronquitis", "COVID-19", "Gripe"]
                },
                { 
                  case: { $regexMatch: { input: "$_id", regex: /fiebre|temperatura/i } },
                  then: ["COVID-19", "Gripe", "Neumonía", "Bronquitis"]
                },
                { 
                  case: { $regexMatch: { input: "$_id", regex: /dificultad|ahogo|falta/i } },
                  then: ["Asma", "EPOC", "Neumonía", "COVID-19"]
                },
                { 
                  case: { $regexMatch: { input: "$_id", regex: /dolor.*pecho|opresión/i } },
                  then: ["Neumonía", "COVID-19", "Asma"]
                },
                { 
                  case: { $regexMatch: { input: "$_id", regex: /sibilancias|silbido/i } },
                  then: ["Asma", "Bronquitis", "EPOC"]
                }
              ],
              default: ["Síntoma General"]
            }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get disease patterns from chat conversations
    const chatDiseaseAnalysis = await ChatConversation.aggregate([
      {
        $unwind: "$messages"
      },
      {
        $match: {
          "messages.role": "bot",
          "messages.metadata.detectedDiseases": { $exists: true, $ne: [] }
        }
      },
      {
        $unwind: "$messages.metadata.detectedDiseases"
      },
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

    // Get district-wise disease distribution
    const districtDiseaseDistribution = await SymptomReport.aggregate([
      { $match: filter },
      { $unwind: "$symptoms" },
      {
        $group: {
          _id: {
            district: "$location.district",
            symptom: "$symptoms.name"
          },
          count: { $sum: 1 },
          severity: { $avg: {
            $switch: {
              branches: [
                { case: { $eq: ["$symptoms.severity", "low"] }, then: 1 },
                { case: { $eq: ["$symptoms.severity", "moderate"] }, then: 2 },
                { case: { $eq: ["$symptoms.severity", "high"] }, then: 3 },
                { case: { $eq: ["$symptoms.severity", "severe"] }, then: 4 }
              ],
              default: 1
            }
          }}
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
        symptomAnalysis: diseaseAnalysis,
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
    res.status(500).json({
      success: false,
      message: 'Error fetching disease reports',
      error: error.message
    });
  }
});

// GET /api/analytics/dashboard - Get comprehensive dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get basic statistics with timeout handling
    const [
      totalReports,
      recentReports,
      urgentReports,
      totalConversations,
      recentConversations
    ] = await Promise.all([
      SymptomReport.countDocuments().maxTimeMS(5000),
      SymptomReport.countDocuments({ reportedAt: { $gte: last7Days } }).maxTimeMS(5000),
      SymptomReport.countDocuments({ status: 'urgent' }).maxTimeMS(5000),
      ChatConversation.countDocuments().maxTimeMS(5000),
      ChatConversation.countDocuments({ startTime: { $gte: last7Days } }).maxTimeMS(5000)
    ]);

    // Get severity distribution with timeout
    const severityDistribution = await SymptomReport.aggregate([
      { $group: { _id: "$severityLevel", count: { $sum: 1 } } }
    ]).maxTimeMS(5000);

    // Get category distribution with timeout
    const categoryDistribution = await SymptomReport.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]).maxTimeMS(5000);

    // Get top districts with timeout
    const topDistricts = await SymptomReport.aggregate([
      {
        $group: {
          _id: "$location.district",
          count: { $sum: 1 },
          avgSeverity: { $avg: {
            $switch: {
              branches: [
                { case: { $eq: ["$severityLevel", "low"] }, then: 1 },
                { case: { $eq: ["$severityLevel", "medium"] }, then: 2 },
                { case: { $eq: ["$severityLevel", "high"] }, then: 3 }
              ],
              default: 1
            }
          }}
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]).maxTimeMS(5000);

    // Get recent activity with timeout
    const recentActivity = await SymptomReport.find()
      .sort({ reportedAt: -1 })
      .limit(10)
      .select('location.district symptoms severityLevel reportedAt category')
      .maxTimeMS(5000);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalReports,
          recentReports,
          urgentReports,
          totalConversations,
          recentConversations
        },
        distributions: {
          severity: severityDistribution,
          category: categoryDistribution
        },
        topDistricts,
        recentActivity,
        lastUpdated: now
      }
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

module.exports = router;
