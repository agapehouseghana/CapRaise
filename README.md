# 🚀 CapRaise - Fundraising Campaign Management Platform

**CapRaise** is a modern React-based Progressive Web Application (PWA) designed for managing fundraising campaigns across multiple churches and organizations. Built with Firebase integration, Express.js middleware, and role-based access control.

## 📋 Table of Contents
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [User Roles & Permissions](#-user-roles--permissions)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Setup](#-environment-setup)
- [Available Scripts](#-available-scripts)
- [Middleware API](#-middleware-api)
- [PWA Features](#-pwa-features)
- [Contributing](#-contributing)

## ✨ Features

### 🎯 Core Functionality
- **Campaign Management**: Create, track, and manage fundraising campaigns
- **Multi-Church Support**: SuperAdmins can manage multiple church organizations
- **Real-time Statistics**: Interactive dashboards with charts and analytics
- **Member Management**: Track fundraisers and their performance
- **Mobile-First Design**: Responsive interface with bottom navigation
- **Progressive Web App**: Installable with offline capabilities

### 🔐 Authentication & Security
- Firebase Authentication with email/password
- OTP (One-Time Password) verification
- Role-based access control (User, Admin, SuperAdmin)
- Express.js middleware with JWT token validation
- Server-side authentication and authorization
- Rate limiting and CORS protection

### 📊 Analytics & Reporting
- Interactive charts using Recharts and MUI X-Charts
- Top fundraisers leaderboard
- Campaign performance metrics
- Member statistics and insights
- Cached analytics for improved performance

### 🚀 Middleware Features
- **Express.js API Layer**: Centralized backend services
- **Caching**: In-memory caching with node-cache for improved performance
- **Rate Limiting**: Protection against API abuse
- **Error Handling**: Structured error responses and logging
- **Firebase Admin SDK**: Server-side Firebase operations
- **Fallback Support**: Graceful degradation to direct Firebase calls

## 🛠️ Technology Stack

```
Frontend Framework     │ React 18.2.0
Build Tool            │ Create React App + CRACO
Styling               │ Tailwind CSS + Material-UI (MUI)
Authentication        │ Firebase Auth + Firebase Admin SDK
Database              │ Firebase Firestore
Backend Middleware    │ Express.js 4.18.2
Caching               │ node-cache (in-memory)
Security              │ Helmet.js + express-rate-limit
State Management      │ React Context API
Charts & Analytics    │ Recharts + MUI X-Charts
Routing              │ React Router DOM v6
PWA Support          │ React PWA Add-to-Homescreen
HTTP Client          │ Fetch API (custom service layer)
Date Handling        │ Day.js
Notifications        │ React Toastify
```

## 🏗️ Architecture

### System Architecture
```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CapRaise System Architecture                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐ │
│  │   React App     │───▶│  Express.js      │───▶│   Firebase          │ │
│  │   (Frontend)    │    │  Middleware      │    │   (Database)        │ │
│  │                 │    │                  │    │                     │ │
│  │ • Components    │    │ • Authentication │    │ • Firestore         │ │
│  │ • Context API   │    │ • Rate Limiting  │    │ • Authentication    │ │
│  │ • PWA Features  │    │ • Caching        │    │ • Storage           │ │
│  │ • Responsive UI │    │ • Error Handling │    │ • Security Rules    │ │
│  └─────────────────┘    └──────────────────┘    └─────────────────────┘ │
│           │                       │                         │           │
│           ▼                       ▼                         ▼           │
│  ┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐ │
│  │   API Service   │    │   Middleware     │    │   External APIs     │ │
│  │                 │    │   Routes         │    │                     │ │
│  │ • Token Mgmt    │    │                  │    │ • Donation Data     │ │
│  │ • Error Handling│    │ • /api/campaigns │    │ • Third-party       │ │
│  │ • Fallbacks     │    │ • /api/analytics │    │   Integrations      │ │
│  │                 │    │ • /api/auth      │    │                     │ │
│  └─────────────────┘    └──────────────────┘    └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### Middleware API Flow
```
Client Request → Authentication → Rate Limiting → Caching Check → 
Firebase Query → Response Caching → Client Response
```

### User Role Hierarchy
```
                    ┌─────────────────┐
                    │   SuperAdmin    │
                    │                 │
                    │ • All permissions│
                    │ • Church mgmt   │
                    │ • Global stats  │
                    └─────────┬───────┘
                              │
                    ┌─────────▼───────┐
                    │      Admin      │
                    │                 │
                    │ • Campaign mgmt │
                    │ • Fundraisers   │
                    │ • Statistics    │
                    └─────────┬───────┘
                              │
                    ┌─────────▼───────┐
                    │      User       │
                    │                 │
                    │ • View dashboard│
                    │ • Personal stats│
                    │ • Limited access│
                    └─────────────────┘
```

## 👥 User Roles & Permissions

| Feature | User | Admin | SuperAdmin |
|---------|------|-------|------------|
| Personal Dashboard | ✅ | ✅ | ✅ |
| View Statistics | ✅ | ✅ | ✅ |
| Campaign Management | ❌ | ✅ | ✅ |
| Fundraiser Management | ❌ | ✅ | ✅ |
| Church Management | ❌ | ❌ | ✅ |
| Global Analytics | ❌ | ✅ | ✅ |

## 📁 Project Structure

```
capraise/
├── public/                    # Static assets & PWA files
│   ├── index.html            # Main HTML template
│   ├── manifest.json         # PWA manifest
│   ├── serviceworker.js      # Service worker for PWA
│   └── icons/                # App icons for various devices
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── auth/            # Authentication components
│   │   │   ├── AgapeSignIn.js
│   │   │   ├── AgapeRegister.js
│   │   │   ├── Register.js
│   │   │   └── OTP.js
│   │   ├── AddCampaign.js   # Campaign creation (middleware)
│   │   ├── AddChurches.js   # Church management
│   │   ├── Campaigns.js     # Campaign listing
│   │   ├── Statistics.js    # Analytics components (middleware)
│   │   ├── EditCampaign.js  # Campaign editing (middleware)
│   │   ├── Navbar.js        # Top navigation
│   │   ├── Sidebar.js       # Side navigation
│   │   └── BottomNavbar.js  # Mobile navigation
│   ├── pages/               # Main page components
│   │   ├── Dashboard.js     # Admin dashboard (middleware)
│   │   ├── Campaigns.js     # Campaign management (middleware)
│   │   ├── Churches.js      # Church management
│   │   └── Fundraisers.js   # Fundraiser management
│   ├── memberPages/         # User-specific pages
│   │   ├── Dashboard.js     # Member dashboard (middleware)
│   │   └── RaiseFunds.js    # Member fundraising (middleware)
│   ├── services/            # API service layer
│   │   └── api.js           # Middleware API client
│   ├── contexts/            # React Context providers
│   │   └── ContextProvider.js # Global state (middleware)
│   ├── firebase/            # Firebase configuration
│   │   ├── config.js        # Firebase credentials
│   │   └── firebase.js      # Firebase initialization
│   ├── api/                 # External API handlers
│   │   └── FetchData.js
│   └── utils/               # Utilities and assets
│       ├── dummys.js        # Sample data
│       └── images/          # Image assets
├── middleware-server/        # Express.js middleware server
│   ├── server.js            # Main server file
│   ├── middleware/          # Middleware functions
│   │   ├── auth.js          # Authentication middleware
│   │   ├── cache.js         # Caching middleware
│   │   └── errorHandler.js  # Error handling middleware
│   ├── routes/              # API routes
│   │   ├── auth.js          # Authentication routes
│   │   ├── campaigns.js     # Campaign CRUD operations
│   │   ├── users.js         # User management
│   │   ├── donations.js     # Donation data integration
│   │   └── analytics.js     # Analytics and statistics
│   ├── package.json         # Middleware dependencies
│   └── .env                 # Environment variables
├── package.json             # Frontend dependencies and scripts
├── craco.config.js         # CRACO configuration for Tailwind
└── tailwind.config.js      # Tailwind CSS configuration
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (v7.0.0 or higher) - Comes with Node.js
- **Git** - [Download here](https://git-scm.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd capraise
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install middleware dependencies**
   ```bash
   cd middleware-server
   npm install
   cd ..
   ```

4. **Set up environment variables**
   
   Create `.env` file in `middleware-server/` directory:
   ```bash
   # Firebase Admin SDK Configuration
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-service-account-email
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   
   # Server Configuration
   PORT=4000
   NODE_ENV=development
   
   # External API
   EXTERNAL_API_URL=https://capraise-backend.onrender.com
   ```

5. **Start the development servers**
   
   **Terminal 1 - Start the middleware server:**
   ```bash
   cd middleware-server
   npm run dev
   ```
   
   **Terminal 2 - Start the React app:**
   ```bash
   npm start
   ```

6. **Open your browser**
   - Frontend: [http://localhost:3001](http://localhost:3001)
   - Middleware API: [http://localhost:4000](http://localhost:4000)
   - Health Check: [http://localhost:4000/health](http://localhost:4000/health)

## 🔧 Environment Setup

### Frontend Environment
Create `.env` file in project root:
```bash
REACT_APP_API_URL=http://localhost:4000/api
```

### Middleware Environment
The middleware server requires Firebase Admin SDK credentials. Set up:

1. **Firebase Service Account**:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Generate new private key
   - Copy the credentials to `.env` file

2. **External API Configuration**:
   - Backend URL: https://capraise-backend.onrender.com
   - API Endpoint: `/api/v1/fetchData`

### Firebase Configuration
The app connects to:
- **Project ID**: capraise-43d7f
- **Auth Domain**: capraise-43d7f.firebaseapp.com
- **Storage Bucket**: capraise-43d7f.appspot.com

## 📜 Available Scripts

### Frontend Scripts

```bash
# Start React development server
npm start

# Run tests
npm test

# Build for production
npm run build

# Eject from Create React App (one-way operation)
npm run eject
```

### Middleware Scripts

```bash
# Start middleware development server (with nodemon)
cd middleware-server && npm run dev

# Start middleware production server
cd middleware-server && npm start

# Install middleware dependencies
cd middleware-server && npm install
```

### Development Workflow

**For development, run both servers:**
```bash
# Terminal 1: Start middleware
cd middleware-server && npm run dev

# Terminal 2: Start frontend  
npm start
```

## 🌐 Middleware API

### API Endpoints

#### Authentication
- `GET /api/auth/me` - Get current user information
- `POST /api/auth/login` - User authentication

#### Campaigns
- `GET /api/campaigns` - List campaigns with pagination
- `POST /api/campaigns` - Create new campaign
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign
- `GET /api/campaigns/:id/analytics` - Campaign analytics

#### Analytics
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/campaigns` - Campaign analytics
- `GET /api/analytics/fundraisers` - Fundraiser analytics

#### Users
- `GET /api/users` - List users with pagination
- `GET /api/users/:id` - Get user details

#### Donations
- `GET /api/donations` - External donation data integration

#### Health Check
- `GET /health` - Server health status

### API Features

- **Authentication**: Firebase ID token validation
- **Caching**: Automatic response caching with 304 responses
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Error Handling**: Structured error responses
- **Pagination**: Consistent pagination across endpoints
- **CORS**: Configured for development and production
- **Logging**: Request/response logging for debugging

### API Client Usage

```javascript
import apiService from '../services/api';

// Get campaigns
const campaigns = await apiService.getCampaigns();

// Create campaign
const newCampaign = await apiService.createCampaign(campaignData);

// Get analytics
const analytics = await apiService.getDashboardAnalytics();
```

## 📱 PWA Features

### Installation
- **Add to Home Screen**: Supported on mobile devices
- **Offline Support**: Basic offline functionality via service worker
- **App-like Experience**: Full-screen mode available

### Manifest Configuration
```json
{
  "name": "CapRaise",
  "short_name": "CapRaise",
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}
```

## 🎨 UI/UX Features

### Responsive Design
- **Desktop**: Full sidebar navigation with detailed layouts
- **Tablet**: Adaptive sidebar that can be toggled
- **Mobile**: Bottom navigation bar for easy thumb access

### Theme Support
- **Light/Dark Mode**: User-configurable theme switching
- **Color Customization**: Multiple accent color options
- **Accessibility**: ARIA labels and keyboard navigation support

## 🔒 Security Features

- **Firebase Security Rules**: Database access controlled by user roles
- **Input Validation**: Form validation on all user inputs  
- **Server-side Authentication**: Firebase Admin SDK token verification
- **Rate Limiting**: Protection against API abuse (100 req/15min)
- **CORS Protection**: Configured allowed origins
- **Helmet.js**: Security headers and protection
- **HTTPS Only**: All API calls made over secure connections

## 📈 Performance Optimizations

- **Middleware Caching**: In-memory caching with node-cache
- **HTTP Caching**: 304 responses for unchanged data
- **Code Splitting**: React.lazy() for route-based splitting
- **Image Optimization**: Optimized images in multiple formats
- **Service Worker**: PWA caching for offline support
- **Bundle Analysis**: Built-in bundle analyzer available
- **Fallback Support**: Graceful degradation to direct Firebase

## 🛠️ Development Features

- **Hot Reloading**: Both frontend and middleware support hot reload
- **Error Handling**: Comprehensive error logging and handling
- **Development Logging**: Detailed request/response logs
- **Fallback Mechanisms**: Automatic fallback to direct Firebase
- **Environment Configuration**: Separate dev/prod configurations

## 📊 Monitoring & Analytics

### Server Monitoring
- Health check endpoint: `/health`
- Request/response logging
- Error tracking and reporting
- Performance metrics

### Application Analytics
- Campaign performance tracking
- User engagement metrics
- Fundraiser leaderboards
- Real-time statistics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow React best practices
- Use TypeScript for new components (if migrating)
- Write tests for new features
- Follow the existing code style
- Update documentation for new features
- Test both middleware and frontend changes
- Ensure fallback mechanisms work properly

## 🚀 Deployment

### Frontend Deployment
```bash
npm run build
# Deploy build/ folder to your hosting service
```

### Middleware Deployment
```bash
cd middleware-server
# Set production environment variables
NODE_ENV=production
# Deploy to your server (Heroku, DigitalOcean, etc.)
```

### Environment Variables for Production
```bash
# Frontend
REACT_APP_API_URL=https://your-middleware-domain.com/api

# Middleware
NODE_ENV=production
PORT=4000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="your-private-key"
EXTERNAL_API_URL=https://capraise-backend.onrender.com
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check existing documentation
- Review Firebase console for backend issues
- Check middleware server logs for API issues
- Test health endpoint: `/health`

---

**Built with ❤️ for fundraising communities**
**Now powered by Express.js middleware for enhanced performance and security** 🚀

