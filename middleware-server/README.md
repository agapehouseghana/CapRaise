# 🛡️ CapRaise Middleware Server

Express.js middleware server that sits between the CapRaise PWA frontend and Firebase/external APIs, providing enhanced security, caching, rate limiting, and API management.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React PWA     │───▶│  Express.js     │───▶│   Firebase      │
│   Frontend      │    │  Middleware     │    │   Firestore     │
│                 │    │                 │    │                 │
│ • Auth Tokens   │    │ • Validation    │    │ • User Data     │
│ • API Calls     │    │ • Rate Limiting │    │ • Campaigns     │
│ • State Mgmt    │    │ • Caching       │    │ • Analytics     │
└─────────────────┘    │ • Error Handle  │    └─────────────────┘
                       │ • Logging       │
                       └─────────┬───────┘
                                 │
                       ┌─────────▼───────┐
                       │  External APIs  │
                       │                 │
                       │ • Donation Data │
                       │ • Payment Info  │
                       └─────────────────┘
```

## ✨ Features

### 🔐 Security
- **Firebase Admin SDK** integration for server-side authentication
- **JWT token validation** with role-based access control
- **Helmet.js** for security headers
- **CORS** configuration with environment-specific origins
- **Rate limiting** to prevent abuse

### 📊 API Management
- **RESTful endpoints** for campaigns, users, donations, analytics
- **Input validation** using express-validator
- **Pagination** support for large datasets
- **Search and filtering** capabilities
- **Structured error responses**

### ⚡ Performance
- **Redis caching** (optional) for frequently accessed data
- **Compression** middleware for response optimization
- **Request logging** with Morgan
- **Graceful shutdown** handling

### 🛠️ Developer Experience
- **Environment-based configuration**
- **Comprehensive error handling**
- **API documentation** with example requests
- **Health check endpoint**
- **Development vs production modes**

## 🚀 Quick Start

### Prerequisites
- Node.js (v16.0.0 or higher)
- npm or yarn
- Firebase Admin SDK credentials
- Redis (optional, for caching)

### Installation

1. **Clone and setup**
   ```bash
   cd middleware-server
   npm install
   ```

2. **Environment configuration**
   ```bash
   cp env.example .env
   # Edit .env with your actual values
   ```

3. **Firebase Admin Setup**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Generate new private key
   - Add the credentials to your `.env` file

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Verify installation**
   ```bash
   curl http://localhost:4000/health
   ```

## 📋 API Endpoints

### Authentication
```bash
# All protected routes require Authorization header
Authorization: Bearer <firebase-id-token>
```

### Campaigns
```bash
# Get all campaigns (paginated)
GET /api/campaigns?page=1&limit=10&status=active&search=term

# Get single campaign
GET /api/campaigns/:id

# Create campaign (Admin only)
POST /api/campaigns
{
  "campaignName": "New Campaign",
  "description": "Campaign description",
  "fundraisingGoal": 50000,
  "serviceCode": "CAMP001",
  "endDate": "2024-12-31T23:59:59Z",
  "imagesURL": ["https://..."]
}

# Update campaign (Admin only)
PUT /api/campaigns/:id

# Delete campaign (Admin only)
DELETE /api/campaigns/:id

# Get campaign analytics
GET /api/campaigns/:id/analytics
```

### Users
```bash
# Get users linked to admin
GET /api/users?page=1&limit=10&search=term

# Get single user
GET /api/users/:id

# Update user (Admin only)
PUT /api/users/:id
```

### Analytics
```bash
# Get dashboard analytics
GET /api/analytics/dashboard

# Get fundraiser performance
GET /api/analytics/fundraisers

# Get campaign statistics
GET /api/analytics/campaigns
```

## 🔧 Configuration

### Environment Variables

```bash
# Server
PORT=4000
NODE_ENV=development

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Security
JWT_SECRET=your-super-secret-key
CORS_ORIGINS=http://localhost:3000,https://your-domain.com

