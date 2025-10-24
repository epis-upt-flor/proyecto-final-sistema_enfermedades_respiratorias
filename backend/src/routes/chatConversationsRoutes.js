/**
 * Chat Conversations Routes
 * API endpoints for chatbot conversations
 */

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Controllers will be loaded dynamically
let ChatConversation;

// Initialize mongoose connection
const initializeModel = () => {
  if (!ChatConversation) {
    try {
      const mongoose = require('mongoose');
      // Only connect if not already connected
      if (mongoose.connection.readyState === 0) {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://mongodb:27017/respicare';
        mongoose.connect(mongoUri, {
          useNewUrlParser: true,
          useUnifiedTopology: true
        }).then(() => {
          console.log('✅ MongoDB connected for chat conversations');
        }).catch(err => {
          console.error('❌ MongoDB connection error:', err.message);
        });
      }
      ChatConversation = require('../models/ChatConversation');
    } catch (error) {
      console.error('Error loading ChatConversation model:', error);
    }
  }
  return ChatConversation;
};

/**
 * @route   POST /api/chat-conversations
 * @desc    Create a new chat conversation (start session)
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

    const { userId, userInfo, location, metadata } = req.body;
    
    // Generate session ID
    const sessionId = uuidv4();
    
    // Create new conversation
    const conversation = new Model({
      sessionId,
      userId,
      userInfo,
      location: {
        ...location,
        city: 'Tacna',
        country: 'Perú'
      },
      metadata: {
        ...metadata,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });
    
    await conversation.save();

    res.status(201).json({
      success: true,
      message: 'Chat conversation created',
      data: {
        sessionId: conversation.sessionId,
        _id: conversation._id
      }
    });
  } catch (error) {
    console.error('Error creating chat conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating chat conversation',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/chat-conversations/:sessionId/messages
 * @desc    Add a message to a conversation
 * @access  Public
 */
router.post('/:sessionId/messages', async (req, res) => {
  try {
    const Model = initializeModel();
    if (!Model) {
      return res.status(503).json({
        success: false,
        message: 'Database not available'
      });
    }

    const { sessionId } = req.params;
    const { role, content, metadata } = req.body;
    
    if (!role || !content) {
      return res.status(400).json({
        success: false,
        message: 'Role and content are required'
      });
    }
    
    const conversation = await Model.findOne({ sessionId });
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    // Add message
    conversation.addMessage(role, content, metadata || {});
    await conversation.save();

    res.json({
      success: true,
      message: 'Message added',
      data: {
        messageCount: conversation.messages.length,
        lastMessage: conversation.messages[conversation.messages.length - 1]
      }
    });
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding message',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/chat-conversations/:sessionId
 * @desc    Get a conversation by session ID
 * @access  Public
 */
router.get('/:sessionId', async (req, res) => {
  try {
    const Model = initializeModel();
    if (!Model) {
      return res.status(503).json({
        success: false,
        message: 'Database not available'
      });
    }

    const { sessionId } = req.params;
    
    const conversation = await Model.findOne({ sessionId });
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversation',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/chat-conversations
 * @desc    Get conversations with filters
 * @access  Public
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
      userId,
      status,
      urgency,
      limit = 50,
      includeMessages = 'false'
    } = req.query;

    // Build query
    const query = {};
    if (userId) query.userId = userId;
    if (status) query.status = status;
    if (urgency) query['summary.highestUrgency'] = urgency;

    let conversationsQuery = Model.find(query)
      .sort({ lastActivityAt: -1 })
      .limit(parseInt(limit));
    
    // Optionally exclude messages for performance
    if (includeMessages === 'false') {
      conversationsQuery = conversationsQuery.select('-messages');
    }

    const conversations = await conversationsQuery;

    res.json({
      success: true,
      count: conversations.length,
      data: conversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/chat-conversations/:sessionId/complete
 * @desc    Mark a conversation as completed
 * @access  Public
 */
router.put('/:sessionId/complete', async (req, res) => {
  try {
    const Model = initializeModel();
    if (!Model) {
      return res.status(503).json({
        success: false,
        message: 'Database not available'
      });
    }

    const { sessionId } = req.params;
    
    const conversation = await Model.findOne({ sessionId });
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    conversation.complete();
    await conversation.save();

    res.json({
      success: true,
      message: 'Conversation marked as completed',
      data: {
        sessionId: conversation.sessionId,
        status: conversation.status,
        completedAt: conversation.completedAt
      }
    });
  } catch (error) {
    console.error('Error completing conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing conversation',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/chat-conversations/statistics/summary
 * @desc    Get conversation statistics
 * @access  Public
 */
router.get('/statistics/summary', async (req, res) => {
  try {
    const Model = initializeModel();
    if (!Model) {
      return res.status(503).json({
        success: false,
        message: 'Database not available',
        data: getMockStatistics()
      });
    }

    const { startDate, endDate } = req.query;
    
    const stats = await Model.getStatistics({ startDate, endDate });

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
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
 * @route   GET /api/chat-conversations/urgent/list
 * @desc    Get urgent conversations (high/critical urgency)
 * @access  Public
 */
router.get('/urgent/list', async (req, res) => {
  try {
    const Model = initializeModel();
    if (!Model) {
      return res.status(503).json({
        success: false,
        message: 'Database not available',
        data: []
      });
    }

    const conversations = await Model.getUrgent();

    res.json({
      success: true,
      count: conversations.length,
      data: conversations
    });
  } catch (error) {
    console.error('Error fetching urgent conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching urgent conversations',
      error: error.message
    });
  }
});

// Mock data functions
function getMockStatistics() {
  return {
    totalConversations: 0,
    activeConversations: 0,
    completedConversations: 0,
    urgentConversations: 0,
    totalMessages: 0,
    avgMessagesPerConversation: 0,
    avgConfidence: 0
  };
}

module.exports = router;

