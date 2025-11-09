# TempMail Clone - Architecture Documentation

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Backend Architecture](#backend-architecture)
5. [Frontend Architecture](#frontend-architecture)
6. [API Design](#api-design)
7. [Security](#security)
8. [Deployment](#deployment)
9. [Future Enhancements](#future-enhancements)

---

## Overview

This is a temporary email service application that allows users to create disposable email addresses for receiving emails without using their personal email. The application integrates with the Mail.tm API to provide email services.

### Key Features
- 🎯 **Anonymous Email Creation**: Generate temporary email addresses without registration
- 📬 **Real-time Inbox**: View incoming emails instantly
- 📎 **Attachment Support**: Download email attachments
- 🔄 **Auto-refresh**: Automatic polling for new messages
- 🗑️ **Account Deletion**: Clean up temporary accounts when done
- 🎨 **Modern UI**: Responsive design with Tailwind CSS

---

## System Architecture

### High-Level Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│                 │         │                  │         │                 │
│  Web Browser    │◄────────┤  Express.js      │◄────────┤   Mail.tm       │
│  (Frontend)     │         │  Backend Server  │         │   API Service   │
│  Vite + Vanilla │   HTTP  │                  │   HTTP  │                 │
│     JS          │         │  Port: 3000      │         │  mail.tm        │
│                 │         │                  │         │                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
       │                            │
       │                            │
       ▼                            ▼
  Port: 5173/5174           ┌────────────────┐
  Development Server        │   In-Memory    │
                           │   Account      │
                           │   Storage      │
                           └────────────────┘
```

### Component Architecture

```
┌────────────────────────────────────────────────────────────┐
│                     Frontend Layer                         │
├────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │   Header     │  │   Footer     │  │   Main App      │ │
│  │  Component   │  │  Component   │  │   Controller    │ │
│  └──────────────┘  └──────────────┘  └─────────────────┘ │
│                                                            │
│  ┌──────────────────────┐  ┌──────────────────────────┐  │
│  │  Email Generator     │  │    Inbox View            │  │
│  │    Component         │  │    Component             │  │
│  └──────────────────────┘  └──────────────────────────┘  │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │            API Service Layer                         │ │
│  │  (Fetch API + Caching + Error Handling)             │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST
                            ▼
┌────────────────────────────────────────────────────────────┐
│                     Backend Layer                          │
├────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐ │
│  │              Express.js Server                       │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │   CORS       │  │  Rate Limit  │  │  Validation    │ │
│  │  Middleware  │  │  Middleware  │  │  Middleware    │ │
│  └──────────────┘  └──────────────┘  └────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │              API Routes Layer                        │ │
│  │  /email/generate, /email/:address/inbox, etc.       │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │           MailTM Service Layer                       │ │
│  │  (Axios Client + Token Management)                   │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/REST
                            ▼
                    ┌────────────────┐
                    │   Mail.tm API  │
                    │   Service      │
                    └────────────────┘
```

---

## Technology Stack

### Backend
- **Runtime**: Node.js (v14+)
- **Framework**: Express.js 4.18.2
- **HTTP Client**: Axios 1.6.0
- **Middleware**:
  - `cors`: Cross-Origin Resource Sharing
  - `express-rate-limit`: Rate limiting
  - `express-validator`: Input validation
  - `morgan`: HTTP request logger
- **Environment**: dotenv for configuration

### Frontend
- **Build Tool**: Vite 5.0.8
- **Language**: Vanilla JavaScript (ES6+)
- **CSS Framework**: Tailwind CSS 3.4.0
- **HTTP Client**: Fetch API (native)
- **Code Quality**: ESLint 8.57.1

### External Services
- **Email Service**: Mail.tm API (https://api.mail.tm)

---

## Backend Architecture

### Directory Structure

```
backend/
├── server.js              # Main server entry point
├── package.json           # Dependencies and scripts
├── .env                   # Environment configuration
├── middleware/
│   ├── rateLimit.js      # Rate limiting configurations
│   └── validation.js     # Input validation middleware
├── routes/
│   └── email.js          # Email-related API routes
└── services/
    └── mailtm.js         # Mail.tm API integration service
```

### Core Components

#### 1. **Server (server.js)**
- Express application setup
- Middleware configuration (CORS, body parser, rate limiting)
- Route mounting
- Error handling
- Health check endpoint

#### 2. **Routes Layer (routes/email.js)**
Handles HTTP endpoints:
- `POST /api/email/generate` - Create new email account
- `GET /api/email/domains` - Get available domains
- `GET /api/email/:address/inbox` - Get inbox messages
- `GET /api/email/:address/message/:id` - Get specific message
- `GET /api/email/:address/info` - Get account info
- `GET /api/email/:address/message/:messageId/attachment/:attachmentId` - Download attachment
- `DELETE /api/email/:address` - Delete account

#### 3. **Service Layer (services/mailtm.js)**
- Axios instance with Mail.tm API configuration
- Token management and authentication
- Account lifecycle management
- Message fetching and parsing
- Attachment download handling
- Statistics tracking

#### 4. **Middleware**

##### Rate Limiting (middleware/rateLimit.js)
```javascript
- General Limiter: 100 requests per 15 minutes
- Account Creation: 5 accounts per hour
- Message Fetching: 30 requests per minute
```

##### Validation (middleware/validation.js)
- Email address format validation
- Password strength requirements
- Input sanitization
- Parameter validation

### API Integration Flow

```
User Request
    │
    ▼
Express Route Handler
    │
    ▼
Validation Middleware
    │
    ▼
Rate Limit Middleware
    │
    ▼
Service Layer (MailTM)
    │
    ▼
Axios HTTP Request
    │
    ▼
Mail.tm API
    │
    ▼
Response Processing
    │
    ▼
JSON Response to Client
```

---

## Frontend Architecture

### Directory Structure

```
frontend/
├── index.html            # Main HTML entry point
├── main.js              # Simple fallback implementation
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── eslint.config.js     # ESLint configuration
├── style.css            # Global styles
└── src/
    ├── main.js          # Application entry point
    ├── components/
    │   ├── header.js         # Header component
    │   ├── footer.js         # Footer component
    │   ├── EmailCreator.js   # Email creation form
    │   ├── emailGenerator.js # Alternative email generator
    │   ├── inboxView.js      # Inbox display component
    │   ├── Inbox.js          # Alternative inbox component
    │   └── messageView.js    # Message detail modal
    ├── services/
    │   └── pollingService.js # Auto-refresh service
    ├── utils/
    │   └── api.js           # API client utilities
    └── styles/
        └── main.css         # Component styles
```

### Component Architecture

#### 1. **Main Application (src/main.js)**
- Application initialization
- Route management
- Global event handling
- State management
- View coordination

#### 2. **Components**

##### Header Component
- Navigation
- Branding
- View switching

##### Email Creator Component
- Domain selection
- Username input
- Password generation
- Account creation form

##### Inbox View Component
- Message list display
- Message status indicators
- Refresh functionality
- Account information
- Account deletion

##### Message View Component
- Message detail modal
- HTML/text rendering
- Attachment display
- Download functionality

#### 3. **Services**

##### API Service (utils/api.js)
```javascript
Core Functions:
- generateEmail()      # Create account
- getDomains()         # Fetch domains
- getMessages()        # Fetch inbox
- getMessage()         # Get message details
- deleteAccount()      # Delete account
- downloadAttachment() # Download file
- checkAccountStatus() # Verify account
- healthCheck()        # Server health
```

Features:
- Request caching
- Error handling
- Timeout management
- Response formatting

##### Polling Service (services/pollingService.js)
- Automatic inbox refresh
- Configurable intervals
- Multiple account support
- Callback management
- Start/stop controls

### State Management

```javascript
Application State:
├── currentView ('generator' | 'inbox')
├── currentAccount
│   ├── id
│   ├── address
│   ├── token
│   └── createdAt
├── messages []
└── domains []
```

### UI/UX Flow

```
Landing Page
    │
    ▼
Email Generator View
    │
    ├─► Select Domain
    ├─► Enter Username
    ├─► Generate Password
    └─► Create Account
        │
        ▼
    Inbox View
        │
        ├─► View Messages
        ├─► Open Message Detail
        ├─► Download Attachments
        ├─► Refresh Inbox
        └─► Delete Account
            │
            ▼
        Return to Generator
```

---

## API Design

### RESTful Endpoints

#### 1. Create Email Account
```
POST /api/email/generate
Content-Type: application/json

Request:
{
  "address": "user@domain.com",
  "password": "securePassword123"
}

Response (201):
{
  "success": true,
  "data": {
    "id": "account_id",
    "address": "user@domain.com",
    "token": "jwt_token"
  },
  "message": "Email account created successfully"
}
```

#### 2. Get Available Domains
```
GET /api/email/domains

Response (200):
{
  "success": true,
  "data": {
    "@context": "/contexts/Domain",
    "hydra:member": [...]
  },
  "domains": [
    {
      "id": "domain_id",
      "domain": "2200freefonts.com",
      "isActive": true,
      "isPrivate": false
    }
  ],
  "total": 1
}
```

#### 3. Get Inbox Messages
```
GET /api/email/:address/inbox

Response (200):
{
  "success": true,
  "data": {
    "address": "user@domain.com",
    "messages": [...],
    "total": 5,
    "unread": 2
  }
}
```

#### 4. Get Message Details
```
GET /api/email/:address/message/:id

Response (200):
{
  "success": true,
  "data": {
    "address": "user@domain.com",
    "message": {
      "id": "message_id",
      "from": {...},
      "to": [...],
      "subject": "Message subject",
      "text": "Plain text content",
      "html": "<html>HTML content</html>",
      "attachments": [...]
    }
  }
}
```

#### 5. Download Attachment
```
GET /api/email/:address/message/:messageId/attachment/:attachmentId

Response (200):
Binary file stream with appropriate headers
```

#### 6. Delete Account
```
DELETE /api/email/:address

Response (200):
{
  "success": true,
  "data": {},
  "message": "Email account deleted successfully"
}
```

### Error Responses

```javascript
Standard Error Format:
{
  "success": false,
  "error": "Error message",
  "details": "Additional context"
}

Common Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 422: Unprocessable Entity
- 429: Too Many Requests
- 500: Internal Server Error
```

---

## Security

### Backend Security Measures

1. **Rate Limiting**
   - Prevents abuse and DDoS attacks
   - Different limits for different endpoints
   - Account creation strictly limited

2. **Input Validation**
   - Email format validation
   - Password complexity requirements
   - Parameter sanitization
   - XSS prevention

3. **CORS Configuration**
   - Whitelist specific origins
   - Development and production environments
   - Credentials support

4. **Environment Variables**
   - Sensitive data in .env
   - No hardcoded secrets
   - Configurable endpoints

### Frontend Security Measures

1. **XSS Prevention**
   - HTML escaping for user content
   - Safe DOM manipulation
   - Content sanitization

2. **CSRF Protection**
   - Stateless JWT tokens
   - No cookie-based sessions

3. **Secure Communication**
   - HTTPS in production
   - API timeout handling
   - Error message sanitization

### Data Privacy

- **No Persistent Storage**: All account data stored in memory
- **Automatic Cleanup**: Accounts expire naturally
- **No Tracking**: No user analytics or tracking
- **Temporary Nature**: Emphasizes disposable email addresses

---

## Deployment

### Development Environment

#### Backend
```bash
cd backend
npm install
cp .env.example .env
npm start
```

Server runs on: `http://localhost:3000`

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

Development server: `http://localhost:5173` or `http://localhost:5174`

### Environment Variables

#### Backend (.env)
```env
PORT=3000
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
MAIL_TM_BASE_URL=https://api.mail.tm
ADMIN_TOKEN=your_admin_token
```

### Production Deployment

#### Recommended Setup
```
┌──────────────────┐
│   Nginx/Caddy    │ ← Reverse Proxy + SSL
│   (Port 80/443)  │
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
┌───▼──┐  ┌──▼────┐
│ Node │  │ Vite  │
│ :3000│  │ Build │
└──────┘  └───────┘
```

#### Build Commands
```bash
# Frontend Production Build
cd frontend
npm run build
# Output: dist/

# Backend Production
cd backend
NODE_ENV=production node server.js
```

#### Deployment Checklist
- ✅ Set NODE_ENV=production
- ✅ Configure production CORS origins
- ✅ Enable HTTPS
- ✅ Set up process manager (PM2)
- ✅ Configure logging
- ✅ Set up monitoring
- ✅ Configure rate limits appropriately

---

## Future Enhancements

### Planned Features

1. **Enhanced Email Management**
   - Search functionality
   - Email filtering
   - Mark as read/unread
   - Archive messages

2. **Account Persistence**
   - Optional account storage
   - Session management
   - Account recovery

3. **Advanced Features**
   - Reply to emails (if Mail.tm supports)
   - Forward emails
   - Multiple account management
   - Email rules/filters

4. **UI/UX Improvements**
   - Dark mode
   - Multiple themes
   - Accessibility enhancements
   - Mobile app version

5. **Performance Optimization**
   - Redis caching layer
   - WebSocket for real-time updates
   - Database for account persistence
   - CDN for static assets

6. **Monitoring & Analytics**
   - Application performance monitoring
   - Error tracking (Sentry)
   - Usage analytics
   - Health check dashboard

7. **Testing**
   - Unit tests
   - Integration tests
   - E2E tests
   - Load testing

### Scalability Considerations

1. **Horizontal Scaling**
   - Stateless design enables load balancing
   - Session data in external store (Redis)
   - Distributed rate limiting

2. **Caching Strategy**
   - Domain list caching
   - Message caching
   - CDN for static assets

3. **Database Integration**
   - PostgreSQL for persistence
   - Account history
   - Message archiving

---

## Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Run linting: `npm run lint`
5. Test locally
6. Submit pull request

### Code Standards

- **JavaScript**: ES6+ with ESLint
- **Formatting**: Prettier (if configured)
- **Naming**: camelCase for functions, PascalCase for classes
- **Comments**: JSDoc style for functions
- **Commits**: Conventional commits format

---

## License

[Add your license information here]

---

## Contact & Support

- **Repository**: [GitHub URL]
- **Issues**: [GitHub Issues URL]
- **Documentation**: This file and README.md

---

## Changelog

### Version 1.0.0 (Current)
- ✅ Basic email account creation
- ✅ Inbox viewing
- ✅ Message reading
- ✅ Attachment downloads
- ✅ Account deletion
- ✅ Rate limiting
- ✅ Input validation
- ✅ Responsive UI
- ✅ Auto-refresh polling

---

*Last Updated: November 9, 2025*