# External APIs
EXTERNAL_API_URL=https://capraise-backend.onrender.com/api/v1
EXTERNAL_API_KEY=your-api-key

# Caching (Optional)
REDIS_URL=redis://localhost:6379
```

### Rate Limiting
- **Development**: 1000 requests per 15 minutes
- **Production**: 100 requests per 15 minutes
- Customizable per endpoint

### CORS Policy
- **Development**: `localhost:3000`, `localhost:3002`
- **Production**: Your deployed frontend domains
- Supports credentials and preflight requests

## 🏛️ Project Structure

```
middleware-server/
├── server.js              # Main application entry point
├── package.json           # Dependencies and scripts
├── env.example           # Environment variables template
├── README.md             # This file
├── middleware/           # Custom middleware
│   ├── auth.js          # Authentication & authorization
│   ├── cache.js         # Redis caching middleware
│   └── errorHandler.js  # Global error handling
├── routes/              # API route handlers
│   ├── auth.js         # Authentication routes
│   ├── campaigns.js    # Campaign CRUD operations
│   ├── users.js        # User management
│   ├── donations.js    # Donation data integration
│   └── analytics.js    # Analytics and reporting
├── services/           # Business logic services
│   ├── firebase.js    # Firebase Admin SDK utilities
│   ├── external.js    # External API integration
│   └── cache.js       # Caching service
├── utils/             # Utility functions
│   ├── validation.js  # Input validation schemas
│   ├── helpers.js     # Common helper functions
│   └── constants.js   # Application constants
└── tests/             # Test files
    ├── auth.test.js
    ├── campaigns.test.js
    └── integration.test.js
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run integration tests
npm run test:integration

# Generate coverage report
npm run test:coverage
```

## 📦 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Docker
```bash
# Build image
docker build -t capraise-middleware .

# Run container
docker run -p 4000:4000 --env-file .env capraise-middleware
```

### Environment-specific Configs
- **Development**: Detailed logging, relaxed rate limits
- **Production**: Compressed responses, strict security headers
- **Testing**: Mock services, isolated database

## 🔍 Monitoring & Logging

### Health Check
```bash
GET /health
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "environment": "development"
}
```

### Error Logging
- Structured error logging with context
- Request tracking with unique IDs
- Performance metrics collection
- Firebase Admin SDK error handling

### Metrics
- Request/response times
- Error rates by endpoint
- Authentication success/failure rates
- Cache hit/miss ratios

## 🔄 Integration with Frontend

### Update Frontend API Calls
Replace direct Firebase calls with middleware endpoints:

```javascript
// Before (direct Firebase)
const campaigns = await getDocs(query(collection(db, "campaigns")));

// After (through middleware)
const response = await fetch('/api/campaigns', {
  headers: {
    'Authorization': `Bearer ${idToken}`,
    'Content-Type': 'application/json'
  }
});
const { campaigns } = await response.json();
```

### Authentication Flow
1. Frontend authenticates with Firebase Auth
2. Gets ID token from Firebase
3. Sends requests to middleware with `Authorization: Bearer <token>`
4. Middleware validates token and processes request
5. Returns structured response

## 🚧 Migration Strategy

### Phase 1: Setup & Basic Routes
- [x] Server setup with security middleware
- [x] Authentication middleware
- [x] Campaign CRUD operations
- [ ] User management routes
- [ ] Analytics endpoints

### Phase 2: Frontend Integration
- [ ] Update frontend API service
- [ ] Replace direct Firebase calls
- [ ] Implement error handling
- [ ] Add loading states

### Phase 3: Advanced Features
- [ ] Redis caching implementation
- [ ] Real-time notifications
- [ ] Advanced analytics
- [ ] Performance optimization

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines
- Follow RESTful API conventions
- Add tests for new endpoints
- Update documentation
- Use consistent error handling
- Validate all inputs

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for the CapRaise fundraising platform** 