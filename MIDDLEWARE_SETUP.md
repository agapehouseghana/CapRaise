# 🚀 CapRaise Middleware Setup Guide

This guide walks you through setting up the Express.js middleware server and integrating it with your existing React frontend.

## 📋 Phase 1: Middleware Server Setup

### 1. **Install Dependencies**

```bash
cd middleware-server
npm install
```

### 2. **Firebase Admin SDK Setup**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your `capraise-43d7f` project
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file

### 3. **Environment Configuration**

```bash
# Copy the example environment file
cp env.example .env
```

Edit `.env` with your Firebase credentials:

```bash
# Server Configuration
PORT=4000
NODE_ENV=development

# Firebase Admin SDK (from downloaded JSON)
FIREBASE_PROJECT_ID=capraise-43d7f
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@capraise-43d7f.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# External API Configuration
EXTERNAL_API_URL=https://capraise-backend.onrender.com/api/v1/fetchData

# CORS Origins
CORS_ORIGINS=http://localhost:3000,http://localhost:3002
```

### 4. **Start the Middleware Server**

```bash
# Development mode (with auto-restart)
npm run dev

# Or production mode
npm start
```

**✅ Verify it's working:**
```bash
curl http://localhost:4000/health
```

You should see:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123,
  "environment": "development"
}
```

---

## 📋 Phase 2: Frontend Integration

### 1. **Add Environment Variable**

Create/update `.env` in your React project root:

```bash
# Add this line to your existing .env file
REACT_APP_API_URL=http://localhost:4000/api
```

### 2. **Test the API Service**

Create a simple test component to verify the connection:

```jsx
// src/components/ApiTest.js
import React, { useState } from 'react';
import apiService from '../services/api';

const ApiTest = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      const data = await apiService.getCurrentUser();
      setResult(data);
    } catch (error) {
      setResult({ error: error.message });
    }
    setLoading(false);
  };

  return (
    <div className="p-4 border rounded">
      <h3>API Connection Test</h3>
      <button 
        onClick={testConnection} 
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        {loading ? 'Testing...' : 'Test API Connection'}
      </button>
      {result && (
        <pre className="mt-4 p-2 bg-gray-100 rounded text-xs">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default ApiTest;
```

### 3. **Gradual Migration Strategy**

Instead of replacing everything at once, migrate one component at a time:

#### **Start with Campaigns Page**

Update `src/pages/Campaigns.js` to use the middleware:

```jsx
// Add this import at the top
import apiService from '../services/api';

// Replace the existing useEffect with:
useEffect(() => {
  const fetchCampaigns = async () => {
    if (!adminId) {
      console.log("Waiting for admin ID...");
      return;
    }

    setLoading(true);
    try {
      // Use middleware instead of direct Firebase
      const response = await apiService.getCampaigns();
      setCampaigns(response.campaigns || []);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      // Fallback to original Firebase method if middleware fails
      // ... keep your existing Firebase code as fallback
    }
    setLoading(false);
  };

  fetchCampaigns();
}, [adminId, refreshCampaigns]);
```

### 4. **Running Both Systems**

During migration, run both systems simultaneously:

**Terminal 1 - React Frontend:**
```bash
npm start
# Runs on http://localhost:3000
```

**Terminal 2 - Middleware:**
```bash
cd middleware-server
npm run dev
# Runs on http://localhost:4000
```

---

## 🔧 Development Workflow

### **Testing Endpoints**

Use these curl commands to test your middleware:

```bash
# Get Firebase ID token from browser console:
# auth.currentUser.getIdToken().then(token => console.log(token))

export TOKEN="your-firebase-id-token-here"

# Test campaigns
curl -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/campaigns

# Test users
curl -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/users

# Test analytics
curl -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/analytics/dashboard
```

### **Debugging**

1. **Check middleware logs** in Terminal 2
2. **Check browser console** for frontend errors
3. **Verify Firebase token** is being sent correctly
4. **Test direct Firebase access** as fallback

### **Common Issues & Solutions**

**Issue: "Authentication failed"**
```bash
# Solution: Check if Firebase token is valid
# In browser console:
auth.currentUser.getIdToken().then(token => console.log('Token:', token))
```

**Issue: "CORS error"**
```bash
# Solution: Update CORS_ORIGINS in middleware .env
CORS_ORIGINS=http://localhost:3000,http://localhost:3002
```

**Issue: "External API timeout"**
```bash
# Solution: The external donation API might be slow/down
# This is expected - the middleware handles it gracefully
```

---

## 📊 Migration Checklist

### **Phase 1 Complete ✅**
- [ ] Middleware server running on port 4000
- [ ] Firebase Admin SDK configured
- [ ] Health check endpoint working
- [ ] Environment variables set

### **Phase 2 Progress**
- [ ] API service created in frontend
- [ ] Test component working
- [ ] First component migrated (campaigns)
- [ ] Error handling implemented
- [ ] Fallback to Firebase working

### **Next Components to Migrate**
1. **Campaigns page** (admin campaign management)
2. **Dashboard analytics** (admin dashboard data)
3. **Fundraisers page** (user management)
4. **Member dashboard** (user stats)

---

## 🎯 Benefits You'll See

### **Immediate Benefits**
- ✅ **Better error handling** with structured responses
- ✅ **Request/response logging** for debugging
- ✅ **Rate limiting** protection
- ✅ **Centralized API management**

### **Medium-term Benefits**
- ✅ **Improved performance** with caching
- ✅ **Better security** with server-side validation
- ✅ **Easier testing** with mock endpoints
- ✅ **Standardized data format**

---

## 🆘 Need Help?

If you run into issues:

1. **Check the middleware logs** for detailed error messages
2. **Verify your Firebase credentials** are correct
3. **Test with curl** to isolate frontend vs backend issues
4. **Use the fallback Firebase code** if middleware is down

The middleware is designed to **enhance** your existing system, not replace it immediately. Take your time with the migration! 🚀 