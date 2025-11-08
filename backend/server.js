const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const axios = require('axios');
require('dotenv').config();

const mailTMService = require('./services/mailtm');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
}));
app.use(morgan('combined'));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    service: 'Mail.tm Integration API'
  });
});

// Service statistics (for debugging)
app.get('/api/stats', (req, res) => {
  const stats = mailTMService.getStats();
  res.json({
    success: true,
    data: stats
  });
});

// Mail.tm API proxy endpoints
app.get('/api/domains', async (req, res) => {
  try {
    const response = await axios.get('https://api.mail.tm/domains');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch domains',
      details: error.message
    });
  }
});

// Create account endpoint
app.post('/api/accounts', async (req, res) => {
  try {
    const { address, password } = req.body;

    if (!address || !password) {
      return res.status(400).json({
        success: false,
        error: 'Address and password are required'
      });
    }

    const result = await mailTMService.createAccount(address, password);

    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        details: result.details
      });
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create account',
      details: error.message
    });
  }
});

// Get messages for account
app.get('/api/accounts/:accountId/messages', async (req, res) => {
  try {
    const { accountId } = req.params;

    const result = await mailTMService.fetchMessagesForAddress(accountId);

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        details: result.details
      });
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages',
      details: error.message
    });
  }
});

// Get specific message
app.get('/api/accounts/:accountId/messages/:messageId', async (req, res) => {
  try {
    const { accountId, messageId } = req.params;

    const result = await mailTMService.fetchMessageById(accountId, messageId);

    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        details: result.details
      });
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch message',
      details: error.message
    });
  }
});

// Delete account
app.delete('/api/accounts/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;

    const result = await mailTMService.deleteAccount(accountId);

    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        details: result.details
      });
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete account',
      details: error.message
    });
  }
});

// Get account info
app.get('/api/accounts/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;

    const result = await mailTMService.getAccountInfo(accountId);

    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        details: result.details
      });
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch account info',
      details: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 Mail.tm Service initialized`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
});