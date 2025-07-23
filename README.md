# 🚀 CapRaise - Fundraising Campaign Management Platform

**CapRaise** is a modern React-based Progressive Web Application (PWA) designed for managing fundraising campaigns across multiple churches and organizations. Built with Firebase integration and role-based access control.

## 📋 Table of Contents
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [User Roles & Permissions](#-user-roles--permissions)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Setup](#-environment-setup)
- [Available Scripts](#-available-scripts)
- [API Integration](#-api-integration)
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
- Secure session management

### 📊 Analytics & Reporting
- Interactive charts using Recharts and MUI X-Charts
- Top fundraisers leaderboard
- Campaign performance metrics
- Member statistics and insights

## 🛠️ Technology Stack

```
Frontend Framework     │ React 18.2.0
Build Tool            │ Create React App + CRACO
Styling               │ Tailwind CSS + Material-UI (MUI)
Authentication        │ Firebase Auth
Database              │ Firebase Firestore
State Management      │ React Context API
Charts & Analytics    │ Recharts + MUI X-Charts
Routing              │ React Router DOM v6
PWA Support          │ React PWA Add-to-Homescreen
HTTP Client          │ Axios
Date Handling        │ Day.js
Notifications        │ React Toastify
```

## 🏗️ Architecture

### Application Flow
```
┌─────────────────────────────────────────────────────────────┐
│                     CapRaise Application                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────────┐ │
│  │   Welcome   │───▶│ Authentication│───▶│  Role-Based     │ │
│  │   Screen    │    │   (Firebase)  │    │   Dashboard     │ │
│  │  (2 sec)    │    │               │    │                 │ │
│  └─────────────┘    └──────────────┘    └─────────────────┘ │
│                            │                       │         │
│                            ▼                       ▼         │
│                     ┌──────────────┐    ┌─────────────────┐ │
│                     │  OTP Verify  │    │   Main App      │ │
│                     │              │    │   Interface     │ │
│                     └──────────────┘    └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
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

### Component Architecture
```
App.js
├── ContextProvider (Global State)
├── BrowserRouter
│   ├── Welcome Screen (2s timeout)
│   ├── Authentication Routes
│   │   ├── AgapeSignIn
│   │   ├── AgapeRegister
│   │   ├── Register
│   │   └── OTP
│   └── Authenticated Routes
│       ├── Sidebar (Navigation)
│       ├── Navbar (Top Bar)
│       ├── Main Content Area
│       │   ├── Dashboard (Admin/SuperAdmin)
│       │   ├── Dashboard2 (Regular Users)
│       │   ├── Fundraisers
│       │   ├── Churches (SuperAdmin only)
│       │   └── Campaigns
│       └── BottomNavbar (Mobile)
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
│   │   ├── AddCampaign.js   # Campaign creation
│   │   ├── AddChurches.js   # Church management
│   │   ├── Campaigns.js     # Campaign listing
│   │   ├── Statistics.js    # Analytics components
│   │   ├── Navbar.js        # Top navigation
│   │   ├── Sidebar.js       # Side navigation
│   │   └── BottomNavbar.js  # Mobile navigation
│   ├── pages/               # Main page components
│   │   ├── Dashboard.js     # Admin dashboard
│   │   ├── Campaigns.js     # Campaign management
│   │   ├── Churches.js      # Church management
│   │   └── Fundraisers.js   # Fundraiser management
│   ├── memberPages/         # User-specific pages
│   │   └── Dashboard.js     # Member dashboard
│   ├── contexts/            # React Context providers
│   │   └── ContextProvider.js
│   ├── firebase/            # Firebase configuration
│   │   ├── config.js        # Firebase credentials
│   │   └── firebase.js      # Firebase initialization
│   ├── api/                 # External API handlers
│   │   └── FetchData.js
│   └── utils/               # Utilities and assets
│       ├── dummys.js        # Sample data
│       └── images/          # Image assets
├── package.json             # Dependencies and scripts
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

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Setup

The application uses Firebase for authentication and database. The Firebase configuration is already included in `src/firebase/config.js`.

### Firebase Configuration
The app connects to:
- **Project ID**: capraise-43d7f
- **Auth Domain**: capraise-43d7f.firebaseapp.com
- **Storage Bucket**: capraise-43d7f.appspot.com

### External API
The application integrates with an external backend API:
- **Backend URL**: https://capraise-backend.onrender.com
- **API Endpoint**: `/api/v1/fetchData`

## 📜 Available Scripts

In the project directory, you can run:

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)
- Hot reloading enabled
- Lint errors displayed in console

### `npm test`
Launches the test runner in interactive watch mode
- Uses Jest testing framework
- Supports React Testing Library

### `npm run build`
Builds the app for production to the `build` folder
- Optimized and minified build
- Ready for deployment

### `npm run eject`
⚠️ **One-way operation** - Ejects from Create React App
- Exposes all configuration files
- Provides full control over build tools

## 🌐 API Integration

### External Data Fetching
```javascript
// Fetches data from external backend
const response = await axios.get(
  "https://capraise-backend.onrender.com/api/v1/fetchData"
);
```

### Firebase Integration
```javascript
// Authentication state management
onAuthStateChanged(auth, (user) => {
  if (user) {
    setAuthUser(user);
    // Fetch user/admin data from Firestore
  }
});
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
- **Secure Authentication**: Firebase Auth with OTP verification
- **HTTPS Only**: All API calls made over secure connections

## 📈 Performance Optimizations

- **Code Splitting**: React.lazy() for route-based splitting
- **Image Optimization**: Optimized images in multiple formats
- **Caching**: Service worker caching for offline support
- **Bundle Analysis**: Built-in bundle analyzer available

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

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check existing documentation
- Review Firebase console for backend issues

---

**Built with ❤️ for fundraising communities**
