const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

// Import routes and middleware
const emailRoutes = require('./routes/email');
const notionRoutes = require('./routes/notion');
const { generalLimiter } = require('./middleware/rateLimit');
const { sanitizeInput } = require('./middleware/validation');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost origins for development
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174'
    ];
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // In production, you might want to restrict this further
    if (process.env.NODE_ENV === 'production') {
      return callback(new Error('Not allowed by CORS'));
    }
    
    // For development, allow any localhost origin
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Apply general rate limiting to all routes
app.use(generalLimiter);

// Global sanitization middleware
app.use(sanitizeInput);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Email API Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/email', emailRoutes);
app.use('/api/notion', notionRoutes);

// Service statistics endpoint (protected)
app.get('/api/admin/stats', (req, res) => {
  // Basic protection for stats endpoint
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.ADMIN_TOKEN}`) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized'
    });
  }

  const mailTMService = require('./services/mailtm');
  const stats = mailTMService.getStats();
  
  res.json({
    success: true,
    data: stats
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found'
  });
});

// Global error handling middleware
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  // Rate limit errors
  if (error.status === 429) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests',
      details: 'Please slow down and try again later'
    });
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.message
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Email API Server running on port ${PORT}`);
  console.log(`📧 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
  console.log(`📋 Available endpoints:`);
  console.log(`\n   📧 Email API:`);
  console.log(`   POST   /api/email/generate - Create new email account`);
  console.log(`   GET    /api/email/:address/inbox - Get inbox messages`);
  console.log(`   GET    /api/email/:address/message/:id - Get specific message`);
  console.log(`   DELETE /api/email/:address - Delete account`);
  console.log(`\n   📝 Notion API:`);
  console.log(`   GET    /api/notion/health - Check Notion configuration`);
  console.log(`   POST   /api/notion/posts - Create new post`);
  console.log(`   GET    /api/notion/posts - List all posts`);
  console.log(`   GET    /api/notion/posts/:id - Get specific post`);
  console.log(`   PUT    /api/notion/posts/:id - Update post`);
  console.log(`   DELETE /api/notion/posts/:id - Delete post`);
  console.log(`\n   🏥 System:`);
  console.log(`   GET    /api/health - Health check\n`);
});