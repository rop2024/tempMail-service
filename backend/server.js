const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const MAILTM_BASE_URL = process.env.MAILTM_BASE_URL || 'https://api.mail.tm';

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
    timestamp: new Date().toISOString()
  });
});

// Mail.tm API proxy endpoints
app.get('/api/domains', async (req, res) => {
  try {
    const response = await axios.get(`${MAILTM_BASE_URL}/domains`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ 
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
        error: 'Address and password are required' 
      });
    }

    const response = await axios.post(`${MAILTM_BASE_URL}/accounts`, {
      address,
      password
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to create account',
      details: error.response?.data || error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 Mail.tm API base: ${MAILTM_BASE_URL}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});