/**
 * Symptom Reports Routes
 * API endpoints for symptom reporting and heatmap data
 */

const express = require('express');
const router = express.Router();

// Controllers will be loaded dynamically to avoid mongoose connection issues
let SymptomReport;

// Initialize mongoose connection
const initializeModel = () => {
  if (!SymptomReport) {
    try {
      const mongoose = require('mongoose');
      // Only connect if not already connected
      if (mongoose.connection.readyState === 0) {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://mongodb:27017/respicare';
        mongoose.connect(mongoUri, {
          useNewUrlParser: true,
          useUnifiedTopology: true
        }).then(() => {
          console.log('✅ MongoDB connected for symptom reports');
        }).catch(err => {
          console.error('❌ MongoDB connection error:', err.message);
        });
      }
      SymptomReport = require('../models/SymptomReport');
    } catch (error) {
      console.error('Error loading SymptomReport model:', error);
    }
  }
  return SymptomReport;
};

/**
 * @route   GET /api/symptom-reports
 * @desc    Get all symptom reports with optional filters
 * @access  Public
 * @query   district, severity, startDate, endDate, limit
 */
router.get('/', async (req, res) => {
  try {
    const Model = initializeModel();
    if (!Model) {
      return res.status(503).json({
        success: false,
        message: 'Database not available',
        data: []
      });
    }

    const {
      district,
      severity,
      startDate,
      endDate,
      limit = 100,
      status
    } = req.query;

    // Build query
    const query = {};
    if (district) query['location.district'] = district;
    if (severity) query.overallSeverity = severity;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const reports = await Model.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('-contactInfo -patientId'); // Exclude sensitive data

    res.json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    console.error('Error fetching symptom reports:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching symptom reports',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/symptom-reports/heatmap
 * @desc    Get aggregated data for heatmap visualization
 * @access  Public
 * @query   startDate, endDate
 */
router.get('/heatmap', async (req, res) => {
  try {
    const Model = initializeModel();
    if (!Model) {
      // Return mock data if database not available
      return res.json({
        success: true,
        message: 'Using mock data (database not connected)',
        data: getMockHeatmapData()
      });
    }

    const { startDate, endDate } = req.query;

    const aggregatedData = await Model.getAggregatedByDistrict({
      startDate,
      endDate
    });

    res.json({
      success: true,
      count: aggregatedData.length,
      data: aggregatedData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching heatmap data:', error);
    
    // Return mock data on error
    res.json({
      success: true,
      message: 'Using mock data due to error',
      data: getMockHeatmapData(),
      error: error.message
    });
  }
});

/**
 * @route   GET /api/symptom-reports/statistics
 * @desc    Get statistics about symptom reports
 * @access  Public
 */
router.get('/statistics', async (req, res) => {
  try {
    const Model = initializeModel();
    if (!Model) {
      return res.json({
        success: true,
        message: 'Using mock statistics',
        data: getMockStatistics()
      });
    }

    const { startDate, endDate } = req.query;
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const query = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

    const [
      totalReports,
      highSeverityCount,
      mediumSeverityCount,
      lowSeverityCount,
      urgentCount,
      categoryStats
    ] = await Promise.all([
      Model.countDocuments(query),
      Model.countDocuments({ ...query, overallSeverity: 'high' }),
      Model.countDocuments({ ...query, overallSeverity: 'medium' }),
      Model.countDocuments({ ...query, overallSeverity: 'low' }),
      Model.countDocuments({ ...query, status: 'urgent' }),
      Model.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      data: {
        total: totalReports,
        bySeverity: {
          high: highSeverityCount,
          medium: mediumSeverityCount,
          low: lowSeverityCount
        },
        urgent: urgentCount,
        byCategory: categoryStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/symptom-reports/:id
 * @desc    Get a specific symptom report
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const Model = initializeModel();
    if (!Model) {
      return res.status(503).json({
        success: false,
        message: 'Database not available'
      });
    }

    const report = await Model.findById(req.params.id)
      .select('-contactInfo -patientId'); // Exclude sensitive data

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Symptom report not found'
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error fetching symptom report:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching symptom report',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/symptom-reports
 * @desc    Create a new symptom report
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const Model = initializeModel();
    if (!Model) {
      return res.status(503).json({
        success: false,
        message: 'Database not available'
      });
    }

    // Validate required fields
    const { location, symptoms, category } = req.body;
    
    if (!location || !location.district || !location.coordinates) {
      return res.status(400).json({
        success: false,
        message: 'Location data is required'
      });
    }

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one symptom is required'
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category is required'
      });
    }

    // Create new report
    const report = new Model(req.body);
    
    // Calculate severity
    report.calculateSeverity();
    
    // Save to database
    await report.save();

    res.status(201).json({
      success: true,
      message: 'Symptom report created successfully',
      data: report
    });
  } catch (error) {
    console.error('Error creating symptom report:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating symptom report',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/symptom-reports/:id
 * @desc    Update a symptom report (for medical staff)
 * @access  Public (should be protected in production)
 */
router.put('/:id', async (req, res) => {
  try {
    const Model = initializeModel();
    if (!Model) {
      return res.status(503).json({
        success: false,
        message: 'Database not available'
      });
    }

    const report = await Model.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Symptom report not found'
      });
    }

    res.json({
      success: true,
      message: 'Symptom report updated successfully',
      data: report
    });
  } catch (error) {
    console.error('Error updating symptom report:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating symptom report',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/symptom-reports/:id
 * @desc    Delete a symptom report
 * @access  Public (should be protected in production)
 */
router.delete('/:id', async (req, res) => {
  try {
    const Model = initializeModel();
    if (!Model) {
      return res.status(503).json({
        success: false,
        message: 'Database not available'
      });
    }

    const report = await Model.findByIdAndDelete(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Symptom report not found'
      });
    }

    res.json({
      success: true,
      message: 'Symptom report deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting symptom report:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting symptom report',
      error: error.message
    });
  }
});

// Mock data functions
function getMockHeatmapData() {
  return [
    {
      district: 'Centro de Tacna',
      totalCases: 45,
      highSeverity: 12,
      mediumSeverity: 20,
      lowSeverity: 13,
      coordinates: { latitude: -18.0056, longitude: -70.2444 },
      severity: 'high'
    },
    {
      district: 'Gregorio Albarracín',
      totalCases: 32,
      highSeverity: 8,
      mediumSeverity: 15,
      lowSeverity: 9,
      coordinates: { latitude: -18.0300, longitude: -70.2500 },
      severity: 'medium'
    },
    {
      district: 'Ciudad Nueva',
      totalCases: 28,
      highSeverity: 6,
      mediumSeverity: 14,
      lowSeverity: 8,
      coordinates: { latitude: -18.0120, longitude: -70.2300 },
      severity: 'medium'
    },
    {
      district: 'Pocollay',
      totalCases: 15,
      highSeverity: 2,
      mediumSeverity: 7,
      lowSeverity: 6,
      coordinates: { latitude: -17.9950, longitude: -70.2100 },
      severity: 'low'
    },
    {
      district: 'Alto de la Alianza',
      totalCases: 38,
      highSeverity: 10,
      mediumSeverity: 18,
      lowSeverity: 10,
      coordinates: { latitude: -17.9700, longitude: -70.2400 },
      severity: 'high'
    },
    {
      district: 'Calana',
      totalCases: 12,
      highSeverity: 1,
      mediumSeverity: 5,
      lowSeverity: 6,
      coordinates: { latitude: -17.9600, longitude: -70.1950 },
      severity: 'low'
    },
    {
      district: 'Pachia',
      totalCases: 8,
      highSeverity: 1,
      mediumSeverity: 3,
      lowSeverity: 4,
      coordinates: { latitude: -17.9200, longitude: -70.1850 },
      severity: 'low'
    },
    {
      district: 'Boca del Río',
      totalCases: 25,
      highSeverity: 5,
      mediumSeverity: 12,
      lowSeverity: 8,
      coordinates: { latitude: -18.0400, longitude: -70.2800 },
      severity: 'medium'
    }
  ];
}

function getMockStatistics() {
  return {
    total: 203,
    bySeverity: {
      high: 45,
      medium: 94,
      low: 64
    },
    urgent: 15,
    byCategory: {
      respiratory: 120,
      fever: 65,
      pain: 45,
      digestive: 12,
      fatigue: 35,
      neurological: 8
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = router;

